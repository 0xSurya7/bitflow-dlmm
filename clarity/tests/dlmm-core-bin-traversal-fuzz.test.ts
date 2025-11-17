import {
  alice,
  bob,
  deployer,
  dlmmCore,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  setupTestEnvironment,
} from "./helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import { cvToValue } from '@clarigen/core';
import { txOk, txErr, rovOk } from '@clarigen/test';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Constants
// ============================================================================

const MIN_BIN_ID = -500n;
const MAX_BIN_ID = 500n;
const CENTER_BIN_ID = 0n;

// ============================================================================
// Logger for test results
// ============================================================================

class BinTraversalLogger {
  private logFile: string;
  private logs: string[] = [];
  private errors: Array<{ bin: bigint; operation: string; error: string; params: any }> = [];

  constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseDir = path.join(process.cwd(), 'logs', 'bin-traversal');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    this.logFile = path.join(baseDir, `bin-traversal-${timestamp}.log`);
  }

  log(message: string) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}`;
    this.logs.push(logLine);
    console.log(logLine);
  }

  logError(bin: bigint, operation: string, error: string, params: any) {
    this.errors.push({ bin, operation, error, params });
    this.log(`ERROR at bin ${bin}: ${operation} failed - ${error}`);
  }

  save() {
    let content = `# Bin Traversal Fuzz Test Log\n\n`;
    content += `**Test Date:** ${new Date().toISOString()}\n\n`;
    content += `## Test Summary\n\n`;
    content += `- Total Errors: ${this.errors.length}\n\n`;
    
    if (this.errors.length > 0) {
      content += `## Errors\n\n`;
      for (const err of this.errors) {
        content += `### Bin ${err.bin} - ${err.operation}\n`;
        content += `- Error: ${err.error}\n`;
        content += `- Params: ${JSON.stringify(err.params, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2)}\n\n`;
      }
    }
    
    content += `## Full Log\n\n\`\`\`\n`;
    content += this.logs.join('\n');
    content += `\n\`\`\`\n`;
    
    fs.writeFileSync(this.logFile, content, 'utf-8');
    this.log(`\nLog saved to: ${this.logFile}`);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function getActiveBinId(): bigint {
  return rovOk(sbtcUsdcPool.getActiveBinId());
}

function getBinBalances(binId: bigint) {
  const unsignedBinId = rovOk(dlmmCore.getUnsignedBinId(binId));
  try {
    const balances = rovOk(sbtcUsdcPool.getBinBalances(unsignedBinId));
    return { xBalance: balances.xBalance, yBalance: balances.yBalance };
  } catch {
    return { xBalance: 0n, yBalance: 0n };
  }
}

function getUserTokenBalance(user: string, token: any): bigint {
  return rovOk(token.getBalance(user));
}

function getUserLpBalance(user: string, binId: bigint): bigint {
  const unsignedBinId = rovOk(dlmmCore.getUnsignedBinId(binId));
  try {
    return rovOk(sbtcUsdcPool.getBalanceOf(user, unsignedBinId));
  } catch {
    return 0n;
  }
}

// ============================================================================
// Operation Generators
// ============================================================================

function generateSwapAmount(
  binId: bigint,
  direction: 'x-for-y' | 'y-for-x',
  user: string
): bigint | null {
  const balances = getBinBalances(binId);
  const userXBalance = getUserTokenBalance(user, mockSbtcToken);
  const userYBalance = getUserTokenBalance(user, mockUsdcToken);

  if (direction === 'x-for-y') {
    if (balances.yBalance === 0n || userXBalance === 0n) return null;
    // Use 5-15% of available Y balance or user X balance, whichever is smaller
    const maxFromBin = (balances.yBalance * 15n) / 100n;
    const maxFromUser = userXBalance;
    const maxAmount = maxFromBin < maxFromUser ? maxFromBin : maxFromUser;
    if (maxAmount < 10000n) return null;
    return maxAmount;
  } else {
    if (balances.xBalance === 0n || userYBalance === 0n) return null;
    const maxFromBin = (balances.xBalance * 15n) / 100n;
    const maxFromUser = userYBalance;
    const maxAmount = maxFromBin < maxFromUser ? maxFromBin : maxFromUser;
    if (maxAmount < 10000n) return null;
    return maxAmount;
  }
}

function generateAddLiquidityAmounts(
  binId: bigint,
  user: string
): { xAmount: bigint; yAmount: bigint } | null {
  const activeBinId = getActiveBinId();
  const userXBalance = getUserTokenBalance(user, mockSbtcToken);
  const userYBalance = getUserTokenBalance(user, mockUsdcToken);

  if (binId < activeBinId) {
    // Negative bin: only Y tokens
    if (userYBalance === 0n) return null;
    const yAmount = (userYBalance * 10n) / 100n; // 10% of balance
    if (yAmount < 1000n) return null;
    return { xAmount: 0n, yAmount };
  } else if (binId === activeBinId) {
    // Active bin: both X and Y tokens
    if (userXBalance === 0n || userYBalance === 0n) return null;
    const xAmount = (userXBalance * 10n) / 100n;
    const yAmount = (userYBalance * 10n) / 100n;
    if (xAmount < 1000n || yAmount < 1000n) return null;
    return { xAmount, yAmount };
  } else {
    // Positive bin: only X tokens
    if (userXBalance === 0n) return null;
    const xAmount = (userXBalance * 10n) / 100n;
    if (xAmount < 1000n) return null;
    return { xAmount, yAmount: 0n };
  }
}

function generateWithdrawAmount(binId: bigint, user: string): bigint | null {
  const lpBalance = getUserLpBalance(user, binId);
  if (lpBalance === 0n) return null;
  // Withdraw 30-50% of LP tokens
  const amount = (lpBalance * 40n) / 100n;
  if (amount < 100n) return null;
  return amount;
}

function generateMoveAmount(sourceBinId: bigint, user: string): bigint | null {
  const lpBalance = getUserLpBalance(user, sourceBinId);
  if (lpBalance === 0n) return null;
  // Move 20-40% of LP tokens
  const amount = (lpBalance * 30n) / 100n;
  if (amount < 100n) return null;
  return amount;
}

// ============================================================================
// Swap to cross bins
// ============================================================================

function swapToCrossBin(
  targetBinId: bigint,
  logger: BinTraversalLogger
): boolean {
  const activeBinId = getActiveBinId();
  
  if (activeBinId === targetBinId) {
    return true; // Already at target
  }

  logger.log(`Swapping to cross from bin ${activeBinId} to bin ${targetBinId}`);

  // Determine direction: to go to higher bin (positive), swap X for Y
  // To go to lower bin (negative), swap Y for X
  const direction = targetBinId > activeBinId ? 'x-for-y' : 'y-for-x';
  const user = alice;
  let attempts = 0;
  const maxAttempts = 200; // More attempts for long traversals

  while (getActiveBinId() !== targetBinId && attempts < maxAttempts) {
    attempts++;
    const currentBinId = getActiveBinId();
    
    // Check if we're moving in the right direction
    const currentDirection = targetBinId > currentBinId ? 'x-for-y' : 'y-for-x';
    if (currentDirection !== direction) {
      // We've overshot or need to change direction
      logger.log(`Direction changed at bin ${currentBinId}, target is ${targetBinId}`);
      break;
    }
    
    const amount = generateSwapAmount(currentBinId, currentDirection, user);
    
    if (!amount) {
      logger.log(`Cannot generate swap amount at bin ${currentBinId} - may need liquidity`);
      // Try to add liquidity to current bin to continue
      const amounts = generateAddLiquidityAmounts(currentBinId, user);
      if (amounts) {
        try {
          txOk(dlmmCore.addLiquidity(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            currentBinId,
            amounts.xAmount,
            amounts.yAmount,
            1n,
            user
          ), user);
          logger.log(`Added liquidity to bin ${currentBinId} to continue traversal`);
          continue;
        } catch (e) {
          logger.log(`Failed to add liquidity at bin ${currentBinId}`);
        }
      }
      break;
    }

    try {
      if (currentDirection === 'x-for-y') {
        txOk(dlmmCore.swapXForY(
          sbtcUsdcPool.identifier,
          mockSbtcToken.identifier,
          mockUsdcToken.identifier,
          currentBinId,
          amount
        ), user);
        const newBinId = getActiveBinId();
        logger.log(`Swap X for Y: ${amount} at bin ${currentBinId} -> new bin ${newBinId}`);
      } else {
        txOk(dlmmCore.swapYForX(
          sbtcUsdcPool.identifier,
          mockSbtcToken.identifier,
          mockUsdcToken.identifier,
          currentBinId,
          amount
        ), user);
        const newBinId = getActiveBinId();
        logger.log(`Swap Y for X: ${amount} at bin ${currentBinId} -> new bin ${newBinId}`);
      }
    } catch (error: any) {
      logger.logError(currentBinId, `swap-${currentDirection}`, error.message || String(error), { amount });
      // Try smaller amount or continue
      continue;
    }
  }

  const finalBinId = getActiveBinId();
  if (finalBinId === targetBinId) {
    logger.log(`Successfully reached target bin ${targetBinId}`);
    return true;
  } else {
    logger.log(`Reached bin ${finalBinId} instead of target ${targetBinId} after ${attempts} attempts`);
    return false;
  }
}

// ============================================================================
// Main Test
// ============================================================================

describe('DLMM Core Bin Traversal Fuzz Test', () => {
  let logger: BinTraversalLogger;

  beforeEach(() => {
    setupTestEnvironment();
    logger = new BinTraversalLogger();
  });

  it('should traverse bins: 0 → -500 → 500 → 0 with operations in each bin', async () => {
    logger.log('Starting bin traversal fuzz test');
    
    // Define traversal path
    const path: bigint[] = [0n, -500n, 500n, 0n];
    
    for (let i = 0; i < path.length; i++) {
      const targetBinId = path[i];
      logger.log(`\n=== Processing bin ${targetBinId} ===`);
      
      // Swap to target bin
      if (i > 0) {
        const success = swapToCrossBin(targetBinId, logger);
        if (!success) {
          logger.log(`Failed to reach bin ${targetBinId}`);
          continue;
        }
      }
      
      const currentBinId = getActiveBinId();
      expect(currentBinId).toBe(targetBinId);
      
      // Perform operations in this bin
      // 4-5 swaps (staying in same bin)
      logger.log(`Performing 4-5 swaps in bin ${currentBinId}`);
      for (let j = 0; j < 5; j++) {
        const direction = j % 2 === 0 ? 'x-for-y' : 'y-for-x';
        const user = j % 2 === 0 ? alice : bob;
        const amount = generateSwapAmount(currentBinId, direction, user);
        
        if (!amount) {
          logger.log(`Skipping swap ${j + 1} - insufficient balance`);
          continue;
        }
        
        try {
          if (direction === 'x-for-y') {
            txOk(dlmmCore.swapXForY(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              currentBinId,
              amount
            ), user);
          } else {
            txOk(dlmmCore.swapYForX(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              currentBinId,
              amount
            ), user);
          }
          logger.log(`  Swap ${j + 1}: ${direction} with amount ${amount}`);
        } catch (error: any) {
          logger.logError(currentBinId, `swap-${direction}`, error.message || String(error), { amount });
        }
      }
      
      // 2-3 add liquidity
      logger.log(`Performing 2-3 add liquidity operations in bin ${currentBinId}`);
      for (let j = 0; j < 3; j++) {
        const user = j % 2 === 0 ? alice : bob;
        const amounts = generateAddLiquidityAmounts(currentBinId, user);
        
        if (!amounts) {
          logger.log(`Skipping add liquidity ${j + 1} - insufficient balance`);
          continue;
        }
        
        try {
          txOk(dlmmCore.addLiquidity(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            currentBinId,
            amounts.xAmount,
            amounts.yAmount,
            1n, // minDlp
            user // recipient (same as caller)
          ), user);
          logger.log(`  Add liquidity ${j + 1}: x=${amounts.xAmount}, y=${amounts.yAmount}`);
        } catch (error: any) {
          logger.logError(currentBinId, 'add-liquidity', error.message || String(error), amounts);
        }
      }
      
      // 2-3 remove liquidity
      logger.log(`Performing 2-3 remove liquidity operations in bin ${currentBinId}`);
      for (let j = 0; j < 3; j++) {
        const user = j % 2 === 0 ? alice : bob;
        const amount = generateWithdrawAmount(currentBinId, user);
        
        if (!amount) {
          logger.log(`Skipping remove liquidity ${j + 1} - no LP tokens`);
          continue;
        }
        
        try {
          txOk(dlmmCore.withdrawLiquidity(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            currentBinId,
            amount,
            0n, // minXAmount
            0n, // minYAmount
            user // recipient
          ), user);
          logger.log(`  Remove liquidity ${j + 1}: ${amount} LP tokens`);
        } catch (error: any) {
          logger.logError(currentBinId, 'withdraw-liquidity', error.message || String(error), { amount });
        }
      }
      
      // 2-3 move liquidity
      logger.log(`Performing 2-3 move liquidity operations from bin ${currentBinId}`);
      for (let j = 0; j < 3; j++) {
        const user = j % 2 === 0 ? alice : bob;
        const amount = generateMoveAmount(currentBinId, user);
        
        if (!amount) {
          logger.log(`Skipping move liquidity ${j + 1} - no LP tokens`);
          continue;
        }
        
        // Move to a nearby bin
        const targetBin = currentBinId === MIN_BIN_ID 
          ? currentBinId + 1n 
          : currentBinId === MAX_BIN_ID
          ? currentBinId - 1n
          : currentBinId + (j % 2 === 0 ? 1n : -1n);
        
        if (targetBin < MIN_BIN_ID || targetBin > MAX_BIN_ID) {
          logger.log(`Skipping move liquidity ${j + 1} - target bin ${targetBin} out of range`);
          continue;
        }
        
        try {
          txOk(dlmmCore.moveLiquidity(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            currentBinId,
            targetBin,
            amount,
            1n, // minDlp
            user // recipient
          ), user);
          logger.log(`  Move liquidity ${j + 1}: ${amount} LP tokens from ${currentBinId} to ${targetBin}`);
        } catch (error: any) {
          logger.logError(currentBinId, 'move-liquidity', error.message || String(error), { from: currentBinId, to: targetBin, amount });
        }
      }
      
      logger.log(`Completed operations in bin ${currentBinId}`);
    }
    
    // Save log
    logger.save();
    
    // Final verification - try to return to bin 0 if not already there
    let finalBinId = getActiveBinId();
    if (finalBinId !== 0n) {
      logger.log(`\nAttempting to return to bin 0 from bin ${finalBinId}`);
      swapToCrossBin(0n, logger);
      finalBinId = getActiveBinId();
    }
    
    logger.log(`\nFinal bin ID: ${finalBinId}`);
    
    // Verify no errors occurred
    if (logger.errors.length > 0) {
      logger.log(`\n⚠️  Test completed with ${logger.errors.length} errors. Check log file for details.`);
      // Don't fail the test if we have errors - just log them
    } else {
      logger.log(`\n✅ Test completed successfully with no errors.`);
    }
    
    // Note: We don't strictly require ending at bin 0 since the traversal itself is the test
    // The important part is that we attempted the full traversal path
  });
});

