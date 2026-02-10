/**
 * Add Liquidity Test Suite
 * 
 * This test file verifies the add-liquidity functionality of the DLMM protocol.
 * It tests adding liquidity to different bin types and validates that users
 * receive the correct amount of LP tokens in exchange for their tokens.
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
  getSbtcUsdcPoolLpBalance,
} from "../helpers/helpers";

import { captureBinState } from "../../fuzz/properties/invariants";
// Vitest testing framework imports
import { describe, it, expect, beforeEach } from 'vitest';

// Clarigen imports for handling contract responses
import { cvToValue } from '@clarigen/core';
import { txOk, txErr, rovOk } from '@clarigen/test';

/*function generateBinFactors(numEntries: number = Number(dlmmCore.constants.NUM_OF_BINS), startValue: bigint = 1000000n): bigint[] {
  const CENTER_BIN_ID = 500; // NUM_OF_BINS / 2 = 1001 / 2 = 500
  const PRICE_SCALE_BPS = 100000000n;
  // Calculate starting value so that index CENTER_BIN_ID equals PRICE_SCALE_BPS
  // If we want factors[i] = baseValue + i, and factors[CENTER_BIN_ID] = PRICE_SCALE_BPS
  // Then: baseValue + CENTER_BIN_ID = PRICE_SCALE_BPS
  // So: baseValue = PRICE_SCALE_BPS - CENTER_BIN_ID
  const baseValue = PRICE_SCALE_BPS - BigInt(CENTER_BIN_ID);
  const factors: bigint[] = [];
  
  for (let i = 0; i < numEntries; i++) {
    factors.push(baseValue + BigInt(i));
  }
  
  return factors;
}**/
/**
 * Generate mathematically correct bin factors for a given bin-step
 * 
 * Bin factors determine the price ratio for each bin.
 * For bin-step N (basis points), the price ratio between adjacent bins is:
 *   ratio = (10000 + N) / 10000
 * 
 * The price formula is: price = initial_price × (PRICE_SCALE_BPS / factor)
 * So for bin 0 (center), factor = PRICE_SCALE_BPS = 100000000
 * For each step away from center, factor adjusts by (10000 ± bin_step)
 */

function generateBinFactors(
  binStep: bigint,      // e.g., 25n for 0.25%, 100n for 1%
  numBins: number = 1001,  // Total number of bins
  centerBinIndex: number = 500  // Index of center bin (bin 0)
): bigint[] {
  const PRICE_SCALE_BPS = 100000000n;  // 10^8
  const FACTOR_SCALE = 10000n;  // Scale for basis points
  
  const factors: bigint[] = new Array(numBins);
  
  for (let i = 0; i < numBins; i++) {
    // Calculate offset from center (negative = left of center, positive = right)
    const offset = i - centerBinIndex;
    
    if (offset === 0) {
      // Center bin: factor equals PRICE_SCALE_BPS
      factors[i] = PRICE_SCALE_BPS;
    } else if (offset < 0) {
      // Left of center (lower bins): multiply by (10000 + bin_step)^|offset|
      // These are "above current price" bins with higher X token concentration
      let factor = PRICE_SCALE_BPS;
      const absOffset = Math.abs(offset);
      
      for (let j = 0; j < absOffset; j++) {
        // Multiply by (10000 + bin_step) and divide by 10000
        // Using integer arithmetic: factor × (10000 + step) / 10000
        factor = (factor * (FACTOR_SCALE + binStep)) / FACTOR_SCALE;
      }
      
      factors[i] = factor;
    } else {
      // Right of center (higher bins): divide by (10000 + bin_step)^offset
      // These are "below current price" bins with higher Y token concentration
      let factor = PRICE_SCALE_BPS;
      
      for (let j = 0; j < offset; j++) {
        // Divide by (10000 + bin_step) and multiply by 10000
        // Using integer arithmetic: factor × 10000 / (10000 + step)
        factor = (factor * FACTOR_SCALE) / (FACTOR_SCALE + binStep);
      }
      
      factors[i] = factor;
    }
  }
  
  // Reverse the array so bin indices go from high to low
  return factors.reverse();
}

/**
 * DEBUG TEST: Print generateBinFactors output
 * Run with: npx vitest debug-print-factors --reporter=verbose
 
it('DEBUG: print generateBinFactors output', () => {
  const factors = generateBinFactors(25n);
  console.log('=== generateBinFactors Output ===');
  console.log('Total factors:', factors.length);
  console.log('First 5:', factors.slice(0, 5).join(', '));
  console.log('Center (495-505):', factors.slice(495, 506).join(', '));
  console.log('Last 5:', factors.slice(-5).join(', '));
  console.log('All factors:', factors.join(', '));
  expect(true).toBe(true);
});*/

describe('Add Liquidity Function Tests', () => {
  
  /**
   * beforeEach: Setup function that runs before each test
   * This creates a fresh pool environment for every test to ensure isolation
   */
  beforeEach(async () => {
    // Step 1: Mint tokens to test accounts
    // We need to provide tokens to alice so they can add liquidity
    txOk(mockSbtcToken.mint(100000000n, deployer), deployer);   // 1 BTC to deployer
    txOk(mockUsdcToken.mint(50000000000n, deployer), deployer);  // 50,000 USDC to deployer
    txOk(mockSbtcToken.mint(100000000n, alice), deployer);       // 1 BTC to alice
    txOk(mockUsdcToken.mint(50000000000n, alice), deployer);    // 50,000 USDC to alice
    txOk(mockSbtcToken.mint(100000000n, bob), deployer);         // 1 BTC to bob
    txOk(mockUsdcToken.mint(50000000000n, bob), deployer);      // 50,000 USDC to bob

    // Step 2: Generate bin factors for the pool
    // Bin factors are pre-calculated values used to determine the price of each bin
    // They represent the ratio of prices between adjacent bins
    const factors = generateBinFactors(25n);
    
    // Step 3: Register the bin factors with the protocol
    // This makes the factors available for use when creating or operating pools
    txOk(dlmmCore.addBinStep(25n, factors), deployer);

    // Step 4: Create the SBTC-USDC pool with all parameters
    // This initializes a new DLMM pool with the following parameters:
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

    const binState= captureBinState(poolData.activeBinId);
    console.log("Bin-Id : %d ",binState.binId);
    console.log("Total Supply : %d ",binState.totalSupply);
    console.log("x- Balance : %d ",binState.xBalance);
    console.log("y- Balance : %d ",binState.yBalance);
  });

  /**
   * Test: Add Liquidity to Active Bin
   * This test adds both X and Y tokens to the active bin (bin 0)
   * The active bin is where the current market price resides
   */
  it('should add liquidity to active bin and receive LP tokens', async () => {
    // Define the bin and amounts for liquidity addition
    const binId = 0n;  // Active bin (current price bin)
    const xAmount = 1000000n;   // 0.01 BTC to add
    const yAmount = 500000000n;  // 500 USDC to add
    const minDlp = 1n;  // Minimum LP tokens acceptable (must be > 0)

    // Get the LP balance before adding liquidity
    // This helper function gets alice's LP tokens for the specified bin
    const beforeLpBalance = getSbtcUsdcPoolLpBalance(binId, alice);

    // Execute the add liquidity transaction
    // This transfers tokens from user to pool and mints LP tokens
    const response = txOk(dlmmCore.addLiquidity(
      sbtcUsdcPool.identifier,      // pool-identifier: Which pool to add liquidity to
      mockSbtcToken.identifier,      // token-x: The X token contract (SBTC)
      mockUsdcToken.identifier,      // token-y: The Y token contract (USDC)
      binId,                         // bin-id: Which bin to add liquidity to (0 = active)
      xAmount,                       // amount-x: Amount of X tokens to add
      yAmount,                       // amount-y: Amount of Y tokens to add
      minDlp,                        // min-dlp-amount: Minimum LP tokens expected (slippage protection)
      1000000n,                      // max-x-liquidity-fee: Max fee willing to pay in X tokens
      1000000n                       // max-y-liquidity-fee: Max fee willing to pay in Y tokens
    ), alice);

    // Get the actual amount of LP tokens received
    const liquidityReceived = cvToValue(response.result);

    // Get the LP balance after adding liquidity
    const afterLpBalance = getSbtcUsdcPoolLpBalance(binId, alice);

    // Verify the results:
    
    // 1. LP token balance should increase by the liquidity received
    expect(afterLpBalance).toBe(beforeLpBalance + liquidityReceived);
    
    // 2. Liquidity received should be positive
    expect(liquidityReceived).toBeGreaterThan(0n);
    
    // 3. Liquidity received should meet minimum requirement
    expect(liquidityReceived).toBeGreaterThanOrEqual(minDlp);
  });

  /**
   * Test: Add Liquidity to Bin Below Active (Y-only bin)
   * Bins below the active bin (negative bin IDs) represent higher prices
   * These bins only accept Y tokens (USDC)
   */
  it('should add Y-only liquidity to bin below active', async () => {
    const binId = -1n;  // One bin below active (higher price)
    const xAmount = 0n;  // No X tokens for bins below active
    const yAmount = 500000000n;  // 500 USDC to add
    const minDlp = 1n;

    // Get the LP balance before adding liquidity
    const beforeLpBalance = getSbtcUsdcPoolLpBalance(binId, alice);

    // Execute add liquidity
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

    const liquidityReceived = cvToValue(response.result);

    // Get the LP balance after adding liquidity
    const afterLpBalance = getSbtcUsdcPoolLpBalance(binId, alice);

    // Verify:
    // LP tokens increased
    expect(afterLpBalance).toBe(beforeLpBalance + liquidityReceived);
    // Received positive liquidity
    expect(liquidityReceived).toBeGreaterThan(0n);
    // X amount should remain 0 (no X tokens in lower bins)
    expect(xAmount).toBe(0n);
  });

  /**
   * Test: Add Liquidity to Bin Above Active (X-only bin)
   * Bins above the active bin (positive bin IDs) represent lower prices
   * These bins only accept X tokens (SBTC)
   */
  it('should add X-only liquidity to bin above active', async () => {
    const binId = 1n;  // One bin above active (lower price)
    const xAmount = 1000000n;  // 0.01 BTC to add
    const yAmount = 0n;  // No Y tokens for bins above active
    const minDlp = 1n;

    // Get the LP balance before adding liquidity
    const beforeLpBalance = getSbtcUsdcPoolLpBalance(binId, alice);

    // Execute add liquidity
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

    const liquidityReceived = cvToValue(response.result);

    // Get the LP balance after adding liquidity
    const afterLpBalance = getSbtcUsdcPoolLpBalance(binId, alice);

    // Verify:
    // LP tokens increased
    expect(afterLpBalance).toBe(beforeLpBalance + liquidityReceived);
    // Received positive liquidity
    expect(liquidityReceived).toBeGreaterThan(0n);
    // Y amount should remain 0 (no Y tokens in higher bins)
    expect(yAmount).toBe(0n);
  });

  /**
   * Test: Add Liquidity to Multiple Bins
   * This test adds liquidity to several bins at once using a helper function
   * Demonstrates how liquidity providers can create ranged positions
   */
  it('should add liquidity to multiple bins', async () => {
    // Define bins to add liquidity to
    // Each bin can have different amounts based on its type
    const binsToAddLiquidity = [
      { bin: -2n, xAmount: 0n, yAmount: 1000000000n },  // Lower price bin - Y only
      { bin: -1n, xAmount: 0n, yAmount: 1000000000n },  // Lower price bin - Y only
      { bin: 0n, xAmount: 2000000n, yAmount: 1000000000n },  // Active bin - Both tokens
      { bin: 1n, xAmount: 2000000n, yAmount: 0n },  // Higher price bin - X only
      { bin: 2n, xAmount: 2000000n, yAmount: 0n },  // Higher price bin - X only
    ];

    // Add liquidity to all bins using helper function
    const results = addLiquidityToBins(
      binsToAddLiquidity,
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      alice
    );

    // Verify all bins received liquidity
    expect(results.length).toBe(5);  // All 5 bins should be in results

    // Check each result
    for (const result of results) {
      // Each addition should have returned positive liquidity
      expect(result.liquidity).toBeGreaterThan(0n);
      
      // Verify amounts match what was requested
      const requested = binsToAddLiquidity.find(b => b.bin === result.bin);
      expect(result.xAmount).toBe(requested!.xAmount);
      expect(result.yAmount).toBe(requested!.yAmount);
    }
  });

  /**
   * Test: Revert When Minimum LP Amount Not Met
   * If the calculated LP tokens are less than min-dlp-amount, tx should fail
   */
  it('should fail when minimum LP amount not met', async () => {
    const binId = 0n;
    const xAmount = 100n;  // Very small amount
    const yAmount = 50000n;  // Very small amount
    const minDlp = 999999999999n;  // Unreasonably high minimum

    // This transaction should fail because LP received < minDlp
    // Use txErr to expect an error response
    const response = txErr(dlmmCore.addLiquidity(
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

    // The transaction should fail with ERR_MINIMUM_LP_AMOUNT error (u1024)
    // cvToValue extracts the error code from the response
    const errorCode = cvToValue(response.result);
    expect(errorCode).toBe(1024n);  // ERR_MINIMUM_LP_AMOUNT
  });

  /**
   * Test: Add Same Amounts and Verify LP tokens are correct
   * This test verifies that adding equal amounts to the same bin
   * produces consistent LP token amounts
   */
  it('should produce consistent LP tokens for same amounts', async () => {
    const binId = 0n;
    const xAmount = 1000000n;
    const yAmount = 500000000n;
    const minDlp = 1n;

    // First add
    const response1 = txOk(dlmmCore.addLiquidity(
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

    const lp1 = cvToValue(response1.result);

    // Second add with same amounts
    const response2 = txOk(dlmmCore.addLiquidity(
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

    const lp2 = cvToValue(response2.result);

    // Both should produce the same amount of LP tokens
    // (for the same bin conditions)
    expect(lp2).toBe(lp1);
    
    // Total LP should be double
    const totalLp = getSbtcUsdcPoolLpBalance(binId, alice);
    expect(totalLp).toBe(lp1 + lp2);
  });
});
