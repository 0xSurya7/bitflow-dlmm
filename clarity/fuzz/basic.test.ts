import {
  alice,
  deployer,
  dlmmCore,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  setupTestEnvironment,
  getSbtcUsdcPoolLpBalance,
} from "../tests/helpers/helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import { rovOk, txOk } from '@clarigen/test';

// ============================================================================
// Type Definitions
// ============================================================================

interface PoolState {
  poolCreated: boolean;
  activeBinId: bigint;
}

interface OperationStats {
  totalOperations: number;
  successfulOps: number;
  failedOps: number;
}

// ============================================================================
// Configuration & Constants
// ============================================================================

class TestConfig {
  // Test traversal parameters
  static readonly BIN_STEP = 10;
  static readonly MIN_BIN = -500;
  static readonly MAX_BIN = 500;
  
  // Initial token balances
  static readonly INITIAL_BTC_BALANCE = 10000000000n; // 100 BTC
  static readonly INITIAL_USDC_BALANCE = 1000000000000n; // 10M USDC
  
  // Operation parameters
  static readonly SWAPS_PER_BIN_MIN = 4;
  static readonly SWAPS_PER_BIN_MAX = 5;
  static readonly ADD_LIQUIDITY_PER_BIN_MIN = 2;
  static readonly ADD_LIQUIDITY_PER_BIN_MAX = 3;
  static readonly REMOVE_LIQUIDITY_PER_BIN_MIN = 2;
  static readonly REMOVE_LIQUIDITY_PER_BIN_MAX = 3;
  static readonly MOVE_LIQUIDITY_PER_BIN_MIN = 2;
  static readonly MOVE_LIQUIDITY_PER_BIN_MAX = 3;
  
  // Swap amount ranges
  static readonly SWAP_AMOUNT_MIN = 10000n; // 0.0001 BTC
  static readonly SWAP_AMOUNT_MAX = 1000000n; // 0.01 BTC
  
  // Liquidity amount ranges
  static readonly LIQUIDITY_X_MIN = 100000n; // 0.001 BTC
  static readonly LIQUIDITY_X_MAX = 5000000n; // 0.05 BTC
  static readonly LIQUIDITY_Y_MIN = 1000000n; // 1 USDC
  static readonly LIQUIDITY_Y_MAX = 50000000n; // 50 USDC
  
  // Cross-bin swap ranges
  static readonly CROSS_BIN_SWAP_MIN = 10000000n; // 0.1 BTC
  static readonly CROSS_BIN_SWAP_MAX = 100000000n; // 1 BTC
  
  // Liquidity removal/move limits
  static readonly MAX_LP_REMOVE = 10000n;
  static readonly MAX_LP_MOVE = 5000n;
  
  // Operation minimums
  static readonly MIN_AMOUNT_OUT = 1n;
  static readonly MIN_DLP = 1n;
  static readonly MAX_LIQUIDITY_FEE = 1000000n;
  
  // Random seed
  static readonly RANDOM_SEED = 12345;

  static readonly TIMEOUT = 600000;
}

// ============================================================================
// Seeded Random Number Generator
// ============================================================================

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextBigInt(min: bigint, max: bigint): bigint {
    const range = max - min;
    const randomValue = BigInt(Math.floor(this.next() * Number(range)));
    return min + randomValue;
  }

  nextBoolean(): boolean {
    return this.next() > 0.5;
  }
}

// ============================================================================
// Pool State Manager
// ============================================================================

class PoolStateManager {
  /**
   * Check if a bin has liquidity
   */
  static binHasLiquidity(binId: bigint): boolean {
    try {
      const unsignedBin = rovOk(dlmmCore.getUnsignedBinId(binId));
      const balances = rovOk(sbtcUsdcPool.getBinBalances(unsignedBin));
      return balances.xBalance > 0n || balances.yBalance > 0n;
    } catch {
      return false;
    }
  }

  /**
   * Get LP balance for a bin
   */
  static getLpBalance(binId: bigint): bigint {
    try {
      return getSbtcUsdcPoolLpBalance(binId, alice);
    } catch {
      return 0n;
    }
  }

  /**
   * Get current pool state
   */
  static getPoolState(): PoolState {
    const pool = rovOk(sbtcUsdcPool.getPool());
    return {
      poolCreated: pool.poolCreated,
      activeBinId: pool.activeBinId,
    };
  }

  /**
   * Get active bin ID
   */
  static getActiveBinId(): bigint {
    return rovOk(sbtcUsdcPool.getActiveBinId());
  }
}

// ============================================================================
// Operation Executor
// ============================================================================

class OperationExecutor {
  /**
   * Perform random swaps in a bin
   */
  static performSwaps(binId: bigint, count: number, rng: SeededRandom, stats: OperationStats): void {
    for (let i = 0; i < count; i++) {
      try {
        const swapXForY = rng.nextBoolean();
        const amount = rng.nextBigInt(TestConfig.SWAP_AMOUNT_MIN, TestConfig.SWAP_AMOUNT_MAX);
        
        if (swapXForY) {
          txOk(dlmmCore.swapXForY(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            Number(binId),
            amount
          ), alice);
        } else {
          txOk(dlmmCore.swapYForX(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            Number(binId),
            amount
          ), alice);
        }
        stats.successfulOps++;
        stats.totalOperations++;
      } catch (error: any) {
        stats.failedOps++;
        stats.totalOperations++;
      }
    }
  }

  /**
   * Perform random liquidity additions to a bin
   */
  static performAddLiquidity(binId: bigint, count: number, rng: SeededRandom, stats: OperationStats): void {
    const activeBin = PoolStateManager.getActiveBinId();
    
    for (let i = 0; i < count; i++) {
      try {
        const xAmount = rng.nextBigInt(TestConfig.LIQUIDITY_X_MIN, TestConfig.LIQUIDITY_X_MAX);
        const yAmount = rng.nextBigInt(TestConfig.LIQUIDITY_Y_MIN, TestConfig.LIQUIDITY_Y_MAX);
        
        let finalX = 0n;
        let finalY = 0n;
        
        if (binId < activeBin) {
          // y only
          finalX = 0n;
          finalY = yAmount;
        } else if (binId === activeBin) {
          // both x & y
          finalX = xAmount;
          finalY = yAmount;
        } else {
          // x only
          finalX = xAmount;
          finalY = 0n;
        }
        
        txOk(dlmmCore.addLiquidity(
          sbtcUsdcPool.identifier,
          mockSbtcToken.identifier,
          mockUsdcToken.identifier,
          Number(binId),
          finalX,
          finalY,
          TestConfig.MIN_DLP,
          TestConfig.MAX_LIQUIDITY_FEE,
          TestConfig.MAX_LIQUIDITY_FEE
        ), alice);
        stats.successfulOps++;
        stats.totalOperations++;
      } catch (error: any) {
        stats.failedOps++;
        stats.totalOperations++;
      }
    }
  }

  /**
   * Perform random liquidity removals from a bin
   */
  static performRemoveLiquidity(binId: bigint, count: number, rng: SeededRandom, stats: OperationStats): void {
    for (let i = 0; i < count; i++) {
      try {
        const lpBalance = PoolStateManager.getLpBalance(binId);
        
        if (lpBalance > 0n) {
          const maxRemove = lpBalance > TestConfig.MAX_LP_REMOVE ? TestConfig.MAX_LP_REMOVE : lpBalance;
          const removeAmount = rng.nextBigInt(1n, maxRemove);
          
          txOk(dlmmCore.withdrawLiquidity(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            Number(binId),
            removeAmount,
            0n, // min x amount
            0n  // min y amount
          ), alice);
          stats.successfulOps++;
          stats.totalOperations++;
        }
      } catch (error: any) {
        stats.failedOps++;
        stats.totalOperations++;
      }
    }
  }

  /**
   * Perform random liquidity moves from a bin
   */
  static performMoveLiquidity(binId: bigint, count: number, rng: SeededRandom, stats: OperationStats): void {
    for (let i = 0; i < count; i++) {
      try {
        const lpBalance = PoolStateManager.getLpBalance(binId);
        
        if (lpBalance > 0n) {
          const maxMove = lpBalance > TestConfig.MAX_LP_MOVE ? TestConfig.MAX_LP_MOVE : lpBalance;
          const moveAmount = rng.nextBigInt(1n, maxMove);
          const toBinId = binId + (rng.nextBoolean() ? 1n : -1n);
          
          // validate target bin is within range
          if (toBinId >= TestConfig.MIN_BIN && toBinId <= TestConfig.MAX_BIN) {
            txOk(dlmmCore.moveLiquidity(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              Number(binId),
              Number(toBinId),
              moveAmount,
              TestConfig.MIN_DLP,
              TestConfig.MAX_LIQUIDITY_FEE,
              TestConfig.MAX_LIQUIDITY_FEE
            ), alice);
            stats.successfulOps++;
            stats.totalOperations++;
          }
        }
      } catch (error: any) {
        stats.failedOps++;
        stats.totalOperations++;
      }
    }
  }

  /**
   * Perform cross-bin swap to move active bin toward target
   */
  static performCrossBinSwap(targetBinId: bigint, rng: SeededRandom, stats: OperationStats): void {
    try {
      const activeBin = PoolStateManager.getActiveBinId();
      const binDiff = targetBinId - activeBin;
      
      if (binDiff === 0n) return; // Already at target
      
      const largeAmount = rng.nextBigInt(TestConfig.CROSS_BIN_SWAP_MIN, TestConfig.CROSS_BIN_SWAP_MAX);
      
      if (binDiff > 0n) {
        txOk(dlmmCore.swapXForY(
          sbtcUsdcPool.identifier,
          mockSbtcToken.identifier,
          mockUsdcToken.identifier,
          Number(activeBin),
          largeAmount
        ), alice);
      } else {
        txOk(dlmmCore.swapYForX(
          sbtcUsdcPool.identifier,
          mockSbtcToken.identifier,
          mockUsdcToken.identifier,
          Number(activeBin),
          largeAmount
        ), alice);
      }
      stats.successfulOps++;
      stats.totalOperations++;
    } catch (error: any) {
      stats.failedOps++;
      stats.totalOperations++;
    }
  }
}

// ============================================================================
// Test Orchestrator
// ============================================================================

class TestOrchestrator {
  private rng: SeededRandom;
  private stats: OperationStats;

  constructor(seed: number) {
    this.rng = new SeededRandom(seed);
    this.stats = {
      totalOperations: 0,
      successfulOps: 0,
      failedOps: 0,
    };
  }

  /**
   * Process a single bin with random operations
   */
  processBin(binId: bigint): void {
    const hasLiquidity = PoolStateManager.binHasLiquidity(binId);
    
    console.log(`\nProcessing bin ${binId} | has liquidity: ${hasLiquidity}`);
    
    if (hasLiquidity) {
      const swapCount = this.rng.nextInt(TestConfig.SWAPS_PER_BIN_MIN, TestConfig.SWAPS_PER_BIN_MAX);
      const addLiqCount = this.rng.nextInt(TestConfig.ADD_LIQUIDITY_PER_BIN_MIN, TestConfig.ADD_LIQUIDITY_PER_BIN_MAX);
      const removeLiqCount = this.rng.nextInt(TestConfig.REMOVE_LIQUIDITY_PER_BIN_MIN, TestConfig.REMOVE_LIQUIDITY_PER_BIN_MAX);
      const moveLiqCount = this.rng.nextInt(TestConfig.MOVE_LIQUIDITY_PER_BIN_MIN, TestConfig.MOVE_LIQUIDITY_PER_BIN_MAX);
      
      OperationExecutor.performSwaps(binId, swapCount, this.rng, this.stats);
      OperationExecutor.performAddLiquidity(binId, addLiqCount, this.rng, this.stats);
      OperationExecutor.performRemoveLiquidity(binId, removeLiqCount, this.rng, this.stats);
      OperationExecutor.performMoveLiquidity(binId, moveLiqCount, this.rng, this.stats);
    }
  }

  /**
   * Traverse bins in a given direction
   */
  traverseBins(startBin: number, endBin: number, step: number, phaseName: string): void {
    console.log(`\n=== ${phaseName} ===`);
    
    const direction = step > 0 ? 1 : -1;
    for (let bin = startBin; direction > 0 ? bin <= endBin : bin >= endBin; bin += step) {
      const binId = BigInt(bin);
      
      this.processBin(binId);
      
      // Move to next bin if not at end
      if (bin !== endBin) {
        const nextBin = BigInt(bin + step);
        OperationExecutor.performCrossBinSwap(nextBin, this.rng, this.stats);
      }
      
      // Verify pool state is still valid
      const pool = PoolStateManager.getPoolState();
      expect(pool.poolCreated).toBe(true);
    }
  }

  /**
   * Get operation statistics
   */
  getStats(): OperationStats {
    return this.stats;
  }
}

// ============================================================================
// Invariant Validator
// ============================================================================

class InvariantValidator {
  /**
   * Validate final pool state and invariants
   */
  static validateFinalState(initialActiveBin: bigint, finalActiveBin: bigint): void {
    console.log(`  Initial active bin: ${initialActiveBin}`);
    console.log(`  Final active bin: ${finalActiveBin}`);
    
    // Pool should still be functional
    const pool = PoolStateManager.getPoolState();
    expect(pool.poolCreated).toBe(true);
    expect(finalActiveBin).toBeGreaterThanOrEqual(BigInt(TestConfig.MIN_BIN));
    expect(finalActiveBin).toBeLessThanOrEqual(BigInt(TestConfig.MAX_BIN));
    
    // Active bin should have non-negative balances
    const activeBinId = PoolStateManager.getActiveBinId();
    const unsignedBin = rovOk(dlmmCore.getUnsignedBinId(activeBinId));
    const poolBalances = rovOk(sbtcUsdcPool.getBinBalances(unsignedBin));
    expect(poolBalances.xBalance).toBeGreaterThanOrEqual(0n);
    expect(poolBalances.yBalance).toBeGreaterThanOrEqual(0n);
    
    // User token balances should be non-negative
    const sbtcBalance = rovOk(mockSbtcToken.getBalance(alice));
    const usdcBalance = rovOk(mockUsdcToken.getBalance(alice));
    expect(sbtcBalance).toBeGreaterThanOrEqual(0n);
    expect(usdcBalance).toBeGreaterThanOrEqual(0n);
  }
}

// ============================================================================
// Test Suite
// ============================================================================

describe('DLMM Core Comprehensive Fuzz Test', () => {
  
  beforeEach(async () => {
    setupTestEnvironment();
    
    txOk(mockSbtcToken.mint(TestConfig.INITIAL_BTC_BALANCE, alice), deployer);
    txOk(mockUsdcToken.mint(TestConfig.INITIAL_USDC_BALANCE, alice), deployer);
  });

  it('should handle comprehensive fuzz test: traverse bins 0 > -500 > 500 > 0', async () => {
    const initialPool = PoolStateManager.getPoolState();
    const initialActiveBin = initialPool.activeBinId;
    
    console.log(`Starting comprehensive fuzz test`);
    console.log(`Initial active bin: ${initialActiveBin}`);
    
    const orchestrator = new TestOrchestrator(TestConfig.RANDOM_SEED);
    
    // 0 to -500
    orchestrator.traverseBins(0, TestConfig.MIN_BIN, -TestConfig.BIN_STEP, 'traverse from bin 0 to bin -500');
    
    // -500 to 500
    orchestrator.traverseBins(TestConfig.MIN_BIN, TestConfig.MAX_BIN, TestConfig.BIN_STEP, 'traverse from bin -500 to bin 500');
    
    // 500 to 0
    orchestrator.traverseBins(TestConfig.MAX_BIN, 0, -TestConfig.BIN_STEP, 'traverse from bin 500 to bin 0');
    
    // get stats
    const stats = orchestrator.getStats();
    const finalPool = PoolStateManager.getPoolState();
    const finalActiveBin = finalPool.activeBinId;
    
    console.log(`\n=== Fuzz Test Complete ===`);
    console.log(`  Total operations: ${stats.totalOperations}`);
    console.log(`  Successful operations: ${stats.successfulOps}`);
    console.log(`  Failed operations: ${stats.failedOps}`);
    
    // final sanity checks
    InvariantValidator.validateFinalState(initialActiveBin, finalActiveBin);
  }, TestConfig.TIMEOUT);
});
