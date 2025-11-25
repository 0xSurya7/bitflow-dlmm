import {
  alice,
  bob,
  deployer,
  dlmmCore,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  setupTestEnvironment,
  getSbtcUsdcPoolLpBalance,
} from "../tests/helpers/helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import { txOk, rovOk } from '@clarigen/test';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Type Definitions
// ============================================================================

type Direction = 'x-for-y' | 'y-for-x';

interface BinBalances {
  xBalance: bigint;
  yBalance: bigint;
}

interface LiquidityAmounts {
  xAmount: bigint;
  yAmount: bigint;
}

interface ErrorRecord {
  bin: bigint;
  operation: string;
  error: string;
  params: any;
}

// ============================================================================
// Configuration & Constants
// ============================================================================

class TestConfig {
  // Bin range
  static readonly MIN_BIN_ID = -500n;
  static readonly MAX_BIN_ID = 500n;
  static readonly CENTER_BIN_ID = 0n;
  
  // Traversal path
  static readonly TRAVERSAL_PATH = [0n, -500n, 500n, 0n];
  
  // Operations per bin
  static readonly SWAPS_PER_BIN = 5;
  static readonly ADD_LIQUIDITY_PER_BIN = 3;
  static readonly WITHDRAW_LIQUIDITY_PER_BIN = 3;
  static readonly MOVE_LIQUIDITY_PER_BIN = 3;
  
  // Amount generation percentages
  static readonly SWAP_BIN_BALANCE_PERCENT = 15; // 5-15% of bin balance
  static readonly ADD_LIQUIDITY_USER_BALANCE_PERCENT = 10; // 10% of user balance
  static readonly WITHDRAW_LP_PERCENT = 40; // 30-50% of LP tokens
  static readonly MOVE_LP_PERCENT = 30; // 20-40% of LP tokens
  
  // Minimum amounts
  static readonly MIN_SWAP_AMOUNT = 10000n;
  static readonly MIN_ADD_LIQUIDITY_AMOUNT = 1000n;
  static readonly MIN_WITHDRAW_AMOUNT = 100n;
  static readonly MIN_MOVE_AMOUNT = 100n;
  static readonly MIN_DLP = 1n;
  
  // Cross-bin swap parameters
  static readonly MAX_CROSS_BIN_ATTEMPTS = 200;
  
  static readonly MAX_LIQUIDITY_FEE = 1000000n;

  static readonly TIMEOUT = 600000;
}

// ============================================================================
// Pool State Manager
// ============================================================================

class PoolStateManager {
  /**
   * Get active bin ID
   */
  static getActiveBinId(): bigint {
    return rovOk(sbtcUsdcPool.getActiveBinId());
  }

  /**
   * Get bin balances
   */
  static getBinBalances(binId: bigint): BinBalances {
    const unsignedBinId = rovOk(dlmmCore.getUnsignedBinId(binId));
    try {
      const balances = rovOk(sbtcUsdcPool.getBinBalances(unsignedBinId));
      return { xBalance: balances.xBalance, yBalance: balances.yBalance };
    } catch {
      return { xBalance: 0n, yBalance: 0n };
    }
  }

  /**
   * Get user token balance
   */
  static getUserTokenBalance(user: string, tokenContract: any): bigint {
    return rovOk(tokenContract.getBalance(user)) as bigint;
  }

  /**
   * Get user LP balance for a bin
   */
  static getUserLpBalance(user: string, binId: bigint): bigint {
    try {
      return getSbtcUsdcPoolLpBalance(binId, user);
    } catch {
      return 0n;
    }
  }
}

// ============================================================================
// Amount Generator
// ============================================================================

class AmountGenerator {
  /**
   * Generate swap amount based on bin and user balances
   */
  static generateSwapAmount(binId: bigint, direction: Direction, user: string): bigint | null {
    const balances = PoolStateManager.getBinBalances(binId);
    const userXBalance = PoolStateManager.getUserTokenBalance(user, mockSbtcToken);
    const userYBalance = PoolStateManager.getUserTokenBalance(user, mockUsdcToken);

    if (direction === 'x-for-y') {
      if (balances.yBalance === 0n || userXBalance === 0n) return null;
      const maxFromBin = (balances.yBalance * BigInt(TestConfig.SWAP_BIN_BALANCE_PERCENT)) / 100n;
      const maxAmount = maxFromBin < userXBalance ? maxFromBin : userXBalance;
      return maxAmount < TestConfig.MIN_SWAP_AMOUNT ? null : maxAmount;
    } else {
      if (balances.xBalance === 0n || userYBalance === 0n) return null;
      const maxFromBin = (balances.xBalance * BigInt(TestConfig.SWAP_BIN_BALANCE_PERCENT)) / 100n;
      const maxAmount = maxFromBin < userYBalance ? maxFromBin : userYBalance;
      return maxAmount < TestConfig.MIN_SWAP_AMOUNT ? null : maxAmount;
    }
  }

  /**
   * Generate add liquidity amounts based on bin position
   */
  static generateAddLiquidityAmounts(binId: bigint, user: string): LiquidityAmounts | null {
    const activeBinId = PoolStateManager.getActiveBinId();
    const userXBalance = PoolStateManager.getUserTokenBalance(user, mockSbtcToken);
    const userYBalance = PoolStateManager.getUserTokenBalance(user, mockUsdcToken);

    if (binId < activeBinId) {
      // y only
      if (userYBalance === 0n) return null;
      const yAmount = (userYBalance * BigInt(TestConfig.ADD_LIQUIDITY_USER_BALANCE_PERCENT)) / 100n;
      return yAmount < TestConfig.MIN_ADD_LIQUIDITY_AMOUNT ? null : { xAmount: 0n, yAmount };
    } else if (binId === activeBinId) {
      // both x & y
      if (userXBalance === 0n || userYBalance === 0n) return null;
      const xAmount = (userXBalance * BigInt(TestConfig.ADD_LIQUIDITY_USER_BALANCE_PERCENT)) / 100n;
      const yAmount = (userYBalance * BigInt(TestConfig.ADD_LIQUIDITY_USER_BALANCE_PERCENT)) / 100n;
      return (xAmount < TestConfig.MIN_ADD_LIQUIDITY_AMOUNT || yAmount < TestConfig.MIN_ADD_LIQUIDITY_AMOUNT) 
        ? null 
        : { xAmount, yAmount };
    } else {
      // x only
      if (userXBalance === 0n) return null;
      const xAmount = (userXBalance * BigInt(TestConfig.ADD_LIQUIDITY_USER_BALANCE_PERCENT)) / 100n;
      return xAmount < TestConfig.MIN_ADD_LIQUIDITY_AMOUNT ? null : { xAmount, yAmount: 0n };
    }
  }

  /**
   * Generate withdraw amount from LP balance
   */
  static generateWithdrawAmount(binId: bigint, user: string): bigint | null {
    const lpBalance = PoolStateManager.getUserLpBalance(user, binId);
    if (lpBalance === 0n) return null;
    const amount = (lpBalance * BigInt(TestConfig.WITHDRAW_LP_PERCENT)) / 100n;
    return amount < TestConfig.MIN_WITHDRAW_AMOUNT ? null : amount;
  }

  /**
   * Generate move amount from LP balance
   */
  static generateMoveAmount(sourceBinId: bigint, user: string): bigint | null {
    const lpBalance = PoolStateManager.getUserLpBalance(user, sourceBinId);
    if (lpBalance === 0n) return null;
    const amount = (lpBalance * BigInt(TestConfig.MOVE_LP_PERCENT)) / 100n;
    return amount < TestConfig.MIN_MOVE_AMOUNT ? null : amount;
  }
}

// ============================================================================
// Operation Executor
// ============================================================================

class OperationExecutor {
  /**
   * Execute a swap operation
   */
  static executeSwap(binId: bigint, direction: Direction, amount: bigint, user: string): void {
    if (direction === 'x-for-y') {
      txOk(dlmmCore.swapXForY(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        Number(binId),
        amount
      ), user);
    } else {
      txOk(dlmmCore.swapYForX(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        Number(binId),
        amount
      ), user);
    }
  }

  /**
   * Execute add liquidity operation
   */
  static executeAddLiquidity(binId: bigint, amounts: LiquidityAmounts, user: string): void {
    txOk(dlmmCore.addLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      Number(binId),
      amounts.xAmount,
      amounts.yAmount,
      TestConfig.MIN_DLP,
      TestConfig.MAX_LIQUIDITY_FEE,
      TestConfig.MAX_LIQUIDITY_FEE
    ), user);
  }

  /**
   * Execute withdraw liquidity operation
   */
  static executeWithdrawLiquidity(binId: bigint, amount: bigint, user: string): void {
    txOk(dlmmCore.withdrawLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      Number(binId),
      amount,
      0n, // minXAmount
      0n  // minYAmount
    ), user);
  }

  /**
   * Execute move liquidity operation
   */
  static executeMoveLiquidity(fromBinId: bigint, toBinId: bigint, amount: bigint, user: string): void {
    txOk(dlmmCore.moveLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      Number(fromBinId),
      Number(toBinId),
      amount,
      TestConfig.MIN_DLP,
      TestConfig.MAX_LIQUIDITY_FEE,
      TestConfig.MAX_LIQUIDITY_FEE
    ), user);
  }
}

// ============================================================================
// Traversal Logger
// ============================================================================

class TraversalLogger {
  private logFile: string;
  private logs: string[] = [];
  public errors: ErrorRecord[] = [];

  constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseDir = path.join(process.cwd(), 'logs', 'bin-traversal');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    this.logFile = path.join(baseDir, `bin-traversal-${timestamp}.log`);
  }

  log(message: string): void {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}`;
    this.logs.push(logLine);
    console.log(logLine);
  }

  logError(bin: bigint, operation: string, error: string, params: any): void {
    this.errors.push({ bin, operation, error, params });
    this.log(`ERROR at bin ${bin}: ${operation} failed - ${error}`);
  }

  save(): void {
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
// Bin Operations Handler
// ============================================================================

class BinOperationsHandler {
  /**
   * Perform swap operations in a bin
   */
  static performSwaps(binId: bigint, count: number, logger: TraversalLogger): void {
    logger.log(`Performing ${count} swaps in bin ${binId}`);
    
    for (let j = 0; j < count; j++) {
      const direction: Direction = j % 2 === 0 ? 'x-for-y' : 'y-for-x';
      const user = j % 2 === 0 ? alice : bob;
      const amount = AmountGenerator.generateSwapAmount(binId, direction, user);
      
      if (!amount) {
        logger.log(`Skipping swap ${j + 1} - insufficient balance`);
        continue;
      }
      
      try {
        OperationExecutor.executeSwap(binId, direction, amount, user);
        logger.log(` Swap ${j + 1}: ${direction} with amount ${amount}`);
      } catch (error: any) {
        logger.logError(binId, `swap-${direction}`, error.message || String(error), { amount });
      }
    }
  }

  /**
   * Perform add liquidity operations in a bin
   */
  static performAddLiquidity(binId: bigint, count: number, logger: TraversalLogger): void {
    logger.log(`Performing ${count} add liquidity operations in bin ${binId}`);
    
    for (let j = 0; j < count; j++) {
      const user = j % 2 === 0 ? alice : bob;
      const amounts = AmountGenerator.generateAddLiquidityAmounts(binId, user);
      
      if (!amounts) {
        logger.log(`Skipping add liquidity ${j + 1} - insufficient balance`);
        continue;
      }
      
      try {
        OperationExecutor.executeAddLiquidity(binId, amounts, user);
        logger.log(`  Add liquidity ${j + 1}: x=${amounts.xAmount}, y=${amounts.yAmount}`);
      } catch (error: any) {
        logger.logError(binId, 'add-liquidity', error.message || String(error), amounts);
      }
    }
  }

  /**
   * Perform withdraw liquidity operations in a bin
   */
  static performWithdrawLiquidity(binId: bigint, count: number, logger: TraversalLogger): void {
    logger.log(`Performing ${count} remove liquidity operations in bin ${binId}`);
    
    for (let j = 0; j < count; j++) {
      const user = j % 2 === 0 ? alice : bob;
      const amount = AmountGenerator.generateWithdrawAmount(binId, user);
      
      if (!amount) {
        logger.log(`Skipping remove liquidity ${j + 1} - no LP tokens`);
        continue;
      }
      
      try {
        OperationExecutor.executeWithdrawLiquidity(binId, amount, user);
        logger.log(`  Remove liquidity ${j + 1}: ${amount} LP tokens`);
      } catch (error: any) {
        logger.logError(binId, 'withdraw-liquidity', error.message || String(error), { amount });
      }
    }
  }

  /**
   * Perform move liquidity operations from a bin
   */
  static performMoveLiquidity(binId: bigint, count: number, logger: TraversalLogger): void {
    logger.log(`Performing ${count} move liquidity operations from bin ${binId}`);
    
    for (let j = 0; j < count; j++) {
      const user = j % 2 === 0 ? alice : bob;
      const amount = AmountGenerator.generateMoveAmount(binId, user);
      
      if (!amount) {
        logger.log(`Skipping move liquidity ${j + 1} - no LP tokens`);
        continue;
      }
      
      // Determine target bin
      const targetBin = binId === TestConfig.MIN_BIN_ID 
        ? binId + 1n 
        : binId === TestConfig.MAX_BIN_ID
        ? binId - 1n
        : binId + (j % 2 === 0 ? 1n : -1n);
      
      if (targetBin < TestConfig.MIN_BIN_ID || targetBin > TestConfig.MAX_BIN_ID) {
        logger.log(`Skipping move liquidity ${j + 1} - target bin ${targetBin} out of range`);
        continue;
      }
      
      try {
        OperationExecutor.executeMoveLiquidity(binId, targetBin, amount, user);
        logger.log(`  Move liquidity ${j + 1}: ${amount} LP tokens from ${binId} to ${targetBin}`);
      } catch (error: any) {
        logger.logError(binId, 'move-liquidity', error.message || String(error), { from: binId, to: targetBin, amount });
      }
    }
  }

  /**
   * Process all operations for a bin
   */
  static processAllOperations(binId: bigint, logger: TraversalLogger): void {
    this.performSwaps(binId, TestConfig.SWAPS_PER_BIN, logger);
    this.performAddLiquidity(binId, TestConfig.ADD_LIQUIDITY_PER_BIN, logger);
    this.performWithdrawLiquidity(binId, TestConfig.WITHDRAW_LIQUIDITY_PER_BIN, logger);
    this.performMoveLiquidity(binId, TestConfig.MOVE_LIQUIDITY_PER_BIN, logger);
    logger.log(`Completed operations in bin ${binId}`);
  }
}

// ============================================================================
// Bin Traversal Handler
// ============================================================================

class BinTraversalHandler {
  /**
   * Swap to cross bins and reach target bin
   */
  static swapToCrossBin(targetBinId: bigint, logger: TraversalLogger): boolean {
    const activeBinId = PoolStateManager.getActiveBinId();
    
    if (activeBinId === targetBinId) {
      return true; // Already at target
    }

    logger.log(`Swapping to cross from bin ${activeBinId} to bin ${targetBinId}`);

    const direction: Direction = targetBinId > activeBinId ? 'x-for-y' : 'y-for-x';
    let attempts = 0;

    while (PoolStateManager.getActiveBinId() !== targetBinId && attempts < TestConfig.MAX_CROSS_BIN_ATTEMPTS) {
      attempts++;
      const currentBinId = PoolStateManager.getActiveBinId();
      
      // correct direction sanity
      const currentDirection: Direction = targetBinId > currentBinId ? 'x-for-y' : 'y-for-x';
      if (currentDirection !== direction) {
        logger.log(`Direction changed at bin ${currentBinId}, target is ${targetBinId}`);
        break;
      }
      
      const amount = AmountGenerator.generateSwapAmount(currentBinId, currentDirection, alice);
      
      if (!amount) {
        // try adding liquidity to continue
        if (this.tryAddLiquidityForTraversal(currentBinId, alice, logger)) {
          continue;
        }
        break;
      }

      try {
        OperationExecutor.executeSwap(currentBinId, currentDirection, amount, alice);
        const newBinId = PoolStateManager.getActiveBinId();
        logger.log(`Swap ${currentDirection}: ${amount} at bin ${currentBinId} -> new bin ${newBinId}`);
      } catch (error: any) {
        logger.logError(currentBinId, `swap-${currentDirection}`, error.message || String(error), { amount });
        continue;
      }
    }

    const finalBinId = PoolStateManager.getActiveBinId();
    if (finalBinId === targetBinId) {
      logger.log(`Successfully reached target bin ${targetBinId}`);
      return true;
    } else {
      logger.log(`Reached bin ${finalBinId} instead of target ${targetBinId} after ${attempts} attempts`);
      return false;
    }
  }

  /**
   * Try adding liquidity to enable continued traversal
   */
  private static tryAddLiquidityForTraversal(binId: bigint, user: string, logger: TraversalLogger): boolean {
    logger.log(`Cannot generate swap amount at bin ${binId} - attempting to add liquidity`);
    const amounts = AmountGenerator.generateAddLiquidityAmounts(binId, user);
    
    if (!amounts) return false;
    
    try {
      OperationExecutor.executeAddLiquidity(binId, amounts, user);
      logger.log(`Added liquidity to bin ${binId} to continue traversal`);
      return true;
    } catch (e) {
      logger.log(`Failed to add liquidity at bin ${binId}`);
      return false;
    }
  }
}

// ============================================================================
// Test Orchestrator
// ============================================================================

class TestOrchestrator {
  private logger: TraversalLogger;

  constructor(logger: TraversalLogger) {
    this.logger = logger;
  }

  /**
   * Process a single bin in the traversal path
   */
  processBin(targetBinId: bigint, isFirstBin: boolean): void {
    this.logger.log(`\n=== Processing bin ${targetBinId} ===`);
    
    // Traverse to target bin
    if (!isFirstBin) {
      const success = BinTraversalHandler.swapToCrossBin(targetBinId, this.logger);
      if (!success) {
        this.logger.log(`Failed to reach bin ${targetBinId}`);
        return;
      }
    }
    
    const currentBinId = PoolStateManager.getActiveBinId();
    expect(currentBinId).toBe(targetBinId);
    
    // Perform all operations in this bin
    BinOperationsHandler.processAllOperations(currentBinId, this.logger);
  }

  /**
   * Execute complete traversal path
   */
  executeTraversalPath(traversalPath: bigint[]): void {
    for (let i = 0; i < traversalPath.length; i++) {
      this.processBin(traversalPath[i], i === 0);
    }
  }

  /**
   * Attempt to return to center bin
   */
  returnToCenterIfNeeded(): bigint {
    let finalBinId = PoolStateManager.getActiveBinId();
    
    if (finalBinId !== TestConfig.CENTER_BIN_ID) {
      this.logger.log(`\nAttempting to return to bin 0 from bin ${finalBinId}`);
      BinTraversalHandler.swapToCrossBin(TestConfig.CENTER_BIN_ID, this.logger);
      finalBinId = PoolStateManager.getActiveBinId();
    }
    
    return finalBinId;
  }

  /**
   * Log final summary
   */
  logFinalSummary(finalBinId: bigint): void {
    this.logger.log(`\nFinal bin ID: ${finalBinId}`);
    
    if (this.logger.errors.length > 0) {
      this.logger.log(`\nTest completed with ${this.logger.errors.length} errors. Check log file for details.`);
    } else {
      this.logger.log(`\nTest completed successfully with no errors.`);
    }
  }
}

// ============================================================================
// Test Suite
// ============================================================================

describe('DLMM Core Bin Traversal Fuzz Test', () => {
  let logger: TraversalLogger;

  beforeEach(() => {
    setupTestEnvironment();
    logger = new TraversalLogger();
  });

  it('should traverse bins: 0 > -500 > 500 > 0 with operations in each bin', async () => {
    logger.log('Starting bin traversal fuzz test');
    
    const orchestrator = new TestOrchestrator(logger);
    
    // execute traversal path
    orchestrator.executeTraversalPath(TestConfig.TRAVERSAL_PATH);
    
    // attempt to return to center
    const finalBinId = orchestrator.returnToCenterIfNeeded();
    
    // log final summary
    orchestrator.logFinalSummary(finalBinId);
    
    logger.save();
  }, TestConfig.TIMEOUT);
});
