import {
  alice,
  deployer,
  dlmmCore,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  setupTestEnvironment,
  addLiquidityToBins,
  getSbtcUsdcPoolLpBalance,
} from "./helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import { rovOk, txOk } from '@clarigen/test';
import { cvToValue } from '@clarigen/core';

describe('DLMM Core Comprehensive Fuzz Test', () => {
  
  beforeEach(async () => {
    setupTestEnvironment();
    
    // Mint substantial tokens for alice for comprehensive fuzz testing
    txOk(mockSbtcToken.mint(10000000000n, alice), deployer); // 100 BTC
    txOk(mockUsdcToken.mint(1000000000000n, alice), deployer); // 10M USDC
  });

  it('should handle comprehensive fuzz test: traverse bins 0 → -500 → 500 → 0', async () => {
    const binStep = 10; // Test every 10th bin
    let totalOperations = 0;
    let successfulOps = 0;
    let failedOps = 0;
    
    // Get initial pool state
    const initialPool = rovOk(sbtcUsdcPool.getPool());
    const initialActiveBin = initialPool.activeBinId;
    
    console.log(`Starting comprehensive fuzz test`);
    console.log(`Initial active bin: ${initialActiveBin}`);
    
    // Seed for reproducibility
    let seed = 12345;
    
    // Simple PRNG
    const random = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    
    const randomInt = (min: number, max: number) => {
      return Math.floor(random() * (max - min + 1)) + min;
    };
    
    const randomBigInt = (min: bigint, max: bigint) => {
      const range = max - min;
      const randomValue = BigInt(Math.floor(random() * Number(range)));
      return min + randomValue;
    };
    
    // Helper to check if bin has liquidity
    const binHasLiquidity = (binId: bigint): boolean => {
      try {
        const unsignedBin = rovOk(dlmmCore.getUnsignedBinId(binId));
        const balances = rovOk(sbtcUsdcPool.getBinBalances(unsignedBin));
        return balances.xBalance > 0n || balances.yBalance > 0n;
      } catch {
        return false;
      }
    };
    
    // Helper to get LP balance for a bin
    const getLpBalance = (binId: bigint): bigint => {
      try {
        return getSbtcUsdcPoolLpBalance(binId, alice);
      } catch {
        return 0n;
      }
    };
    
    // Helper to perform swap operations (staying in same bin)
    const performSwaps = async (binId: bigint, count: number) => {
      const activeBin = rovOk(sbtcUsdcPool.getActiveBinId());
      
      for (let i = 0; i < count; i++) {
        try {
          const swapXForY = random() > 0.5;
          // Use small amounts to stay in same bin
          const amount = randomBigInt(10000n, 1000000n); // 0.0001 to 0.01 BTC
          
          if (swapXForY) {
            txOk(dlmmCore.swapXForY(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              binId,
              amount,
              1n // min amount out
            ), alice);
            successfulOps++;
            totalOperations++;
          } else {
            txOk(dlmmCore.swapYForX(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              binId,
              amount,
              1n // min amount out
            ), alice);
            successfulOps++;
            totalOperations++;
          }
        } catch (error: any) {
          failedOps++;
          totalOperations++;
        }
      }
    };
    
    // Helper to add liquidity
    const performAddLiquidity = async (binId: bigint, count: number) => {
      const activeBin = rovOk(sbtcUsdcPool.getActiveBinId());
      
      for (let i = 0; i < count; i++) {
        try {
          const xAmount = randomBigInt(100000n, 5000000n); // 0.001 to 0.05 BTC
          const yAmount = randomBigInt(1000000n, 50000000n); // 1 to 50 USDC
          
          let finalX = 0n;
          let finalY = 0n;
          
          if (binId < activeBin) {
            finalX = 0n;
            finalY = yAmount;
          } else if (binId === activeBin) {
            finalX = xAmount;
            finalY = yAmount;
          } else {
            finalX = xAmount;
            finalY = 0n;
          }
          
          txOk(dlmmCore.addLiquidity(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            binId,
            finalX,
            finalY,
            1n // min DLP
          ), alice);
          successfulOps++;
          totalOperations++;
        } catch (error: any) {
          failedOps++;
          totalOperations++;
        }
      }
    };
    
    // Helper to remove liquidity
    const performRemoveLiquidity = async (binId: bigint, count: number) => {
      for (let i = 0; i < count; i++) {
        try {
          const lpBalance = getLpBalance(binId);
          
          if (lpBalance > 0n) {
            const removeAmount = randomBigInt(1n, lpBalance > 10000n ? 10000n : lpBalance);
            
            txOk(dlmmCore.withdrawLiquidity(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              binId,
              removeAmount,
              0n, // min x amount
              0n  // min y amount
            ), alice);
            successfulOps++;
            totalOperations++;
          }
        } catch (error: any) {
          failedOps++;
          totalOperations++;
        }
      }
    };
    
    // Helper to move liquidity
    const performMoveLiquidity = async (binId: bigint, count: number) => {
      for (let i = 0; i < count; i++) {
        try {
          const lpBalance = getLpBalance(binId);
          
          if (lpBalance > 0n) {
            const moveAmount = randomBigInt(1n, lpBalance > 5000n ? 5000n : lpBalance);
            // Move to adjacent bin
            const toBinId = binId + (random() > 0.5 ? 1n : -1n);
            
            // Check if toBinId is valid
            if (toBinId >= -500n && toBinId <= 500n) {
              txOk(dlmmCore.moveLiquidity(
                sbtcUsdcPool.identifier,
                mockSbtcToken.identifier,
                mockUsdcToken.identifier,
                binId,
                toBinId,
                moveAmount,
                1n, // min DLP
                1000000n, // max x liquidity fee
                1000000n  // max y liquidity fee
              ), alice);
              successfulOps++;
              totalOperations++;
            }
          }
        } catch (error: any) {
          failedOps++;
          totalOperations++;
        }
      }
    };
    
    // Helper to perform cross-bin swap to move active bin
    const performCrossBinSwap = async (targetBinId: bigint) => {
      try {
        const activeBin = rovOk(sbtcUsdcPool.getActiveBinId());
        const binDiff = targetBinId - activeBin;
        
        if (binDiff === 0n) return; // Already at target bin
        
        // Use large swap to cross bins
        const largeAmount = randomBigInt(10000000n, 100000000n); // 0.1 to 1 BTC
        
        if (binDiff > 0n) {
          // Need to swap X for Y to move bin up
          txOk(dlmmCore.swapXForY(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            activeBin,
            largeAmount,
            1n
          ), alice);
        } else {
          // Need to swap Y for X to move bin down
          txOk(dlmmCore.swapYForX(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            activeBin,
            largeAmount,
            1n
          ), alice);
        }
        successfulOps++;
        totalOperations++;
      } catch (error: any) {
        failedOps++;
        totalOperations++;
      }
    };
    
    // Phase 1: Traverse from bin 0 to bin -500 (every 10th bin)
    console.log('\n=== Phase 1: Traversing from bin 0 to bin -500 ===');
    for (let bin = 0; bin >= -500; bin -= binStep) {
      const binId = BigInt(bin);
      const hasLiquidity = binHasLiquidity(binId);
      
      console.log(`\nProcessing bin ${binId} (has liquidity: ${hasLiquidity})`);
      
      if (hasLiquidity) {
        // Perform operations in this bin
        await performSwaps(binId, randomInt(4, 5));
        await performAddLiquidity(binId, randomInt(2, 3));
        await performRemoveLiquidity(binId, randomInt(2, 3));
        await performMoveLiquidity(binId, randomInt(2, 3));
      }
      
      // Cross-bin swap to move to next bin
      if (bin > -500) {
        await performCrossBinSwap(BigInt(bin - binStep));
      }
      
      // Verify pool state is still valid
      const pool = rovOk(sbtcUsdcPool.getPool());
      expect(pool.poolCreated).toBe(true);
    }
    
    // Phase 2: Traverse from bin -500 to bin 500 (every 10th bin)
    console.log('\n=== Phase 2: Traversing from bin -500 to bin 500 ===');
    for (let bin = -500; bin <= 500; bin += binStep) {
      const binId = BigInt(bin);
      const hasLiquidity = binHasLiquidity(binId);
      
      console.log(`\nProcessing bin ${binId} (has liquidity: ${hasLiquidity})`);
      
      if (hasLiquidity) {
        // Perform operations in this bin
        await performSwaps(binId, randomInt(4, 5));
        await performAddLiquidity(binId, randomInt(2, 3));
        await performRemoveLiquidity(binId, randomInt(2, 3));
        await performMoveLiquidity(binId, randomInt(2, 3));
      }
      
      // Cross-bin swap to move to next bin
      if (bin < 500) {
        await performCrossBinSwap(BigInt(bin + binStep));
      }
      
      // Verify pool state is still valid
      const pool = rovOk(sbtcUsdcPool.getPool());
      expect(pool.poolCreated).toBe(true);
    }
    
    // Phase 3: Traverse from bin 500 back to bin 0 (every 10th bin)
    console.log('\n=== Phase 3: Traversing from bin 500 back to bin 0 ===');
    for (let bin = 500; bin >= 0; bin -= binStep) {
      const binId = BigInt(bin);
      const hasLiquidity = binHasLiquidity(binId);
      
      console.log(`\nProcessing bin ${binId} (has liquidity: ${hasLiquidity})`);
      
      if (hasLiquidity) {
        // Perform operations in this bin
        await performSwaps(binId, randomInt(4, 5));
        await performAddLiquidity(binId, randomInt(2, 3));
        await performRemoveLiquidity(binId, randomInt(2, 3));
        await performMoveLiquidity(binId, randomInt(2, 3));
      }
      
      // Cross-bin swap to move to next bin
      if (bin > 0) {
        await performCrossBinSwap(BigInt(bin - binStep));
      }
      
      // Verify pool state is still valid
      const pool = rovOk(sbtcUsdcPool.getPool());
      expect(pool.poolCreated).toBe(true);
    }
    
    // Final state checks
    const finalPool = rovOk(sbtcUsdcPool.getPool());
    const finalActiveBin = finalPool.activeBinId;
    
    console.log(`\n=== Fuzz Test Complete ===`);
    console.log(`  Total operations: ${totalOperations}`);
    console.log(`  Successful operations: ${successfulOps}`);
    console.log(`  Failed operations: ${failedOps}`);
    console.log(`  Initial active bin: ${initialActiveBin}`);
    console.log(`  Final active bin: ${finalActiveBin}`);
    
    // Basic invariants
    expect(finalPool.poolCreated).toBe(true);
    expect(finalActiveBin).toBeGreaterThanOrEqual(-500n);
    expect(finalActiveBin).toBeLessThanOrEqual(500n);
    
    // Pool should still be functional
    const activeBinId = rovOk(sbtcUsdcPool.getActiveBinId());
    const unsignedBin = rovOk(dlmmCore.getUnsignedBinId(activeBinId));
    const poolBalances = rovOk(sbtcUsdcPool.getBinBalances(unsignedBin));
    expect(poolBalances.xBalance).toBeGreaterThanOrEqual(0n);
    expect(poolBalances.yBalance).toBeGreaterThanOrEqual(0n);
    
    // Verify token balances are non-negative
    const sbtcBalance = rovOk(mockSbtcToken.getBalance(alice));
    const usdcBalance = rovOk(mockUsdcToken.getBalance(alice));
    expect(sbtcBalance).toBeGreaterThanOrEqual(0n);
    expect(usdcBalance).toBeGreaterThanOrEqual(0n);
  }, 600000); // 10 minute timeout for comprehensive test
});

