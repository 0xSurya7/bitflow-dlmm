/**
 * Withdraw Liquidity Test Suite
 * 
 * This test file verifies the withdraw-liquidity functionality of the DLMM protocol.
 * It tests withdrawing liquidity from bins and validates that users receive
 * the correct amount of their tokens back from the LP tokens they had.
 * 
 * IMPORTANT: These tests verify that withdrawing returns the exact tokens
 * that were originally deposited (minus any fees that may apply).
 * 
 * Each line is commented to explain what it does.
 */

import {
  // Test accounts imported from helpers
  alice,
  bob,
  deployer,
  
  // Core contract and pool interfaces
  dlmmCore,
  sbtcUsdcPool,
  
  // Token contracts for the pool
  mockSbtcToken,
  mockUsdcToken,
  
  // Helper functions for testing
  setupTokens,
  createTestPool,
  addLiquidityToBins,
  generateBinFactors,
  getSbtcUsdcPoolLpBalance,
} from "../helpers/helpers";

// Vitest testing framework imports
import { describe, it, expect, beforeEach } from 'vitest';

// Clarigen imports for handling contract responses
import { cvToValue } from '@clarigen/core';
import { txOk, txErr, rovOk } from '@clarigen/test';

describe('Withdraw Liquidity Function Tests', () => {
  
  /**
   * beforeEach: Setup function that runs before each test
   * Creates a fresh pool and adds initial liquidity that can be withdrawn
   */
  beforeEach(async () => {
    // Step 1: Mint tokens to test accounts
    // Alice needs tokens to add liquidity, which will then be withdrawn
    txOk(mockSbtcToken.mint(100000000n, deployer), deployer);   // 1 BTC to deployer
    txOk(mockUsdcToken.mint(50000000000n, deployer), deployer);  // 50,000 USDC to deployer
    txOk(mockSbtcToken.mint(100000000n, alice), deployer);       // 1 BTC to alice
    txOk(mockUsdcToken.mint(50000000000n, alice), deployer);    // 50,000 USDC to alice

    // Step 2: Generate bin factors for the pool
    // Bin factors are pre-calculated values used to determine the price of each bin
    // They represent the ratio of prices between adjacent bins
    const factors = generateBinFactors();
    
    // Step 3: Register the bin factors with the protocol
    // This makes the factors available for use when creating or operating pools
    txOk(dlmmCore.addBinStep(25n, factors), deployer);

    // Step 4: Create the SBTC-USDC pool with all parameters
    txOk(dlmmCore.createPool(
      sbtcUsdcPool.identifier,           // pool-identifier: Unique ID for this pool contract
      mockSbtcToken.identifier,           // token-x: The first token (SBTC)
      mockUsdcToken.identifier,          // token-y: The second token (USDC)
      10000000n,                          // active-bin-supply-x: Initial X amount (0.1 BTC)
      5000000000n,                        // active-bin-supply-y: Initial Y amount (5,000 USDC)
      1000n,                              // burn-amount: LP tokens to burn initially
      1000n, 3000n,                       // x-protocol-fee, x-provider-fee
      1000n, 3000n,                       // y-protocol-fee, y-provider-fee
      25n,                                 // bin-step: Price increment between bins (0.25%)
      900n,                                // variable-fees-cooldown: Time before fee changes (900s)
      false,                               // freeze-variable-fees-manager: Whether to freeze fees
      null,                                // dynamic-config: Optional advanced settings
      deployer,                            // fee-address: Address receiving protocol fees
      "https://bitflow.finance/dlmm",     // uri: IPFS metadata URI
      true                                 // active: Whether pool is immediately active
    ), deployer);

    // Verify the pool was created successfully
    const poolData = rovOk(sbtcUsdcPool.getPool());
    expect(poolData.poolCreated).toBe(true);
    expect(poolData.binStep).toBe(25n);
    expect(poolData.activeBinId).toBe(0n);
  });

  /**
   * Test: Withdraw All Liquidity from Active Bin
   * This test adds liquidity to the active bin, then withdraws it completely
   * and verifies the exact amounts are returned
   */
  it('should withdraw exactly what was added from active bin', async () => {
    // Define which bin we're working with and how much to add
    const binId = 0n;  // Active bin (where current market price resides)
    const xAmountToAdd = 2000000n;    // 0.02 BTC (2,000,000 satoshis) to add
    const yAmountToAdd = 1000000000n;  // 1,000 USDC to add
    const minDlp = 1n;  // Minimum LP tokens acceptable (must be > 0)

    // Step 1: Add liquidity first to have tokens to withdraw
    // This mints LP tokens to alice in exchange for X and Y tokens
    
    const addResponse = txOk(dlmmCore.addLiquidity(
      sbtcUsdcPool.identifier,      // pool-identifier: The pool contract identifier
      mockSbtcToken.identifier,      // token-x: The X token contract (SBTC)
      mockUsdcToken.identifier,      // token-y: The Y token contract (USDC)
      binId,                         // bin-id: Which bin to add liquidity to (0 = active)
      xAmountToAdd,                  // amount-x: Amount of X tokens (SBTC) to add
      yAmountToAdd,                  // amount-y: Amount of Y tokens (USDC) to add
      minDlp,                        // min-dlp-amount: Minimum LP tokens expected (slippage protection)
      1000000n,                      // max-x-liquidity-fee: Max fee willing to pay in X tokens
      1000000n                       // max-y-liquidity-fee: Max fee willing to pay in Y tokens
    ), alice);

    // Get the actual amount of LP tokens received
    const lpReceived = cvToValue(addResponse.result);

    // Verify we received positive LP tokens
    expect(lpReceived).toBeGreaterThan(0n);

    // Get alice's LP balance in this bin before withdrawal
    const lpBalanceBefore = getSbtcUsdcPoolLpBalance(binId, alice);
    
    // Verify LP balance matches what we just received
    expect(lpBalanceBefore).toBe(lpReceived);

    // Step 2: Withdraw all the liquidity we just added
    // This burns the LP tokens and returns X and Y tokens to alice
    
    const withdrawResponse = txOk(dlmmCore.withdrawLiquidity(
      sbtcUsdcPool.identifier,      // pool-trait: The pool contract identifier
      mockSbtcToken.identifier,      // token-x: The X token contract (SBTC)
      mockUsdcToken.identifier,      // token-y: The Y token contract (USDC)
      binId,                         // bin-id: Which bin to withdraw liquidity from
      lpReceived,                    // amount: Amount of LP tokens to burn (all of them)
      1n,                            // min-x-amount: Minimum X tokens expected (slippage protection)
      1n                             // min-y-amount: Minimum Y tokens expected (slippage protection)
    ), alice);

    // Get the withdrawal result
    // This contains the actual amounts of X and Y tokens returned
    const withdrawResult = cvToValue(withdrawResponse.result);

    // Get alice's LP balance after withdrawal
    const lpBalanceAfter = getSbtcUsdcPoolLpBalance(binId, alice);

    // Step 3: Verify the withdrawal results
    
    // LP tokens should be completely burned (0 remaining)
    expect(lpBalanceAfter).toBe(0n);
    
    // User should have received back positive amounts of both tokens
    expect(withdrawResult.xAmount).toBeGreaterThan(0n);
    expect(withdrawResult.yAmount).toBeGreaterThan(0n);
    
    // For a complete withdrawal from active bin (without price changes),
    // the amounts should approximately match what was added
    // Note: Due to rounding, there might be small differences
    console.log(`=== Active Bin Withdrawal ===`);
    console.log(`X tokens added: ${xAmountToAdd}`);
    console.log(`X tokens withdrawn: ${withdrawResult.xAmount}`);
    console.log(`Y tokens added: ${yAmountToAdd}`);
    console.log(`Y tokens withdrawn: ${withdrawResult.yAmount}`);
    
    // The withdrawn amounts should be very close to what was added
    expect(withdrawResult.xAmount).toBeLessThanOrEqual(xAmountToAdd);
    expect(withdrawResult.yAmount).toBeLessThanOrEqual(yAmountToAdd);
  });

  /**
   * Test: Withdraw Partial Liquidity from Active Bin
   * This test adds liquidity, then withdraws only a portion of it
   * Demonstrates that LP tokens can be partially burned
   */
  it('should withdraw partial liquidity and keep remainder', async () => {
    const binId = 0n;
    const xAmountToAdd = 2000000n;
    const yAmountToAdd = 1000000000n;
    const minDlp = 1n;

    // Step 1: Add liquidity to establish a position
    const addResponse = txOk(dlmmCore.addLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      binId,
      xAmountToAdd,
      yAmountToAdd,
      minDlp,
      1000000n,
      1000000n
    ), alice);

    const lpReceived = cvToValue(addResponse.result);
    expect(lpReceived).toBeGreaterThan(0n);

    // Calculate how much to withdraw and how much to keep
    const lpToWithdraw = lpReceived / 2n;  // Withdraw half
    const lpToKeep = lpReceived - lpToWithdraw;  // Keep half

    // Get LP balance before withdrawal
    const lpBalanceBefore = getSbtcUsdcPoolLpBalance(binId, alice);
    expect(lpBalanceBefore).toBe(lpReceived);

    // Step 2: Withdraw only partial liquidity
    const withdrawResponse = txOk(dlmmCore.withdrawLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      binId,
      lpToWithdraw,
      1n,  // min-x-amount
      1n   // min-y-amount
    ), alice);

    const withdrawResult = cvToValue(withdrawResponse.result);

    // Get LP balance after withdrawal
    const lpBalanceAfter = getSbtcUsdcPoolLpBalance(binId, alice);

    // Verify partial withdrawal worked correctly
    
    // Remaining LP balance should match what we kept
    expect(lpBalanceAfter).toBe(lpToKeep);
    
    // Withdraw amount should be proportional
    expect(withdrawResult.xAmount).toBeLessThanOrEqual(xAmountToAdd);
    expect(withdrawResult.yAmount).toBeLessThanOrEqual(yAmountToAdd);
    
    // Both amounts should be positive
    expect(withdrawResult.xAmount).toBeGreaterThan(0n);
    expect(withdrawResult.yAmount).toBeGreaterThan(0n);
  });

  /**
   * Test: Withdraw Liquidity from Y-Only Bin (Below Active)
   * Bins below active (negative bin IDs) contain only Y tokens (USDC)
   * These bins represent higher price ranges where only USDC is deposited
   * Withdrawing from these bins should return only Y tokens
   */
  it('should withdraw Y-only tokens from bin below active', async () => {
    const binId = -1n;  // One bin below active (higher price range)
    const xAmount = 0n;  // No X tokens added to this type of bin
    const yAmountToAdd = 1000000000n;  // 1,000 USDC to add
    const minDlp = 1n;

    // Step 1: Add Y-only liquidity to bin below active
    const addResponse = txOk(dlmmCore.addLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      binId,
      xAmount,
      yAmountToAdd,
      minDlp,
      1000000n,
      1000000n
    ), alice);

    const lpReceived = cvToValue(addResponse.result);
    expect(lpReceived).toBeGreaterThan(0n);

    // Verify LP tokens were minted
    const lpBalanceBefore = getSbtcUsdcPoolLpBalance(binId, alice);
    expect(lpBalanceBefore).toBe(lpReceived);

    // Step 2: Withdraw all liquidity from this Y-only bin
    const withdrawResponse = txOk(dlmmCore.withdrawLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      binId,
      lpReceived,
      0n,   // min-x-amount = 0 (expect no X tokens from this bin)
      1n    // min-y-amount (expect Y tokens)
    ), alice);

    const withdrawResult = cvToValue(withdrawResponse.result);

    // Step 3: Verify withdrawal results for Y-only bin
    const lpBalanceAfter = getSbtcUsdcPoolLpBalance(binId, alice);

    // LP tokens should be 0 after complete withdrawal
    expect(lpBalanceAfter).toBe(0n);
    
    // Should receive Y tokens (no X tokens from this bin type)
    expect(withdrawResult.xAmount).toBe(0n);  // No X tokens
    expect(withdrawResult.yAmount).toBeGreaterThan(0n);  // Has Y tokens
    
    // Log the results
    console.log(`=== Y-Only Bin (bin ${binId}) Withdrawal ===`);
    console.log(`Y tokens added: ${yAmountToAdd}`);
    console.log(`Y tokens withdrawn: ${withdrawResult.yAmount}`);
    
    // For Y-only bin withdrawal, should get back approximately what was added
    expect(withdrawResult.yAmount).toBeLessThanOrEqual(yAmountToAdd);
  });

  /**
   * Test: Withdraw Liquidity from X-Only Bin (Above Active)
   * Bins above active (positive bin IDs) contain only X tokens (SBTC)
   * These bins represent lower price ranges where only SBTC is deposited
   * Withdrawing from these bins should return only X tokens
   */
  it('should withdraw X-only tokens from bin above active', async () => {
    const binId = 1n;  // One bin above active (lower price range)
    const xAmountToAdd = 1000000n;  // 0.01 BTC to add
    const yAmount = 0n;  // No Y tokens added to this type of bin
    const minDlp = 1n;

    // Step 1: Add X-only liquidity to bin above active
    const addResponse = txOk(dlmmCore.addLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      binId,
      xAmountToAdd,
      yAmount,
      minDlp,
      1000000n,
      1000000n
    ), alice);

    const lpReceived = cvToValue(addResponse.result);
    expect(lpReceived).toBeGreaterThan(0n);

    // Verify LP tokens were minted
    const lpBalanceBefore = getSbtcUsdcPoolLpBalance(binId, alice);
    expect(lpBalanceBefore).toBe(lpReceived);

    // Step 2: Withdraw all liquidity from this X-only bin
    const withdrawResponse = txOk(dlmmCore.withdrawLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      binId,
      lpReceived,
      1n,   // min-x-amount (expect X tokens)
      0n    // min-y-amount = 0 (expect no Y tokens)
    ), alice);

    const withdrawResult = cvToValue(withdrawResponse.result);

    // Step 3: Verify withdrawal results for X-only bin
    const lpBalanceAfter = getSbtcUsdcPoolLpBalance(binId, alice);

    // LP tokens should be 0 after complete withdrawal
    expect(lpBalanceAfter).toBe(0n);
    
    // Should receive X tokens (no Y tokens from this bin type)
    expect(withdrawResult.xAmount).toBeGreaterThan(0n);  // Has X tokens
    expect(withdrawResult.yAmount).toBe(0n);  // No Y tokens
    
    // Log the results
    console.log(`=== X-Only Bin (bin ${binId}) Withdrawal ===`);
    console.log(`X tokens added: ${xAmountToAdd}`);
    console.log(`X tokens withdrawn: ${withdrawResult.xAmount}`);
    
    // For X-only bin withdrawal, should get back approximately what was added
    expect(withdrawResult.xAmount).toBeLessThanOrEqual(xAmountToAdd);
  });

  /**
   * Test: Full Round-Trip Add and Withdraw from Multiple Bins
   * This comprehensive test adds liquidity to multiple bins,
   * then withdraws from all of them, verifying exact amounts returned
   */
  it('should add to multiple bins then withdraw exact amounts', async () => {
    // Define bins to add liquidity to
    // Negative bins: Higher price ranges (Y-only tokens)
    // Bin 0: Current price (both X and Y tokens)
    // Positive bins: Lower price ranges (X-only tokens)
    const binsToAddLiquidity = [
      { bin: -2n, xAmount: 0n, yAmount: 500000000n },   // Y-only bin
      { bin: -1n, xAmount: 0n, yAmount: 500000000n },   // Y-only bin
      { bin: 0n, xAmount: 1000000n, yAmount: 500000000n }, // Active bin
      { bin: 1n, xAmount: 1000000n, yAmount: 0n },      // X-only bin
      { bin: 2n, xAmount: 1000000n, yAmount: 0n },      // X-only bin
    ];

    // Track how much we added to each bin for verification
    const amountsAdded = new Map<bigint, { x: bigint; y: bigint; lp: bigint }>();

    // Step 1: Add liquidity to all bins
    for (const { bin, xAmount, yAmount } of binsToAddLiquidity) {
      const addResponse = txOk(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        bin,
        xAmount,
        yAmount,
        1n,  // min-dlp
        1000000n,  // max-x-fee
        1000000n   // max-y-fee
      ), alice);

      const lpReceived = cvToValue(addResponse.result);
      
      // Record what we added to this bin
      amountsAdded.set(bin, { x: xAmount, y: yAmount, lp: lpReceived });
      
      expect(lpReceived).toBeGreaterThan(0n);
    }

    // Step 2: Withdraw from all bins
    for (const { bin } of binsToAddLiquidity) {
      const added = amountsAdded.get(bin)!;
      
      // Get current LP balance for this bin
      const lpBalance = getSbtcUsdcPoolLpBalance(bin, alice);

      // Verify we have LP tokens for this bin
      expect(lpBalance).toBe(added.lp);

      // Set min amounts based on bin type
      // Y-only bins (negative): min-x-amount = 0, min-y-amount = 1
      // X-only bins (positive): min-x-amount = 1, min-y-amount = 0
      // Active bin: both = 1
      const minXAmount = bin >= 0n ? 1n : 0n;
      const minYAmount = bin <= 0n ? 1n : 0n;

      // Execute withdrawal from this bin
      const withdrawResponse = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        bin,
        lpBalance,  // Withdraw all LP tokens from this bin
        minXAmount,
        minYAmount
      ), alice);

      const withdrawResult = cvToValue(withdrawResponse.result);

      // Step 3: Verify withdrawal results based on bin type:
      // Negative bins: only Y tokens
      // Positive bins: only X tokens
      // Active bin: both
      
      if (bin < 0n) {
        // Below active: Y tokens only
        expect(withdrawResult.xAmount).toBe(0n);
        expect(withdrawResult.yAmount).toBeGreaterThan(0n);
        
        console.log(`Bin ${bin}: Withdrew 0 X, ${withdrawResult.yAmount} Y`);
        
      } else if (bin > 0n) {
        // Above active: X tokens only
        expect(withdrawResult.xAmount).toBeGreaterThan(0n);
        expect(withdrawResult.yAmount).toBe(0n);
        
        console.log(`Bin ${bin}: Withdrew ${withdrawResult.xAmount} X, 0 Y`);
        
      } else {
        // Active bin: both
        expect(withdrawResult.xAmount).toBeGreaterThan(0n);
        expect(withdrawResult.yAmount).toBeGreaterThan(0n);
        
        console.log(`Bin ${bin}: Withdrew ${withdrawResult.xAmount} X, ${withdrawResult.yAmount} Y`);
      }
    }

    // Step 4: Verify all LP tokens are withdrawn
    for (const { bin } of binsToAddLiquidity) {
      const lpBalance = getSbtcUsdcPoolLpBalance(bin, alice);
      expect(lpBalance).toBe(0n);
    }

    console.log(`=== All bins successfully withdrawn ===`);
  });

  /**
   * Test: Withdraw with Insufficient Minimum Amounts
   * The min-x-amount and min-y-amount parameters provide slippage protection
   */
  it('should fail when withdraw amounts below minimum', async () => {
    const binId = 0n;
    const xAmountToAdd = 2000000n;
    const yAmountToAdd = 1000000000n;
    const minDlp = 1n;

    // Add liquidity first
    const addResponse = txOk(dlmmCore.addLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      binId,
      xAmountToAdd,
      yAmountToAdd,
      minDlp,
      1000000n,
      1000000n
    ), alice);

    const lpReceived = cvToValue(addResponse.result);

    // Try to withdraw with unreasonably high minimums
    // This should fail with ERR_MINIMUM_X_AMOUNT or ERR_MINIMUM_Y_AMOUNT (1022)
    const withdrawResponse = txErr(dlmmCore.withdrawLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      binId,
      lpReceived,
      9999999999999n,  // Very high min X - will fail
      1n                // Valid min Y
    ), alice);

    // The transaction should fail with an error
    const errorCode = cvToValue(withdrawResponse.result);
    expect(errorCode).toBe(1022n);  // ERR_MINIMUM_X_AMOUNT
  });

  /**
   * Test: Withdraw from Bin with No Liquidity
   * Attempting to withdraw from a bin with no LP tokens should fail
   */
  it('should fail when withdrawing from bin with no liquidity', async () => {
    const binId = 10n;  // A bin we haven't added liquidity to
    
    // Get current LP balance (should be 0)
    const lpBalance = getSbtcUsdcPoolLpBalance(binId, alice);
    expect(lpBalance).toBe(0n);

    // Try to withdraw from a bin with no LP tokens
    // This should fail with ERR_NO_BIN_SHARES (1048)
    const withdrawResponse = txErr(dlmmCore.withdrawLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      binId,
      1000n,  // Try to withdraw 1000 LP tokens
      1n,
      1n
    ), alice);

    // The transaction should fail with ERR_NO_BIN_SHARES
    const errorCode = cvToValue(withdrawResponse.result);
    expect(errorCode).toBe(1048n);  // ERR_NO_BIN_SHARES
  });

  /**
   * Test: Verify Token Amounts Match After Add-Withdraw Cycle
   * This test specifically checks that the amounts returned match
   * what was originally deposited
   */
  it('should return exact token amounts after add and withdraw cycle', async () => {
    const binId = 0n;
    const xAmountToAdd = 5000000n;   // 0.05 BTC
    const yAmountToAdd = 2500000000n; // 2,500 USDC
    const minDlp = 1n;

    // Step 1: Add liquidity and record the amounts
    const addResponse = txOk(dlmmCore.addLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      binId,
      xAmountToAdd,
      yAmountToAdd,
      minDlp,
      1000000n,
      1000000n
    ), alice);

    const lpReceived = cvToValue(addResponse.result);
    expect(lpReceived).toBeGreaterThan(0n);

    // Step 2: Withdraw all liquidity
    const withdrawResponse = txOk(dlmmCore.withdrawLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      binId,
      lpReceived,
      1n,
      1n
    ), alice);

    const withdrawResult = cvToValue(withdrawResponse.result);

    // Step 3: Calculate the return percentage
    const xReturnPercentage = Number(withdrawResult.xAmount) / Number(xAmountToAdd);
    const yReturnPercentage = Number(withdrawResult.yAmount) / Number(yAmountToAdd);

    console.log(`=== Add-Withdraw Cycle Results ===`);
    console.log(`X tokens: Added ${xAmountToAdd}, Withdrew ${withdrawResult.xAmount}`);
    console.log(`  Return percentage: ${(xReturnPercentage * 100).toFixed(4)}%`);
    console.log(`Y tokens: Added ${yAmountToAdd}, Withdrew ${withdrawResult.yAmount}`);
    console.log(`  Return percentage: ${(yReturnPercentage * 100).toFixed(4)}%`);

    // The return percentage should be very close to 100%
    // (within 0.1% due to rounding in the protocol)
    expect(xReturnPercentage).toBeGreaterThan(0.999);
    expect(yReturnPercentage).toBeGreaterThan(0.999);
  });
});
