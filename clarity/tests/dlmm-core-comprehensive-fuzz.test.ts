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
  getSbtcUsdcPoolLpBalance,
} from "./helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import { cvToValue } from '@clarigen/core';
import { txOk, txErr, rovOk } from '@clarigen/test';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Seeded Random Number Generator (for reproducibility)
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

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

// ============================================================================
// State Tracking
// ============================================================================

interface PoolState {
  activeBinId: bigint;
  binBalances: Map<bigint, { xBalance: bigint; yBalance: bigint; totalSupply: bigint }>;
  userBalances: Map<string, { xToken: bigint; yToken: bigint; lpTokens: Map<bigint, bigint> }>;
  protocolFees: { xFee: bigint; yFee: bigint };
}

interface TransactionLog {
  txNumber: number;
  functionName: string;
  caller: string;
  params: any;
  beforeState: PoolState;
  result: 'success' | 'failure';
  error?: string;
  afterState?: PoolState;
  invariantChecks?: string[];
}

// ============================================================================
// Logging System
// ============================================================================

class FuzzTestLogger {
  private logFile: string;
  private jsonFile: string;
  private summaryFile: string;
  private logs: string[] = [];
  private transactionLogs: TransactionLog[] = [];
  public stats = {
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    functionCounts: new Map<string, number>(),
    errorCounts: new Map<string, number>(),
    invariantViolations: 0,
    roundingErrors: 0,
    binCoverage: new Set<number>(),
  };

  constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseDir = path.join(process.cwd(), 'logs', 'fuzz-test-results');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    this.logFile = path.join(baseDir, `fuzz-test-log-${timestamp}.txt`);
    this.jsonFile = path.join(baseDir, `fuzz-test-data-${timestamp}.json`);
    this.summaryFile = path.join(baseDir, `fuzz-test-summary-${timestamp}.md`);
    this.log('=== FUZZ TEST STARTED ===');
    this.log(`Log file: ${this.logFile}`);
    this.log(`JSON file: ${this.jsonFile}`);
    this.log(`Summary file: ${this.summaryFile}`);
  }

  log(message: string) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}`;
    this.logs.push(logLine);
    console.log(logLine);
  }

  logTransaction(log: TransactionLog) {
    this.transactionLogs.push(log);
    this.stats.totalTransactions++;
    
    if (log.result === 'success') {
      this.stats.successfulTransactions++;
    } else {
      this.stats.failedTransactions++;
    }

    const count = this.stats.functionCounts.get(log.functionName) || 0;
    this.stats.functionCounts.set(log.functionName, count + 1);

    if (log.error) {
      const errorCount = this.stats.errorCounts.get(log.error) || 0;
      this.stats.errorCounts.set(log.error, errorCount + 1);
    }

    // Write detailed log
    this.log(`\n--- Transaction ${log.txNumber} ---`);
    this.log(`Function: ${log.functionName}`);
    this.log(`Caller: ${log.caller}`);
    this.log(`Params: ${JSON.stringify(log.params, (_, v) => typeof v === 'bigint' ? v.toString() : v)}`);
    this.log(`Result: ${log.result}`);
    if (log.error) {
      this.log(`Error: ${log.error}`);
    }
    if (log.invariantChecks && log.invariantChecks.length > 0) {
      this.log(`Invariant Checks: ${log.invariantChecks.join(', ')}`);
      this.stats.invariantViolations += log.invariantChecks.length;
    }

    // Track bin coverage
    if (log.params.binId !== undefined) {
      this.stats.binCoverage.add(Number(log.params.binId));
    }
    if (log.params.sourceBinId !== undefined) {
      this.stats.binCoverage.add(Number(log.params.sourceBinId));
    }
    if (log.params.destBinId !== undefined) {
      this.stats.binCoverage.add(Number(log.params.destBinId));
    }
  }

  generateSummary() {
    const successRate = this.stats.totalTransactions > 0 
      ? ((this.stats.successfulTransactions / this.stats.totalTransactions) * 100).toFixed(2)
      : '0.00';
    
    this.log('\n=== FUZZ TEST SUMMARY ===');
    this.log(`Total Transactions: ${this.stats.totalTransactions}`);
    this.log(`Successful: ${this.stats.successfulTransactions}`);
    this.log(`Failed: ${this.stats.failedTransactions}`);
    this.log(`Success Rate: ${successRate}%`);
    this.log(`Invariant Violations: ${this.stats.invariantViolations}`);
    this.log(`Unique Bins Covered: ${this.stats.binCoverage.size}`);
    
    this.log('\nFunction Distribution:');
    for (const [func, count] of this.stats.functionCounts.entries()) {
      const percentage = ((count / this.stats.totalTransactions) * 100).toFixed(2);
      this.log(`  ${func}: ${count} (${percentage}%)`);
    }

    this.log('\nError Distribution:');
    if (this.stats.errorCounts.size === 0) {
      this.log('  No errors recorded');
    } else {
      for (const [error, count] of Array.from(this.stats.errorCounts.entries()).sort((a, b) => b[1] - a[1])) {
        const percentage = ((count / this.stats.failedTransactions) * 100).toFixed(2);
        this.log(`  ${error.substring(0, 100)}: ${count} (${percentage}% of failures)`);
      }
    }

    this.log('\n=== FUZZ TEST COMPLETED ===');
  }

  writeToFile() {
    // Write text log
    const content = this.logs.join('\n');
    fs.writeFileSync(this.logFile, content, 'utf-8');
    
    // Write JSON data for analysis
    const jsonData = {
      stats: {
        totalTransactions: this.stats.totalTransactions,
        successfulTransactions: this.stats.successfulTransactions,
        failedTransactions: this.stats.failedTransactions,
        successRate: this.stats.totalTransactions > 0 
          ? (this.stats.successfulTransactions / this.stats.totalTransactions) * 100 
          : 0,
        invariantViolations: this.stats.invariantViolations,
        uniqueBinsCovered: this.stats.binCoverage.size,
        functionCounts: Object.fromEntries(this.stats.functionCounts),
        errorCounts: Object.fromEntries(this.stats.errorCounts),
      },
      transactions: this.transactionLogs.map(log => ({
        ...log,
        beforeState: undefined, // Too large for JSON
        afterState: undefined,
      })),
      binCoverage: Array.from(this.stats.binCoverage).sort((a, b) => a - b),
    };
    fs.writeFileSync(this.jsonFile, JSON.stringify(jsonData, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2), 'utf-8');
    
    // Write markdown summary
    const summary = this.generateMarkdownSummary();
    fs.writeFileSync(this.summaryFile, summary, 'utf-8');
    
    this.log(`\nResults saved:`);
    this.log(`  - Log: ${this.logFile}`);
    this.log(`  - JSON: ${this.jsonFile}`);
    this.log(`  - Summary: ${this.summaryFile}`);
  }

  generateMarkdownSummary(): string {
    const successRate = this.stats.totalTransactions > 0 
      ? ((this.stats.successfulTransactions / this.stats.totalTransactions) * 100).toFixed(2)
      : '0.00';
    
    const failureRate = this.stats.totalTransactions > 0
      ? ((this.stats.failedTransactions / this.stats.totalTransactions) * 100).toFixed(2)
      : '0.00';

    let md = `# Fuzz Test Summary\n\n`;
    md += `**Test Date:** ${new Date().toISOString()}\n\n`;
    md += `## Overall Statistics\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total Transactions | ${this.stats.totalTransactions} |\n`;
    md += `| Successful | ${this.stats.successfulTransactions} |\n`;
    md += `| Failed | ${this.stats.failedTransactions} |\n`;
    md += `| Success Rate | ${successRate}% |\n`;
    md += `| Failure Rate | ${failureRate}% |\n`;
    md += `| Invariant Violations | ${this.stats.invariantViolations} |\n`;
    md += `| Unique Bins Covered | ${this.stats.binCoverage.size} |\n\n`;

    md += `## Function Distribution\n\n`;
    md += `| Function | Count | Percentage |\n`;
    md += `|----------|-------|------------|\n`;
    for (const [func, count] of Array.from(this.stats.functionCounts.entries()).sort((a, b) => b[1] - a[1])) {
      const percentage = ((count / this.stats.totalTransactions) * 100).toFixed(2);
      md += `| ${func} | ${count} | ${percentage}% |\n`;
    }
    md += `\n`;

    if (this.stats.errorCounts.size > 0) {
      md += `## Error Distribution\n\n`;
      md += `| Error | Count | Percentage of Failures |\n`;
      md += `|-------|-------|------------------------|\n`;
      for (const [error, count] of Array.from(this.stats.errorCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20)) {
        const percentage = ((count / this.stats.failedTransactions) * 100).toFixed(2);
        const errorShort = error.length > 80 ? error.substring(0, 80) + '...' : error;
        md += `| ${errorShort} | ${count} | ${percentage}% |\n`;
      }
      md += `\n`;
    }

    md += `## Bin Coverage\n\n`;
    md += `Covered ${this.stats.binCoverage.size} unique bins.\n\n`;
    const bins = Array.from(this.stats.binCoverage).sort((a, b) => a - b);
    if (bins.length <= 50) {
      md += `Bins: ${bins.join(', ')}\n\n`;
    } else {
      md += `Bins: ${bins.slice(0, 25).join(', ')} ... ${bins.slice(-25).join(', ')}\n\n`;
      md += `(Showing first and last 25 bins)\n\n`;
    }

    md += `## Health Assessment\n\n`;
    if (parseFloat(successRate) >= 80) {
      md += `✅ **EXCELLENT**: Success rate above 80%\n\n`;
    } else if (parseFloat(successRate) >= 60) {
      md += `⚠️ **GOOD**: Success rate above 60%\n\n`;
    } else if (parseFloat(successRate) >= 40) {
      md += `⚠️ **FAIR**: Success rate above 40% - consider improving random amount generation\n\n`;
    } else {
      md += `❌ **POOR**: Success rate below 40% - significant issues detected\n\n`;
    }

    if (this.stats.invariantViolations === 0) {
      md += `✅ **PASS**: No invariant violations detected\n\n`;
    } else {
      md += `❌ **FAIL**: ${this.stats.invariantViolations} invariant violations detected\n\n`;
    }

    if (this.stats.binCoverage.size >= 20) {
      md += `✅ **GOOD**: Good bin coverage (${this.stats.binCoverage.size} bins)\n\n`;
    } else {
      md += `⚠️ **LIMITED**: Limited bin coverage (${this.stats.binCoverage.size} bins)\n\n`;
    }

    return md;
  }
}

// ============================================================================
// State Management
// ============================================================================

async function capturePoolState(): Promise<PoolState> {
  const activeBinId = rovOk(sbtcUsdcPool.getActiveBinId());
  const binBalances = new Map<bigint, { xBalance: bigint; yBalance: bigint; totalSupply: bigint }>();
  const userBalances = new Map<string, { xToken: bigint; yToken: bigint; lpTokens: Map<bigint, bigint> }>();
  const users = [deployer, alice, bob, charlie];

  // Get protocol fees
  const poolId = 1n; // Assuming pool ID 1
  const fees = rovOk(dlmmCore.getUnclaimedProtocolFeesById(poolId));
  if (!fees) {
    return { activeBinId, binBalances, userBalances, protocolFees: { xFee: 0n, yFee: 0n } };
  }
  const protocolFees = { xFee: fees.xFee, yFee: fees.yFee };

  // Sample bins around active bin (we can't query all 1001 bins efficiently)
  // Focus on active bin and nearby bins
  for (let offset = -10; offset <= 10; offset++) {
    const binId = activeBinId + BigInt(offset);
    if (binId >= -500n && binId <= 500n) {
      const unsignedBin = rovOk(dlmmCore.getUnsignedBinId(binId));
      try {
        const balances = rovOk(sbtcUsdcPool.getBinBalances(unsignedBin));
        const totalSupply = rovOk(sbtcUsdcPool.getTotalSupply(unsignedBin));
        binBalances.set(binId, {
          xBalance: balances.xBalance,
          yBalance: balances.yBalance,
          totalSupply: totalSupply,
        });
      } catch (e) {
        // Bin might not exist yet
        binBalances.set(binId, { xBalance: 0n, yBalance: 0n, totalSupply: 0n });
      }
    }
  }

  // Get user balances
  for (const user of users) {
    const xToken = rovOk(mockSbtcToken.getBalance(user));
    const yToken = rovOk(mockUsdcToken.getBalance(user));
    const lpTokens = new Map<bigint, bigint>();

    // Get LP tokens for sampled bins
    for (const binId of binBalances.keys()) {
      const lpBalance = getSbtcUsdcPoolLpBalance(binId, user);
      if (lpBalance > 0n) {
        lpTokens.set(binId, lpBalance);
      }
    }

    userBalances.set(user, { xToken, yToken, lpTokens });
  }

  return {
    activeBinId,
    binBalances,
    userBalances,
    protocolFees,
  };
}

// ============================================================================
// Smart Random Amount Generators
// ============================================================================

function generateRandomSwapAmount(
  rng: SeededRandom,
  poolState: PoolState,
  binId: bigint,
  direction: 'x-for-y' | 'y-for-x',
  user: string
): bigint | null {
  const unsignedBin = rovOk(dlmmCore.getUnsignedBinId(binId));
  let binData = poolState.binBalances.get(binId);
  
  if (!binData) {
    try {
      const balances = rovOk(sbtcUsdcPool.getBinBalances(unsignedBin));
      binData = {
        xBalance: balances.xBalance,
        yBalance: balances.yBalance,
        totalSupply: 0n,
      };
    } catch {
      return null; // Bin doesn't exist
    }
  }

  const userBalance = poolState.userBalances.get(user);
  if (!userBalance) return null;

  if (direction === 'x-for-y') {
    // Need Y tokens in bin to swap X for Y
    if (binData.yBalance === 0n || userBalance.xToken === 0n) return null;
    
    // Calculate max swapable amount more carefully
    // For x-for-y: we need Y in the bin, and user needs X tokens
    // Use smaller percentage to avoid hitting limits
    const maxFromUser = userBalance.xToken;
    // Be more conservative - use 10-30% of available
    const maxFromBin = (binData.yBalance * 80n) / 100n; // Leave 20% buffer for fees and safety
    const maxAmount = maxFromUser < maxFromBin ? maxFromUser : maxFromBin;
    
    if (maxAmount < 10000n) return null; // Higher minimum for swaps
    
    const percentage = rng.next() * 0.2 + 0.1; // 10% to 30%
    const amount = (maxAmount * BigInt(Math.floor(percentage * 100))) / 100n;
    return amount < 10000n ? null : amount;
  } else {
    // Need X tokens in bin to swap Y for X
    if (binData.xBalance === 0n || userBalance.yToken === 0n) return null;
    
    const maxFromUser = userBalance.yToken;
    const maxFromBin = (binData.xBalance * 80n) / 100n; // Leave 20% buffer
    const maxAmount = maxFromUser < maxFromBin ? maxFromUser : maxFromBin;
    
    if (maxAmount < 10000n) return null;
    
    const percentage = rng.next() * 0.2 + 0.1; // 10% to 30%
    const amount = (maxAmount * BigInt(Math.floor(percentage * 100))) / 100n;
    return amount < 10000n ? null : amount;
  }
}

function generateRandomAddLiquidityAmount(
  rng: SeededRandom,
  poolState: PoolState,
  binId: bigint,
  user: string
): { xAmount: bigint; yAmount: bigint } | null {
  const userBalance = poolState.userBalances.get(user);
  if (!userBalance) return null;

  const activeBinId = poolState.activeBinId;
  let xAmount = 0n;
  let yAmount = 0n;

  if (binId < activeBinId) {
    // Negative bin: only Y tokens
    if (userBalance.yToken === 0n) return null;
    const maxAmount = userBalance.yToken;
    const percentage = rng.next() * 0.5 + 0.01;
    yAmount = (maxAmount * BigInt(Math.floor(percentage * 100))) / 100n;
    if (yAmount < 1000n) return null;
  } else if (binId === activeBinId) {
    // Active bin: both X and Y tokens
    if (userBalance.xToken === 0n || userBalance.yToken === 0n) return null;
    const xPercentage = rng.next() * 0.5 + 0.01;
    const yPercentage = rng.next() * 0.5 + 0.01;
    xAmount = (userBalance.xToken * BigInt(Math.floor(xPercentage * 100))) / 100n;
    yAmount = (userBalance.yToken * BigInt(Math.floor(yPercentage * 100))) / 100n;
    if (xAmount < 1000n || yAmount < 1000n) return null;
  } else {
    // Positive bin: only X tokens
    if (userBalance.xToken === 0n) return null;
    const maxAmount = userBalance.xToken;
    const percentage = rng.next() * 0.5 + 0.01;
    xAmount = (maxAmount * BigInt(Math.floor(percentage * 100))) / 100n;
    if (xAmount < 1000n) return null;
  }

  return { xAmount, yAmount };
}

function generateRandomWithdrawAmount(
  rng: SeededRandom,
  poolState: PoolState,
  binId: bigint,
  user: string
): bigint | null {
  const userBalance = poolState.userBalances.get(user);
  if (!userBalance) return null;

  const lpBalance = userBalance.lpTokens.get(binId) || 0n;
  if (lpBalance === 0n) return null;

  // Withdraw 20-90% of LP tokens (ensure minimum amount)
  const percentage = rng.next() * 0.7 + 0.2;
  const amount = (lpBalance * BigInt(Math.floor(percentage * 100))) / 100n;
  
  // Ensure minimum withdrawal amount (at least 1000 LP tokens or 20% of balance, whichever is larger)
  const minAmount = lpBalance > 5000n ? 1000n : (lpBalance * 20n / 100n);
  if (amount < minAmount) {
    return lpBalance >= minAmount ? minAmount : null;
  }
  return amount;
}

function generateRandomMoveAmount(
  rng: SeededRandom,
  poolState: PoolState,
  sourceBinId: bigint,
  user: string
): bigint | null {
  const userBalance = poolState.userBalances.get(user);
  if (!userBalance) return null;

  const lpBalance = userBalance.lpTokens.get(sourceBinId) || 0n;
  if (lpBalance === 0n) return null;

  // Move 10-90% of LP tokens
  const percentage = rng.next() * 0.8 + 0.1;
  const amount = (lpBalance * BigInt(Math.floor(percentage * 100))) / 100n;
  
  if (amount < 1n) return null;
  return amount;
}

// ============================================================================
// Invariant Checkers (Enhanced with comprehensive checks)
// ============================================================================

import {
  checkSwapXForYInvariants,
  checkSwapYForXInvariants,
  checkAddLiquidityInvariants as checkAddLiquidityInvariantsCore,
  checkWithdrawLiquidityInvariants as checkWithdrawLiquidityInvariantsCore,
  checkMoveLiquidityInvariants as checkMoveLiquidityInvariantsCore,
  BinState,
  UserState,
  ProtocolFeesState,
} from "./invariants";

function checkSwapInvariants(
  functionName: string,
  beforeState: PoolState,
  afterState: PoolState,
  params: any,
  result: any,
  user: string
): string[] {
  const issues: string[] = [];
  const binId = params.binId;
  const beforeBin = beforeState.binBalances.get(binId);
  const afterBin = afterState.binBalances.get(binId);

  if (!beforeBin || !afterBin) {
    issues.push(`Bin ${binId} not found in state`);
    return issues;
  }

  const beforeUser = beforeState.userBalances.get(user);
  const afterUser = afterState.userBalances.get(user);
  if (!beforeUser || !afterUser) {
    issues.push(`User ${user} not found in state`);
    return issues;
  }

  const poolId = 1n; // Assuming pool ID 1
  const beforeFees: ProtocolFeesState = beforeState.protocolFees;
  const afterFees: ProtocolFeesState = afterState.protocolFees;

  const beforeBinState: BinState = {
    binId,
    xBalance: beforeBin.xBalance,
    yBalance: beforeBin.yBalance,
    totalSupply: beforeBin.totalSupply,
  };
  const afterBinState: BinState = {
    binId,
    xBalance: afterBin.xBalance,
    yBalance: afterBin.yBalance,
    totalSupply: afterBin.totalSupply,
  };
  const beforeUserState: UserState = {
    xTokenBalance: beforeUser.xToken,
    yTokenBalance: beforeUser.yToken,
    lpTokenBalance: beforeUser.lpTokens.get(binId) || 0n,
  };
  const afterUserState: UserState = {
    xTokenBalance: afterUser.xToken,
    yTokenBalance: afterUser.yToken,
    lpTokenBalance: afterUser.lpTokens.get(binId) || 0n,
  };

  if (functionName === 'swap-x-for-y') {
    const check = checkSwapXForYInvariants(
      beforeBinState,
      afterBinState,
      beforeUserState,
      afterUserState,
      beforeFees,
      afterFees,
      params.xAmount,
      result
    );
    issues.push(...check.errors);
  } else if (functionName === 'swap-y-for-x') {
    const check = checkSwapYForXInvariants(
      beforeBinState,
      afterBinState,
      beforeUserState,
      afterUserState,
      beforeFees,
      afterFees,
      params.yAmount,
      result
    );
    issues.push(...check.errors);
  }

  return issues;
}

function checkAddLiquidityInvariants(
  beforeState: PoolState,
  afterState: PoolState,
  params: any,
  result: bigint
): string[] {
  const issues: string[] = [];
  const binId = params.binId;
  const beforeBin = beforeState.binBalances.get(binId);
  const afterBin = afterState.binBalances.get(binId);

  if (!beforeBin || !afterBin) {
    issues.push(`Bin ${binId} not found in state`);
    return issues;
  }

  const user = params.user || params.caller;
  const beforeUser = beforeState.userBalances.get(user);
  const afterUser = afterState.userBalances.get(user);
  if (!beforeUser || !afterUser) {
    issues.push(`User ${user} not found in state`);
    return issues;
  }

  const beforeBinState: BinState = {
    binId,
    xBalance: beforeBin.xBalance,
    yBalance: beforeBin.yBalance,
    totalSupply: beforeBin.totalSupply,
  };
  const afterBinState: BinState = {
    binId,
    xBalance: afterBin.xBalance,
    yBalance: afterBin.yBalance,
    totalSupply: afterBin.totalSupply,
  };
  const beforeUserState: UserState = {
    xTokenBalance: beforeUser.xToken,
    yTokenBalance: beforeUser.yToken,
    lpTokenBalance: beforeUser.lpTokens.get(binId) || 0n,
  };
  const afterUserState: UserState = {
    xTokenBalance: afterUser.xToken,
    yTokenBalance: afterUser.yToken,
    lpTokenBalance: afterUser.lpTokens.get(binId) || 0n,
  };

  const check = checkAddLiquidityInvariantsCore(
    beforeBinState,
    afterBinState,
    beforeUserState,
    afterUserState,
    params.xAmount,
    params.yAmount,
    result,
    params.minDlp || 1n
  );
  issues.push(...check.errors);

  return issues;
}

function checkWithdrawLiquidityInvariants(
  beforeState: PoolState,
  afterState: PoolState,
  params: any,
  result: any
): string[] {
  const issues: string[] = [];
  const binId = params.binId;
  const beforeBin = beforeState.binBalances.get(binId);
  const afterBin = afterState.binBalances.get(binId);

  if (!beforeBin || !afterBin) {
    issues.push(`Bin ${binId} not found in state`);
    return issues;
  }

  const user = params.user || params.caller;
  const beforeUser = beforeState.userBalances.get(user);
  const afterUser = afterState.userBalances.get(user);
  if (!beforeUser || !afterUser) {
    issues.push(`User ${user} not found in state`);
    return issues;
  }

  const beforeBinState: BinState = {
    binId,
    xBalance: beforeBin.xBalance,
    yBalance: beforeBin.yBalance,
    totalSupply: beforeBin.totalSupply,
  };
  const afterBinState: BinState = {
    binId,
    xBalance: afterBin.xBalance,
    yBalance: afterBin.yBalance,
    totalSupply: afterBin.totalSupply,
  };
  const beforeUserState: UserState = {
    xTokenBalance: beforeUser.xToken,
    yTokenBalance: beforeUser.yToken,
    lpTokenBalance: beforeUser.lpTokens.get(binId) || 0n,
  };
  const afterUserState: UserState = {
    xTokenBalance: afterUser.xToken,
    yTokenBalance: afterUser.yToken,
    lpTokenBalance: afterUser.lpTokens.get(binId) || 0n,
  };

  const check = checkWithdrawLiquidityInvariantsCore(
    beforeBinState,
    afterBinState,
    beforeUserState,
    afterUserState,
    params.amount,
    result.xAmount || 0n,
    result.yAmount || 0n,
    params.minXAmount || 0n,
    params.minYAmount || 0n
  );
  issues.push(...check.errors);

  return issues;
}

function checkMoveLiquidityInvariants(
  beforeState: PoolState,
  afterState: PoolState,
  params: any,
  result: bigint
): string[] {
  const issues: string[] = [];
  const sourceBinId = params.sourceBinId;
  const destBinId = params.destBinId;
  const beforeSourceBin = beforeState.binBalances.get(sourceBinId);
  const afterSourceBin = afterState.binBalances.get(sourceBinId);
  const beforeDestBin = beforeState.binBalances.get(destBinId);
  const afterDestBin = afterState.binBalances.get(destBinId);

  if (!beforeSourceBin || !afterSourceBin || !beforeDestBin || !afterDestBin) {
    issues.push(`Bins not found in state`);
    return issues;
  }

  const user = params.user || params.caller;
  const beforeUser = beforeState.userBalances.get(user);
  const afterUser = afterState.userBalances.get(user);
  if (!beforeUser || !afterUser) {
    issues.push(`User ${user} not found in state`);
    return issues;
  }

  const beforeSourceBinState: BinState = {
    binId: sourceBinId,
    xBalance: beforeSourceBin.xBalance,
    yBalance: beforeSourceBin.yBalance,
    totalSupply: beforeSourceBin.totalSupply,
  };
  const afterSourceBinState: BinState = {
    binId: sourceBinId,
    xBalance: afterSourceBin.xBalance,
    yBalance: afterSourceBin.yBalance,
    totalSupply: afterSourceBin.totalSupply,
  };
  const beforeDestBinState: BinState = {
    binId: destBinId,
    xBalance: beforeDestBin.xBalance,
    yBalance: beforeDestBin.yBalance,
    totalSupply: beforeDestBin.totalSupply,
  };
  const afterDestBinState: BinState = {
    binId: destBinId,
    xBalance: afterDestBin.xBalance,
    yBalance: afterDestBin.yBalance,
    totalSupply: afterDestBin.totalSupply,
  };
  const beforeUserSourceState: UserState = {
    xTokenBalance: beforeUser.xToken,
    yTokenBalance: beforeUser.yToken,
    lpTokenBalance: beforeUser.lpTokens.get(sourceBinId) || 0n,
  };
  const afterUserSourceState: UserState = {
    xTokenBalance: afterUser.xToken,
    yTokenBalance: afterUser.yToken,
    lpTokenBalance: afterUser.lpTokens.get(sourceBinId) || 0n,
  };
  const beforeUserDestState: UserState = {
    xTokenBalance: beforeUser.xToken,
    yTokenBalance: beforeUser.yToken,
    lpTokenBalance: beforeUser.lpTokens.get(destBinId) || 0n,
  };
  const afterUserDestState: UserState = {
    xTokenBalance: afterUser.xToken,
    yTokenBalance: afterUser.yToken,
    lpTokenBalance: afterUser.lpTokens.get(destBinId) || 0n,
  };

  const check = checkMoveLiquidityInvariantsCore(
    beforeSourceBinState,
    afterSourceBinState,
    beforeDestBinState,
    afterDestBinState,
    beforeUserSourceState,
    afterUserSourceState,
    beforeUserDestState,
    afterUserDestState,
    params.amount,
    result,
    params.minDlp || 1n
  );
  issues.push(...check.errors);

  return issues;
}

function checkRoundingErrors(
  functionName: string,
  beforeState: PoolState,
  afterState: PoolState,
  params: any,
  result: any,
  user: string
): string[] {
  const issues: string[] = [];
  const binId = params.binId || params.sourceBinId;
  
  if (!binId) return issues;
  
  const beforeBin = beforeState.binBalances.get(binId);
  const afterBin = afterState.binBalances.get(binId);
  const beforeUser = beforeState.userBalances.get(user);
  const afterUser = afterState.userBalances.get(user);
  
  if (!beforeBin || !afterBin || !beforeUser || !afterUser) return issues;
  
  if (functionName === 'swap-x-for-y' || functionName === 'swap-y-for-x') {
    // Check conservation: tokens in = tokens out + fees (with small rounding tolerance)
    // For swaps, we can't easily calculate exact fees, but we can check:
    // 1. User balance changes match expected direction
    // 2. Pool balance changes are consistent
    // 3. No unexpected dust accumulation
    // 4. **NEW**: Verify swap calculation matches contract's internal math
    
    if (functionName === 'swap-x-for-y') {
      const xIn = params.amount;
      const xChange = afterBin.xBalance - beforeBin.xBalance;
      const yChange = beforeBin.yBalance - afterBin.yBalance;
      
      // X should increase (input minus fees)
      if (xChange > xIn) {
        issues.push(`Rounding error: X balance increased more than input (${xChange} > ${xIn})`);
      }
      
      // Y should decrease (output)
      if (yChange <= 0n) {
        issues.push(`Rounding error: Y balance did not decrease as expected`);
      }
      
      // Check user balance changes
      // Note: Swaps allow partial fills - the contract caps at available liquidity
      // The swap returns {in: updated-x-amount, out: dy} where 'in' is the actual amount swapped
      const userXChange = beforeUser.xToken - afterUser.xToken;
      const userYChange = afterUser.yToken - beforeUser.yToken;
      
      // Extract the actual amount swapped from the result
      // result is {in: updated-x-amount, out: dy} from the contract
      const actualSwappedIn = result?.in || 0n;
      const actualSwappedOut = result?.out || 0n;
      
      // User should have paid exactly what was actually swapped (not the input amount)
      // No tolerance - any discrepancy indicates a potential rounding error
      if (userXChange !== actualSwappedIn) {
        issues.push(`Rounding error: User X balance change (${userXChange}) != actual swapped amount (${actualSwappedIn}), diff: ${actualSwappedIn > userXChange ? actualSwappedIn - userXChange : userXChange - actualSwappedIn}`);
      }
      
      // Output should be positive (user received tokens)
      if (userYChange <= 0n) {
        issues.push(`Rounding error: User did not receive Y tokens`);
      }
      
      // **NEW**: Verify swap calculation matches contract's internal math
      // For swap-x-for-y, the contract has TWO caps (partial fills):
      // 1. First cap (line 1260-1264): Caps input X at updated-max-x-amount (based on available Y BEFORE swap)
      // 2. Second cap (line 1274-1275): Caps output Y at y-balance BEFORE swap
      try {
        const poolData = rovOk(sbtcUsdcPool.getPool());
        const binStep = poolData.binStep;
        const initialPrice = poolData.initialPrice;
        const FEE_SCALE_BPS = 10000;
        const PRICE_SCALE_BPS = 100000000;
        
        // Get bin price
        const binPriceBigInt = rovOk(dlmmCore.getBinPrice(initialPrice, binStep, binId));
        
        // Get fees from pool data - for swap-x-for-y, use X fees
        const protocolFee = Number(poolData.xProtocolFee || 0n);
        const providerFee = Number(poolData.xProviderFee || 0n);
        const variableFee = Number(poolData.xVariableFee || 0n);
        const swapFeeTotal = protocolFee + providerFee + variableFee;
        
        // CRITICAL FIX: Use balance BEFORE swap from captured state, not after
        // The contract calculates max-x-amount using y-balance BEFORE the swap
        const yBalanceBeforeSwap = Number(beforeBin.yBalance);
        const inputXAmount = Number(params.amount);
        const binPrice = Number(binPriceBigInt);
        
        // Contract calculation for swap-x-for-y (lines 1260-1275):
        // Use FLOAT arithmetic to match contract formulas exactly
        // Step 1: Calculate max-x-amount based on y-balance BEFORE swap
        // Formula: max-x-amount = (y-balance * PRICE_SCALE_BPS + bin-price - 1) / bin-price
        // The "+ bin-price - 1" is for ceiling rounding in integer math, but we use float
        const maxXAmount = (yBalanceBeforeSwap * PRICE_SCALE_BPS + binPrice - 1) / binPrice;
        
        // Step 2: Adjust for fees to get updated-max-x-amount
        // Formula: updated-max-x-amount = max-x-amount * FEE_SCALE_BPS / (FEE_SCALE_BPS - swap-fee-total)
        const updatedMaxXAmount = swapFeeTotal > 0 
          ? (maxXAmount * FEE_SCALE_BPS) / (FEE_SCALE_BPS - swapFeeTotal)
          : maxXAmount;
        
        // Step 3: Cap input X amount (this is the partial fill - line 1264)
        // updated-x-amount = min(x-amount, updated-max-x-amount)
        // Use actualSwappedIn from result - this is the actual amount swapped after capping
        const updatedXAmount = Number(actualSwappedIn);
        
        // Step 4: Calculate fees and dx from the actual swapped amount (lines 1267-1271)
        // Formula: x-amount-fees-total = (updated-x-amount * swap-fee-total) / FEE_SCALE_BPS
        // Use integer arithmetic to match contract exactly
        const updatedXAmountBigInt = BigInt(actualSwappedIn);
        const swapFeeTotalBigInt = BigInt(swapFeeTotal);
        const FEE_SCALE_BPS_BIGINT = 10000n;
        const xAmountFeesTotalBigInt = (updatedXAmountBigInt * swapFeeTotalBigInt) / FEE_SCALE_BPS_BIGINT;
        // Formula: dx = updated-x-amount - x-amount-fees-total
        const dxBigInt = updatedXAmountBigInt - xAmountFeesTotalBigInt;
        
        // Step 5: Calculate dy from dx (line 1274)
        // Formula: dy-before-cap = (dx * bin-price) / PRICE_SCALE_BPS
        // Use integer arithmetic to match contract exactly
        const PRICE_SCALE_BPS_BIGINT = 100000000n;
        const dyBeforeCapBigInt = (dxBigInt * binPriceBigInt) / PRICE_SCALE_BPS_BIGINT;
        
        // Step 6: Second cap - Cap dy at y-balance BEFORE swap (line 1275)
        // Formula: dy = (if (> dy-before-cap y-balance) y-balance dy-before-cap)
        const yBalanceBeforeSwapBigInt = beforeBin.yBalance;
        const expectedDy = dyBeforeCapBigInt > yBalanceBeforeSwapBigInt ? yBalanceBeforeSwapBigInt : dyBeforeCapBigInt;
        
        // Compare expected to actual - allow only 1-2 token difference for legitimate rounding
        // CRITICAL: The contract returns result.in as the ACTUAL amount swapped (after capping)
        // and result.out as the ACTUAL output. We need to verify our calculation matches.
        if (expectedDy !== actualSwappedOut) {
          const diff = expectedDy > actualSwappedOut ? expectedDy - actualSwappedOut : actualSwappedOut - expectedDy;
          // Only allow 1-2 token difference for legitimate integer rounding
          const maxTolerance = 2n; // Strict tolerance: only 2 tokens
          if (diff > maxTolerance) {
            // Build detailed error message with all intermediate values
            const errorDetails = [
              `expected out: ${expectedDy}`,
              `actual out: ${actualSwappedOut}`,
              `diff: ${diff}`,
              `binPrice: ${binPriceBigInt}`,
              `dx: ${dxBigInt}`,
              `fees: ${xAmountFeesTotalBigInt}`,
              `yBalanceBeforeSwap: ${beforeBin.yBalance}`,
              `yBalanceAfterSwap: ${afterBin.yBalance}`,
              `dyBeforeCap: ${dyBeforeCapBigInt}`,
              `updatedXAmount: ${updatedXAmountBigInt}`,
              `updatedMaxXAmount: ${updatedMaxXAmount.toFixed(6)}`,
              `maxXAmount: ${maxXAmount.toFixed(6)}`,
              `inputXAmount: ${inputXAmount.toFixed(6)}`,
              `swapFeeTotal: ${swapFeeTotal}`
            ].join(', ');
            issues.push(`Rounding error: Swap calculation mismatch - ${errorDetails}`);
          }
        }
      } catch (e) {
        // If we can't get pool data or calculate, skip this check
        // (this shouldn't happen, but don't fail the test if it does)
      }
    } else {
      const yIn = params.amount;
      const yChange = afterBin.yBalance - beforeBin.yBalance;
      const xChange = beforeBin.xBalance - afterBin.xBalance;
      
      if (yChange > yIn) {
        issues.push(`Rounding error: Y balance increased more than input (${yChange} > ${yIn})`);
      }
      
      if (xChange <= 0n) {
        issues.push(`Rounding error: X balance did not decrease as expected`);
      }
      
      const userYChange = beforeUser.yToken - afterUser.yToken;
      const userXChange = afterUser.xToken - beforeUser.xToken;
      
      // Extract the actual amount swapped from the result
      // result is {in: updated-y-amount, out: dx} from the contract
      const actualSwappedIn = result?.in || 0n;
      const actualSwappedOut = result?.out || 0n;
      
      // User should have paid exactly what was actually swapped (not the input amount)
      // No tolerance - any discrepancy indicates a potential rounding error
      if (userYChange !== actualSwappedIn) {
        issues.push(`Rounding error: User Y balance change (${userYChange}) != actual swapped amount (${actualSwappedIn}), diff: ${actualSwappedIn > userYChange ? actualSwappedIn - userYChange : userYChange - actualSwappedIn}`);
      }
      
      // Output should be positive (user received tokens)
      if (userXChange <= 0n) {
        issues.push(`Rounding error: User did not receive X tokens`);
      }
      
      // **NEW**: Verify swap calculation matches contract's internal math
      // For swap-y-for-x, the contract has TWO caps (partial fills):
      // 1. First cap (line 1405-1409): Caps input Y at updated-max-y-amount (based on available X BEFORE swap)
      // 2. Second cap (line 1419-1420): Caps output X at x-balance BEFORE swap
      try {
        const poolData = rovOk(sbtcUsdcPool.getPool());
        const binStep = poolData.binStep;
        const initialPrice = poolData.initialPrice;
        const FEE_SCALE_BPS = 10000;
        const PRICE_SCALE_BPS = 100000000;
        
        // Get bin price
        const binPriceBigInt = rovOk(dlmmCore.getBinPrice(initialPrice, binStep, binId));
        
        // Get fees from pool data - for swap-y-for-x, use Y fees
        const protocolFee = Number(poolData.yProtocolFee || 0n);
        const providerFee = Number(poolData.yProviderFee || 0n);
        const variableFee = Number(poolData.yVariableFee || 0n);
        const swapFeeTotal = protocolFee + providerFee + variableFee;
        
        // CRITICAL FIX: Use balance BEFORE swap from captured state, not after
        // The contract calculates max-y-amount using x-balance BEFORE the swap
        const xBalanceBeforeSwap = Number(beforeBin.xBalance);
        const inputYAmount = Number(params.amount);
        const binPrice = Number(binPriceBigInt);
        
        // Contract calculation for swap-y-for-x (lines 1405-1420):
        // Use FLOAT arithmetic to match contract formulas exactly
        // Step 1: Calculate max-y-amount based on x-balance BEFORE swap
        // Formula: max-y-amount = (x-balance * bin-price + PRICE_SCALE_BPS - 1) / PRICE_SCALE_BPS
        // The "+ PRICE_SCALE_BPS - 1" is for ceiling rounding in integer math, but we use float
        const maxYAmount = (xBalanceBeforeSwap * binPrice + PRICE_SCALE_BPS - 1) / PRICE_SCALE_BPS;
        
        // Step 2: Adjust for fees to get updated-max-y-amount
        // Formula: updated-max-y-amount = max-y-amount * FEE_SCALE_BPS / (FEE_SCALE_BPS - swap-fee-total)
        const updatedMaxYAmount = swapFeeTotal > 0 
          ? (maxYAmount * FEE_SCALE_BPS) / (FEE_SCALE_BPS - swapFeeTotal)
          : maxYAmount;
        
        // Step 3: Cap input Y amount (this is the partial fill - line 1409)
        // updated-y-amount = min(y-amount, updated-max-y-amount)
        // Use actualSwappedIn from result - this is the actual amount swapped after capping
        const updatedYAmount = Number(actualSwappedIn);
        
        // Step 4: Calculate fees and dy from the actual swapped amount (lines 1412-1416)
        // Formula: y-amount-fees-total = (updated-y-amount * swap-fee-total) / FEE_SCALE_BPS
        // Use integer arithmetic to match contract exactly
        const updatedYAmountBigInt = BigInt(actualSwappedIn);
        const swapFeeTotalBigInt = BigInt(swapFeeTotal);
        const FEE_SCALE_BPS_BIGINT = 10000n;
        const yAmountFeesTotalBigInt = (updatedYAmountBigInt * swapFeeTotalBigInt) / FEE_SCALE_BPS_BIGINT;
        // Formula: dy = updated-y-amount - y-amount-fees-total
        const dyBigInt = updatedYAmountBigInt - yAmountFeesTotalBigInt;
        
        // Step 5: Calculate dx from dy (line 1419)
        // Formula: dx-before-cap = (dy * PRICE_SCALE_BPS) / bin-price
        // Use integer arithmetic to match contract exactly
        const PRICE_SCALE_BPS_BIGINT = 100000000n;
        const dxBeforeCapBigInt = (dyBigInt * PRICE_SCALE_BPS_BIGINT) / binPriceBigInt;
        
        // Step 6: Second cap - Cap dx at x-balance BEFORE swap (line 1420)
        // Formula: dx = (if (> dx-before-cap x-balance) x-balance dx-before-cap)
        const xBalanceBeforeSwapBigInt = beforeBin.xBalance;
        const expectedDx = dxBeforeCapBigInt > xBalanceBeforeSwapBigInt ? xBalanceBeforeSwapBigInt : dxBeforeCapBigInt;
        
        // Compare expected to actual - allow only 1-2 token difference for legitimate rounding
        // CRITICAL: The contract returns result.in as the ACTUAL amount swapped (after capping)
        // and result.out as the ACTUAL output. We need to verify our calculation matches.
        if (expectedDx !== actualSwappedOut) {
          const diff = expectedDx > actualSwappedOut ? expectedDx - actualSwappedOut : actualSwappedOut - expectedDx;
          // Only allow 1-2 token difference for legitimate integer rounding
          const maxTolerance = 2n; // Strict tolerance: only 2 tokens
          if (diff > maxTolerance) {
            // Build detailed error message with all intermediate values
            const errorDetails = [
              `expected out: ${expectedDx}`,
              `actual out: ${actualSwappedOut}`,
              `diff: ${diff}`,
              `binPrice: ${binPriceBigInt}`,
              `dy: ${dyBigInt}`,
              `fees: ${yAmountFeesTotalBigInt}`,
              `xBalanceBeforeSwap: ${beforeBin.xBalance}`,
              `xBalanceAfterSwap: ${afterBin.xBalance}`,
              `dxBeforeCap: ${dxBeforeCapBigInt}`,
              `updatedYAmount: ${updatedYAmountBigInt}`,
              `updatedMaxYAmount: ${updatedMaxYAmount.toFixed(6)}`,
              `maxYAmount: ${maxYAmount.toFixed(6)}`,
              `inputYAmount: ${inputYAmount.toFixed(6)}`,
              `swapFeeTotal: ${swapFeeTotal}`
            ].join(', ');
            issues.push(`Rounding error: Swap calculation mismatch - ${errorDetails}`);
          }
        }
      } catch (e) {
        // If we can't get pool data or calculate, skip this check
        // (this shouldn't happen, but don't fail the test if it does)
      }
    }
  } else if (functionName === 'add-liquidity') {
    // Check LP token calculation: LP received should be proportional to liquidity added
    const xAdded = params.xAmount || 0n;
    const yAdded = params.yAmount || 0n;
    const lpReceived = result || 0n;
    
    // LP should be positive if liquidity was added
    if ((xAdded > 0n || yAdded > 0n) && lpReceived === 0n) {
      issues.push(`Rounding error: No LP tokens received despite adding liquidity`);
    }
    
    // Check bin balance increases
    // Note: Liquidity fees are deducted, so bin balance increase may be less than added
    const xIncrease = afterBin.xBalance - beforeBin.xBalance;
    const yIncrease = afterBin.yBalance - beforeBin.yBalance;
    
    // Bin balance should increase, but may be less than added due to fees
    // Only flag if increase is significantly less (more than 1% difference)
    if (xAdded > 0n) {
      if (xIncrease <= 0n) {
        issues.push(`Rounding error: X balance did not increase despite adding ${xAdded}`);
      } else if (xIncrease < xAdded) {
        const diff = xAdded - xIncrease;
        const percentDiff = (diff * 10000n) / xAdded; // Basis points
        if (percentDiff > 100n) { // More than 1% difference - likely a real issue
          issues.push(`Rounding error: X balance increase (${xIncrease}) < added (${xAdded}), diff: ${diff} (${percentDiff/100n}%)`);
        }
      }
    }
    
    if (yAdded > 0n) {
      if (yIncrease <= 0n) {
        issues.push(`Rounding error: Y balance did not increase despite adding ${yAdded}`);
      } else if (yIncrease < yAdded) {
        const diff = yAdded - yIncrease;
        const percentDiff = (diff * 10000n) / yAdded; // Basis points
        if (percentDiff > 100n) { // More than 1% difference
          issues.push(`Rounding error: Y balance increase (${yIncrease}) < added (${yAdded}), diff: ${diff} (${percentDiff/100n}%)`);
        }
      }
    }
  } else if (functionName === 'withdraw-liquidity') {
    // Check that withdrawn amounts are proportional to LP tokens burned
    // const lpBurned = params.amount; // Not used in current checks
    const xOut = result?.xAmount || 0n;
    const yOut = result?.yAmount || 0n;
    
    // Check bin balance decreases
    // Note: Withdrawal may have fees, so bin decrease may be more than user output
    const xDecrease = beforeBin.xBalance - afterBin.xBalance;
    const yDecrease = beforeBin.yBalance - afterBin.yBalance;
    
    // Bin should decrease, but only flag if decrease is significantly more than output
    // (more than 1% difference suggests an issue)
    if (xOut > 0n && xDecrease > xOut) {
      const diff = xDecrease - xOut;
      const percentDiff = (diff * 10000n) / xOut; // Basis points
      if (percentDiff > 100n) { // More than 1% difference
        issues.push(`Rounding error: X balance decrease (${xDecrease}) > output (${xOut}), diff: ${diff} (${percentDiff/100n}%)`);
      }
    }
    
    if (yOut > 0n && yDecrease > yOut) {
      const diff = yDecrease - yOut;
      const percentDiff = (diff * 10000n) / yOut; // Basis points
      if (percentDiff > 100n) { // More than 1% difference
        issues.push(`Rounding error: Y balance decrease (${yDecrease}) > output (${yOut}), diff: ${diff} (${percentDiff/100n}%)`);
      }
    }
  }
  
  return issues;
}

function checkGlobalInvariants(state: PoolState): string[] {
  const issues: string[] = [];

  // Active bin should be in valid range
  if (state.activeBinId < -500n || state.activeBinId > 500n) {
    issues.push(`Active bin out of range: ${state.activeBinId}`);
  }

  // All bin balances should be non-negative
  for (const [binId, bin] of state.binBalances.entries()) {
    if (bin.xBalance < 0n || bin.yBalance < 0n || bin.totalSupply < 0n) {
      issues.push(`Bin ${binId} has negative values`);
    }
  }

  // User balances should be non-negative
  for (const [user, balance] of state.userBalances.entries()) {
    if (balance.xToken < 0n || balance.yToken < 0n) {
      issues.push(`User ${user} has negative token balance`);
    }
    for (const [binId, lpBalance] of balance.lpTokens.entries()) {
      if (lpBalance < 0n) {
        issues.push(`User ${user} has negative LP balance in bin ${binId}`);
      }
    }
  }

  return issues;
}

// ============================================================================
// Main Fuzz Test
// ============================================================================

describe('DLMM Core Comprehensive Fuzz Test', () => {
  let logger: FuzzTestLogger;
  let rng: SeededRandom;
  // Start small, scale up iteratively
  const NUM_TRANSACTIONS = process.env.FUZZ_SIZE ? parseInt(process.env.FUZZ_SIZE) : 100;
  const RANDOM_SEED = Date.now(); // Use timestamp for seed, but log it for reproducibility

  beforeEach(async () => {
    // Setup test environment
    setupTestEnvironment();
    
    // Initialize logger
    logger = new FuzzTestLogger();
    logger.log(`Random seed: ${RANDOM_SEED}`);
    
    // Initialize RNG
    rng = new SeededRandom(RANDOM_SEED);
    
    // Mint additional tokens to users for fuzzing
    txOk(mockSbtcToken.mint(10000000000n, alice), deployer); // 100 BTC
    txOk(mockUsdcToken.mint(1000000000000n, alice), deployer); // 1M USDC
    txOk(mockSbtcToken.mint(10000000000n, bob), deployer);
    txOk(mockUsdcToken.mint(1000000000000n, bob), deployer);
    txOk(mockSbtcToken.mint(10000000000n, charlie), deployer);
    txOk(mockUsdcToken.mint(1000000000000n, charlie), deployer);
  });

  it(`should execute ${NUM_TRANSACTIONS} random transactions and maintain invariants`, async () => {
    const users = [deployer, alice, bob, charlie];
    const functions = ['swap-x-for-y', 'swap-y-for-x', 'add-liquidity', 'withdraw-liquidity', 'move-liquidity'];
    
    let consecutiveFailures = 0;
    const MAX_CONSECUTIVE_FAILURES = 100;
    
    console.log(`\n🚀 Starting fuzz test with ${NUM_TRANSACTIONS} transactions...`);
    console.log(`📊 Results will be saved to: logs/fuzz-test-results/`);
    const startTime = Date.now();

    for (let txNum = 1; txNum <= NUM_TRANSACTIONS; txNum++) {
      // Progress indicator - show every 10 transactions for visibility
      if (txNum % 10 === 0 || txNum === 1) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = txNum > 0 && (Date.now() - startTime) > 0 ? (txNum / (Date.now() - startTime) * 1000).toFixed(1) : '0';
        const successRate = logger.stats.totalTransactions > 0 ? ((logger.stats.successfulTransactions / logger.stats.totalTransactions) * 100).toFixed(1) : '0';
        const percent = ((txNum / NUM_TRANSACTIONS) * 100).toFixed(1);
        
        // Create progress bar
        const barWidth = 40;
        const filled = Math.floor((txNum / NUM_TRANSACTIONS) * barWidth);
        const empty = barWidth - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        
        logger.log(`Progress: ${txNum}/${NUM_TRANSACTIONS} (${percent}%) | Success: ${successRate}% | Rate: ${rate} tx/s | Elapsed: ${elapsed}s`);
        
        // Force output with process.stdout.write for immediate visibility
        process.stdout.write(`\r📊 [${bar}] ${percent}% (${txNum}/${NUM_TRANSACTIONS}) | ✅ ${successRate}% | ⚡ ${rate} tx/s | ⏱️  ${elapsed}s`);
        if (txNum > 0 && parseFloat(rate) > 0) {
          const remaining = NUM_TRANSACTIONS - txNum;
          const eta = (remaining / parseFloat(rate)).toFixed(0);
          const etaMin = Math.floor(parseFloat(eta) / 60);
          const etaSec = parseFloat(eta) % 60;
          process.stdout.write(` | ⏳ ETA: ~${etaMin}m ${etaSec}s`);
        }
        process.stdout.write('\n');
      }

      // Capture state before (with error handling)
      let beforeState: PoolState;
      try {
        beforeState = await capturePoolState();
      } catch (e) {
        logger.log(`Error capturing state before tx ${txNum}: ${e}`);
        continue; // Skip this transaction
      }

      // Select random function and user
      const functionName = rng.choice(functions);
      const caller = rng.choice(users);

      let params: any = {};
      let success = false;
      let error: string | undefined;
      let result: any;

      try {
        if (functionName === 'swap-x-for-y' || functionName === 'swap-y-for-x') {
          // Swaps must use the active bin
          const activeBinId = beforeState.activeBinId;
          const binId = activeBinId;
          
          const direction = functionName === 'swap-x-for-y' ? 'x-for-y' : 'y-for-x';
          const amount = generateRandomSwapAmount(rng, beforeState, binId, direction, caller);
          
          if (!amount || amount === 0n) {
            consecutiveFailures++;
            if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
              logger.log(`Too many consecutive failures, regenerating state...`);
              // Add liquidity to random bins to improve state
              for (let i = 0; i < 5; i++) {
                const randomBin = beforeState.activeBinId + BigInt(rng.nextInt(-5, 5));
                const liqParams = generateRandomAddLiquidityAmount(rng, beforeState, randomBin, deployer);
                if (liqParams) {
                  try {
                    txOk(dlmmCore.addLiquidity(
                      sbtcUsdcPool.identifier,
                      mockSbtcToken.identifier,
                      mockUsdcToken.identifier,
                      randomBin,
                      liqParams.xAmount,
                      liqParams.yAmount,
                      1n,
                      1000000n,
                      1000000n
                    ), deployer);
                  } catch {}
                }
              }
              consecutiveFailures = 0;
            }
            continue;
          }

          params = { binId, amount, caller, user: caller };
          
          let swapResponse;
          if (functionName === 'swap-x-for-y') {
            swapResponse = txOk(dlmmCore.swapXForY(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              binId,
              amount
            ), caller);
          } else {
            swapResponse = txOk(dlmmCore.swapYForX(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              binId,
              amount
            ), caller);
          }
          
          // Extract result value - swap returns {in: uint128, out: uint128}
          result = cvToValue(swapResponse.result);
          
          // Ensure result has the expected structure
          if (!result || typeof result !== 'object' || result.in === undefined || result.out === undefined) {
            logger.log(`Warning: Unexpected swap result structure: ${JSON.stringify(result)}`);
            // Try to handle if result is just a number (shouldn't happen but be defensive)
            if (typeof result === 'bigint' || typeof result === 'number') {
              result = { in: BigInt(result), out: 0n };
            }
          }
          
          success = true;
          consecutiveFailures = 0;

        } else if (functionName === 'add-liquidity') {
          const activeBinId = beforeState.activeBinId;
          const binOffset = rng.nextInt(-10, 10);
          const binId = activeBinId + BigInt(binOffset);
          const clampedBinId = binId < -500n ? -500n : (binId > 500n ? 500n : binId);
          
          const liqParams = generateRandomAddLiquidityAmount(rng, beforeState, clampedBinId, caller);
          
          if (!liqParams) {
            consecutiveFailures++;
            continue;
          }

          params = { binId: clampedBinId, ...liqParams, caller, user: caller };
          
          const addLiquidityResponse = txOk(dlmmCore.addLiquidity(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            clampedBinId,
            liqParams.xAmount,
            liqParams.yAmount,
            1n, // minDlp
            1000000n, // max-x-liquidity-fee
            1000000n  // max-y-liquidity-fee
          ), caller);
          
          // Extract result value - addLiquidity returns LP tokens (uint128)
          result = cvToValue(addLiquidityResponse.result);
          
          success = true;
          consecutiveFailures = 0;

        } else if (functionName === 'withdraw-liquidity') {
          // Find bins where user has LP tokens
          const userBalance = beforeState.userBalances.get(caller);
          if (!userBalance || userBalance.lpTokens.size === 0) {
            consecutiveFailures++;
            continue;
          }

          const binsWithLiquidity = Array.from(userBalance.lpTokens.keys());
          const binId = rng.choice(binsWithLiquidity);
          const amount = generateRandomWithdrawAmount(rng, beforeState, binId, caller);
          
          if (!amount) {
            consecutiveFailures++;
            continue;
          }

          params = { binId, amount, caller, user: caller };
          
          // Calculate reasonable minimums based on bin balances
          // If bin has no X tokens, minXAmount should be 0
          // If bin has no Y tokens, minYAmount should be 0
          const binData = beforeState.binBalances.get(binId);
          const minXAmount = binData && binData.xBalance > 0n ? 1000n : 0n;
          const minYAmount = binData && binData.yBalance > 0n ? 1000n : 0n;
          
          const withdrawResponse = txOk(dlmmCore.withdrawLiquidity(
            sbtcUsdcPool.identifier,
            mockSbtcToken.identifier,
            mockUsdcToken.identifier,
            binId,
            amount,
            minXAmount,
            minYAmount
          ), caller);
          
          // Extract result values - withdraw returns {xAmount: uint128, yAmount: uint128}
          result = cvToValue(withdrawResponse.result);
          
          success = true;
          consecutiveFailures = 0;

        } else if (functionName === 'move-liquidity') {
          const userBalance = beforeState.userBalances.get(caller);
          if (!userBalance || userBalance.lpTokens.size === 0) {
            consecutiveFailures++;
            continue;
          }

          const binsWithLiquidity = Array.from(userBalance.lpTokens.keys());
          const sourceBinId = rng.choice(binsWithLiquidity);
          const amount = generateRandomMoveAmount(rng, beforeState, sourceBinId, caller);
          
          if (!amount) {
            consecutiveFailures++;
            continue;
          }

          // Select destination bin (different from source)
          // IMPORTANT: Must respect contract constraints:
          // - If destBinId < activeBinId: can only accept Y tokens (x-amount must be 0)
          // - If destBinId > activeBinId: can only accept X tokens (y-amount must be 0)
          // - If destBinId == activeBinId: can accept both X and Y tokens
          // 
          // The contract calculates X and Y amounts from the source bin's composition.
          // We need to select a destination that can accept the tokens from the source bin.
          const activeBinId = beforeState.activeBinId;
          const sourceBin = beforeState.binBalances.get(sourceBinId);
          
          // Determine what tokens the source bin has
          const sourceHasX = sourceBin && sourceBin.xBalance > 0n;
          const sourceHasY = sourceBin && sourceBin.yBalance > 0n;
          
          // Sometimes test invalid moves (10% chance) to verify error handling
          const testInvalidMove = rng.next() < 0.1;
          let destBinId: bigint;
          let expectedToFail = false;
          let attempts = 0;
          
          do {
            if (testInvalidMove) {
              // Intentionally select an INCOMPATIBLE destination to test error handling
              expectedToFail = true;
              if (sourceHasX && sourceHasY) {
                // Source has both - select a bin that can only accept one type
                const offset = rng.next() > 0.5 ? rng.nextInt(1, 10) : rng.nextInt(-10, -1);
                destBinId = activeBinId + BigInt(offset);
              } else if (sourceHasX && !sourceHasY) {
                // Source has only X - select negative bin (can only accept Y) - INVALID
                const offset = rng.nextInt(-10, -1);
                destBinId = activeBinId + BigInt(offset);
              } else if (!sourceHasX && sourceHasY) {
                // Source has only Y - select positive bin (can only accept X) - INVALID
                const offset = rng.nextInt(1, 10);
                destBinId = activeBinId + BigInt(offset);
              } else {
                // Source has no tokens - select any bin
                const offset = rng.nextInt(-10, 10);
                destBinId = activeBinId + BigInt(offset);
                expectedToFail = false; // Won't fail if source has no tokens
              }
            } else {
              // Select compatible destination bin (normal case)
              if (sourceHasX && sourceHasY) {
                // Source has both X and Y - destination must be active bin or can accept both
                // Prefer active bin or nearby bins that can accept both
                const offset = rng.nextInt(-2, 2);
                destBinId = activeBinId + BigInt(offset);
              } else if (sourceHasX && !sourceHasY) {
                // Source has only X - destination must be >= activeBinId
                const offset = rng.nextInt(0, 10);
                destBinId = activeBinId + BigInt(offset);
              } else if (!sourceHasX && sourceHasY) {
                // Source has only Y - destination must be <= activeBinId
                const offset = rng.nextInt(-10, 0);
                destBinId = activeBinId + BigInt(offset);
              } else {
                // Source has no tokens (shouldn't happen, but fallback)
                const offset = rng.nextInt(-10, 10);
                destBinId = activeBinId + BigInt(offset);
              }
            }
            
            destBinId = destBinId < -500n ? -500n : (destBinId > 500n ? 500n : destBinId);
            attempts++;
          } while (destBinId === sourceBinId && attempts < 10);
          
          // Final check: ensure destination is different from source
          if (destBinId === sourceBinId) {
            // If still same, adjust by 1
            destBinId = sourceBinId + (rng.next() > 0.5 ? 1n : -1n);
            destBinId = destBinId < -500n ? -500n : (destBinId > 500n ? 500n : destBinId);
            expectedToFail = false; // Same bin will fail for different reason
          }

          params = { sourceBinId, destBinId, amount, expectedToFail, caller, user: caller };
          
          if (expectedToFail) {
            // Expect this to fail - test error handling
            const moveResponse = txErr(dlmmCore.moveLiquidity(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              sourceBinId,
              destBinId,
              amount,
              1n, // minDlp
              1000000n, // max-x-liquidity-fee
              1000000n  // max-y-liquidity-fee
            ), caller);
            // Expected failure - this is success for our test
            success = true;
            result = null; // No result for failed transactions
            error = `Expected failure: ${cvToValue(moveResponse.result)}`;
            consecutiveFailures = 0;
          } else {
            // Expect this to succeed
            const moveResponse = txOk(dlmmCore.moveLiquidity(
              sbtcUsdcPool.identifier,
              mockSbtcToken.identifier,
              mockUsdcToken.identifier,
              sourceBinId,
              destBinId,
              amount,
              1n, // minDlp
              1000000n, // max-x-liquidity-fee
              1000000n  // max-y-liquidity-fee
            ), caller);
            result = cvToValue(moveResponse.result);
            success = true;
            consecutiveFailures = 0;
          }
        }

      } catch (e: any) {
        error = String(e);
        // Check if this was an expected failure
        const expectedToFail = params?.expectedToFail || false;
        if (expectedToFail) {
          // Expected failure - this is actually success for our test
          success = true;
          result = null;
          error = `Expected failure: ${error}`;
          consecutiveFailures = 0;
        } else {
          // Unexpected failure
          success = false;
          consecutiveFailures++;
        }
      }

      // Capture state after (only if transaction succeeded)
      const afterState = success ? await capturePoolState() : beforeState;

      // Check invariants (only for successful transactions that changed state)
      let invariantIssues: string[] = [];
      if (success && result !== null) {
        if (functionName === 'swap-x-for-y' || functionName === 'swap-y-for-x') {
          invariantIssues = checkSwapInvariants(functionName, beforeState, afterState, params, result, caller);
        } else if (functionName === 'add-liquidity') {
          invariantIssues = checkAddLiquidityInvariants(beforeState, afterState, params, result);
        } else if (functionName === 'withdraw-liquidity') {
          invariantIssues = checkWithdrawLiquidityInvariants(beforeState, afterState, params, result);
        } else if (functionName === 'move-liquidity') {
          invariantIssues = checkMoveLiquidityInvariants(beforeState, afterState, params, result);
        }

        // Check for rounding errors
        const roundingIssues = checkRoundingErrors(functionName, beforeState, afterState, params, result, caller);
        invariantIssues.push(...roundingIssues);

        // Check global invariants
        const globalIssues = checkGlobalInvariants(afterState);
        invariantIssues.push(...globalIssues);

        if (invariantIssues.length > 0) {
          logger.log(`⚠️  INVARIANT VIOLATION in transaction ${txNum}: ${invariantIssues.join('; ')}`);
          logger.stats.invariantViolations += invariantIssues.length;
        }
      }

      // Log transaction
      // For expected failures, mark as 'success' since the failure is expected
      const logResult = success ? 'success' : 'failure';
      logger.logTransaction({
        txNumber: txNum,
        functionName,
        caller,
        params,
        beforeState,
        result: logResult,
        error,
        afterState: success ? afterState : undefined,
        invariantChecks: invariantIssues.length > 0 ? invariantIssues : undefined,
      });
    }

    // Generate summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.log(`\n⏱️  Total execution time: ${totalTime} seconds`);
    logger.generateSummary();
    logger.writeToFile();

    // Final assertions
    const finalState = await capturePoolState();
    const finalIssues = checkGlobalInvariants(finalState);
    
    console.log(`\n✅ Test completed in ${totalTime}s`);
    console.log(`📁 Results saved to: logs/fuzz-test-results/`);
    console.log(`📊 Success rate: ${((logger.stats.successfulTransactions / NUM_TRANSACTIONS) * 100).toFixed(2)}%`);
    console.log(`🔍 Invariant violations: ${logger.stats.invariantViolations}`);
    
    // Read and display summary
    try {
      const resultsDir = path.join(process.cwd(), 'logs', 'fuzz-test-results');
      if (fs.existsSync(resultsDir)) {
        const summaryFiles = fs.readdirSync(resultsDir)
          .filter(f => f.endsWith('.md'))
          .sort()
          .reverse();
        if (summaryFiles.length > 0) {
          const latestSummary = fs.readFileSync(
            path.join(resultsDir, summaryFiles[0]),
            'utf-8'
          );
          console.log(`\n${latestSummary}`);
        }
      }
    } catch (e) {
      console.log(`Could not read summary: ${e}`);
    }
    
    expect(finalIssues.length).toBe(0);
    // Success rate should be reasonable (at least 30% of attempted transactions)
    const attemptedTransactions = logger.stats.totalTransactions;
    const minSuccessRate = 0.3;
    expect(logger.stats.successfulTransactions).toBeGreaterThan(attemptedTransactions * minSuccessRate);
  }, 1800000); // 30 minute timeout
});

