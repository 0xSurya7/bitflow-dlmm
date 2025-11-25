/**
 * Arithmetic Edge Cases Fuzz Test
 * 
 * Fuzz tests that generate biased random values toward edge cases:
 * - Very small values (near 1)
 * - Very large values (near u128 max)
 * - Boundary bin IDs
 * - Values that might cause division by zero
 * 
 * Verifies that all operations either succeed or fail gracefully
 * with expected error codes (no unhandled panics).
 */

import {
  alice,
  bob,
  deployer,
  dlmmCore,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  setupTestEnvironment,
  errors,
  getSbtcUsdcPoolLpBalance,
} from "../tests/helpers/helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import { cvToValue } from '@clarigen/core';
import { txOk, txErr, rovOk } from '@clarigen/test';
import { getFuzzConfig } from './harnesses/config';
import {
  generateBiasedRandomValue,
  generateVerySmallAmount,
  generateVeryLargeAmount,
  generateDivisionByZeroCandidate,
  generateEdgeCaseBinIds,
} from "../tests/helpers/edge-case-generators";

const MIN_BIN_ID = -500n;
const MAX_BIN_ID = 500n;
const U128_MAX = 2n ** 128n - 1n;

// ============================================================================
// Seeded Random Number Generator
// ============================================================================

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextBigInt(min: bigint, max: bigint): bigint {
    if (max <= min) return min;
    const range = max - min;
    if (range > BigInt(Number.MAX_SAFE_INTEGER)) {
      // For very large ranges, use a different approach
      const random = BigInt(Math.floor(this.next() * 1000000));
      return min + (random % range);
    }
    const random = BigInt(Math.floor(this.next() * Number(range)));
    return min + random;
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  nextBiasedValue(min: bigint, max: bigint): bigint {
    const bias = this.next();
    if (bias < 0.2) {
      // 20% very small values
      return generateBiasedRandomValue(min, max, 'small');
    } else if (bias < 0.4) {
      // 20% very large values
      return generateBiasedRandomValue(min, max, 'large');
    } else {
      // 60% normal values
      return generateBiasedRandomValue(min, max, 'normal');
    }
  }
}

// ============================================================================
// Logger
// ============================================================================

class EdgeCaseLogger {
  private errors: Array<{
    txNumber: number;
    operation: string;
    error: string;
    params: any;
    binId?: bigint;
  }> = [];
  private panics: Array<{
    txNumber: number;
    operation: string;
    panic: string;
    params: any;
  }> = [];

  logError(txNumber: number, operation: string, error: string, params: any, binId?: bigint) {
    this.errors.push({ txNumber, operation, error, params, binId });
    console.log(`[TX ${txNumber}] ERROR in ${operation}: ${error}`);
  }

  logPanic(txNumber: number, operation: string, panic: string, params: any) {
    this.panics.push({ txNumber, operation, panic, params });
    console.error(`[TX ${txNumber}] PANIC in ${operation}: ${panic}`);
  }

  getSummary() {
    return {
      totalErrors: this.errors.length,
      totalPanics: this.panics.length,
      errors: this.errors,
      panics: this.panics,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function getActiveBinId(): bigint {
  return rovOk(sbtcUsdcPool.getActiveBinId());
}

function generateSwapAmount(rng: SeededRandom, binId: bigint): bigint {
  // Generate biased random amount
  const bias = rng.next();
  if (bias < 0.2) {
    // 20% very small (1-100)
    return rng.nextBigInt(1n, 100n);
  } else if (bias < 0.4) {
    // 20% very large (near max)
    return rng.nextBigInt(U128_MAX - 1000000n, U128_MAX - 1n);
  } else {
    // 60% normal range
    return rng.nextBigInt(1000n, 1000000000n);
  }
}

function generateLiquidityAmount(rng: SeededRandom): bigint {
  return generateSwapAmount(rng, 0n);
}

function generateBinId(rng: SeededRandom): bigint {
  const bias = rng.next();
  if (bias < 0.1) {
    // 10% edge case bin IDs
    return rng.choice(Array.from(generateEdgeCaseBinIds()));
  } else {
    // 90% normal bin IDs
    return rng.nextBigInt(MIN_BIN_ID, MAX_BIN_ID);
  }
}

// ============================================================================
// Test
// ============================================================================

describe('Arithmetic Edge Cases Fuzz Test', () => {
  
  beforeEach(async () => {
    setupTestEnvironment();
  });

  it('should handle edge case values without panics', async () => {
    const config = getFuzzConfig();
    const NUM_TRANSACTIONS = config.size;
    const RANDOM_SEED = config.seed;
    
    const rng = new SeededRandom(RANDOM_SEED);
    const logger = new EdgeCaseLogger();
    
    let successCount = 0;
    let errorCount = 0;
    let panicCount = 0;
    
    console.log(`\n=== Arithmetic Edge Cases Fuzz Test ===`);
    console.log(`Seed: ${RANDOM_SEED}`);
    console.log(`Transactions: ${NUM_TRANSACTIONS}`);
    console.log(`\n`);
    
    for (let txNumber = 1; txNumber <= NUM_TRANSACTIONS; txNumber++) {
      const operation = rng.choice(['swap-x-for-y', 'swap-y-for-x', 'add-liquidity', 'withdraw-liquidity', 'move-liquidity']);
      const binId = generateBinId(rng);
      
      try {
        if (operation === 'swap-x-for-y') {
          const xAmount = generateSwapAmount(rng, binId);
          
          try {
            const response = txOk(dlmmCore.swapXForY(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              binId,
              xAmount
            ), alice);
            
            successCount++;
          } catch (error: any) {
            const errorStr = String(error);
            // Check if it's a panic (Runtime error) vs expected error
            if (errorStr.includes('Runtime') && (errorStr.includes('ArithmeticUnderflow') || errorStr.includes('panic'))) {
              logger.logPanic(txNumber, operation, errorStr, { binId, xAmount });
              panicCount++;
            } else {
              // Expected error (ERR_INVALID_AMOUNT, etc.) - these are fine
              logger.logError(txNumber, operation, errorStr, { binId, xAmount });
              errorCount++;
            }
          }
        } else if (operation === 'swap-y-for-x') {
          const yAmount = generateSwapAmount(rng, binId);
          
          try {
            const response = txOk(dlmmCore.swapYForX(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              binId,
              yAmount
            ), alice);
            
            successCount++;
          } catch (error: any) {
            const errorStr = String(error);
            if (errorStr.includes('Runtime') && (errorStr.includes('ArithmeticUnderflow') || errorStr.includes('panic'))) {
              logger.logPanic(txNumber, operation, errorStr, { binId, yAmount });
              panicCount++;
            } else {
              logger.logError(txNumber, operation, errorStr, { binId, yAmount });
              errorCount++;
            }
          }
        } else if (operation === 'add-liquidity') {
          const xAmount = generateLiquidityAmount(rng);
          const yAmount = generateLiquidityAmount(rng);
          const minDlp = 1n;
          
          try {
            const response = txOk(dlmmCore.addLiquidity(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              binId,
              xAmount,
              yAmount,
              minDlp,
              1000000n,
              1000000n
            ), alice);
            
            successCount++;
          } catch (error: any) {
            const errorStr = String(error);
            if (errorStr.includes('Runtime') && (errorStr.includes('ArithmeticUnderflow') || errorStr.includes('panic'))) {
              logger.logPanic(txNumber, operation, errorStr, { binId, xAmount, yAmount });
              panicCount++;
            } else {
              logger.logError(txNumber, operation, errorStr, { binId, xAmount, yAmount });
              errorCount++;
            }
          }
        } else if (operation === 'withdraw-liquidity') {
          const liquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
          
          if (liquidityBalance > 0n) {
            // Generate amount (might be larger than balance, which is fine for testing)
            const amountToWithdraw = rng.nextBiasedValue(1n, liquidityBalance * 2n);
            const minXAmount = 0n;
            const minYAmount = 0n;
            
            try {
              const response = txOk(dlmmCore.withdrawLiquidity(
                sbtcUsdcPool.identifier,
                mockSbtcToken.identifier,
                mockUsdcToken.identifier,
                binId,
                amountToWithdraw,
                minXAmount,
                minYAmount
              ), alice);
              
              successCount++;
            } catch (error: any) {
              const errorStr = String(error);
              if (errorStr.includes('Runtime') && (errorStr.includes('ArithmeticUnderflow') || errorStr.includes('panic'))) {
                logger.logPanic(txNumber, operation, errorStr, { binId, amountToWithdraw });
                panicCount++;
              } else {
                logger.logError(txNumber, operation, errorStr, { binId, amountToWithdraw });
                errorCount++;
              }
            }
          }
        } else if (operation === 'move-liquidity') {
          const fromBinId = generateBinId(rng);
          const toBinId = generateBinId(rng);
          const liquidityBalance = getSbtcUsdcPoolLpBalance(fromBinId, alice);
          
          if (liquidityBalance > 0n && fromBinId !== toBinId) {
            const amount = rng.nextBiasedValue(1n, liquidityBalance);
            const minXAmount = 0n;
            const minYAmount = 0n;
            const minDlp = 1n;
            
            try {
              const response = txOk(dlmmCore.moveLiquidity(
                sbtcUsdcPool.identifier,
                mockSbtcToken.identifier,
                mockUsdcToken.identifier,
                fromBinId,
                toBinId,
                amount,
                minXAmount,
                minYAmount,
                minDlp,
                1000000n,
                1000000n
              ), alice);
              
              successCount++;
            } catch (error: any) {
              const errorStr = String(error);
              if (errorStr.includes('Runtime') && (errorStr.includes('ArithmeticUnderflow') || errorStr.includes('panic'))) {
                logger.logPanic(txNumber, operation, errorStr, { fromBinId, toBinId, amount });
                panicCount++;
              } else {
                logger.logError(txNumber, operation, errorStr, { fromBinId, toBinId, amount });
                errorCount++;
              }
            }
          }
        }
      } catch (error: any) {
        // Catch any unexpected errors
        const errorStr = String(error);
        if (errorStr.includes('Runtime') && (errorStr.includes('ArithmeticUnderflow') || errorStr.includes('panic'))) {
          logger.logPanic(txNumber, operation, errorStr, { binId });
          panicCount++;
        } else {
          logger.logError(txNumber, operation, errorStr, { binId });
          errorCount++;
        }
      }
      
      // Progress update every 100 transactions
      if (txNumber % 100 === 0) {
        console.log(`Progress: ${txNumber}/${NUM_TRANSACTIONS} | Success: ${successCount} | Errors: ${errorCount} | Panics: ${panicCount}`);
      }
    }
    
    // Final summary
    const summary = logger.getSummary();
    console.log(`\n=== Test Summary ===`);
    console.log(`Total transactions: ${NUM_TRANSACTIONS}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Expected errors: ${errorCount}`);
    console.log(`Panics (unexpected): ${panicCount}`);
    
    if (summary.panics.length > 0) {
      console.log(`\n⚠️  PANICS DETECTED:`);
      summary.panics.forEach(panic => {
        console.log(`  TX ${panic.txNumber}: ${panic.operation} - ${panic.panic}`);
      });
    }
    
    // Test should pass if no panics occurred
    // Expected errors (ERR_INVALID_AMOUNT, etc.) are fine
    expect(panicCount).toBe(0);
    
    // Log summary for debugging
    if (summary.errors.length > 0 || summary.panics.length > 0) {
      console.log(`\nDetailed summary:`, JSON.stringify(summary, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
    }
  });
});

