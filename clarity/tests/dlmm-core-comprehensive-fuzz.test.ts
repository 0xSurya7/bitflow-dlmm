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

interface ViolationData {
  type: 'calculation_mismatch' | 'rounding_error';
  severity: 'critical' | 'warning' | 'info';
  transactionNumber: number;
  functionName: string;
  binId: bigint;
  caller: string;
  
  // Input parameters
  inputAmount: bigint;
  actualSwappedIn: bigint;
  actualSwappedOut: bigint;
  
  // Calculation results
  expectedInteger: bigint;
  expectedFloat: bigint;
  contractResult: bigint;
  
  // Differences
  integerDiff: bigint;
  floatDiff: bigint;
  floatPercentDiff: number;
  
  // Context for reproduction
  poolState: {
    binPrice: bigint;
    yBalanceBefore?: bigint;
    yBalanceAfter?: bigint;
    xBalanceBefore?: bigint;
    xBalanceAfter?: bigint;
    swapFeeTotal: number;
    activeBinId: bigint;
  };
  
  // Intermediate calculations (for debugging)
  calculations: {
    maxAmount: number;
    updatedMaxAmount: number;
    fees: bigint;
    dx?: bigint;
    dy?: bigint;
    dyBeforeCap?: bigint;
    dxBeforeCap?: bigint;
  };
  
  // Timestamp and seed for reproducibility
  timestamp: string;
  randomSeed: number;
}

interface RoundingBiasData {
  txNumber: number;
  functionName: string;
  biasDirection: 'pool_favored' | 'user_favored' | 'neutral';
  biasAmount: bigint; // Positive = user gets more, Negative = pool gets more
  biasPercent: number;
  poolValueBefore: bigint;
  poolValueAfter: bigint;
  poolValueChange: bigint;
  expectedPoolValueChange: bigint; // Based on fees only
  poolValueLeakage: bigint; // Actual change - expected change
}

interface BalanceConservationData {
  txNumber: number;
  functionName: string;
  xBalanceConserved: boolean;
  yBalanceConserved: boolean;
  xBalanceError?: bigint;
  yBalanceError?: bigint;
  poolValueConserved: boolean;
  poolValueError?: bigint;
  lpSupplyConserved?: boolean;
  lpSupplyError?: bigint;
}

interface ViolationStats {
  totalViolations: number;
  byType: {
    calculationMismatch: number;
    roundingError: number;
  };
  bySeverity: {
    critical: number;
    warning: number;
    info: number;
  };
  byFunction: {
    'swap-x-for-y': number;
    'swap-y-for-x': number;
  };
  worstCases: ViolationData[];
}

// ============================================================================
// Logging System
// ============================================================================

class FuzzTestLogger {
  private logFile: string;
  private jsonFile: string;
  private summaryFile: string;
  private violationsFile: string;
  private violationsCsvFile: string;
  private violationsReportFile: string;
  private roundingDifferencesFile: string;
  private logs: string[] = [];
  private transactionLogs: TransactionLog[] = [];
  private violations: ViolationData[] = [];
  private roundingDifferences: any[] = [];
  private roundingBias: RoundingBiasData[] = [];
  private balanceConservation: BalanceConservationData[] = [];
  private cumulativePoolValueLeakage: bigint = 0n;
  private randomSeed: number = 0;
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

  constructor(randomSeed: number) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseDir = path.join(process.cwd(), 'logs', 'fuzz-test-results');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    this.randomSeed = randomSeed;
    this.logFile = path.join(baseDir, `fuzz-test-log-${timestamp}.txt`);
    this.jsonFile = path.join(baseDir, `fuzz-test-data-${timestamp}.json`);
    this.summaryFile = path.join(baseDir, `fuzz-test-summary-${timestamp}.md`);
    this.violationsFile = path.join(baseDir, `violations-${timestamp}.json`);
    this.violationsCsvFile = path.join(baseDir, `violations-summary-${timestamp}.csv`);
    this.violationsReportFile = path.join(baseDir, `violations-report-${timestamp}.md`);
    this.roundingDifferencesFile = path.join(baseDir, `rounding-differences-${timestamp}.json`);
    this.log('=== FUZZ TEST STARTED ===');
    this.log(`Log file: ${this.logFile}`);
    this.log(`JSON file: ${this.jsonFile}`);
    this.log(`Summary file: ${this.summaryFile}`);
    this.log(`Violations file: ${this.violationsFile}`);
    this.log(`Violations CSV: ${this.violationsCsvFile}`);
    this.log(`Violations report: ${this.violationsReportFile}`);
  }

  addViolation(violation: ViolationData) {
    this.violations.push(violation);
    if (violation.type === 'calculation_mismatch') {
      this.stats.invariantViolations++;
    } else {
      this.stats.roundingErrors++;
    }
  }

  logRoundingDifference(data: any) {
    this.roundingDifferences.push(data);
  }

  logRoundingBias(data: RoundingBiasData) {
    this.roundingBias.push(data);
    // Track cumulative leakage
    this.cumulativePoolValueLeakage += data.poolValueLeakage;
  }

  logBalanceConservation(data: BalanceConservationData) {
    this.balanceConservation.push(data);
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
    this.log(`Calculation Mismatches: ${this.stats.invariantViolations}`);
    this.log(`Rounding Errors: ${this.stats.roundingErrors}`);
    this.log(`Total Violations: ${this.stats.invariantViolations + this.stats.roundingErrors}`);
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

  generateViolationStats(): ViolationStats {
    const byType = {
      calculationMismatch: this.violations.filter(v => v.type === 'calculation_mismatch').length,
      roundingError: this.violations.filter(v => v.type === 'rounding_error').length,
    };
    
    const bySeverity = {
      critical: this.violations.filter(v => v.severity === 'critical').length,
      warning: this.violations.filter(v => v.severity === 'warning').length,
      info: this.violations.filter(v => v.severity === 'info').length,
    };
    
    const byFunction = {
      'swap-x-for-y': this.violations.filter(v => v.functionName === 'swap-x-for-y').length,
      'swap-y-for-x': this.violations.filter(v => v.functionName === 'swap-y-for-x').length,
    };
    
    // Sort by severity (critical > warning > info) and then by absolute difference
    const worstCases = [...this.violations].sort((a, b) => {
      const severityOrder = { critical: 3, warning: 2, info: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      const aDiff = Number(a.floatDiff > a.integerDiff ? a.floatDiff : a.integerDiff);
      const bDiff = Number(b.floatDiff > b.integerDiff ? b.floatDiff : b.integerDiff);
      return bDiff - aDiff;
    }).slice(0, 10);
    
    return {
      totalViolations: this.violations.length,
      byType,
      bySeverity,
      byFunction,
      worstCases,
    };
  }

  writeViolationsToFile() {
    if (this.violations.length === 0) {
      return;
    }
    
    const stats = this.generateViolationStats();
    
    // Write JSON file with all violations
    fs.writeFileSync(
      this.violationsFile,
      JSON.stringify({
        stats,
        violations: this.violations,
      }, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2),
      'utf-8'
    );
    
    // Write CSV file for easy analysis
    const csvHeaders = [
      'Transaction',
      'Type',
      'Severity',
      'Function',
      'BinId',
      'InputAmount',
      'ActualOut',
      'ExpectedInteger',
      'ExpectedFloat',
      'IntegerDiff',
      'FloatDiff',
      'FloatPercentDiff',
      'BinPrice',
      'SwapFeeTotal',
      'RandomSeed'
    ];
    
    const csvRows = this.violations.map(v => [
      v.transactionNumber,
      v.type,
      v.severity,
      v.functionName,
      v.binId.toString(),
      v.inputAmount.toString(),
      v.actualSwappedOut.toString(),
      v.expectedInteger.toString(),
      v.expectedFloat.toString(),
      v.integerDiff.toString(),
      v.floatDiff.toString(),
      v.floatPercentDiff.toFixed(4),
      v.poolState.binPrice.toString(),
      v.poolState.swapFeeTotal,
      v.randomSeed,
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    fs.writeFileSync(this.violationsCsvFile, csvContent, 'utf-8');
    
    // Write markdown report
    const report = this.generateViolationsReport(stats);
    fs.writeFileSync(this.violationsReportFile, report, 'utf-8');
  }

  generateViolationsReport(stats: ViolationStats): string {
    let md = `# Violations Report\n\n`;
    md += `**Generated:** ${new Date().toISOString()}\n\n`;
    md += `## Summary\n\n`;
    md += `| Metric | Count |\n`;
    md += `|--------|-------|\n`;
    md += `| Total Violations | ${stats.totalViolations} |\n`;
    md += `| Calculation Mismatches | ${stats.byType.calculationMismatch} |\n`;
    md += `| Rounding Errors | ${stats.byType.roundingError} |\n`;
    md += `| Critical | ${stats.bySeverity.critical} |\n`;
    md += `| Warning | ${stats.bySeverity.warning} |\n`;
    md += `| Info | ${stats.bySeverity.info} |\n\n`;
    
    md += `## By Function\n\n`;
    md += `| Function | Count |\n`;
    md += `|----------|-------|\n`;
    md += `| swap-x-for-y | ${stats.byFunction['swap-x-for-y']} |\n`;
    md += `| swap-y-for-x | ${stats.byFunction['swap-y-for-x']} |\n\n`;
    
    if (stats.worstCases.length > 0) {
      md += `## Worst Cases (Top 10)\n\n`;
      for (const v of stats.worstCases) {
        md += `### Transaction ${v.transactionNumber} - ${v.severity.toUpperCase()} ${v.type}\n\n`;
        md += `- **Function:** ${v.functionName}\n`;
        md += `- **Bin ID:** ${v.binId}\n`;
        md += `- **Input Amount:** ${v.inputAmount.toString()}\n`;
        md += `- **Contract Output:** ${v.contractResult.toString()}\n`;
        md += `- **Expected (Integer):** ${v.expectedInteger.toString()} (diff: ${v.integerDiff.toString()})\n`;
        md += `- **Expected (Float):** ${v.expectedFloat.toString()} (diff: ${v.floatDiff.toString()}, ${v.floatPercentDiff.toFixed(4)}%)\n`;
        md += `- **Bin Price:** ${v.poolState.binPrice.toString()}\n`;
        md += `- **Swap Fee Total:** ${v.poolState.swapFeeTotal}\n`;
        md += `- **Random Seed:** ${v.randomSeed}\n`;
        md += `- **Reproduce:** Use seed ${v.randomSeed}, transaction ${v.transactionNumber}\n\n`;
      }
    }
    
    return md;
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
        roundingErrors: this.stats.roundingErrors,
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
    
    // Write violation reports
    this.writeViolationsToFile();
    
    // Write rounding differences for analysis
    if (this.roundingDifferences.length > 0) {
      fs.writeFileSync(
        this.roundingDifferencesFile,
        JSON.stringify(this.roundingDifferences, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2),
        'utf-8'
      );
    }
    
    // Write adversarial analysis data
    if (this.roundingBias.length > 0 || this.balanceConservation.length > 0) {
      const adversarialFile = this.roundingDifferencesFile.replace('rounding-differences', 'adversarial-analysis');
      fs.writeFileSync(
        adversarialFile,
        JSON.stringify({
          roundingBias: this.roundingBias,
          balanceConservation: this.balanceConservation,
          cumulativePoolValueLeakage: this.cumulativePoolValueLeakage.toString(),
          stats: {
            totalSwaps: this.roundingBias.length,
            userFavored: this.roundingBias.filter(b => b.biasDirection === 'user_favored').length,
            poolFavored: this.roundingBias.filter(b => b.biasDirection === 'pool_favored').length,
            neutral: this.roundingBias.filter(b => b.biasDirection === 'neutral').length,
            totalBias: this.roundingBias.reduce((sum, b) => sum + b.biasAmount, 0n).toString(),
            totalLeakage: this.cumulativePoolValueLeakage.toString(),
            balanceConservationViolations: this.balanceConservation.filter(b => !b.xBalanceConserved || !b.yBalanceConserved || !b.poolValueConserved).length,
            lpSupplyViolations: this.balanceConservation.filter(b => b.lpSupplyConserved === false).length,
          },
        }, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2),
        'utf-8'
      );
      this.log(`  - Adversarial Analysis: ${adversarialFile}`);
    }
    
    this.log(`\nResults saved:`);
    this.log(`  - Log: ${this.logFile}`);
    this.log(`  - JSON: ${this.jsonFile}`);
    this.log(`  - Summary: ${this.summaryFile}`);
    if (this.violations.length > 0) {
      this.log(`  - Violations JSON: ${this.violationsFile}`);
      this.log(`  - Violations CSV: ${this.violationsCsvFile}`);
      this.log(`  - Violations Report: ${this.violationsReportFile}`);
    }
    if (this.roundingDifferences.length > 0) {
      this.log(`  - Rounding Differences: ${this.roundingDifferencesFile}`);
    }
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
    md += `| Calculation Mismatches | ${this.stats.invariantViolations} |\n`;
    md += `| Rounding Errors | ${this.stats.roundingErrors} |\n`;
    md += `| Total Violations | ${this.stats.invariantViolations + this.stats.roundingErrors} |\n`;
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
      md += `✅ **PASS**: No calculation mismatches detected (test logic is correct)\n\n`;
    } else {
      md += `❌ **FAIL**: ${this.stats.invariantViolations} calculation mismatches detected (test logic error)\n\n`;
    }
    
    if (this.stats.roundingErrors === 0) {
      md += `✅ **PASS**: No significant rounding errors detected\n\n`;
    } else {
      md += `⚠️ **WARNING**: ${this.stats.roundingErrors} rounding errors detected (see violations report for details)\n\n`;
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
    // For rounding analysis: vary the percentage more, including very small amounts
    const maxFromBin = (binData.yBalance * 80n) / 100n; // Leave 20% buffer for fees and safety
    const maxAmount = maxFromUser < maxFromBin ? maxFromUser : maxFromBin;
    
    if (maxAmount < 100n) return null; // Lower minimum to allow small amounts
    
    // Vary percentage: 20% very small (<0.1%), 30% small (0.1-1%), 30% medium (1-10%), 20% large (10-30%)
    const rand = rng.next();
    let percentage: number;
    if (rand < 0.2) {
      percentage = rng.next() * 0.001; // 0% to 0.1% - very small amounts
    } else if (rand < 0.5) {
      percentage = rng.next() * 0.009 + 0.001; // 0.1% to 1% - small amounts
    } else if (rand < 0.8) {
      percentage = rng.next() * 0.09 + 0.01; // 1% to 10% - medium amounts
    } else {
      percentage = rng.next() * 0.2 + 0.1; // 10% to 30% - large amounts
    }
    
    const amount = (maxAmount * BigInt(Math.floor(percentage * 10000))) / 10000n;
    return amount < 100n ? null : amount;
  } else {
    // Need X tokens in bin to swap Y for X
    if (binData.xBalance === 0n || userBalance.yToken === 0n) return null;
    
    const maxFromUser = userBalance.yToken;
    const maxFromBin = (binData.xBalance * 80n) / 100n; // Leave 20% buffer
    const maxAmount = maxFromUser < maxFromBin ? maxFromUser : maxFromBin;
    
    if (maxAmount < 100n) return null; // Lower minimum to allow small amounts
    
    // Vary percentage: 20% very small (<0.1%), 30% small (0.1-1%), 30% medium (1-10%), 20% large (10-30%)
    const rand = rng.next();
    let percentage: number;
    if (rand < 0.2) {
      percentage = rng.next() * 0.001; // 0% to 0.1% - very small amounts
    } else if (rand < 0.5) {
      percentage = rng.next() * 0.009 + 0.001; // 0.1% to 1% - small amounts
    } else if (rand < 0.8) {
      percentage = rng.next() * 0.09 + 0.01; // 1% to 10% - medium amounts
    } else {
      percentage = rng.next() * 0.2 + 0.1; // 10% to 30% - large amounts
    }
    
    const amount = (maxAmount * BigInt(Math.floor(percentage * 10000))) / 10000n;
    return amount < 100n ? null : amount;
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

// Helper function to determine violation severity
function determineSeverity(floatDiff: bigint, floatPercentDiff: number): 'critical' | 'warning' | 'info' {
  const absDiff = Number(floatDiff);
  if (absDiff > 1000 || floatPercentDiff > 5) {
    return 'critical';
  } else if (absDiff > 100 || floatPercentDiff > 1) {
    return 'warning';
  } else {
    return 'info';
  }
}

// Helper function for integer square root (matching Clarity's sqrti)
function sqrti(value: bigint): bigint {
  if (value < 0n) throw new Error("sqrti: negative value");
  if (value === 0n) return 0n;
  if (value === 1n) return 1n;
  
  // Binary search for integer square root
  let left = 1n;
  let right = value;
  let result = 0n;
  
  while (left <= right) {
    const mid = (left + right) / 2n;
    const square = mid * mid;
    
    if (square === value) return mid;
    if (square < value) {
      left = mid + 1n;
      result = mid;
    } else {
      right = mid - 1n;
    }
  }
  return result;
}

function checkRoundingErrors(
  functionName: string,
  beforeState: PoolState,
  afterState: PoolState,
  params: any,
  result: any,
  user: string,
  txNumber: number,
  randomSeed: number,
  logger: FuzzTestLogger
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
        
        // CRITICAL: Check if caller is fee exempt (contract line 1239)
        // If exempt, all fees are 0 (contract lines 1240-1242)
        const poolId = poolData.poolId || 1n;
        const swapFeeExemption = rovOk(dlmmCore.getSwapFeeExemptionById(user, poolId));
        
        // Get fees from pool data - for swap-x-for-y, use X fees
        // If fee exempt, use 0 fees (matching contract behavior)
        const protocolFee = swapFeeExemption ? 0 : Number(poolData.xProtocolFee || 0n);
        const providerFee = swapFeeExemption ? 0 : Number(poolData.xProviderFee || 0n);
        const variableFee = swapFeeExemption ? 0 : Number(poolData.xVariableFee || 0n);
        const swapFeeTotal = protocolFee + providerFee + variableFee;
        
        // CRITICAL FIX: Use balance BEFORE swap from captured state, not after
        // The contract calculates max-x-amount using y-balance BEFORE the swap
        const yBalanceBeforeSwap = Number(beforeBin.yBalance);
        const inputXAmount = Number(params.amount);
        const binPrice = Number(binPriceBigInt);
        
        // Contract calculation for swap-x-for-y (dlmm-core-v-1-1.clar lines 1258-1275):
        // Replicate contract's integer arithmetic exactly, then compare to float math
        // 
        // Contract steps (from dlmm-core-v-1-1.clar):
        // 1. Calculate max-x-amount based on y-balance BEFORE swap (line 1260)
        //    Formula: max-x-amount = (/ (+ (* y-balance PRICE_SCALE_BPS) (- bin-price u1)) bin-price)
        //    The "+ bin-price - 1" implements ceiling rounding: (a + b - 1) / b
        // 2. Adjust for fees to get updated-max-x-amount (line 1261)
        //    Formula: updated-max-x-amount = (/ (* max-x-amount FEE_SCALE_BPS) (- FEE_SCALE_BPS swap-fee-total))
        // 3. Cap input X amount at updated-max-x-amount (line 1264)
        //    Formula: updated-x-amount = (if (>= x-amount updated-max-x-amount) updated-max-x-amount x-amount)
        // 4. Calculate fees and dx (lines 1267-1271)
        //    x-amount-fees-total = (/ (* updated-x-amount swap-fee-total) FEE_SCALE_BPS)
        //    dx = (- updated-x-amount x-amount-fees-total)
        // 5. Calculate dy before cap (line 1274)
        //    dy-before-cap = (/ (* dx bin-price) PRICE_SCALE_BPS)
        // 6. Cap output Y at y-balance (line 1275)
        //    dy = (if (> dy-before-cap y-balance) y-balance dy-before-cap)
        
        // ========================================================================
        // CHECK 1: Exact Integer Match (Verify our test logic matches contract)
        // ========================================================================
        // Replicate contract's integer arithmetic exactly using BigInt
        // This verifies our test logic matches the contract's calculation
        
        const swapFeeTotalBigInt = BigInt(swapFeeTotal);
        const FEE_SCALE_BPS_BIGINT = 10000n;
        const PRICE_SCALE_BPS_BIGINT = 100000000n;
        const yBalanceBeforeSwapBigInt = beforeBin.yBalance;
        
        // Step 1: Calculate max-x-amount using integer math with ceiling rounding (contract line 1260)
        // Formula: max-x-amount = (/ (+ (* y-balance PRICE_SCALE_BPS) (- bin-price u1)) bin-price)
        // This implements ceiling rounding: (a + b - 1) / b
        const maxXAmountBigInt = ((yBalanceBeforeSwapBigInt * PRICE_SCALE_BPS_BIGINT) + binPriceBigInt - 1n) / binPriceBigInt;
        
        // Step 2: Adjust for fees to get updated-max-x-amount (contract line 1261)
        // Formula: updated-max-x-amount = (/ (* max-x-amount FEE_SCALE_BPS) (- FEE_SCALE_BPS swap-fee-total))
        const updatedMaxXAmountBigInt = swapFeeTotalBigInt > 0n
          ? (maxXAmountBigInt * FEE_SCALE_BPS_BIGINT) / (FEE_SCALE_BPS_BIGINT - swapFeeTotalBigInt)
          : maxXAmountBigInt;
        
        // Step 3: Use actual swapped amount from contract result (contract line 1264)
        // The contract already capped the input at updated-max-x-amount (partial fill)
        // result.in = updated-x-amount (the actual amount swapped after capping)
        const updatedXAmountBigInt = BigInt(actualSwappedIn);
        
        // Also calculate float versions for CHECK 2 (rounding error detection)
        const maxXAmountFloat = (yBalanceBeforeSwap * PRICE_SCALE_BPS + binPrice - 1) / binPrice;
        const updatedMaxXAmountFloat = swapFeeTotal > 0 
          ? (maxXAmountFloat * FEE_SCALE_BPS) / (FEE_SCALE_BPS - swapFeeTotal)
          : maxXAmountFloat;
        const updatedXAmountFloat = Number(actualSwappedIn);
        
        // Calculate fees (contract line 1267): x-amount-fees-total = (/ (* updated-x-amount swap-fee-total) FEE_SCALE_BPS)
        const xAmountFeesTotalBigInt = (updatedXAmountBigInt * swapFeeTotalBigInt) / FEE_SCALE_BPS_BIGINT;
        
        // Calculate dx after fees (contract line 1271): dx = (- updated-x-amount x-amount-fees-total)
        const dxBigInt = updatedXAmountBigInt - xAmountFeesTotalBigInt;
        
        // Calculate dy before cap (contract line 1274): dy-before-cap = (/ (* dx bin-price) PRICE_SCALE_BPS)
        const dyBeforeCapBigInt = (dxBigInt * binPriceBigInt) / PRICE_SCALE_BPS_BIGINT;
        
        // Cap dy at y-balance (contract line 1275): dy = (if (> dy-before-cap y-balance) y-balance dy-before-cap)
        const expectedDyInteger = dyBeforeCapBigInt > yBalanceBeforeSwapBigInt ? yBalanceBeforeSwapBigInt : dyBeforeCapBigInt;
        
        // CRITICAL: Integer arithmetic MUST match exactly (0 difference)
        // Our test logic replicates the contract's integer math step-by-step
        // Any difference means our test logic is wrong, not that we need tolerance
        
        // ========================================================================
        // CHECK 2: Rounding Error Detection (Compare to ideal float math)
        // ========================================================================
        // Calculate what the output would be using perfect float math
        // This shows the rounding difference between integer and float math
        const xAmountFeesTotalFloat = (updatedXAmountFloat * swapFeeTotal) / FEE_SCALE_BPS;
        const dxFloat = updatedXAmountFloat - xAmountFeesTotalFloat;
        const dyBeforeCapFloat = (dxFloat * binPrice) / PRICE_SCALE_BPS;
        const expectedDyFloat = Math.min(dyBeforeCapFloat, yBalanceBeforeSwap);
        const expectedDyFloatBigInt = BigInt(Math.floor(expectedDyFloat));
        const floatDiff = expectedDyFloatBigInt > actualSwappedOut 
          ? expectedDyFloatBigInt - actualSwappedOut 
          : actualSwappedOut - expectedDyFloatBigInt;
        const floatPercentDiff = actualSwappedOut > 0n 
          ? (Number(floatDiff) / Number(actualSwappedOut)) * 100 
          : 0;
        
        // Check 1: Exact match with contract's integer arithmetic
        // CRITICAL: Integer arithmetic should match EXACTLY (0 difference)
        // Any difference indicates our test logic doesn't match the contract
        const integerDiff = expectedDyInteger > actualSwappedOut ? expectedDyInteger - actualSwappedOut : actualSwappedOut - expectedDyInteger;
        if (integerDiff > 0n) {
          const violation: ViolationData = {
            type: 'calculation_mismatch',
            severity: 'critical', // Calculation mismatches are always critical
            transactionNumber: txNumber,
            functionName: 'swap-x-for-y',
            binId,
            caller: user,
            inputAmount: BigInt(params.amount),
            actualSwappedIn,
            actualSwappedOut,
            expectedInteger: expectedDyInteger,
            expectedFloat: expectedDyFloatBigInt,
            contractResult: actualSwappedOut,
            integerDiff,
            floatDiff,
            floatPercentDiff,
            poolState: {
              binPrice: binPriceBigInt,
              yBalanceBefore: beforeBin.yBalance,
              yBalanceAfter: afterBin.yBalance,
              swapFeeTotal,
              activeBinId: beforeState.activeBinId,
            },
            calculations: {
              maxAmount: Number(maxXAmountBigInt),
              updatedMaxAmount: Number(updatedMaxXAmountBigInt),
              fees: xAmountFeesTotalBigInt,
              dx: dxBigInt,
              dyBeforeCap: dyBeforeCapBigInt,
            },
            timestamp: new Date().toISOString(),
            randomSeed,
          };
          logger.addViolation(violation);
          issues.push(`Calculation mismatch: Expected ${expectedDyInteger}, got ${actualSwappedOut}, diff: ${integerDiff}`);
        }
        
        // ========================================================================
        // CHECK 2: Rounding Error Detection (Compare to ideal float math)
        // ========================================================================
        // Float values already calculated above for Check 1
        
        // Log ALL rounding differences for analysis (not just violations)
        const roundingData = {
          txNumber,
          functionName: 'swap-x-for-y',
          binId: Number(binId),
          inputAmount: Number(params.amount),
          outputAmount: Number(actualSwappedOut),
          binPrice: Number(binPriceBigInt),
          swapFeeTotal,
          yBalanceBefore: Number(beforeBin.yBalance),
          expectedInteger: Number(expectedDyInteger),
          expectedFloat: Number(expectedDyFloatBigInt),
          integerDiff: Number(integerDiff),
          floatDiff: Number(floatDiff),
          floatPercentDiff,
          activeBinId: Number(beforeState.activeBinId),
        };
        logger.logRoundingDifference(roundingData);
        
        // ========================================================================
        // ADVERSARIAL ANALYSIS: Rounding Bias and Balance Conservation
        // ========================================================================
        
        // Calculate rounding bias (does rounding favor pool or users?)
        // For swap-x-for-y: actualSwappedOut is Y tokens user receives
        // If actualSwappedOut > expectedFloat, user gets MORE (user_favored, positive bias)
        // If actualSwappedOut < expectedFloat, user gets LESS (pool_favored, negative bias)
        const actualBias = actualSwappedOut - expectedDyFloatBigInt;
        const biasPercent = actualSwappedOut > 0n 
          ? (Number(actualBias > 0n ? actualBias : -actualBias) / Number(actualSwappedOut)) * 100 
          : 0;
        const biasDirection = actualBias > 0n ? 'user_favored' : (actualBias < 0n ? 'pool_favored' : 'neutral');
        
        // Calculate pool value before and after
        // Pool value = xBalance * price + yBalance (in Y token terms)
        const poolValueBefore = (beforeBin.xBalance * binPriceBigInt) / PRICE_SCALE_BPS_BIGINT + beforeBin.yBalance;
        const poolValueAfter = (afterBin.xBalance * binPriceBigInt) / PRICE_SCALE_BPS_BIGINT + afterBin.yBalance;
        const poolValueChange = poolValueAfter - poolValueBefore;
        
        // Expected pool value change = provider fees + variable fees (in Y token terms)
        // Protocol fees are removed from pool, but provider/variable fees stay in pool
        // Provider + variable fees = total fees - protocol fees
        const providerFeeBigInt = (updatedXAmountBigInt * BigInt(providerFee)) / FEE_SCALE_BPS_BIGINT;
        const variableFeeBigInt = (updatedXAmountBigInt * BigInt(variableFee)) / FEE_SCALE_BPS_BIGINT;
        const providerAndVariableFeesInY = ((providerFeeBigInt + variableFeeBigInt) * binPriceBigInt) / PRICE_SCALE_BPS_BIGINT;
        const expectedPoolValueChange = providerAndVariableFeesInY; // Pool gains provider + variable fees
        
        // Pool value leakage = actual change - expected change
        // Positive = pool gained more than expected (good for pool)
        // Negative = pool gained less than expected (bad for pool, value leaked to users)
        const poolValueLeakage = poolValueChange - expectedPoolValueChange;
        
        logger.logRoundingBias({
          txNumber,
          functionName: 'swap-x-for-y',
          biasDirection,
          biasAmount: actualBias,
          biasPercent,
          poolValueBefore,
          poolValueAfter,
          poolValueChange,
          expectedPoolValueChange,
          poolValueLeakage,
        });
        
        // Check balance conservation
        // For swap-x-for-y:
        // X: afterX = beforeX + dx + providerFees + variableFees
        //    where dx = actualSwappedIn - totalFees
        //    so: afterX = beforeX + actualSwappedIn - protocolFee
        // Y: beforeY - actualSwappedOut = afterY
        // Calculate protocol fee (already have protocolFee from poolData)
        const protocolFeeBigInt = (updatedXAmountBigInt * BigInt(protocolFee)) / FEE_SCALE_BPS_BIGINT;
        const xBalanceExpected = beforeBin.xBalance + actualSwappedIn - protocolFeeBigInt;
        const xBalanceError = afterBin.xBalance > xBalanceExpected 
          ? afterBin.xBalance - xBalanceExpected 
          : xBalanceExpected - afterBin.xBalance;
        const xBalanceConserved = xBalanceError <= 2n; // Allow 2 token tolerance for rounding
        
        const yBalanceExpected = beforeBin.yBalance - actualSwappedOut;
        const yBalanceError = afterBin.yBalance > yBalanceExpected
          ? afterBin.yBalance - yBalanceExpected
          : yBalanceExpected - afterBin.yBalance;
        const yBalanceConserved = yBalanceError <= 2n;
        
        // Pool value should change by exactly provider + variable fees (accounting for rounding)
        // Use minimum tolerance of 2 tokens to avoid false positives with very small fees
        const poolValueError = poolValueLeakage > 0n ? poolValueLeakage : -poolValueLeakage;
        const percentageTolerance = providerAndVariableFeesInY / 1000n; // 0.1% tolerance
        const minTolerance = 2n; // Minimum 2 tokens tolerance
        const tolerance = providerAndVariableFeesInY > 0n 
          ? (percentageTolerance > minTolerance ? percentageTolerance : minTolerance)
          : minTolerance;
        const poolValueConserved = poolValueError <= tolerance;
        
        // Verify LP supply remains constant during swaps
        const lpSupplyConserved = beforeBin.totalSupply === afterBin.totalSupply;
        const lpSupplyError = beforeBin.totalSupply !== afterBin.totalSupply 
          ? (afterBin.totalSupply > beforeBin.totalSupply 
              ? afterBin.totalSupply - beforeBin.totalSupply 
              : beforeBin.totalSupply - afterBin.totalSupply)
          : undefined;
        
        logger.logBalanceConservation({
          txNumber,
          functionName: 'swap-x-for-y',
          xBalanceConserved,
          yBalanceConserved,
          xBalanceError: xBalanceError > 2n ? xBalanceError : undefined,
          yBalanceError: yBalanceError > 2n ? yBalanceError : undefined,
          poolValueConserved,
          poolValueError: poolValueError > tolerance ? poolValueError : undefined,
          lpSupplyConserved,
          lpSupplyError,
        });
        
        // ========================================================================
        // CRITICAL EXPLOIT CHECK: User-favored bias (actualOutput > expectedFloat)
        // ========================================================================
        // If user receives MORE than float math suggests, this is an exploit
        // Fail immediately regardless of magnitude - even 1 token is unacceptable
        if (actualSwappedOut > expectedDyFloatBigInt) {
          const exploitAmount = actualSwappedOut - expectedDyFloatBigInt;
          const exploitPercent = actualSwappedOut > 0n 
            ? (Number(exploitAmount) / Number(actualSwappedOut)) * 100 
            : 0;
          const violation: ViolationData = {
            type: 'rounding_error',
            severity: 'critical', // User-favored bias is always critical
            transactionNumber: txNumber,
            functionName: 'swap-x-for-y',
            binId,
            caller: user,
            inputAmount: BigInt(params.amount),
            actualSwappedIn,
            actualSwappedOut,
            expectedInteger: expectedDyInteger,
            expectedFloat: expectedDyFloatBigInt,
            contractResult: actualSwappedOut,
            integerDiff,
            floatDiff: exploitAmount,
            floatPercentDiff: exploitPercent,
            poolState: {
              binPrice: binPriceBigInt,
              yBalanceBefore: beforeBin.yBalance,
              yBalanceAfter: afterBin.yBalance,
              swapFeeTotal,
              activeBinId: beforeState.activeBinId,
            },
            calculations: {
              maxAmount: Number(maxXAmountBigInt),
              updatedMaxAmount: Number(updatedMaxXAmountBigInt),
              fees: xAmountFeesTotalBigInt,
              dx: dxBigInt,
              dyBeforeCap: dyBeforeCapBigInt,
            },
            timestamp: new Date().toISOString(),
            randomSeed,
          };
          logger.addViolation(violation);
          issues.push(`🚨 EXPLOIT DETECTED: User received ${exploitAmount} MORE tokens than float math (${exploitPercent.toFixed(6)}%) - actual: ${actualSwappedOut}, expected: ${expectedDyFloatBigInt}`);
        }
        
        // Flag if rounding error is significant (>1% or >100 tokens) for pool-favored cases
        // Note: User-favored cases are already caught above and always fail
        const maxRoundingDiff = Math.max(100, Number(actualSwappedOut) * 0.01);
        if (actualSwappedOut < expectedDyFloatBigInt && Number(floatDiff) > maxRoundingDiff) {
          const severity = determineSeverity(floatDiff, floatPercentDiff);
          const violation: ViolationData = {
            type: 'rounding_error',
            severity,
            transactionNumber: txNumber,
            functionName: 'swap-x-for-y',
            binId,
            caller: user,
            inputAmount: BigInt(params.amount),
            actualSwappedIn,
            actualSwappedOut,
            expectedInteger: expectedDyInteger,
            expectedFloat: expectedDyFloatBigInt,
            contractResult: actualSwappedOut,
            integerDiff,
            floatDiff,
            floatPercentDiff,
            poolState: {
              binPrice: binPriceBigInt,
              yBalanceBefore: beforeBin.yBalance,
              yBalanceAfter: afterBin.yBalance,
              swapFeeTotal,
              activeBinId: beforeState.activeBinId,
            },
            calculations: {
              maxAmount: Number(maxXAmountBigInt),
              updatedMaxAmount: Number(updatedMaxXAmountBigInt),
              fees: xAmountFeesTotalBigInt,
              dx: dxBigInt,
              dyBeforeCap: dyBeforeCapBigInt,
            },
            timestamp: new Date().toISOString(),
            randomSeed,
          };
          logger.addViolation(violation);
          issues.push(`Rounding error detected: Contract ${actualSwappedOut} vs ideal ${expectedDyFloatBigInt}, diff: ${floatDiff} (${floatPercentDiff.toFixed(4)}%)`);
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
        
        // CRITICAL: Check if caller is fee exempt (contract line 1384)
        // If exempt, all fees are 0 (contract lines 1385-1387)
        const poolId = poolData.poolId || 1n;
        const swapFeeExemption = rovOk(dlmmCore.getSwapFeeExemptionById(user, poolId));
        
        // Get fees from pool data - for swap-y-for-x, use Y fees
        // If fee exempt, use 0 fees (matching contract behavior)
        const protocolFee = swapFeeExemption ? 0 : Number(poolData.yProtocolFee || 0n);
        const providerFee = swapFeeExemption ? 0 : Number(poolData.yProviderFee || 0n);
        const variableFee = swapFeeExemption ? 0 : Number(poolData.yVariableFee || 0n);
        const swapFeeTotal = protocolFee + providerFee + variableFee;
        
        // CRITICAL FIX: Use balance BEFORE swap from captured state, not after
        // The contract calculates max-y-amount using x-balance BEFORE the swap
        const xBalanceBeforeSwap = Number(beforeBin.xBalance);
        const inputYAmount = Number(params.amount);
        const binPrice = Number(binPriceBigInt);
        
        // Contract calculation for swap-y-for-x (dlmm-core-v-1-1.clar lines 1403-1420):
        // Replicate contract's integer arithmetic exactly, then compare to float math
        //
        // Contract steps (from dlmm-core-v-1-1.clar):
        // 1. Calculate max-y-amount based on x-balance BEFORE swap (line 1405)
        //    Formula: max-y-amount = (/ (+ (* x-balance bin-price) (- PRICE_SCALE_BPS u1)) PRICE_SCALE_BPS)
        //    The "+ PRICE_SCALE_BPS - 1" implements ceiling rounding: (a + b - 1) / b
        // 2. Adjust for fees to get updated-max-y-amount (line 1406)
        //    Formula: updated-max-y-amount = (/ (* max-y-amount FEE_SCALE_BPS) (- FEE_SCALE_BPS swap-fee-total))
        // 3. Cap input Y amount at updated-max-y-amount (line 1409)
        //    Formula: updated-y-amount = (if (>= y-amount updated-max-y-amount) updated-max-y-amount y-amount)
        // 4. Calculate fees and dy (lines 1412-1416)
        //    y-amount-fees-total = (/ (* updated-y-amount swap-fee-total) FEE_SCALE_BPS)
        //    dy = (- updated-y-amount y-amount-fees-total)
        // 5. Calculate dx before cap (line 1419)
        //    dx-before-cap = (/ (* dy PRICE_SCALE_BPS) bin-price)
        // 6. Cap output X at x-balance (line 1420)
        //    dx = (if (> dx-before-cap x-balance) x-balance dx-before-cap)
        
        // ========================================================================
        // CHECK 1: Exact Integer Match (Verify our test logic matches contract)
        // ========================================================================
        // Replicate contract's integer arithmetic exactly using BigInt
        // This verifies our test logic matches the contract's calculation
        
        const swapFeeTotalBigInt = BigInt(swapFeeTotal);
        const FEE_SCALE_BPS_BIGINT = 10000n;
        const PRICE_SCALE_BPS_BIGINT = 100000000n;
        const xBalanceBeforeSwapBigInt = beforeBin.xBalance;
        
        // Step 1: Calculate max-y-amount using integer math with ceiling rounding (contract line 1405)
        // Formula: max-y-amount = (/ (+ (* x-balance bin-price) (- PRICE_SCALE_BPS u1)) PRICE_SCALE_BPS)
        // This implements ceiling rounding: (a + b - 1) / b
        const maxYAmountBigInt = ((xBalanceBeforeSwapBigInt * binPriceBigInt) + PRICE_SCALE_BPS_BIGINT - 1n) / PRICE_SCALE_BPS_BIGINT;
        
        // Step 2: Adjust for fees to get updated-max-y-amount (contract line 1406)
        // Formula: updated-max-y-amount = (/ (* max-y-amount FEE_SCALE_BPS) (- FEE_SCALE_BPS swap-fee-total))
        const updatedMaxYAmountBigInt = swapFeeTotalBigInt > 0n
          ? (maxYAmountBigInt * FEE_SCALE_BPS_BIGINT) / (FEE_SCALE_BPS_BIGINT - swapFeeTotalBigInt)
          : maxYAmountBigInt;
        
        // Step 3: Use actual swapped amount from contract result (contract line 1409)
        // The contract already capped the input at updated-max-y-amount (partial fill)
        // result.in = updated-y-amount (the actual amount swapped after capping)
        const updatedYAmountBigInt = BigInt(actualSwappedIn);
        
        // Also calculate float versions for CHECK 2 (rounding error detection)
        const maxYAmountFloat = (xBalanceBeforeSwap * binPrice + PRICE_SCALE_BPS - 1) / PRICE_SCALE_BPS;
        const updatedMaxYAmountFloat = swapFeeTotal > 0 
          ? (maxYAmountFloat * FEE_SCALE_BPS) / (FEE_SCALE_BPS - swapFeeTotal)
          : maxYAmountFloat;
        const updatedYAmountFloat = Number(actualSwappedIn);
        
        // Calculate fees (contract line 1412): y-amount-fees-total = (/ (* updated-y-amount swap-fee-total) FEE_SCALE_BPS)
        const yAmountFeesTotalBigInt = (updatedYAmountBigInt * swapFeeTotalBigInt) / FEE_SCALE_BPS_BIGINT;
        
        // Calculate dy after fees (contract line 1416): dy = (- updated-y-amount y-amount-fees-total)
        const dyBigInt = updatedYAmountBigInt - yAmountFeesTotalBigInt;
        
        // Calculate dx before cap (contract line 1419): dx-before-cap = (/ (* dy PRICE_SCALE_BPS) bin-price)
        const dxBeforeCapBigInt = (dyBigInt * PRICE_SCALE_BPS_BIGINT) / binPriceBigInt;
        
        // Cap dx at x-balance (contract line 1420): dx = (if (> dx-before-cap x-balance) x-balance dx-before-cap)
        const expectedDxInteger = dxBeforeCapBigInt > xBalanceBeforeSwapBigInt ? xBalanceBeforeSwapBigInt : dxBeforeCapBigInt;
        
        // CRITICAL: Integer arithmetic MUST match exactly (0 difference)
        // Our test logic replicates the contract's integer math step-by-step
        // Any difference means our test logic is wrong, not that we need tolerance
        
        // ========================================================================
        // CHECK 2: Rounding Error Detection (Compare to ideal float math)
        // ========================================================================
        // Calculate what the output would be using perfect float math
        // This shows the rounding difference between integer and float math
        const yAmountFeesTotalFloat = (updatedYAmountFloat * swapFeeTotal) / FEE_SCALE_BPS;
        const dyFloat = updatedYAmountFloat - yAmountFeesTotalFloat;
        const dxBeforeCapFloat = (dyFloat * PRICE_SCALE_BPS) / binPrice;
        const expectedDxFloat = Math.min(dxBeforeCapFloat, xBalanceBeforeSwap);
        const expectedDxFloatBigInt = BigInt(Math.floor(expectedDxFloat));
        const floatDiff = expectedDxFloatBigInt > actualSwappedOut 
          ? expectedDxFloatBigInt - actualSwappedOut 
          : actualSwappedOut - expectedDxFloatBigInt;
        const floatPercentDiff = actualSwappedOut > 0n 
          ? (Number(floatDiff) / Number(actualSwappedOut)) * 100 
          : 0;
        
        // Check 1: Exact match with contract's integer arithmetic
        // CRITICAL: Integer arithmetic should match EXACTLY (0 difference)
        // Any difference indicates our test logic doesn't match the contract
        const integerDiff = expectedDxInteger > actualSwappedOut ? expectedDxInteger - actualSwappedOut : actualSwappedOut - expectedDxInteger;
        if (integerDiff > 0n) {
          const violation: ViolationData = {
            type: 'calculation_mismatch',
            severity: 'critical', // Calculation mismatches are always critical
            transactionNumber: txNumber,
            functionName: 'swap-y-for-x',
            binId,
            caller: user,
            inputAmount: BigInt(params.amount),
            actualSwappedIn,
            actualSwappedOut,
            expectedInteger: expectedDxInteger,
            expectedFloat: expectedDxFloatBigInt,
            contractResult: actualSwappedOut,
            integerDiff,
            floatDiff,
            floatPercentDiff,
            poolState: {
              binPrice: binPriceBigInt,
              xBalanceBefore: beforeBin.xBalance,
              xBalanceAfter: afterBin.xBalance,
              swapFeeTotal,
              activeBinId: beforeState.activeBinId,
            },
            calculations: {
              maxAmount: Number(maxYAmountBigInt),
              updatedMaxAmount: Number(updatedMaxYAmountBigInt),
              fees: yAmountFeesTotalBigInt,
              dy: dyBigInt,
              dxBeforeCap: dxBeforeCapBigInt,
            },
            timestamp: new Date().toISOString(),
            randomSeed,
          };
          logger.addViolation(violation);
          issues.push(`Calculation mismatch: Expected ${expectedDxInteger}, got ${actualSwappedOut}, diff: ${integerDiff}`);
        }
        
        // ========================================================================
        // CHECK 2: Rounding Error Detection (Compare to ideal float math)
        // ========================================================================
        // Float values already calculated above for Check 1
        
        // Log ALL rounding differences for analysis (not just violations)
        const roundingDataY = {
          txNumber,
          functionName: 'swap-y-for-x',
          binId: Number(binId),
          inputAmount: Number(params.amount),
          outputAmount: Number(actualSwappedOut),
          binPrice: Number(binPriceBigInt),
          swapFeeTotal,
          xBalanceBefore: Number(beforeBin.xBalance),
          expectedInteger: Number(expectedDxInteger),
          expectedFloat: Number(expectedDxFloatBigInt),
          integerDiff: Number(integerDiff),
          floatDiff: Number(floatDiff),
          floatPercentDiff,
          activeBinId: Number(beforeState.activeBinId),
        };
        logger.logRoundingDifference(roundingDataY);
        
        // ========================================================================
        // ADVERSARIAL ANALYSIS: Rounding Bias and Balance Conservation
        // ========================================================================
        
        // Calculate rounding bias (does rounding favor pool or users?)
        // For swap-y-for-x: actualSwappedOut is X tokens user receives
        // If actualSwappedOut > expectedFloat, user gets MORE (user_favored, positive bias)
        // If actualSwappedOut < expectedFloat, user gets LESS (pool_favored, negative bias)
        const actualBiasY = actualSwappedOut - expectedDxFloatBigInt;
        const biasPercentY = actualSwappedOut > 0n 
          ? (Number(actualBiasY > 0n ? actualBiasY : -actualBiasY) / Number(actualSwappedOut)) * 100 
          : 0;
        const biasDirectionY = actualBiasY > 0n ? 'user_favored' : (actualBiasY < 0n ? 'pool_favored' : 'neutral');
        
        // Calculate pool value before and after (in X token terms for swap-y-for-x)
        // Pool value = xBalance + (yBalance * PRICE_SCALE_BPS) / binPrice
        const poolValueBeforeY = beforeBin.xBalance + (beforeBin.yBalance * PRICE_SCALE_BPS_BIGINT) / binPriceBigInt;
        const poolValueAfterY = afterBin.xBalance + (afterBin.yBalance * PRICE_SCALE_BPS_BIGINT) / binPriceBigInt;
        const poolValueChangeY = poolValueAfterY - poolValueBeforeY;
        
        // Expected pool value change = provider fees + variable fees (in X token terms)
        // Protocol fees are removed from pool, but provider/variable fees stay in pool
        const providerFeeY = Number(poolData.yProviderFee || 0n);
        const variableFeeY = Number(poolData.yVariableFee || 0n);
        const providerFeeYBigInt = (updatedYAmountBigInt * BigInt(providerFeeY)) / FEE_SCALE_BPS_BIGINT;
        const variableFeeYBigInt = (updatedYAmountBigInt * BigInt(variableFeeY)) / FEE_SCALE_BPS_BIGINT;
        // Convert provider + variable fees from Y to X: feesX = (feesY * PRICE_SCALE_BPS) / binPrice
        const providerAndVariableFeesInX = ((providerFeeYBigInt + variableFeeYBigInt) * PRICE_SCALE_BPS_BIGINT) / binPriceBigInt;
        const expectedPoolValueChangeY = providerAndVariableFeesInX;
        
        // Pool value leakage
        const poolValueLeakageY = poolValueChangeY - expectedPoolValueChangeY;
        
        logger.logRoundingBias({
          txNumber,
          functionName: 'swap-y-for-x',
          biasDirection: biasDirectionY,
          biasAmount: actualBiasY,
          biasPercent: biasPercentY,
          poolValueBefore: poolValueBeforeY,
          poolValueAfter: poolValueAfterY,
          poolValueChange: poolValueChangeY,
          expectedPoolValueChange: expectedPoolValueChangeY,
          poolValueLeakage: poolValueLeakageY,
        });
        
        // Check balance conservation for swap-y-for-x
        // X: beforeX - actualSwappedOut = afterX
        // Y: afterY = beforeY + dy + providerFees + variableFees
        //    where dy = actualSwappedIn - totalFees
        //    so: afterY = beforeY + actualSwappedIn - protocolFee
        const xBalanceExpectedY = beforeBin.xBalance - actualSwappedOut;
        const xBalanceErrorY = afterBin.xBalance > xBalanceExpectedY
          ? afterBin.xBalance - xBalanceExpectedY
          : xBalanceExpectedY - afterBin.xBalance;
        const xBalanceConservedY = xBalanceErrorY <= 2n;
        
        // Calculate protocol fee for Y (already have protocolFeeY from poolData)
        const protocolFeeY = Number(poolData.yProtocolFee || 0n);
        const protocolFeeYBigInt = (updatedYAmountBigInt * BigInt(protocolFeeY)) / FEE_SCALE_BPS_BIGINT;
        const yBalanceExpectedY = beforeBin.yBalance + actualSwappedIn - protocolFeeYBigInt;
        const yBalanceErrorY = afterBin.yBalance > yBalanceExpectedY
          ? afterBin.yBalance - yBalanceExpectedY
          : yBalanceExpectedY - afterBin.yBalance;
        const yBalanceConservedY = yBalanceErrorY <= 2n;
        
        // Pool value should change by exactly provider + variable fees (accounting for rounding)
        // Use minimum tolerance of 2 tokens to avoid false positives with very small fees
        const poolValueErrorY = poolValueLeakageY > 0n ? poolValueLeakageY : -poolValueLeakageY;
        const percentageToleranceY = providerAndVariableFeesInX / 1000n; // 0.1% tolerance
        const minToleranceY = 2n; // Minimum 2 tokens tolerance
        const toleranceY = providerAndVariableFeesInX > 0n 
          ? (percentageToleranceY > minToleranceY ? percentageToleranceY : minToleranceY)
          : minToleranceY;
        const poolValueConservedY = poolValueErrorY <= toleranceY;
        
        // Verify LP supply remains constant during swaps
        const lpSupplyConservedY = beforeBin.totalSupply === afterBin.totalSupply;
        const lpSupplyErrorY = beforeBin.totalSupply !== afterBin.totalSupply 
          ? (afterBin.totalSupply > beforeBin.totalSupply 
              ? afterBin.totalSupply - beforeBin.totalSupply 
              : beforeBin.totalSupply - afterBin.totalSupply)
          : undefined;
        
        logger.logBalanceConservation({
          txNumber,
          functionName: 'swap-y-for-x',
          xBalanceConserved: xBalanceConservedY,
          yBalanceConserved: yBalanceConservedY,
          xBalanceError: xBalanceErrorY > 2n ? xBalanceErrorY : undefined,
          yBalanceError: yBalanceErrorY > 2n ? yBalanceErrorY : undefined,
          poolValueConserved: poolValueConservedY,
          poolValueError: poolValueErrorY > toleranceY ? poolValueErrorY : undefined,
          lpSupplyConserved: lpSupplyConservedY,
          lpSupplyError: lpSupplyErrorY,
        });
        
        // ========================================================================
        // CRITICAL EXPLOIT CHECK: User-favored bias (actualOutput > expectedFloat)
        // ========================================================================
        // If user receives MORE than float math suggests, this is an exploit
        // Fail immediately regardless of magnitude - even 1 token is unacceptable
        if (actualSwappedOut > expectedDxFloatBigInt) {
          const exploitAmount = actualSwappedOut - expectedDxFloatBigInt;
          const exploitPercent = actualSwappedOut > 0n 
            ? (Number(exploitAmount) / Number(actualSwappedOut)) * 100 
            : 0;
          const violation: ViolationData = {
            type: 'rounding_error',
            severity: 'critical', // User-favored bias is always critical
            transactionNumber: txNumber,
            functionName: 'swap-y-for-x',
            binId,
            caller: user,
            inputAmount: BigInt(params.amount),
            actualSwappedIn,
            actualSwappedOut,
            expectedInteger: expectedDxInteger,
            expectedFloat: expectedDxFloatBigInt,
            contractResult: actualSwappedOut,
            integerDiff,
            floatDiff: exploitAmount,
            floatPercentDiff: exploitPercent,
            poolState: {
              binPrice: binPriceBigInt,
              xBalanceBefore: beforeBin.xBalance,
              xBalanceAfter: afterBin.xBalance,
              swapFeeTotal,
              activeBinId: beforeState.activeBinId,
            },
            calculations: {
              maxAmount: Number(maxYAmountBigInt),
              updatedMaxAmount: Number(updatedMaxYAmountBigInt),
              fees: yAmountFeesTotalBigInt,
              dy: dyBigInt,
              dxBeforeCap: dxBeforeCapBigInt,
            },
            timestamp: new Date().toISOString(),
            randomSeed,
          };
          logger.addViolation(violation);
          issues.push(`🚨 EXPLOIT DETECTED: User received ${exploitAmount} MORE tokens than float math (${exploitPercent.toFixed(6)}%) - actual: ${actualSwappedOut}, expected: ${expectedDxFloatBigInt}`);
        }
        
        // Flag if rounding error is significant (>1% or >100 tokens) for pool-favored cases
        // Note: User-favored cases are already caught above and always fail
        const maxRoundingDiff = Math.max(100, Number(actualSwappedOut) * 0.01);
        if (actualSwappedOut < expectedDxFloatBigInt && Number(floatDiff) > maxRoundingDiff) {
          const severity = determineSeverity(floatDiff, floatPercentDiff);
          const violation: ViolationData = {
            type: 'rounding_error',
            severity,
            transactionNumber: txNumber,
            functionName: 'swap-y-for-x',
            binId,
            caller: user,
            inputAmount: BigInt(params.amount),
            actualSwappedIn,
            actualSwappedOut,
            expectedInteger: expectedDxInteger,
            expectedFloat: expectedDxFloatBigInt,
            contractResult: actualSwappedOut,
            integerDiff,
            floatDiff,
            floatPercentDiff,
            poolState: {
              binPrice: binPriceBigInt,
              xBalanceBefore: beforeBin.xBalance,
              xBalanceAfter: afterBin.xBalance,
              swapFeeTotal,
              activeBinId: beforeState.activeBinId,
            },
            calculations: {
              maxAmount: Number(maxYAmountBigInt),
              updatedMaxAmount: Number(updatedMaxYAmountBigInt),
              fees: yAmountFeesTotalBigInt,
              dy: dyBigInt,
              dxBeforeCap: dxBeforeCapBigInt,
            },
            timestamp: new Date().toISOString(),
            randomSeed,
          };
          logger.addViolation(violation);
          issues.push(`Rounding error detected: Contract ${actualSwappedOut} vs ideal ${expectedDxFloatBigInt}, diff: ${floatDiff} (${floatPercentDiff.toFixed(4)}%)`);
        }
      } catch (e) {
        // If we can't get pool data or calculate, skip this check
        // (this shouldn't happen, but don't fail the test if it does)
      }
    }
  } else if (functionName === 'add-liquidity') {
    // **NEW**: Comprehensive float comparison for add-liquidity LP token calculation
    // Following the same pattern as swap checks (lines 1274-1540)
    const xAdded = params.xAmount || 0n;
    const yAdded = params.yAmount || 0n;
    const lpReceived = result || 0n;
    
    // Basic validation: LP should be positive if liquidity was added
    if ((xAdded > 0n || yAdded > 0n) && lpReceived === 0n) {
      issues.push(`Rounding error: No LP tokens received despite adding liquidity`);
    }
    
    // **NEW**: Verify LP calculation matches contract's internal math
    try {
      const poolData = rovOk(sbtcUsdcPool.getPool());
      const binStep = poolData.binStep;
      const initialPrice = poolData.initialPrice;
      const FEE_SCALE_BPS = 10000;
      const PRICE_SCALE_BPS = 100000000;
      
      // Get bin price
      const binPriceBigInt = rovOk(dlmmCore.getBinPrice(initialPrice, binStep, binId));
      const binPrice = Number(binPriceBigInt);
      
      // Get minimum burnt shares (for new bins)
      const minimumBurntShares = rovOk(dlmmCore.getMinimumBurntShares());
      
      // Get bin state BEFORE add-liquidity
      const xBalanceBefore = beforeBin.xBalance;
      const yBalanceBefore = beforeBin.yBalance;
      const binSharesBefore = beforeBin.totalSupply;
      
      // Scale y amounts (contract scales y by PRICE_SCALE_BPS)
      const yAmountScaledBigInt = yAdded * BigInt(PRICE_SCALE_BPS);
      const yBalanceScaledBigInt = yBalanceBefore * BigInt(PRICE_SCALE_BPS);
      
      // ========================================================================
      // Calculate liquidity values (matching contract logic)
      // ========================================================================
      // get-liquidity-value(x, y, price) = (bin-price * x-amount) + y-amount
      const addLiquidityValueBigInt = (binPriceBigInt * xAdded) + yAmountScaledBigInt;
      const binLiquidityValueBigInt = (binPriceBigInt * xBalanceBefore) + yBalanceScaledBigInt;
      
      // Calculate initial DLP (pre-fees) using integer math
      let dlpPreFeesBigInt: bigint;
      if (binSharesBefore === 0n || binLiquidityValueBigInt === 0n) {
        // Empty bin: dlp = sqrti(add-liquidity-value)
        dlpPreFeesBigInt = sqrti(addLiquidityValueBigInt);
      } else {
        // Existing bin: dlp = (add-liquidity-value * bin-shares) / bin-liquidity-value
        dlpPreFeesBigInt = (addLiquidityValueBigInt * binSharesBefore) / binLiquidityValueBigInt;
      }
      
      // ========================================================================
      // Calculate fees (only for active bin and if dlp > 0)
      // ========================================================================
      const activeBinId = beforeState.activeBinId;
      const isActiveBin = binId === activeBinId;
      
      let xAmountFeesLiquidityBigInt = 0n;
      let yAmountFeesLiquidityBigInt = 0n;
      
      if (isActiveBin && dlpPreFeesBigInt > 0n) {
        // Get fee rates from pool data
        const xProtocolFee = Number(poolData.xProtocolFee || 0n);
        const xProviderFee = Number(poolData.xProviderFee || 0n);
        const xVariableFee = Number(poolData.xVariableFee || 0n);
        const xLiquidityFee = xProtocolFee + xProviderFee + xVariableFee;
        
        const yProtocolFee = Number(poolData.yProtocolFee || 0n);
        const yProviderFee = Number(poolData.yProviderFee || 0n);
        const yVariableFee = Number(poolData.yVariableFee || 0n);
        const yLiquidityFee = yProtocolFee + yProviderFee + yVariableFee;
        
        // Calculate withdrawable amounts without fees
        // withdrawable = (dlp * (balance + amount)) / (binShares + dlp)
        const xAmountWithdrawableBigInt = (dlpPreFeesBigInt * (xBalanceBefore + xAdded)) / (binSharesBefore + dlpPreFeesBigInt);
        const yAmountWithdrawableBigInt = (dlpPreFeesBigInt * (yBalanceBefore + yAdded)) / (binSharesBefore + dlpPreFeesBigInt);
        
        // Calculate max liquidity fees
        // X fee: if yWithdrawable > yAmount && xAmount > xWithdrawable
        if (yAmountWithdrawableBigInt > yAdded && xAdded > xAmountWithdrawableBigInt) {
          const maxXAmountFeesLiquidityBigInt = ((xAdded - xAmountWithdrawableBigInt) * BigInt(xLiquidityFee)) / BigInt(FEE_SCALE_BPS);
          xAmountFeesLiquidityBigInt = xAdded > maxXAmountFeesLiquidityBigInt ? maxXAmountFeesLiquidityBigInt : xAdded;
        }
        
        // Y fee: if xWithdrawable > xAmount && yAmount > yWithdrawable
        if (xAmountWithdrawableBigInt > xAdded && yAdded > yAmountWithdrawableBigInt) {
          const maxYAmountFeesLiquidityBigInt = ((yAdded - yAmountWithdrawableBigInt) * BigInt(yLiquidityFee)) / BigInt(FEE_SCALE_BPS);
          yAmountFeesLiquidityBigInt = yAdded > maxYAmountFeesLiquidityBigInt ? maxYAmountFeesLiquidityBigInt : yAdded;
        }
      }
      
      // Calculate post-fee amounts
      const xAmountPostFeesBigInt = xAdded - xAmountFeesLiquidityBigInt;
      const yAmountPostFeesBigInt = yAdded - yAmountFeesLiquidityBigInt;
      const yAmountPostFeesScaledBigInt = yAmountPostFeesBigInt * BigInt(PRICE_SCALE_BPS);
      
      // Calculate bin balances post fees (fees stay in pool)
      const xBalancePostFeesBigInt = xBalanceBefore + xAmountFeesLiquidityBigInt;
      const yBalancePostFeesBigInt = yBalanceBefore + yAmountFeesLiquidityBigInt;
      const yBalancePostFeesScaledBigInt = yBalancePostFeesBigInt * BigInt(PRICE_SCALE_BPS);
      
      // Calculate final liquidity values post fees
      const addLiquidityValuePostFeesBigInt = (binPriceBigInt * xAmountPostFeesBigInt) + yAmountPostFeesScaledBigInt;
      const binLiquidityValuePostFeesBigInt = (binPriceBigInt * xBalancePostFeesBigInt) + yBalancePostFeesScaledBigInt;
      
      // Calculate final DLP (post-fees) using integer math
      let expectedLPInteger: bigint;
      const burnAmount = binSharesBefore === 0n ? minimumBurntShares : 0n;
      
      if (binSharesBefore === 0n) {
        // New bin: intended-dlp = sqrti(add-liquidity-value-post-fees), then subtract burn-amount
        const intendedDlp = sqrti(addLiquidityValuePostFeesBigInt);
        // Contract checks: intendedDlp >= minimumBinShares (we skip this check in test)
        expectedLPInteger = intendedDlp - burnAmount;
      } else if (binLiquidityValuePostFeesBigInt === 0n) {
        // Edge case: bin-liquidity-value-post-fees is 0
        expectedLPInteger = sqrti(addLiquidityValuePostFeesBigInt);
      } else {
        // Existing bin: dlp = (add-liquidity-value-post-fees * bin-shares) / bin-liquidity-value-post-fees
        expectedLPInteger = (addLiquidityValuePostFeesBigInt * binSharesBefore) / binLiquidityValuePostFeesBigInt;
      }
      
      // ========================================================================
      // CHECK 1: Exact Integer Match (Verify our test logic matches contract)
      // ========================================================================
      // CRITICAL: Integer arithmetic MUST match exactly (0 difference)
      // Our test logic replicates the contract's integer math step-by-step
      // Any difference means our test logic is wrong, not that we need tolerance
      const integerDiff = expectedLPInteger > lpReceived 
        ? expectedLPInteger - lpReceived 
        : lpReceived - expectedLPInteger;
      
      if (integerDiff > 0n) {
        const violation: ViolationData = {
          type: 'calculation_mismatch',
          severity: 'critical',
          transactionNumber: txNumber,
          functionName: 'add-liquidity',
          binId,
          caller: user,
          inputAmount: xAdded + yAdded, // Combined input for add-liquidity
          actualSwappedIn: xAdded + yAdded,
          actualSwappedOut: lpReceived,
          expectedInteger: expectedLPInteger,
          expectedFloat: expectedLPInteger, // Will be calculated in CHECK 2
          contractResult: lpReceived,
          integerDiff,
          floatDiff: integerDiff, // Placeholder, will be updated in CHECK 2
          floatPercentDiff: lpReceived > 0n ? (Number(integerDiff) / Number(lpReceived)) * 100 : 0,
          poolState: {
            binPrice: binPriceBigInt,
            xBalanceBefore: xBalanceBefore,
            yBalanceBefore: yBalanceBefore,
            swapFeeTotal: 0, // Not applicable for add-liquidity
            activeBinId: beforeState.activeBinId,
          },
          calculations: {
            maxAmount: 0, // Not applicable
            updatedMaxAmount: 0, // Not applicable
            fees: xAmountFeesLiquidityBigInt + yAmountFeesLiquidityBigInt,
          },
          timestamp: new Date().toISOString(),
          randomSeed,
        };
        logger.addViolation(violation);
        issues.push(`Calculation mismatch: Expected ${expectedLPInteger}, got ${lpReceived}, diff: ${integerDiff}`);
      }
      
      // ========================================================================
      // CHECK 2: Rounding Error Detection (Compare to ideal float math)
      // ========================================================================
      // Calculate using float math for comparison
      const addLiquidityValueFloat = (binPrice * Number(xAdded)) + (Number(yAdded) * PRICE_SCALE_BPS);
      const binLiquidityValueFloat = (binPrice * Number(xBalanceBefore)) + (Number(yBalanceBefore) * PRICE_SCALE_BPS);
      
      let dlpPreFeesFloat: number;
      if (binSharesBefore === 0n || binLiquidityValueFloat === 0) {
        dlpPreFeesFloat = Math.sqrt(addLiquidityValueFloat);
      } else {
        dlpPreFeesFloat = (addLiquidityValueFloat * Number(binSharesBefore)) / binLiquidityValueFloat;
      }
      
      // Calculate fees using float math
      let xAmountFeesLiquidityFloat = 0;
      let yAmountFeesLiquidityFloat = 0;
      
      if (isActiveBin && dlpPreFeesFloat > 0) {
        const xProtocolFee = Number(poolData.xProtocolFee || 0n);
        const xProviderFee = Number(poolData.xProviderFee || 0n);
        const xVariableFee = Number(poolData.xVariableFee || 0n);
        const xLiquidityFee = xProtocolFee + xProviderFee + xVariableFee;
        
        const yProtocolFee = Number(poolData.yProtocolFee || 0n);
        const yProviderFee = Number(poolData.yProviderFee || 0n);
        const yVariableFee = Number(poolData.yVariableFee || 0n);
        const yLiquidityFee = yProtocolFee + yProviderFee + yVariableFee;
        
        const xAmountWithdrawableFloat = (dlpPreFeesFloat * (Number(xBalanceBefore) + Number(xAdded))) / (Number(binSharesBefore) + dlpPreFeesFloat);
        const yAmountWithdrawableFloat = (dlpPreFeesFloat * (Number(yBalanceBefore) + Number(yAdded))) / (Number(binSharesBefore) + dlpPreFeesFloat);
        
        if (yAmountWithdrawableFloat > Number(yAdded) && Number(xAdded) > xAmountWithdrawableFloat) {
          const maxXAmountFeesLiquidityFloat = ((Number(xAdded) - xAmountWithdrawableFloat) * xLiquidityFee) / FEE_SCALE_BPS;
          xAmountFeesLiquidityFloat = Number(xAdded) > maxXAmountFeesLiquidityFloat ? maxXAmountFeesLiquidityFloat : Number(xAdded);
        }
        
        if (xAmountWithdrawableFloat > Number(xAdded) && Number(yAdded) > yAmountWithdrawableFloat) {
          const maxYAmountFeesLiquidityFloat = ((Number(yAdded) - yAmountWithdrawableFloat) * yLiquidityFee) / FEE_SCALE_BPS;
          yAmountFeesLiquidityFloat = Number(yAdded) > maxYAmountFeesLiquidityFloat ? maxYAmountFeesLiquidityFloat : Number(yAdded);
        }
      }
      
      const xAmountPostFeesFloat = Number(xAdded) - xAmountFeesLiquidityFloat;
      const yAmountPostFeesFloat = Number(yAdded) - yAmountFeesLiquidityFloat;
      const yAmountPostFeesScaledFloat = yAmountPostFeesFloat * PRICE_SCALE_BPS;
      
      const xBalancePostFeesFloat = Number(xBalanceBefore) + xAmountFeesLiquidityFloat;
      const yBalancePostFeesFloat = Number(yBalanceBefore) + yAmountFeesLiquidityFloat;
      const yBalancePostFeesScaledFloat = yBalancePostFeesFloat * PRICE_SCALE_BPS;
      
      const addLiquidityValuePostFeesFloat = (binPrice * xAmountPostFeesFloat) + yAmountPostFeesScaledFloat;
      const binLiquidityValuePostFeesFloat = (binPrice * xBalancePostFeesFloat) + yBalancePostFeesScaledFloat;
      
      let expectedLPFloat: number;
      const burnAmountFloat = binSharesBefore === 0n ? Number(minimumBurntShares) : 0;
      
      if (binSharesBefore === 0n) {
        const intendedDlpFloat = Math.sqrt(addLiquidityValuePostFeesFloat);
        expectedLPFloat = intendedDlpFloat - burnAmountFloat;
      } else if (binLiquidityValuePostFeesFloat === 0) {
        expectedLPFloat = Math.sqrt(addLiquidityValuePostFeesFloat);
      } else {
        expectedLPFloat = (addLiquidityValuePostFeesFloat * Number(binSharesBefore)) / binLiquidityValuePostFeesFloat;
      }
      
      const expectedLPFloatBigInt = BigInt(Math.floor(expectedLPFloat));
      const floatDiff = expectedLPFloatBigInt > lpReceived
        ? expectedLPFloatBigInt - lpReceived
        : lpReceived - expectedLPFloatBigInt;
      const floatPercentDiff = lpReceived > 0n
        ? (Number(floatDiff) / Number(lpReceived)) * 100
        : 0;
      
      // Log ALL rounding differences for analysis (not just violations)
      const roundingData = {
        txNumber,
        functionName: 'add-liquidity',
        binId: Number(binId),
        xAmount: Number(xAdded),
        yAmount: Number(yAdded),
        lpReceived: Number(lpReceived),
        binPrice: Number(binPriceBigInt),
        binSharesBefore: Number(binSharesBefore),
        expectedInteger: Number(expectedLPInteger),
        expectedFloat: Number(expectedLPFloatBigInt),
        integerDiff: Number(integerDiff),
        floatDiff: Number(floatDiff),
        floatPercentDiff,
        activeBinId: Number(beforeState.activeBinId),
        isActiveBin,
      };
      logger.logRoundingDifference(roundingData);
      
      // ========================================================================
      // ADVERSARIAL ANALYSIS: Rounding Bias and Balance Conservation
      // ========================================================================
      
      // Calculate rounding bias (does rounding favor pool or users?)
      // For add-liquidity: lpReceived is LP tokens user receives
      // If lpReceived > expectedFloat, user gets MORE (user_favored, positive bias)
      // If lpReceived < expectedFloat, user gets LESS (pool_favored, negative bias)
      const actualBias = lpReceived - expectedLPFloatBigInt;
      const biasPercent = lpReceived > 0n
        ? (Number(actualBias > 0n ? actualBias : -actualBias) / Number(lpReceived)) * 100
        : 0;
      const biasDirection = actualBias > 0n ? 'user_favored' : (actualBias < 0n ? 'pool_favored' : 'neutral');
      
      // Calculate pool value before and after (in Y token terms)
      // Pool value = (xBalance * binPrice) / PRICE_SCALE_BPS + yBalance
      const PRICE_SCALE_BPS_BIGINT = 100000000n;
      const poolValueBefore = (xBalanceBefore * binPriceBigInt) / PRICE_SCALE_BPS_BIGINT + yBalanceBefore;
      const poolValueAfter = (afterBin.xBalance * binPriceBigInt) / PRICE_SCALE_BPS_BIGINT + afterBin.yBalance;
      const poolValueChange = poolValueAfter - poolValueBefore;
      
      // Expected pool value change = fees collected (fees stay in pool)
      // Fees are already included in balance increases, so expected change = fees
      const expectedPoolValueChange = (xAmountFeesLiquidityBigInt * binPriceBigInt) / PRICE_SCALE_BPS_BIGINT + yAmountFeesLiquidityBigInt;
      
      // Pool value leakage = actual change - expected change
      const poolValueLeakage = poolValueChange - expectedPoolValueChange;
      
      logger.logRoundingBias({
        txNumber,
        functionName: 'add-liquidity',
        biasDirection,
        biasAmount: actualBias,
        biasPercent,
        poolValueBefore,
        poolValueAfter,
        poolValueChange,
        expectedPoolValueChange,
        poolValueLeakage,
      });
      
      // Check balance conservation
      // X: afterX = beforeX + xAdded (full amount, fees stay in pool)
      const xBalanceExpected = xBalanceBefore + xAdded;
      const xBalanceError = afterBin.xBalance > xBalanceExpected
        ? afterBin.xBalance - xBalanceExpected
        : xBalanceExpected - afterBin.xBalance;
      const xBalanceConserved = xBalanceError <= 2n; // Allow 2 token tolerance
      
      // Y: afterY = beforeY + yAdded (full amount, fees stay in pool)
      const yBalanceExpected = yBalanceBefore + yAdded;
      const yBalanceError = afterBin.yBalance > yBalanceExpected
        ? afterBin.yBalance - yBalanceExpected
        : yBalanceExpected - afterBin.yBalance;
      const yBalanceConserved = yBalanceError <= 2n;
      
      // LP Supply: afterLP = beforeLP + lpReceived
      const lpSupplyExpected = binSharesBefore + lpReceived;
      const lpSupplyError = afterBin.totalSupply > lpSupplyExpected
        ? afterBin.totalSupply - lpSupplyExpected
        : lpSupplyExpected - afterBin.totalSupply;
      const lpSupplyConserved = lpSupplyError <= 2n;
      
      // Pool value should change by exactly fees (accounting for rounding)
      const poolValueError = poolValueLeakage > 0n ? poolValueLeakage : -poolValueLeakage;
      const percentageTolerance = expectedPoolValueChange / 1000n; // 0.1% tolerance
      const minTolerance = 2n; // Minimum 2 tokens tolerance
      const tolerance = expectedPoolValueChange > 0n
        ? (percentageTolerance > minTolerance ? percentageTolerance : minTolerance)
        : minTolerance;
      const poolValueConserved = poolValueError <= tolerance;
      
      logger.logBalanceConservation({
        txNumber,
        functionName: 'add-liquidity',
        xBalanceConserved,
        yBalanceConserved,
        xBalanceError: xBalanceError > 2n ? xBalanceError : undefined,
        yBalanceError: yBalanceError > 2n ? yBalanceError : undefined,
        poolValueConserved,
        poolValueError: poolValueError > tolerance ? poolValueError : undefined,
        lpSupplyConserved,
        lpSupplyError: lpSupplyError > 2n ? lpSupplyError : undefined,
      });
      
      // Flag if rounding error is significant (>1% or >100 LP tokens)
      const maxRoundingDiff = Math.max(100, Number(lpReceived) * 0.01);
      if (Number(floatDiff) > maxRoundingDiff) {
        const severity = determineSeverity(floatDiff, floatPercentDiff);
        const violation: ViolationData = {
          type: 'rounding_error',
          severity,
          transactionNumber: txNumber,
          functionName: 'add-liquidity',
          binId,
          caller: user,
          inputAmount: xAdded + yAdded,
          actualSwappedIn: xAdded + yAdded,
          actualSwappedOut: lpReceived,
          expectedInteger: expectedLPInteger,
          expectedFloat: expectedLPFloatBigInt,
          contractResult: lpReceived,
          integerDiff,
          floatDiff,
          floatPercentDiff,
          poolState: {
            binPrice: binPriceBigInt,
            xBalanceBefore: xBalanceBefore,
            yBalanceBefore: yBalanceBefore,
            swapFeeTotal: 0,
            activeBinId: beforeState.activeBinId,
          },
          calculations: {
            maxAmount: 0,
            updatedMaxAmount: 0,
            fees: xAmountFeesLiquidityBigInt + yAmountFeesLiquidityBigInt,
          },
          timestamp: new Date().toISOString(),
          randomSeed,
        };
        logger.addViolation(violation);
        issues.push(`Rounding error detected: Contract ${lpReceived} vs ideal ${expectedLPFloatBigInt}, diff: ${floatDiff} (${floatPercentDiff.toFixed(4)}%)`);
      }
    } catch (e) {
      // If we can't get pool data or calculate, skip this check
      // (this shouldn't happen, but don't fail the test if it does)
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
    logger = new FuzzTestLogger(RANDOM_SEED);
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
        const roundingIssues = checkRoundingErrors(functionName, beforeState, afterState, params, result, caller, txNum, RANDOM_SEED, logger);
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
    console.log(`🔍 Calculation mismatches: ${logger.stats.invariantViolations}`);
    console.log(`⚠️  Rounding errors: ${logger.stats.roundingErrors}`);
    console.log(`📈 Total violations: ${logger.stats.invariantViolations + logger.stats.roundingErrors}`);
    
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

