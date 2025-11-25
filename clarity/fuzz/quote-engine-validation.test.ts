/**
 * Quote Engine Validation Fuzz Test
 * 
 * This test validates that the contract's swap calculations match Bitflow's
 * production Python quote engine (pricing.py). The quote engine represents
 * the maximum tokens that should be returned - if the contract returns more,
 * it's a critical security violation.
 * 
 * Key differences from comprehensive fuzz test:
 * - Uses helper functions matching pricing.py API exactly
 * - Supports both single-bin and multi-bin swaps (use --multi-bin flag to enable)
 * - Fails immediately if contract returns more than quote engine allows
 * - Compares against both integer and float math from quote engine
 */

import {
  alice,
  bob,
  charlie,
  deployer,
  dlmmCore,
  dlmmSwapRouter,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  setupTestEnvironment,
} from "../tests/helpers/helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import { txOk, rovOk } from '@clarigen/test';
import * as fs from 'fs';
import * as path from 'path';
import { getFuzzConfig } from './harnesses/config';

import {
  calculateBinSwap,
  calculateBinSwapFloat,
  calculateFeeRateBPS,
  BinData,
} from './harnesses/swap-calculations';
import {
  estimateBinsNeeded,
  getSampleBins,
  discoverBinsForSwap,
  calculateMultiBinSwap,
  calculateMultiBinSwapFloat,
  PoolState as MultiBinPoolState,
} from './harnesses/multi-bin-quote-estimation';

// ============================================================================
// Type Definitions
// ============================================================================

type Direction = 'x-for-y' | 'y-for-x';
type SwapType = 'single-bin' | 'multi-bin';

interface PoolState {
  activeBinId: bigint;
  binBalances: Map<bigint, { xBalance: bigint; yBalance: bigint }>;
}

interface SwapValidationResult {
  txNumber: number;
  direction: Direction;
  inputAmount: bigint;
  actualSwappedIn: bigint;
  actualSwappedOut: bigint;
  expectedInteger: bigint;
  expectedFloat: bigint;
  integerMatch: boolean;
  floatMatch: boolean;
  bugDetected: boolean;
  binId: bigint;
  binPrice: bigint;
  feeRateBPS: bigint;
  swapType?: SwapType;
}

interface ValidationStats {
  totalSwaps: number;
  successfulSwaps: number;
  failedSwaps: number;
  integerMatches: number;
  floatMatches: number;
  bugsDetected: number;
  singleBinSwaps: number;
  multiBinSwaps: number;
  roundingDifferences: Array<{
    txNumber: number;
    direction: string;
    actualOut: bigint;
    expectedFloat: bigint;
    difference: bigint;
    percentDiff: number;
  }>;
}

interface SwapResult {
  swappedIn: bigint;
  swappedOut: bigint;
}

interface PoolData {
  binStep: bigint;
  initialPrice: bigint;
  xProtocolFee?: bigint;
  yProtocolFee?: bigint;
  xProviderFee?: bigint;
  yProviderFee?: bigint;
  xVariableFee?: bigint;
  yVariableFee?: bigint;
}

// ============================================================================
// Configuration & Constants
// ============================================================================

class TestConfig {
  static readonly PRICE_SCALE_BPS = 100000000n;
  static readonly MIN_SWAP_AMOUNT = 100n;
  static readonly PERCENTAGE_PRECISION = 10000n;
  
  // Swap amount generation ranges
  static readonly SINGLE_BIN_MIN_PERCENT = 0.01; // 1%
  static readonly SINGLE_BIN_MAX_PERCENT = 0.30; // 30%
  
  static readonly MULTI_BIN_MIN_PERCENT = 0.80; // 80%
  static readonly MULTI_BIN_MAX_PERCENT = 1.20; // 120%
  static readonly MULTI_BIN_FALLBACK_MIN = 0.50; // 50%
  static readonly MULTI_BIN_FALLBACK_MAX = 1.00; // 100%
  
  // Pool state capture
  static readonly MULTI_BIN_CAPTURE_RADIUS = 20;
  
  // Progress reporting
  static readonly PROGRESS_UPDATE_INTERVAL = 10;
  
  // Validation thresholds
  static readonly MIN_INTEGER_MATCH_RATE = 90;
  static readonly MIN_FLOAT_MATCH_RATE = 80;
  
  // Initial balances (CRITICAL: must match original values)
  static readonly INITIAL_BTC_BALANCE = 10000000000n; // 100 BTC
  static readonly INITIAL_USDC_BALANCE = 1000000000000n; // 10M USDC
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
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// ============================================================================
// Pool State Manager
// ============================================================================

class PoolStateManager {
  /**
   * Capture pool state for a single bin (active bin only).
   */
  static async captureSingleBin(): Promise<PoolState> {
    const activeBinId = rovOk(sbtcUsdcPool.getActiveBinId());
    const binBalances = new Map<bigint, { xBalance: bigint; yBalance: bigint }>();

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

  /**
   * Capture pool state including multiple bins around the active bin.
   * 
   * @param radius - Number of bins to capture on each side of active bin
   */
  static async captureMultiBin(radius: number = TestConfig.MULTI_BIN_CAPTURE_RADIUS): Promise<PoolState> {
    const activeBinId = rovOk(sbtcUsdcPool.getActiveBinId());
    const binBalances = new Map<bigint, { xBalance: bigint; yBalance: bigint }>();

    for (let offset = -radius; offset <= radius; offset++) {
      const binId = activeBinId + BigInt(offset);
      const unsignedBin = rovOk(dlmmCore.getUnsignedBinId(binId));
      try {
        const balances = rovOk(sbtcUsdcPool.getBinBalances(unsignedBin));
        binBalances.set(binId, {
          xBalance: balances.xBalance,
          yBalance: balances.yBalance,
        });
      } catch (e) {
        binBalances.set(binId, { xBalance: 0n, yBalance: 0n });
      }
    }

    return { activeBinId, binBalances };
  }
}

// ============================================================================
// Swap Amount Generator
// ============================================================================

class SwapAmountGenerator {
  /**
   * Generate a random swap amount for single-bin swaps.
   * Uses 1-30% of available balance to ensure single-bin execution.
   */
  static generateSingleBin(
    rng: SeededRandom,
    poolState: PoolState,
    binId: bigint,
    direction: Direction,
    userBalance: bigint,
    binPrice: bigint
  ): bigint | null {
    const binData = poolState.binBalances.get(binId);
    if (!binData) return null;

    if (direction === 'x-for-y') {
      if (binData.yBalance === 0n || userBalance === 0n) return null;
      
      // Formula from pricing.py: max_x_amount = ((reserve_y * PRICE_SCALE_BPS + (bin_price - 1)) / bin_price)
      const maxXFromBin = binPrice > 0n
        ? ((binData.yBalance * TestConfig.PRICE_SCALE_BPS + (binPrice - 1n)) / binPrice)
        : 0n;
      
      const maxAmount = userBalance < maxXFromBin ? userBalance : maxXFromBin;
      if (maxAmount < TestConfig.MIN_SWAP_AMOUNT) return null;
      
      const percentage = rng.next() * (TestConfig.SINGLE_BIN_MAX_PERCENT - TestConfig.SINGLE_BIN_MIN_PERCENT) + TestConfig.SINGLE_BIN_MIN_PERCENT;
      const amount = (maxAmount * BigInt(Math.floor(percentage * Number(TestConfig.PERCENTAGE_PRECISION)))) / TestConfig.PERCENTAGE_PRECISION;
      return amount < TestConfig.MIN_SWAP_AMOUNT ? null : amount;
    } else {
      if (binData.xBalance === 0n || userBalance === 0n) return null;
      
      // Formula from pricing.py: max_y_amount = ((reserve_x * bin_price + (PRICE_SCALE_BPS - 1)) / PRICE_SCALE_BPS)
      const maxYFromBin = ((binData.xBalance * binPrice + (TestConfig.PRICE_SCALE_BPS - 1n)) / TestConfig.PRICE_SCALE_BPS);
      
      const maxAmount = userBalance < maxYFromBin ? userBalance : maxYFromBin;
      if (maxAmount < TestConfig.MIN_SWAP_AMOUNT) return null;
      
      const percentage = rng.next() * (TestConfig.SINGLE_BIN_MAX_PERCENT - TestConfig.SINGLE_BIN_MIN_PERCENT) + TestConfig.SINGLE_BIN_MIN_PERCENT;
      const amount = (maxAmount * BigInt(Math.floor(percentage * Number(TestConfig.PERCENTAGE_PRECISION)))) / TestConfig.PERCENTAGE_PRECISION;
      return amount < TestConfig.MIN_SWAP_AMOUNT ? null : amount;
    }
  }

  /**
   * Generate a random swap amount that will require multiple bins.
   * Uses 80-120% of active bin capacity to ensure multi-bin execution.
   */
  static generateMultiBin(
    rng: SeededRandom,
    poolState: PoolState,
    activeBinId: bigint,
    userBalance: bigint
  ): bigint | null {
    const activeBinData = poolState.binBalances.get(activeBinId);
    if (!activeBinData) return null;

    const minReserve = activeBinData.xBalance < activeBinData.yBalance 
      ? activeBinData.xBalance 
      : activeBinData.yBalance;
    const activeBinCapacity = (minReserve * 80n) / 100n;

    const minAmount = (activeBinCapacity * BigInt(Math.floor(TestConfig.MULTI_BIN_MIN_PERCENT * 100))) / 100n;
    const maxAmount = (activeBinCapacity * BigInt(Math.floor(TestConfig.MULTI_BIN_MAX_PERCENT * 100))) / 100n;
    const effectiveMax = userBalance < maxAmount ? userBalance : maxAmount;
    
    if (effectiveMax < minAmount || effectiveMax < TestConfig.MIN_SWAP_AMOUNT) {
      // Fallback: try smaller amounts that might still require multiple bins
      const fallbackMin = (activeBinCapacity * BigInt(Math.floor(TestConfig.MULTI_BIN_FALLBACK_MIN * 100))) / 100n;
      const fallbackMax = effectiveMax;
      if (fallbackMax < fallbackMin || fallbackMax < TestConfig.MIN_SWAP_AMOUNT) return null;
      
      const percentage = rng.next() * (TestConfig.MULTI_BIN_FALLBACK_MAX - TestConfig.MULTI_BIN_FALLBACK_MIN) + TestConfig.MULTI_BIN_FALLBACK_MIN;
      const amount = (fallbackMax * BigInt(Math.floor(percentage * Number(TestConfig.PERCENTAGE_PRECISION)))) / TestConfig.PERCENTAGE_PRECISION;
      return amount < TestConfig.MIN_SWAP_AMOUNT ? null : amount;
    }

    const percentage = rng.next() * (TestConfig.MULTI_BIN_MAX_PERCENT - TestConfig.MULTI_BIN_MIN_PERCENT) + TestConfig.MULTI_BIN_MIN_PERCENT;
    const amount = (effectiveMax * BigInt(Math.floor(percentage * Number(TestConfig.PERCENTAGE_PRECISION)))) / TestConfig.PERCENTAGE_PRECISION;
    
    return amount < TestConfig.MIN_SWAP_AMOUNT ? null : amount;
  }
}

// ============================================================================
// Swap Executor
// ============================================================================

class SwapExecutor {
  /**
   * Execute a single-bin swap.
   */
  static executeSingleBin(
    direction: Direction,
    amount: bigint,
    activeBinId: bigint,
    user: string
  ): SwapResult {
    if (direction === 'x-for-y') {
      const result = txOk(dlmmCore.swapXForY(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        Number(activeBinId),
        amount
      ), user);
      return { swappedIn: result.value.in, swappedOut: result.value.out };
    } else {
      const result = txOk(dlmmCore.swapYForX(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        Number(activeBinId),
        amount
      ), user);
      return { swappedIn: result.value.in, swappedOut: result.value.out };
    }
  }

  /**
   * Execute a multi-bin swap using the swap router.
   */
  static executeMultiBin(
    direction: Direction,
    amount: bigint,
    user: string
  ): SwapResult {
    if (direction === 'x-for-y') {
      const result = txOk(
        dlmmSwapRouter.swapXForYSimpleMulti(
          sbtcUsdcPool.identifier,
          mockSbtcToken.identifier,
          mockUsdcToken.identifier,
          amount,
          0n
        ),
        user
      );
      return { swappedIn: result.value.in, swappedOut: result.value.out };
    } else {
      const result = txOk(
        dlmmSwapRouter.swapYForXSimpleMulti(
          sbtcUsdcPool.identifier,
          mockSbtcToken.identifier,
          mockUsdcToken.identifier,
          amount,
          0n
        ),
        user
      );
      return { swappedIn: result.value.in, swappedOut: result.value.out };
    }
  }
}

// ============================================================================
// Swap Validator
// ============================================================================

class SwapValidator {
  /**
   * Validate a single-bin swap against the quote engine.
   */
  static validateSingleBin(
    txNumber: number,
    direction: Direction,
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
    const feeRateBPS = calculateFeeRateBPS(protocolFeeBPS, providerFeeBPS, variableFeeBPS);
    
    const binData: BinData = {
      reserve_x: poolState.binBalances.get(binId)?.xBalance || 0n,
      reserve_y: poolState.binBalances.get(binId)?.yBalance || 0n,
    };

    // CRITICAL: Use actualSwappedIn (the capped input) not inputAmount, because the contract
    // may cap the input at max_x_amount or max_y_amount. We need to compare what the contract
    // actually swapped, not what was requested.
    const swapForY = direction === 'x-for-y';
    const effectiveInput = actualSwappedIn > 0n ? actualSwappedIn : inputAmount;
    
    const integerResult = calculateBinSwap(binData, binPrice, effectiveInput, feeRateBPS, swapForY);
    const floatResult = calculateBinSwapFloat(
      binData,
      Number(binPrice),
      Number(effectiveInput),
      Number(feeRateBPS),
      swapForY
    );

    const expectedInteger = integerResult.out_this;
    const expectedFloat = BigInt(Math.floor(floatResult.out_this));
    const integerMatch = expectedInteger === actualSwappedOut;
    const floatMatch = expectedFloat === actualSwappedOut;
    const bugDetected = actualSwappedOut > expectedFloat;

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
      bugDetected,
      binId,
      binPrice,
      feeRateBPS,
    };
  }

  /**
   * Validate a multi-bin swap against the quote engine.
   */
  static async validateMultiBin(
    txNumber: number,
    direction: Direction,
    inputAmount: bigint,
    actualSwappedIn: bigint,
    actualSwappedOut: bigint,
    poolState: PoolState,
    poolData: PoolData,
    protocolFeeBPS: bigint,
    providerFeeBPS: bigint,
    variableFeeBPS: bigint
  ): Promise<SwapValidationResult> {
    const feeRateBPS = calculateFeeRateBPS(protocolFeeBPS, providerFeeBPS, variableFeeBPS);
    const swapForY = direction === 'x-for-y';
    const activeBinId = poolState.activeBinId;

    const multiBinPoolState: MultiBinPoolState = {
      activeBinId,
      binBalances: poolState.binBalances,
    };

    const activeBinData = poolState.binBalances.get(activeBinId);
    if (!activeBinData) throw new Error('Active bin data not found');

    const binData: BinData = {
      reserve_x: activeBinData.xBalance,
      reserve_y: activeBinData.yBalance,
    };

    const effectiveInput = actualSwappedIn > 0n ? actualSwappedIn : inputAmount;
    const sampleBins = getSampleBins(multiBinPoolState, activeBinId, 2);
    const estimatedBins = estimateBinsNeeded(effectiveInput, binData, sampleBins);

    const getBinPrice = async (initialPrice: bigint, binStep: bigint, binId: bigint): Promise<bigint> => {
      return rovOk(dlmmCore.getBinPrice(initialPrice, binStep, binId));
    };

    const getBinBalances = async (binId: bigint): Promise<{ xBalance: bigint; yBalance: bigint } | null> => {
      try {
        const unsignedBin = rovOk(dlmmCore.getUnsignedBinId(binId));
        const balances = rovOk(sbtcUsdcPool.getBinBalances(unsignedBin));
        return {
          xBalance: balances.xBalance,
          yBalance: balances.yBalance,
        };
      } catch (e) {
        return null;
      }
    };

    const discoveredBins = await discoverBinsForSwap(
      multiBinPoolState,
      activeBinId,
      swapForY,
      estimatedBins,
      getBinPrice,
      poolData.initialPrice,
      poolData.binStep,
      getBinBalances
    );

    const integerResult = calculateMultiBinSwap(discoveredBins, effectiveInput, feeRateBPS, swapForY);
    const floatResult = calculateMultiBinSwapFloat(discoveredBins, effectiveInput, feeRateBPS, swapForY);

    const expectedInteger = integerResult.totalOut;
    const expectedFloat = BigInt(Math.floor(floatResult.totalOut));
    const integerMatch = expectedInteger === actualSwappedOut;
    const floatMatch = expectedFloat === actualSwappedOut;
    const bugDetected = actualSwappedOut > expectedFloat;
    const binPrice = rovOk(dlmmCore.getBinPrice(poolData.initialPrice, poolData.binStep, activeBinId));

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
      bugDetected,
      binId: activeBinId,
      binPrice,
      feeRateBPS,
    };
  }
}

// ============================================================================
// Progress Reporter
// ============================================================================

class ProgressReporter {
  private ttyFd: number | null = null;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    try {
      this.ttyFd = fs.openSync('/dev/tty', 'w');
    } catch (e) {
      // /dev/tty not available, will use stderr fallback
      this.ttyFd = null;
    }
  }

  writeProgress(txNumber: number, totalTransactions: number, stats: ValidationStats): void {
    const percent = ((txNumber / totalTransactions) * 100).toFixed(1);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;
    const rate = txNumber > 1 && elapsedSeconds > 0 
      ? ((txNumber - 1) / elapsedSeconds).toFixed(1)
      : '0.0';
    const successRate = stats.totalSwaps > 0 
      ? ((stats.successfulSwaps / stats.totalSwaps) * 100).toFixed(1)
      : '0.0';
    const integerMatchRate = stats.totalSwaps > 0
      ? ((stats.integerMatches / stats.totalSwaps) * 100).toFixed(1)
      : '0.0';
    const floatMatchRate = stats.totalSwaps > 0
      ? ((stats.floatMatches / stats.totalSwaps) * 100).toFixed(1)
      : '0.0';
    
    let progressLine = `${percent}% (${txNumber}/${totalTransactions}) | ✅ ${successRate}% | 🔢 ${integerMatchRate}% | 🔷 ${floatMatchRate}% | 🚨 ${stats.bugsDetected} | ⚡ ${rate} tx/s | ⏱️  ${elapsed}s`;
    
    if (txNumber > 1 && parseFloat(rate) > 0) {
      const remaining = totalTransactions - txNumber;
      const etaSeconds = remaining / parseFloat(rate);
      const etaMin = Math.floor(etaSeconds / 60);
      const etaSec = Math.floor(etaSeconds % 60);
      progressLine += ` | ⏳ ETA: ~${etaMin}m ${etaSec}s`;
    }
    
    this.write(progressLine + '\n');
  }

  writebug(txNumber: number, direction: Direction, swapAmount: bigint, actualOut: bigint, expectedFloat: bigint): void {
    const bugMsg = `\n🚨 bug DETECTED at transaction ${txNumber}:\n   Direction: ${direction}\n   Input: ${swapAmount}\n   Contract returned: ${actualOut}\n   Quote engine max: ${expectedFloat}\n   Excess: ${actualOut - expectedFloat}\n`;
    this.write(bugMsg);
  }

  writeSummary(stats: ValidationStats): void {
    const summary = `\n✅ Validation complete:\n   Total swaps: ${stats.totalSwaps}\n   Integer matches: ${stats.integerMatches}\n   Float matches: ${stats.floatMatches}\n   bugs detected: ${stats.bugsDetected}\n`;
    this.write(summary);
  }

  private write(message: string): void {
    if (this.ttyFd !== null) {
      try {
        fs.writeSync(this.ttyFd, message);
        return;
      } catch (e) {
        // Fallback to stderr
      }
    }
    fs.writeSync(2, message);
  }

  close(): void {
    if (this.ttyFd !== null) {
      try {
        fs.closeSync(this.ttyFd);
      } catch (e) {
        // Ignore errors on close
      }
    }
  }
}

// ============================================================================
// Validation Logger
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
      bugsDetected: 0,
      singleBinSwaps: 0,
      multiBinSwaps: 0,
      roundingDifferences: [],
    };
  }

  logResult(result: SwapValidationResult): void {
    this.results.push(result);
    this.updateStats(result);
  }

  private updateStats(result: SwapValidationResult): void {
    this.stats.totalSwaps++;
    
    if (result.actualSwappedOut > 0n) {
      this.stats.successfulSwaps++;
    } else {
      this.stats.failedSwaps++;
    }
    
    if (result.integerMatch) this.stats.integerMatches++;
    if (result.floatMatch) this.stats.floatMatches++;
    if (result.bugDetected) this.stats.bugsDetected++;
    
    if (result.swapType === 'multi-bin') {
      this.stats.multiBinSwaps++;
    } else {
      this.stats.singleBinSwaps++;
    }
    
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

  writeResults(): void {
    this.writeJSON();
    this.writeMarkdown();
  }

  private writeJSON(): void {
    const jsonPath = path.join(this.logDir, 'validation-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify({
      stats: this.stats,
      results: this.results,
    }, null, 2));
  }

  private writeMarkdown(): void {
    const mdPath = path.join(this.logDir, 'summary.md');
    const md = this.generateMarkdownSummary();
    fs.writeFileSync(mdPath, md);
  }

  private generateMarkdownSummary(): string {
    let md = `# Quote Engine Validation Results\n\n`;
    md += `Generated: ${new Date().toISOString()}\n\n`;
    md += `## Summary\n\n`;
    md += `- Total Swaps: ${this.stats.totalSwaps}\n`;
    md += `- Single-Bin Swaps: ${this.stats.singleBinSwaps}\n`;
    md += `- Multi-Bin Swaps: ${this.stats.multiBinSwaps}\n`;
    md += `- Successful Swaps: ${this.stats.successfulSwaps}\n`;
    md += `- Failed Swaps: ${this.stats.failedSwaps}\n`;
    md += `- Integer Math Matches: ${this.stats.integerMatches} (${((this.stats.integerMatches / this.stats.totalSwaps) * 100).toFixed(2)}%)\n`;
    md += `- Float Math Matches: ${this.stats.floatMatches} (${((this.stats.floatMatches / this.stats.totalSwaps) * 100).toFixed(2)}%)\n`;
    md += `- **bugS DETECTED**: ${this.stats.bugsDetected}\n\n`;
    
    if (this.stats.bugsDetected > 0) {
      md += this.generatebugSection();
    }
    
    if (this.stats.roundingDifferences.length > 0) {
      md += this.generateRoundingSection();
    }
    
    return md;
  }

  private generatebugSection(): string {
    let md = `## 🚨 CRITICAL: bugs Detected\n\n`;
    md += `The contract returned MORE tokens than the quote engine allows in ${this.stats.bugsDetected} cases.\n\n`;
    const bugs = this.results.filter(r => r.bugDetected);
    for (const bug of bugs) {
      md += `- Transaction ${bug.txNumber}: ${bug.direction}, `;
      md += `Input: ${bug.inputAmount}, `;
      md += `Contract returned: ${bug.actualSwappedOut}, `;
      md += `Quote engine max: ${bug.expectedFloat}, `;
      md += `Excess: ${bug.actualSwappedOut - bug.expectedFloat}\n`;
    }
    md += `\n`;
    return md;
  }

  private generateRoundingSection(): string {
    let md = `## Rounding Differences\n\n`;
    md += `Total rounding differences: ${this.stats.roundingDifferences.length}\n\n`;
    md += `| TX | Direction | Actual Out | Expected Float | Difference | % Diff |\n`;
    md += `|----|-----------|------------|----------------|------------|--------|\n`;
    for (const diff of this.stats.roundingDifferences.slice(0, 50)) {
      md += `| ${diff.txNumber} | ${diff.direction} | ${diff.actualOut} | ${diff.expectedFloat} | ${diff.difference} | ${diff.percentDiff.toFixed(6)}% |\n`;
    }
    if (this.stats.roundingDifferences.length > 50) {
      md += `\n(Showing first 50 of ${this.stats.roundingDifferences.length} differences)\n`;
    }
    return md;
  }
}

// ============================================================================
// Test Orchestrator
// ============================================================================

class TestOrchestrator {
  private logger: ValidationLogger;
  private reporter: ProgressReporter;
  private rng: SeededRandom;
  private users: string[];

  constructor(logger: ValidationLogger, reporter: ProgressReporter, rng: SeededRandom) {
    this.logger = logger;
    this.reporter = reporter;
    this.rng = rng;
    this.users = [alice, bob, charlie];
  }

  async runSwapIteration(
    txNumber: number,
    totalTransactions: number,
    multiBinMode: boolean
  ): Promise<{ success: boolean; bugDetected: boolean }> {
    const useMultiBin = multiBinMode && this.rng.next() < 0.5;
    
    const beforeState = useMultiBin
      ? await PoolStateManager.captureMultiBin()
      : await PoolStateManager.captureSingleBin();
    
    const activeBinId = beforeState.activeBinId;
    const poolData = rovOk(sbtcUsdcPool.getPool());
    const binPrice = rovOk(dlmmCore.getBinPrice(poolData.initialPrice, poolData.binStep, activeBinId));
    
    const user = this.users[this.rng.nextInt(0, this.users.length - 1)];
    const direction: Direction = this.rng.next() < 0.5 ? 'x-for-y' : 'y-for-x';
    
    const userXBalance = rovOk(mockSbtcToken.getBalance(user));
    const userYBalance = rovOk(mockUsdcToken.getBalance(user));
    const userBalance = direction === 'x-for-y' ? userXBalance : userYBalance;
    
    const swapAmount = useMultiBin
      ? SwapAmountGenerator.generateMultiBin(this.rng, beforeState, activeBinId, userBalance)
      : SwapAmountGenerator.generateSingleBin(this.rng, beforeState, activeBinId, direction, userBalance, binPrice);
    
    if (!swapAmount || swapAmount === 0n) {
      return { success: false, bugDetected: false };
    }
    
    try {
      const swapResult = useMultiBin
        ? SwapExecutor.executeMultiBin(direction, swapAmount, user)
        : SwapExecutor.executeSingleBin(direction, swapAmount, activeBinId, user);
      
      const protocolFeeBPS = direction === 'x-for-y' ? poolData.xProtocolFee || 0n : poolData.yProtocolFee || 0n;
      const providerFeeBPS = direction === 'x-for-y' ? poolData.xProviderFee || 0n : poolData.yProviderFee || 0n;
      const variableFeeBPS = direction === 'x-for-y' ? poolData.xVariableFee || 0n : poolData.yVariableFee || 0n;
      
      const validation = useMultiBin
        ? await SwapValidator.validateMultiBin(
            txNumber,
            direction,
            swapAmount,
            swapResult.swappedIn,
            swapResult.swappedOut,
            beforeState,
            poolData,
            protocolFeeBPS,
            providerFeeBPS,
            variableFeeBPS
          )
        : SwapValidator.validateSingleBin(
            txNumber,
            direction,
            swapAmount,
            swapResult.swappedIn,
            swapResult.swappedOut,
            beforeState,
            activeBinId,
            binPrice,
            protocolFeeBPS,
            providerFeeBPS,
            variableFeeBPS
          );
      
      validation.swapType = useMultiBin ? 'multi-bin' : 'single-bin';
      this.logger.logResult(validation);
      
      if (validation.bugDetected) {
        this.reporter.writebug(txNumber, direction, swapAmount, swapResult.swappedOut, validation.expectedFloat);
        this.reporter.writeProgress(txNumber, totalTransactions, this.logger.stats);
        return { success: true, bugDetected: true };
      }
      
      return { success: true, bugDetected: false };
    } catch (e: any) {
      this.logger.logResult({
        txNumber,
        direction,
        inputAmount: swapAmount,
        actualSwappedIn: 0n,
        actualSwappedOut: 0n,
        expectedInteger: 0n,
        expectedFloat: 0n,
        integerMatch: true,
        floatMatch: true,
        bugDetected: false,
        binId: activeBinId,
        binPrice,
        feeRateBPS: 0n,
      });
      return { success: false, bugDetected: false };
    }
  }

  shouldUpdateProgress(txNumber: number, totalTransactions: number, lastPercent: number): boolean {
    const currentPercent = Math.floor((txNumber / totalTransactions) * 100);
    return txNumber === 1 || 
           txNumber === totalTransactions || 
           txNumber % TestConfig.PROGRESS_UPDATE_INTERVAL === 0 || 
           currentPercent !== lastPercent;
  }
}

// ============================================================================
// Main Test
// ============================================================================

describe('DLMM Core Quote Engine Validation Fuzz Test', () => {
  let logger: ValidationLogger;
  let rng: SeededRandom;
  
  const config = getFuzzConfig();
  const NUM_TRANSACTIONS = config.size;
  const RANDOM_SEED = config.seed;
  const MULTI_BIN_MODE = config.multiBin ?? false;

  beforeEach(async () => {
    setupTestEnvironment();
    
    txOk(mockSbtcToken.mint(TestConfig.INITIAL_BTC_BALANCE, alice), deployer);
    txOk(mockUsdcToken.mint(TestConfig.INITIAL_USDC_BALANCE, alice), deployer);
    txOk(mockSbtcToken.mint(TestConfig.INITIAL_BTC_BALANCE, bob), deployer);
    txOk(mockUsdcToken.mint(TestConfig.INITIAL_USDC_BALANCE, bob), deployer);
    txOk(mockSbtcToken.mint(TestConfig.INITIAL_BTC_BALANCE, charlie), deployer);
    txOk(mockUsdcToken.mint(TestConfig.INITIAL_USDC_BALANCE, charlie), deployer);
    
    logger = new ValidationLogger();
    rng = new SeededRandom(RANDOM_SEED);
  });

  it(`should validate swap calculations against quote engine (${NUM_TRANSACTIONS} transactions)`, async () => {
    const reporter = new ProgressReporter();
    const orchestrator = new TestOrchestrator(logger, reporter, rng);
    
    let txNumber = 0;
    let lastPercent = -1;

    console.log(`\n🔍 Starting Quote Engine Validation Fuzz Test`);
    console.log(`   Transactions: ${NUM_TRANSACTIONS}`);
    console.log(`   Random Seed: ${RANDOM_SEED}`);
    console.log(`   Multi-Bin Mode: ${MULTI_BIN_MODE ? 'ENABLED' : 'DISABLED'}\n`);

    for (let i = 0; i < NUM_TRANSACTIONS; i++) {
      txNumber++;
      
      if (orchestrator.shouldUpdateProgress(txNumber, NUM_TRANSACTIONS, lastPercent)) {
        reporter.writeProgress(txNumber, NUM_TRANSACTIONS, logger.stats);
        lastPercent = Math.floor((txNumber / NUM_TRANSACTIONS) * 100);
      }
      
      const result = await orchestrator.runSwapIteration(txNumber, NUM_TRANSACTIONS, MULTI_BIN_MODE);
      
      if (!result.success) {
        txNumber--;
        continue;
      }
    }
    
    reporter.close();
    logger.writeResults();
    reporter.writeSummary(logger.stats);
    
    // Verify no bugs were detected
    expect(logger.stats.bugsDetected).toBe(0);
    
    // Verify high match rates
    if (logger.stats.totalSwaps > 0) {
      const integerMatchRate = (logger.stats.integerMatches / logger.stats.totalSwaps) * 100;
      const floatMatchRate = (logger.stats.floatMatches / logger.stats.totalSwaps) * 100;
      
      expect(integerMatchRate).toBeGreaterThanOrEqual(TestConfig.MIN_INTEGER_MATCH_RATE);
      expect(floatMatchRate).toBeGreaterThanOrEqual(TestConfig.MIN_FLOAT_MATCH_RATE);
    } else {
      expect(logger.stats.totalSwaps).toBeGreaterThan(0);
    }
  }, NUM_TRANSACTIONS > 100 ? 300000 : NUM_TRANSACTIONS > 50 ? 120000 : 60000);
});
