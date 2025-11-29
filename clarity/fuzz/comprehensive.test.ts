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
} from "../tests/helpers/helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import { cvToValue } from '@clarigen/core';
import { txOk, rovOk } from '@clarigen/test';
import * as fs from 'fs';
import * as path from 'path';
import { getFuzzConfig } from './harnesses/config';
import {
  checkSwapXForYInvariants,
  checkSwapYForXInvariants,
  checkAddLiquidityInvariants as checkAddLiquidityInvariantsCore,
  checkWithdrawLiquidityInvariants as checkWithdrawLiquidityInvariantsCore,
  checkMoveLiquidityInvariants as checkMoveLiquidityInvariantsCore,
  BinState,
  UserState,
} from "./properties/invariants";

type OperationType = 'swap-x-for-y' | 'swap-y-for-x' | 'add-liquidity' | 'withdraw-liquidity' | 'move-liquidity';

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
  result: 'success' | 'failure';
  error?: string;
  invariantChecks?: string[];
}

class TestConfig {
  // Bin range for sampling
  static readonly MIN_BIN_SAMPLE = -10;
  static readonly MAX_BIN_SAMPLE = 10;
  static readonly MIN_BIN_ID = -500n;
  static readonly MAX_BIN_ID = 500n;
  
  // Liquidity parameters
  static readonly MAX_LIQUIDITY_FEE = 1000000n;
  static readonly MIN_DLP = 1n;
  
  // Amount generation
  static readonly MIN_SWAP_AMOUNT = 100n;
  static readonly MIN_LIQUIDITY_AMOUNT = 1000n;
  
  // Random Generation Probabilities
  static readonly PROB_SWAP_VERY_SMALL = 0.2; // <0.1%
  static readonly PROB_SWAP_SMALL = 0.3;      // 0.1-1%
  static readonly PROB_SWAP_MEDIUM = 0.3;     // 1-10%
  static readonly PROB_SWAP_LARGE = 0.2;      // 10-30%
  
  // Error Handling
  static readonly MAX_CONSECUTIVE_FAILURES = 100;
  
  // Progress Reporting
  static readonly PROGRESS_BAR_WIDTH = 40;
  static readonly PROGRESS_UPDATE_INTERVAL = 10;
}

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

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
  
  nextBoolean(): boolean {
    return this.next() > 0.5;
  }
}

class PoolStateManager {
  static async captureState(): Promise<PoolState> {
    const activeBinId = rovOk(sbtcUsdcPool.getActiveBinId());
    const binBalances = new Map<bigint, { xBalance: bigint; yBalance: bigint; totalSupply: bigint }>();
    const userBalances = new Map<string, { xToken: bigint; yToken: bigint; lpTokens: Map<bigint, bigint> }>();
    const users = [deployer, alice, bob, charlie];

    // Get protocol fees
    const poolId = 1n;
    const fees = rovOk(dlmmCore.getUnclaimedProtocolFeesById(poolId));
    const protocolFees = fees ? { xFee: fees.xFee, yFee: fees.yFee } : { xFee: 0n, yFee: 0n };

    // Sample bins around active bin
    for (let offset = TestConfig.MIN_BIN_SAMPLE; offset <= TestConfig.MAX_BIN_SAMPLE; offset++) {
      const binId = activeBinId + BigInt(offset);
      if (binId >= TestConfig.MIN_BIN_ID && binId <= TestConfig.MAX_BIN_ID) {
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
          binBalances.set(binId, { xBalance: 0n, yBalance: 0n, totalSupply: 0n });
        }
      }
    }

    // Get user balances
    for (const user of users) {
      const xToken = rovOk(mockSbtcToken.getBalance(user));
      const yToken = rovOk(mockUsdcToken.getBalance(user));
      const lpTokens = new Map<bigint, bigint>();

      for (const binId of binBalances.keys()) {
        try {
          const lpBalance = getSbtcUsdcPoolLpBalance(binId, user);
          if (lpBalance > 0n) {
            lpTokens.set(binId, lpBalance);
          }
        } catch { }
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
}

class AmountGenerator {
  constructor(private rng: SeededRandom) {}

  generateSwapAmount(poolState: PoolState, binId: bigint, direction: 'x-for-y' | 'y-for-x', user: string): bigint | null {
    const binData = poolState.binBalances.get(binId);
    if (!binData) return null;

    const userBalance = poolState.userBalances.get(user);
    if (!userBalance) return null;

    if (direction === 'x-for-y') {
      if (binData.yBalance === 0n || userBalance.xToken === 0n) return null;
      
      const maxFromUser = userBalance.xToken;
      const maxFromBin = (binData.yBalance * 80n) / 100n; // 80% buffer
      const maxAmount = maxFromUser < maxFromBin ? maxFromUser : maxFromBin;
      
      if (maxAmount < TestConfig.MIN_SWAP_AMOUNT) return null;
      
      return this.randomizeAmount(maxAmount);
    } else {
      if (binData.xBalance === 0n || userBalance.yToken === 0n) return null;
      
      const maxFromUser = userBalance.yToken;
      const maxFromBin = (binData.xBalance * 80n) / 100n;
      const maxAmount = maxFromUser < maxFromBin ? maxFromUser : maxFromBin;
      
      if (maxAmount < TestConfig.MIN_SWAP_AMOUNT) return null;
      
      return this.randomizeAmount(maxAmount);
    }
  }

  generateAddLiquidityAmount(poolState: PoolState, binId: bigint, user: string): { xAmount: bigint; yAmount: bigint } | null {
    const userBalance = poolState.userBalances.get(user);
    if (!userBalance) return null;

    const activeBinId = poolState.activeBinId;
    let xAmount = 0n;
    let yAmount = 0n;

    if (binId < activeBinId) {
      if (userBalance.yToken === 0n) return null;
      yAmount = this.randomizeAmount(userBalance.yToken, 0.5);
      if (yAmount < TestConfig.MIN_LIQUIDITY_AMOUNT) return null;
    } else if (binId === activeBinId) {
      if (userBalance.xToken === 0n || userBalance.yToken === 0n) return null;
      xAmount = this.randomizeAmount(userBalance.xToken, 0.5);
      yAmount = this.randomizeAmount(userBalance.yToken, 0.5);
      if (xAmount < TestConfig.MIN_LIQUIDITY_AMOUNT || yAmount < TestConfig.MIN_LIQUIDITY_AMOUNT) return null;
    } else {
      if (userBalance.xToken === 0n) return null;
      xAmount = this.randomizeAmount(userBalance.xToken, 0.5);
      if (xAmount < TestConfig.MIN_LIQUIDITY_AMOUNT) return null;
    }

    return { xAmount, yAmount };
  }

  generateWithdrawAmount(poolState: PoolState, binId: bigint, user: string): bigint | null {
    const userBalance = poolState.userBalances.get(user);
    if (!userBalance) return null;

    const lpBalance = userBalance.lpTokens.get(binId) || 0n;
    if (lpBalance === 0n) return null;

    const percentage = this.rng.next() * 0.7 + 0.2; // 20-90%
    const amount = (lpBalance * BigInt(Math.floor(percentage * 100))) / 100n;
    
    const minAmount = lpBalance > 5000n ? 1000n : (lpBalance * 20n / 100n);
    if (amount < minAmount) {
      return lpBalance >= minAmount ? minAmount : null;
    }
    return amount;
  }

  generateMoveAmount(poolState: PoolState, sourceBinId: bigint, user: string): bigint | null {
    const userBalance = poolState.userBalances.get(user);
    if (!userBalance) return null;

    const lpBalance = userBalance.lpTokens.get(sourceBinId) || 0n;
    if (lpBalance === 0n) return null;

    const percentage = this.rng.next() * 0.8 + 0.1; // 10-90%
    const amount = (lpBalance * BigInt(Math.floor(percentage * 100))) / 100n;
    
    if (amount < 1n) return null;
    return amount;
  }

  private randomizeAmount(maxAmount: bigint, maxPercent: number = 1.0): bigint {
    const rand = this.rng.next();
    let percentage: number;
    
    if (rand < TestConfig.PROB_SWAP_VERY_SMALL) {
      percentage = this.rng.next() * 0.001;
    } else if (rand < TestConfig.PROB_SWAP_VERY_SMALL + TestConfig.PROB_SWAP_SMALL) {
      percentage = this.rng.next() * 0.009 + 0.001;
    } else if (rand < TestConfig.PROB_SWAP_VERY_SMALL + TestConfig.PROB_SWAP_SMALL + TestConfig.PROB_SWAP_MEDIUM) {
      percentage = this.rng.next() * 0.09 + 0.01;
    } else {
      percentage = this.rng.next() * (maxPercent - 0.1) + 0.1;
    }
    
    return (maxAmount * BigInt(Math.floor(percentage * 10000))) / 10000n;
  }
}

class InvariantChecker {
  static checkInvariants(
    functionName: string,
    beforeState: PoolState,
    afterState: PoolState,
    params: any,
    result: any,
    user: string
  ): string[] {
    const issues: string[] = [];
    const binId = params.binId !== undefined ? params.binId : params.sourceBinId;
    
    // Helper to construct state objects
    const getBinState = (state: PoolState, id: bigint): BinState | null => {
      const bin = state.binBalances.get(id);
      return bin ? { binId: id, xBalance: bin.xBalance, yBalance: bin.yBalance, totalSupply: bin.totalSupply } : null;
    };

    const getUserState = (state: PoolState, u: string, id: bigint): UserState | null => {
      const userBal = state.userBalances.get(u);
      return userBal ? { 
        xTokenBalance: userBal.xToken, 
        yTokenBalance: userBal.yToken, 
        lpTokenBalance: userBal.lpTokens.get(id) || 0n 
      } : null;
    };

    const beforeBin = getBinState(beforeState, binId);
    const afterBin = getBinState(afterState, binId);
    const beforeUser = getUserState(beforeState, user, binId);
    const afterUser = getUserState(afterState, user, binId);

    if (!beforeBin || !afterBin || !beforeUser || !afterUser) {
      issues.push(`State data missing for bin ${binId} or user ${user}`);
      return issues;
    }

    if (functionName === 'swap-x-for-y') {
      const check = checkSwapXForYInvariants(
        beforeBin, afterBin, beforeUser, afterUser,
        beforeState.protocolFees, afterState.protocolFees,
        params.amount, result
      );
      issues.push(...check.errors);
    } else if (functionName === 'swap-y-for-x') {
      const check = checkSwapYForXInvariants(
        beforeBin, afterBin, beforeUser, afterUser,
        beforeState.protocolFees, afterState.protocolFees,
        params.amount, result
      );
      issues.push(...check.errors);
    } else if (functionName === 'add-liquidity') {
      const check = checkAddLiquidityInvariantsCore(
        beforeBin, afterBin, beforeUser, afterUser,
        params.xAmount, params.yAmount, result, params.minDlp || 1n
      );
      issues.push(...check.errors);
    } else if (functionName === 'withdraw-liquidity') {
      const check = checkWithdrawLiquidityInvariantsCore(
        beforeBin, afterBin, beforeUser, afterUser,
        params.amount, result.xAmount || 0n, result.yAmount || 0n,
        params.minXAmount || 0n, params.minYAmount || 0n
      );
      issues.push(...check.errors);
    } else if (functionName === 'move-liquidity') {
      const destBinId = params.destBinId;
      const beforeDestBin = getBinState(beforeState, destBinId);
      const afterDestBin = getBinState(afterState, destBinId);
      const beforeUserDest = getUserState(beforeState, user, destBinId);
      const afterUserDest = getUserState(afterState, user, destBinId);

      if (beforeDestBin && afterDestBin && beforeUserDest && afterUserDest) {
        const check = checkMoveLiquidityInvariantsCore(
          beforeBin, afterBin, beforeDestBin, afterDestBin,
          beforeUser, afterUser, beforeUserDest, afterUserDest,
          params.amount, result, params.minDlp || 1n
        );
        issues.push(...check.errors);
      }
    }

    // Global invariants
    if (afterState.activeBinId < TestConfig.MIN_BIN_ID || afterState.activeBinId > TestConfig.MAX_BIN_ID) {
      issues.push(`Active bin out of range: ${afterState.activeBinId}`);
    }

    return issues;
  }
}

class FuzzLogger {
  private logs: string[] = [];
  private logFile: string;
  public stats = {
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    invariantViolations: 0,
  };

  constructor(seed: number) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseDir = path.join(process.cwd(), 'logs', 'fuzz-test-results');
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
    this.logFile = path.join(baseDir, `fuzz-test-log-${timestamp}-${seed}.txt`);
  }

  log(message: string) {
    const line = `[${new Date().toISOString()}] ${message}`;
    this.logs.push(line);
    console.log(line);
  }

  logTransaction(log: TransactionLog) {
    this.stats.totalTransactions++;
    if (log.result === 'success') this.stats.successfulTransactions++;
    else this.stats.failedTransactions++;
    
    if (log.invariantChecks && log.invariantChecks.length > 0) {
      this.stats.invariantViolations += log.invariantChecks.length;
      this.log(`INVARIANT VIOLATION in tx ${log.txNumber}: ${log.invariantChecks.join(', ')}`);
    }
  }

  save() {
    fs.writeFileSync(this.logFile, this.logs.join('\n'), 'utf-8');
    this.log(`Log saved to: ${this.logFile}`);
  }
}

class TestOrchestrator {
  private logger: FuzzLogger;
  private rng: SeededRandom;
  private amountGen: AmountGenerator;
  private users = [deployer, alice, bob, charlie];
  private functions: OperationType[] = ['swap-x-for-y', 'swap-y-for-x', 'add-liquidity', 'withdraw-liquidity', 'move-liquidity'];

  constructor(seed: number) {
    this.logger = new FuzzLogger(seed);
    this.rng = new SeededRandom(seed);
    this.amountGen = new AmountGenerator(this.rng);
  }

  async run(totalTransactions: number) {
    this.logger.log(`Starting fuzz test with ${totalTransactions} transactions...`);
    let consecutiveFailures = 0;

    for (let i = 1; i <= totalTransactions; i++) {
      if ((i % TestConfig.PROGRESS_UPDATE_INTERVAL === 0) || i === 1) {
        this.reportProgress(i, totalTransactions);
      }

      let beforeState: PoolState;
      try {
        beforeState = await PoolStateManager.captureState();
      } catch (e) {
        continue;
      }

      const functionName = this.rng.choice(this.functions);
      const caller = this.rng.choice(this.users);
      const txResult = await this.executeTransaction(functionName, caller, beforeState);

      if (txResult.result === 'failure') {
        consecutiveFailures++;
        if (consecutiveFailures >= TestConfig.MAX_CONSECUTIVE_FAILURES) {
          this.regenerateState(beforeState);
          consecutiveFailures = 0;
        }
      } else {
        consecutiveFailures = 0;
      }

      this.logger.logTransaction({ ...txResult, txNumber: i });
    }

    this.logger.save();
    this.printSummary(totalTransactions);
  }

  private async executeTransaction(functionName: OperationType, caller: string, beforeState: PoolState): Promise<Omit<TransactionLog, 'txNumber'>> {
    let params: any = {};
    let result: any;
    let success = false;
    let error: string | undefined;
    let invariantIssues: string[] = [];

    try {
      if (functionName.startsWith('swap')) {
        // Swap implementation
        const activeBinId = beforeState.activeBinId;
        const direction = functionName === 'swap-x-for-y' ? 'x-for-y' : 'y-for-x';
        const amount = this.amountGen.generateSwapAmount(beforeState, activeBinId, direction, caller);
        
        if (!amount) throw new Error("Could not generate valid swap amount");
        
        params = { binId: activeBinId, amount, caller };
        const response = direction === 'x-for-y'
          ? txOk(dlmmCore.swapXForY(sbtcUsdcPool.identifier, mockSbtcToken.identifier, mockUsdcToken.identifier, activeBinId, amount), caller)
          : txOk(dlmmCore.swapYForX(sbtcUsdcPool.identifier, mockSbtcToken.identifier, mockUsdcToken.identifier, activeBinId, amount), caller);
        
        result = cvToValue(response.result);
        if (typeof result === 'bigint' || typeof result === 'number') result = { in: BigInt(result), out: 0n };
        success = true;

      } else if (functionName === 'add-liquidity') {
        // Add Liquidity implementation
        const binOffset = this.rng.nextInt(TestConfig.MIN_BIN_SAMPLE, TestConfig.MAX_BIN_SAMPLE);
        const binId = beforeState.activeBinId + BigInt(binOffset);
        const clampedBinId = binId < TestConfig.MIN_BIN_ID ? TestConfig.MIN_BIN_ID : (binId > TestConfig.MAX_BIN_ID ? TestConfig.MAX_BIN_ID : binId);
        
        const amounts = this.amountGen.generateAddLiquidityAmount(beforeState, clampedBinId, caller);
        if (!amounts) throw new Error("Could not generate liquidity amounts");

        params = { binId: clampedBinId, ...amounts, caller };
        const response = txOk(dlmmCore.addLiquidity(
          sbtcUsdcPool.identifier, mockSbtcToken.identifier, mockUsdcToken.identifier, clampedBinId,
          amounts.xAmount, amounts.yAmount, TestConfig.MIN_DLP,
          TestConfig.MAX_LIQUIDITY_FEE, TestConfig.MAX_LIQUIDITY_FEE
        ), caller);
        
        result = cvToValue(response.result);
        success = true;

      } else if (functionName === 'withdraw-liquidity') {
        // Withdraw Liquidity implementation
        const userBal = beforeState.userBalances.get(caller);
        if (!userBal || userBal.lpTokens.size === 0) throw new Error("User has no LP tokens");
        
        const binId = this.rng.choice(Array.from(userBal.lpTokens.keys()));
        const amount = this.amountGen.generateWithdrawAmount(beforeState, binId, caller);
        if (!amount) throw new Error("Could not generate withdraw amount");

        params = { binId, amount, caller };
        const response = txOk(dlmmCore.withdrawLiquidity(
          sbtcUsdcPool.identifier, mockSbtcToken.identifier, mockUsdcToken.identifier, binId,
          amount, 0n, 0n
        ), caller);
        
        result = cvToValue(response.result);
        success = true;

      } else if (functionName === 'move-liquidity') {
        // Move Liquidity implementation
        const userBal = beforeState.userBalances.get(caller);
        if (!userBal || userBal.lpTokens.size === 0) throw new Error("User has no LP tokens");
        
        const sourceBinId = this.rng.choice(Array.from(userBal.lpTokens.keys()));
        const amount = this.amountGen.generateMoveAmount(beforeState, sourceBinId, caller);
        if (!amount) throw new Error("Could not generate move amount");

        // Find compatible destination bin
        let destBinId = sourceBinId;
        const sourceBin = beforeState.binBalances.get(sourceBinId);
        const hasX = sourceBin && sourceBin.xBalance > 0n;
        const hasY = sourceBin && sourceBin.yBalance > 0n;
        
        let attempts = 0;
        do {
          const offset = this.rng.nextInt(-5, 5);
          const candidate = beforeState.activeBinId + BigInt(offset);
          
          // Compatibility check based on active bin pricing
          if (candidate === beforeState.activeBinId) {
            destBinId = candidate; // Active bin accepts both
          } else if (candidate > beforeState.activeBinId && hasX && !hasY) {
            destBinId = candidate; // Higher bins needs X
          } else if (candidate < beforeState.activeBinId && hasY && !hasX) {
            destBinId = candidate; // Lower bins needs Y
          }
          attempts++;
        } while(destBinId === sourceBinId && attempts < 10);

        if (destBinId === sourceBinId) throw new Error("Could not find valid destination bin");

        params = { sourceBinId, destBinId, amount, caller };
        const response = txOk(dlmmCore.moveLiquidity(
          sbtcUsdcPool.identifier, mockSbtcToken.identifier, mockUsdcToken.identifier,
          sourceBinId, destBinId, amount, TestConfig.MIN_DLP,
          TestConfig.MAX_LIQUIDITY_FEE, TestConfig.MAX_LIQUIDITY_FEE
        ), caller);
        
        result = cvToValue(response.result);
        success = true;
      }

      // Capture after state and check invariants
      if (success) {
        const afterState = await PoolStateManager.captureState();
        invariantIssues = InvariantChecker.checkInvariants(functionName, beforeState, afterState, params, result, caller);
      }

    } catch (e: any) {
      success = false;
      error = e.message || String(e);
    }

    return { functionName, caller, params, result: success ? 'success' : 'failure', error, invariantChecks: invariantIssues };
  }

  private reportProgress(current: number, total: number) {
    const percent = ((current / total) * 100).toFixed(1);
    const filled = Math.floor((current / total) * TestConfig.PROGRESS_BAR_WIDTH);
    const bar = '█'.repeat(filled) + '░'.repeat(TestConfig.PROGRESS_BAR_WIDTH - filled);
    
    try {
      process.stdout.write(`\r📊 [${bar}] ${percent}% (${current}/${total}) | ✅ ${this.logger.stats.successfulTransactions} | ❌ ${this.logger.stats.failedTransactions}`);
    } catch(e) {} // Ignore TTY errors
  }

  private regenerateState(state: PoolState) {
    // Add liquidity to random bins to fix stuck state
    try {
      for (let i = 0; i < 5; i++) {
        const binId = state.activeBinId + BigInt(this.rng.nextInt(-5, 5));
        const amounts = this.amountGen.generateAddLiquidityAmount(state, binId, deployer);
        if (amounts) {
          txOk(dlmmCore.addLiquidity(
            sbtcUsdcPool.identifier, mockSbtcToken.identifier, mockUsdcToken.identifier, binId,
            amounts.xAmount, amounts.yAmount, 1n, TestConfig.MAX_LIQUIDITY_FEE, TestConfig.MAX_LIQUIDITY_FEE
          ), deployer);
        }
      }
    } catch {}
  }

  private printSummary(total: number) {
    console.log(`\n\n=== TEST COMPLETE ===`);
    console.log(`Total Transactions: ${this.logger.stats.totalTransactions}`);
    console.log(`Successful: ${this.logger.stats.successfulTransactions}`);
    console.log(`Invariant Violations: ${this.logger.stats.invariantViolations}`);
    
    expect(this.logger.stats.invariantViolations).toBe(0);
  }
}

describe('DLMM Core Comprehensive Fuzz Test', () => {
  const config = getFuzzConfig();
  const NUM_TRANSACTIONS = config.size;
  const RANDOM_SEED = config.seed;

  beforeEach(async () => {
    setupTestEnvironment();
    // Mint tokens
    txOk(mockSbtcToken.mint(10000000000n, alice), deployer);
    txOk(mockUsdcToken.mint(1000000000000n, alice), deployer);
    txOk(mockSbtcToken.mint(10000000000n, bob), deployer);
    txOk(mockUsdcToken.mint(1000000000000n, bob), deployer);
    txOk(mockSbtcToken.mint(10000000000n, charlie), deployer);
    txOk(mockUsdcToken.mint(1000000000000n, charlie), deployer);
  });

  it(`should execute ${NUM_TRANSACTIONS} random transactions and maintain invariants`, async () => {
    const orchestrator = new TestOrchestrator(RANDOM_SEED);
    await orchestrator.run(NUM_TRANSACTIONS);
  }, 21600000); // 6 hour timeout
});
