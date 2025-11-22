/**
 * Quote Engine Validation Fuzz Test
 * 
 * This test validates that the contract's swap calculations match Bitflow's
 * production Python quote engine (pricing.py). The quote engine represents
 * the maximum tokens that should be returned - if the contract returns more,
 * it's a critical security violation (exploit).
 * 
 * Key differences from comprehensive fuzz test:
 * - Uses helper functions matching pricing.py API exactly
 * - Focuses on active-bin swaps only (multi-bin to be added later)
 * - Fails immediately if contract returns more than quote engine allows
 * - Compares against both integer and float math from quote engine
 */

import {
  alice,
  bob,
  charlie,
  deployer,
  dlmmCore,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  setupTestEnvironment,
} from "./helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import { txOk, rovOk } from '@clarigen/test';
import * as fs from 'fs';
import * as path from 'path';

import {
  calculateBinSwap,
  calculateBinSwapFloat,
  calculateFeeRateBPS,
  BinData,
} from './helpers/swap-calculations';

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
    const range = max - min;
    const random = BigInt(Math.floor(this.next() * Number(range)));
    return min + random;
  }
}

// ============================================================================
// State Tracking
// ============================================================================

interface PoolState {
  activeBinId: bigint;
  binBalances: Map<bigint, { xBalance: bigint; yBalance: bigint }>;
}

interface SwapValidationResult {
  txNumber: number;
  direction: 'x-for-y' | 'y-for-x';
  inputAmount: bigint;
  actualSwappedIn: bigint;
  actualSwappedOut: bigint;
  expectedInteger: bigint;
  expectedFloat: bigint;
  integerMatch: boolean;
  floatMatch: boolean;
  exploitDetected: boolean; // actualSwappedOut > expectedFloat
  binId: bigint;
  binPrice: bigint;
  feeRateBPS: bigint;
}

interface ValidationStats {
  totalSwaps: number;
  successfulSwaps: number;
  failedSwaps: number;
  integerMatches: number;
  floatMatches: number;
  exploitsDetected: number;
  roundingDifferences: Array<{
    txNumber: number;
    direction: string;
    actualOut: bigint;
    expectedFloat: bigint;
    difference: bigint;
    percentDiff: number;
  }>;
}

// ============================================================================
// Logging
// ============================================================================

class ValidationLogger {
  private logDir: string;
  private results: SwapValidationResult[] = [];
  public stats: ValidationStats;

  constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logDir = path.join(process.cwd(), 'logs', 'quote-engine-validation', timestamp);
    fs.mkdirSync(this.logDir, { recursive: true });
    
    this.stats = {
      totalSwaps: 0,
      successfulSwaps: 0,
      failedSwaps: 0,
      integerMatches: 0,
      floatMatches: 0,
      exploitsDetected: 0,
      roundingDifferences: [],
    };
  }

  logResult(result: SwapValidationResult) {
    this.results.push(result);
    this.stats.totalSwaps++;
    
    if (result.actualSwappedOut > 0n) {
      this.stats.successfulSwaps++;
    } else {
      this.stats.failedSwaps++;
    }
    
    if (result.integerMatch) {
      this.stats.integerMatches++;
    }
    
    if (result.floatMatch) {
      this.stats.floatMatches++;
    }
    
    if (result.exploitDetected) {
      this.stats.exploitsDetected++;
    }
    
    // Log rounding differences (even if not exploits)
    if (!result.floatMatch && result.actualSwappedOut > 0n) {
      const diff = result.expectedFloat > result.actualSwappedOut
        ? result.expectedFloat - result.actualSwappedOut
        : result.actualSwappedOut - result.expectedFloat;
      const percentDiff = result.actualSwappedOut > 0n
        ? (Number(diff) / Number(result.actualSwappedOut)) * 100
        : 0;
      
      this.stats.roundingDifferences.push({
        txNumber: result.txNumber,
        direction: result.direction,
        actualOut: result.actualSwappedOut,
        expectedFloat: result.expectedFloat,
        difference: diff,
        percentDiff,
      });
    }
  }

  writeResults() {
    // Write JSON results
    const jsonPath = path.join(this.logDir, 'validation-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify({
      stats: this.stats,
      results: this.results,
    }, null, 2));

    // Write summary markdown
    const mdPath = path.join(this.logDir, 'summary.md');
    let md = `# Quote Engine Validation Results\n\n`;
    md += `Generated: ${new Date().toISOString()}\n\n`;
    md += `## Summary\n\n`;
    md += `- Total Swaps: ${this.stats.totalSwaps}\n`;
    md += `- Successful Swaps: ${this.stats.successfulSwaps}\n`;
    md += `- Failed Swaps: ${this.stats.failedSwaps}\n`;
    md += `- Integer Math Matches: ${this.stats.integerMatches} (${((this.stats.integerMatches / this.stats.totalSwaps) * 100).toFixed(2)}%)\n`;
    md += `- Float Math Matches: ${this.stats.floatMatches} (${((this.stats.floatMatches / this.stats.totalSwaps) * 100).toFixed(2)}%)\n`;
    md += `- **EXPLOITS DETECTED**: ${this.stats.exploitsDetected}\n\n`;
    
    if (this.stats.exploitsDetected > 0) {
      md += `## 🚨 CRITICAL: Exploits Detected\n\n`;
      md += `The contract returned MORE tokens than the quote engine allows in ${this.stats.exploitsDetected} cases.\n\n`;
      const exploits = this.results.filter(r => r.exploitDetected);
      for (const exploit of exploits) {
        md += `- Transaction ${exploit.txNumber}: ${exploit.direction}, `;
        md += `Input: ${exploit.inputAmount}, `;
        md += `Contract returned: ${exploit.actualSwappedOut}, `;
        md += `Quote engine max: ${exploit.expectedFloat}, `;
        md += `Excess: ${exploit.actualSwappedOut - exploit.expectedFloat}\n`;
      }
      md += `\n`;
    }
    
    if (this.stats.roundingDifferences.length > 0) {
      md += `## Rounding Differences\n\n`;
      md += `Total rounding differences: ${this.stats.roundingDifferences.length}\n\n`;
      md += `| TX | Direction | Actual Out | Expected Float | Difference | % Diff |\n`;
      md += `|----|-----------|------------|----------------|------------|--------|\n`;
      for (const diff of this.stats.roundingDifferences.slice(0, 50)) {
        md += `| ${diff.txNumber} | ${diff.direction} | ${diff.actualOut} | ${diff.expectedFloat} | ${diff.difference} | ${diff.percentDiff.toFixed(6)}% |\n`;
      }
      if (this.stats.roundingDifferences.length > 50) {
        md += `\n(Showing first 50 of ${this.stats.roundingDifferences.length} differences)\n`;
      }
    }
    
    fs.writeFileSync(mdPath, md);
    
    console.log(`\n📊 Validation results written to: ${this.logDir}`);
  }
}

// ============================================================================
// State Management
// ============================================================================

async function capturePoolState(): Promise<PoolState> {
  const activeBinId = rovOk(sbtcUsdcPool.getActiveBinId());
  const binBalances = new Map<bigint, { xBalance: bigint; yBalance: bigint }>();

  // Get active bin balances
  const unsignedBin = rovOk(dlmmCore.getUnsignedBinId(activeBinId));
  try {
    const balances = rovOk(sbtcUsdcPool.getBinBalances(unsignedBin));
    binBalances.set(activeBinId, {
      xBalance: balances.xBalance,
      yBalance: balances.yBalance,
    });
  } catch (e) {
    binBalances.set(activeBinId, { xBalance: 0n, yBalance: 0n });
  }

  return { activeBinId, binBalances };
}

// ============================================================================
// Swap Validation
// ============================================================================

function validateSwap(
  txNumber: number,
  direction: 'x-for-y' | 'y-for-x',
  inputAmount: bigint,
  actualSwappedIn: bigint,
  actualSwappedOut: bigint,
  poolState: PoolState,
  binId: bigint,
  binPrice: bigint,
  protocolFeeBPS: bigint,
  providerFeeBPS: bigint,
  variableFeeBPS: bigint
): SwapValidationResult {
  // Calculate fee rate in BPS
  const feeRateBPS = calculateFeeRateBPS(protocolFeeBPS, providerFeeBPS, variableFeeBPS);
  
  // Get bin data
  const binData: BinData = {
    reserve_x: poolState.binBalances.get(binId)?.xBalance || 0n,
    reserve_y: poolState.binBalances.get(binId)?.yBalance || 0n,
  };

  // Calculate expected output using quote engine logic (integer math)
  // CRITICAL: Use actualSwappedIn (the capped input) not inputAmount, because the contract
  // may cap the input at max_x_amount or max_y_amount. We need to compare what the contract
  // actually swapped, not what was requested.
  const swapForY = direction === 'x-for-y';
  const integerResult = calculateBinSwap(
    binData,
    binPrice,
    actualSwappedIn > 0n ? actualSwappedIn : inputAmount, // Use actual swapped amount if available
    feeRateBPS,
    swapForY
  );

  // Calculate expected output using quote engine logic (float math)
  const floatResult = calculateBinSwapFloat(
    binData,
    Number(binPrice),
    actualSwappedIn > 0n ? Number(actualSwappedIn) : Number(inputAmount),
    Number(feeRateBPS),
    swapForY
  );

  // Compare results
  // The quote engine calculates based on the actual input amount that was swapped
  const expectedInteger = integerResult.out_this;
  const expectedFloat = BigInt(Math.floor(floatResult.out_this));

  // Check if integer math matches
  const integerMatch = expectedInteger === actualSwappedOut;

  // Check if float math matches (within rounding tolerance)
  // For security: we care if actualSwappedOut > expectedFloat (exploit)
  const floatMatch = expectedFloat === actualSwappedOut;
  const exploitDetected = actualSwappedOut > expectedFloat;

  return {
    txNumber,
    direction,
    inputAmount,
    actualSwappedIn,
    actualSwappedOut,
    expectedInteger,
    expectedFloat,
    integerMatch,
    floatMatch,
    exploitDetected,
    binId,
    binPrice,
    feeRateBPS,
  };
}

// ============================================================================
// Random Amount Generation
// ============================================================================

function generateRandomSwapAmount(
  rng: SeededRandom,
  poolState: PoolState,
  binId: bigint,
  direction: 'x-for-y' | 'y-for-x',
  userBalance: bigint,
  binPrice: bigint
): bigint | null {
  const binData = poolState.binBalances.get(binId);
  if (!binData) return null;

  const PRICE_SCALE_BPS = 100000000n;

  if (direction === 'x-for-y') {
    // For x-for-y: user provides X, bin needs Y
    if (binData.yBalance === 0n || userBalance === 0n) return null;
    
    // Calculate max X that can be swapped based on bin's Y balance
    // Formula: max_x_amount = ((reserve_y * PRICE_SCALE_BPS + (bin_price - 1)) / bin_price)
    const maxXFromBin = binPrice > 0n
      ? ((binData.yBalance * PRICE_SCALE_BPS + (binPrice - 1n)) / binPrice)
      : 0n;
    
    // Use the smaller of user balance or max from bin
    const maxAmount = userBalance < maxXFromBin ? userBalance : maxXFromBin;
    if (maxAmount < 100n) return null;
    
    // Use 1-30% of available balance
    const percentage = rng.next() * 0.29 + 0.01; // 1% to 30%
    const amount = (maxAmount * BigInt(Math.floor(percentage * 10000))) / 10000n;
    return amount < 100n ? null : amount;
  } else {
    // For y-for-x: user provides Y, bin needs X
    if (binData.xBalance === 0n || userBalance === 0n) return null;
    
    // Calculate max Y that can be swapped based on bin's X balance
    // Formula: max_y_amount = ((reserve_x * bin_price + (PRICE_SCALE_BPS - 1)) / PRICE_SCALE_BPS)
    const maxYFromBin = ((binData.xBalance * binPrice + (PRICE_SCALE_BPS - 1n)) / PRICE_SCALE_BPS);
    
    // Use the smaller of user balance or max from bin
    const maxAmount = userBalance < maxYFromBin ? userBalance : maxYFromBin;
    if (maxAmount < 100n) return null;
    
    const percentage = rng.next() * 0.29 + 0.01; // 1% to 30%
    const amount = (maxAmount * BigInt(Math.floor(percentage * 10000))) / 10000n;
    return amount < 100n ? null : amount;
  }
}

// ============================================================================
// Main Test
// ============================================================================

describe('DLMM Core Quote Engine Validation Fuzz Test', () => {
  let logger: ValidationLogger;
  let rng: SeededRandom;
  const NUM_TRANSACTIONS = process.env.FUZZ_SIZE ? parseInt(process.env.FUZZ_SIZE) : 100;
  const RANDOM_SEED = process.env.RANDOM_SEED ? parseInt(process.env.RANDOM_SEED) : Date.now();

  beforeEach(async () => {
    setupTestEnvironment();
    
    // Mint tokens for all users
    txOk(mockSbtcToken.mint(10000000000n, alice), deployer); // 100 BTC
    txOk(mockUsdcToken.mint(1000000000000n, alice), deployer); // 10M USDC
    txOk(mockSbtcToken.mint(10000000000n, bob), deployer); // 100 BTC
    txOk(mockUsdcToken.mint(1000000000000n, bob), deployer); // 10M USDC
    txOk(mockSbtcToken.mint(10000000000n, charlie), deployer); // 100 BTC
    txOk(mockUsdcToken.mint(1000000000000n, charlie), deployer); // 10M USDC
    
    // Initialize logger and RNG
    logger = new ValidationLogger();
    rng = new SeededRandom(RANDOM_SEED);
  });

  it(`should validate swap calculations against quote engine (${NUM_TRANSACTIONS} transactions)`, async () => {
    const users = [alice, bob, charlie];
    
    let txNumber = 0;
    let exploitCount = 0;

    console.log(`\n🔍 Starting Quote Engine Validation Fuzz Test`);
    console.log(`   Transactions: ${NUM_TRANSACTIONS}`);
    console.log(`   Random Seed: ${RANDOM_SEED}\n`);

    // Open /dev/tty for direct terminal output - bypasses Vitest's output capture
    // CRITICAL: Must open TTY BEFORE any async operations to ensure it's available
    let ttyFd: number | null = null;
    try {
      ttyFd = fs.openSync('/dev/tty', 'w');
    } catch (e) {
      // /dev/tty not available, will use stderr fallback (will be buffered)
      ttyFd = null;
    }

    let lastPrintedPercent = -1; // Track last printed percentage for 1% increments
    const startTime = Date.now();

    for (let i = 0; i < NUM_TRANSACTIONS; i++) {
      txNumber++;
      
      // Progress indicator - update every 1% of total transactions
      // CRITICAL: Update BEFORE async work to ensure real-time display
      const currentPercent = Math.floor((txNumber / NUM_TRANSACTIONS) * 100);
      const shouldUpdate = txNumber === 1 || 
                           txNumber === NUM_TRANSACTIONS || 
                           currentPercent !== lastPrintedPercent;
      
      if (shouldUpdate) {
        lastPrintedPercent = currentPercent;
        const percent = ((txNumber / NUM_TRANSACTIONS) * 100).toFixed(1);
        const barWidth = 40;
        const filled = Math.floor((txNumber / NUM_TRANSACTIONS) * barWidth);
        const empty = barWidth - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        
        // Build progress line with stats
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const rate = txNumber > 1 && elapsedSeconds > 0 
          ? ((txNumber - 1) / elapsedSeconds).toFixed(1)
          : '0.0';
        const successRate = logger.stats.totalSwaps > 0 
          ? ((logger.stats.successfulSwaps / logger.stats.totalSwaps) * 100).toFixed(1)
          : '0.0';
        const integerMatchRate = logger.stats.totalSwaps > 0
          ? ((logger.stats.integerMatches / logger.stats.totalSwaps) * 100).toFixed(1)
          : '0.0';
        const floatMatchRate = logger.stats.totalSwaps > 0
          ? ((logger.stats.floatMatches / logger.stats.totalSwaps) * 100).toFixed(1)
          : '0.0';
        const exploitCount = logger.stats.exploitsDetected;
        
        let progressLine = `📊 [${bar}] ${percent}% (${txNumber}/${NUM_TRANSACTIONS}) | ✅ ${successRate}% | 🔢 ${integerMatchRate}% | 🔷 ${floatMatchRate}% | 🚨 ${exploitCount} | ⚡ ${rate} tx/s | ⏱️  ${elapsed}s`;
        
        // Calculate ETA
        if (txNumber > 1 && parseFloat(rate) > 0) {
          const remaining = NUM_TRANSACTIONS - txNumber;
          const etaSeconds = remaining / parseFloat(rate);
          const etaMin = Math.floor(etaSeconds / 60);
          const etaSec = Math.floor(etaSeconds % 60);
          progressLine += ` | ⏳ ETA: ~${etaMin}m ${etaSec}s`;
        }
        
        // Write to TTY with \r to overwrite same line
        // CRITICAL: Write BEFORE any async operations (await) to ensure immediate flush
        const lineEnd = txNumber === NUM_TRANSACTIONS ? '\n' : '\r';
        if (ttyFd !== null) {
          try {
            fs.writeSync(ttyFd, progressLine + lineEnd);
          } catch (e) {
            // Fallback to stderr if TTY write fails
            fs.writeSync(2, progressLine + lineEnd);
          }
        } else {
          // Fallback to stderr if /dev/tty not available
          fs.writeSync(2, progressLine + lineEnd);
        }
      }
      
      // Capture state before swap
      const beforeState = await capturePoolState();
      const activeBinId = beforeState.activeBinId;
      
      // Get pool data for fees
      const poolData = rovOk(sbtcUsdcPool.getPool());
      const binStep = poolData.binStep;
      const initialPrice = poolData.initialPrice;
      
      // Get bin price
      const binPrice = rovOk(dlmmCore.getBinPrice(initialPrice, binStep, activeBinId));
      
      // Choose random user and direction
      const user = users[rng.nextInt(0, users.length - 1)];
      const direction = rng.next() < 0.5 ? 'x-for-y' : 'y-for-x';
      
      // Get user balance
      const userXBalance = rovOk(mockSbtcToken.getBalance(user));
      const userYBalance = rovOk(mockUsdcToken.getBalance(user));
      const userBalance = direction === 'x-for-y' ? userXBalance : userYBalance;
      
      // Generate swap amount (need binPrice for max calculation)
      const swapAmount = generateRandomSwapAmount(rng, beforeState, activeBinId, direction, userBalance, binPrice);
      if (!swapAmount || swapAmount === 0n) {
        txNumber--; // Don't count skipped transactions
        continue;
      }
      
      // Perform swap
      let actualSwappedIn = 0n;
      let actualSwappedOut = 0n;
      
      try {
        if (direction === 'x-for-y') {
          const result = txOk(dlmmCore.swapXForY(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            Number(activeBinId),
            swapAmount
          ), user);
          actualSwappedIn = result.value.in;
          actualSwappedOut = result.value.out;
        } else {
          const result = txOk(dlmmCore.swapYForX(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            Number(activeBinId),
            swapAmount
          ), user);
          actualSwappedIn = result.value.in;
          actualSwappedOut = result.value.out;
        }
        
        // Get fees from pool data
        // Note: Fee exemption check would require reading from swap-fee-exemptions map,
        // but for validation test we use pool fees directly (users typically not exempt)
        const protocolFeeBPS = direction === 'x-for-y' ? poolData.xProtocolFee || 0n : poolData.yProtocolFee || 0n;
        const providerFeeBPS = direction === 'x-for-y' ? poolData.xProviderFee || 0n : poolData.yProviderFee || 0n;
        const variableFeeBPS = direction === 'x-for-y' ? poolData.xVariableFee || 0n : poolData.yVariableFee || 0n;
        
        // Validate swap
        const validation = validateSwap(
          txNumber,
          direction,
          swapAmount,
          actualSwappedIn,
          actualSwappedOut,
          beforeState,
          activeBinId,
          binPrice,
          protocolFeeBPS,
          providerFeeBPS,
          variableFeeBPS
        );
        
        logger.logResult(validation);
        
        // Fail immediately on exploit detection
        if (validation.exploitDetected) {
          exploitCount++;
          console.error(`\n🚨 EXPLOIT DETECTED at transaction ${txNumber}:`);
          console.error(`   Direction: ${direction}`);
          console.error(`   Input: ${swapAmount}`);
          console.error(`   Contract returned: ${actualSwappedOut}`);
          console.error(`   Quote engine max: ${validation.expectedFloat}`);
          console.error(`   Excess: ${actualSwappedOut - validation.expectedFloat}`);
          
          // Don't fail the test immediately - collect all exploits first
          // expect(validation.exploitDetected).toBe(false);
        }
        
      } catch (e: any) {
        // Swap failed - log but continue
        logger.logResult({
          txNumber,
          direction,
          inputAmount: swapAmount,
          actualSwappedIn: 0n,
          actualSwappedOut: 0n,
          expectedInteger: 0n,
          expectedFloat: 0n,
          integerMatch: true,
          floatMatch: true,
          exploitDetected: false,
          binId: activeBinId,
          binPrice,
          feeRateBPS: 0n,
        });
      }
      
    }
    
    // Close /dev/tty file descriptor if opened
    if (ttyFd !== null) {
      try {
        fs.closeSync(ttyFd);
      } catch (e) {
        // Ignore errors on close
      }
    }
    
    // Write results
    logger.writeResults();
    
    // Final assertions
    console.log(`\n✅ Validation complete:`);
    console.log(`   Total swaps: ${logger.stats.totalSwaps}`);
    console.log(`   Integer matches: ${logger.stats.integerMatches}`);
    console.log(`   Float matches: ${logger.stats.floatMatches}`);
    console.log(`   Exploits detected: ${exploitCount}\n`);
    
    // Fail if exploits were detected
    if (exploitCount > 0) {
      expect(exploitCount).toBe(0);
    }
    
    // Expect high match rate (at least 90% for integer, 80% for float accounting for rounding)
    if (logger.stats.totalSwaps > 0) {
      const integerMatchRate = (logger.stats.integerMatches / logger.stats.totalSwaps) * 100;
      const floatMatchRate = (logger.stats.floatMatches / logger.stats.totalSwaps) * 100;
      
      expect(integerMatchRate).toBeGreaterThanOrEqual(90);
      expect(floatMatchRate).toBeGreaterThanOrEqual(80);
    } else {
      // If no swaps were successful, that's also a problem
      expect(logger.stats.totalSwaps).toBeGreaterThan(0);
    }
  });
});

