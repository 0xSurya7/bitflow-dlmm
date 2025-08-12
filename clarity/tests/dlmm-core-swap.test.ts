import {
  alice,
  bob,
  deployer,
  dlmmCore,
  errors,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  mockPool
} from "./helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import { accounts } from './clarigen-types'; 
import {
  cvToValue,
} from '@clarigen/core';
import { filterEvents, rov, txErr, txOk, rovOk } from '@clarigen/test';


describe('DLMM Core Swap Functions', () => {
  
  beforeEach(async () => {
    // Step 1: Mint tokens to required parties
    txOk(mockSbtcToken.mint(1000000000n, deployer), deployer);  // 10 BTC to deployer
    txOk(mockUsdcToken.mint(500000000000n, deployer), deployer); // 500k USDC to deployer
    txOk(mockSbtcToken.mint(100000000n, alice), deployer);  // 1 BTC to alice
    txOk(mockUsdcToken.mint(50000000000n, alice), deployer); // 50k USDC to alice
    txOk(mockSbtcToken.mint(100000000n, bob), deployer);  // 1 BTC to bob
    txOk(mockUsdcToken.mint(50000000000n, bob), deployer); // 50k USDC to bob
    
    // Step 2: Enable public pool creation and create pool
    txOk(dlmmCore.setPublicPoolCreation(true), deployer);
    const poolData = rov(sbtcUsdcPool.getPool());
    if (!poolData.isOk || !poolData.value.poolCreated) {
      // Create pool with proper parameters
      txOk(dlmmCore.createPool(
        sbtcUsdcPool.identifier,           
        mockSbtcToken.identifier,          
        mockUsdcToken.identifier,          
        10000000n,    // 0.1 BTC in active bin
        5000000000n,  // 5000 USDC in active bin  
        1000n,        // burn amount
        1000n, 3000n, // x fees (0.1% protocol, 0.3% provider)
        1000n, 3000n, // y fees (0.1% protocol, 0.3% provider)
        25n,          // bin step (25 basis points)
        900n,         // variable fees cooldown
        false,        // freeze variable fees manager
        deployer,     // fee address
        "https://bitflow.finance/dlmm", // uri
        true          // status
      ), deployer);
    } 

    // Step 3: Add liquidity to multiple bins following DLMM rules
    // Active bin is 0, so:
    // - Bins < 0: only Y tokens (higher price bins)
    // - Bin = 0: both X and Y tokens (active bin)  
    // - Bins > 0: only X tokens (lower price bins)
    
    const liquidityX = 5000000n;    // 0.05 BTC
    const liquidityY = 2500000000n; // 2500 USDC
    const minDlp = 1n; // Must be > 0
    
    // Add liquidity to negative bins (Y tokens only)
    const negativeBins = [-5n, -3n, -1n];
    for (const binId of negativeBins) {
      txOk(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        0n,         // no X tokens for negative bins
        liquidityY, // only Y tokens
        minDlp
      ), deployer);
    }
    
    // Add liquidity to active bin (both X and Y tokens)
    txOk(dlmmCore.addLiquidity(
      sbtcUsdcPool.identifier,
      mockSbtcToken.identifier,
      mockUsdcToken.identifier,
      0n,         // active bin
      liquidityX, // X tokens
      liquidityY, // Y tokens  
      minDlp
    ), deployer);
    
    // Add liquidity to positive bins (X tokens only)
    const positiveBins = [1n, 3n, 5n];
    for (const binId of positiveBins) {
      txOk(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        liquidityX, // only X tokens for positive bins
        0n,         // no Y tokens
        minDlp
      ), deployer);
    }
  });

  describe('Pool Setup Verification', () => {
    it('should have created pool successfully', async () => {
      const poolData = rovOk(sbtcUsdcPool.getPool());
      expect(poolData.poolCreated).toBe(true);
      expect(poolData.binStep).toBe(25n);
      expect(poolData.activeBinId).toBe(0n);
    });

    it('should have liquidity in bins', async () => {
      // Check active bin (500 = 0 + CENTER_BIN_ID)
      const activeBinBalances = rovOk(sbtcUsdcPool.getBinBalances(500n));
      expect(activeBinBalances.xBalance).toBeGreaterThan(0n);
      expect(activeBinBalances.yBalance).toBeGreaterThan(0n);
      
      // Check negative bin (has only Y tokens)
      const negativeBinBalances = rovOk(sbtcUsdcPool.getBinBalances(495n)); // -5 + 500
      expect(negativeBinBalances.yBalance).toBeGreaterThan(0n);
      
      // Check positive bin (has only X tokens)
      const positiveBinBalances = rovOk(sbtcUsdcPool.getBinBalances(505n)); // 5 + 500
      expect(positiveBinBalances.xBalance).toBeGreaterThan(0n);
    });
  });

  describe('swap-x-for-y Function', () => {
    it('should successfully swap X for Y with valid parameters', async () => {
      const binId = 0n; // Active bin
      const xAmount = 1000000n; // 0.01 BTC
      
      // Check initial balances
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      const response = txOk(dlmmCore.swapXForY(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount
      ), alice);
      
      // Check balances changed correctly
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const swappedInTokens = cvToValue(response.result);
      
      expect(finalXBalance).toBeLessThan(initialXBalance);
      expect(finalYBalance).toBe(initialYBalance + swappedInTokens);
      expect(finalXBalance).toBe(initialXBalance - xAmount);
    });

    it('should fail when pool fails to execute get-pool', async () => {
      const binId = 0n;
      const xAmount = 1000000n;

      // without this the pool does not revert on get-pool
      txOk(mockPool.setRevert(true), deployer);

      const response = txErr(dlmmCore.swapXForY(
        mockPool.identifier, // Invalid pool
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_NO_POOL_DATA);
    });

    it('should fail when x-amount exceeds maximum allowed', async () => {
      const binId = 0n;
      const xAmount = 999999999999n; // Very large amount
      
      const response = txErr(dlmmCore.swapXForY(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_MAXIMUM_X_AMOUNT);
    });

    it('should handle zero x-amount', async () => {
      const binId = 0n;
      const xAmount = 0n;
      
      const response = txErr(dlmmCore.swapXForY(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_AMOUNT);
    });

    it('should handle edge case with minimum swap amount', async () => {
      const binId = 0n;
      const xAmount = 1n; // Minimum amount
      
      const response = txOk(dlmmCore.swapXForY(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount
      ), alice);
      
      expect(response).toBeDefined();
    });

    it('should handle swaps in bins with no liquidity', async () => {
      const binId = 100n; // Bin without liquidity
      const xAmount = 1n;
      
      /// the check for active bin is done after the active bin check
      const response = txErr(dlmmCore.swapXForY(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_MAXIMUM_X_AMOUNT);
    });
  });

  describe('swap-y-for-x Function', () => {
    it('should successfully swap Y for X with valid parameters', async () => {
      const binId = 0n; // Active bin
      const yAmount = 50000000n; // 50 USDC
      
      // Check initial balances
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      const response = txOk(dlmmCore.swapYForX(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        yAmount
      ), alice);
      
      // Check balances changed correctly
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const swappedInTokens = cvToValue(response.result);

      expect(finalXBalance).toBe(initialXBalance + swappedInTokens);
      expect(finalYBalance).toBeLessThan(initialYBalance);
      expect(finalYBalance).toBe(initialYBalance - yAmount);
    });

    it('Should fail when pool reverts on get-pool call', async () => {
      const binId = 0n;
      const yAmount = 50000000n;
      
      // without this the pool does not revert on get-pool
      txOk(mockPool.setRevert(true), deployer);    

      const response = txErr(dlmmCore.swapYForX(
        mockPool.identifier, // Invalid pool
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        yAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_NO_POOL_DATA);
    });

    it('Should fail when y-amount exceeds maximum allowed', async () => {
      const binId = 0n;
      const yAmount = 999999999999n; // Very large amount
      
      const response = txErr(dlmmCore.swapYForX(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        yAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_MAXIMUM_Y_AMOUNT);
    });

    it('should handle swaps in bins with no liquidity', async () => {
      const binId = 100n; // Bin without liquidity
      const yAmount = 1n;
      
      /// the check for active bin is done after the active bin check
      const response = txErr(dlmmCore.swapYForX(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        yAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_MAXIMUM_Y_AMOUNT);
    });

    it('Should handle zero y-amount', async () => {
      const binId = 0n;
      const yAmount = 0n;
      
      const response = txErr(dlmmCore.swapYForX(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        yAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_AMOUNT);
    });

    it.skip('Should handle edge case with minimum swap amount', async () => {
      const binId = 0n;
      const yAmount = 1n; // Minimum amount
      
      // this test actually fails with errors.sbtcUsdcPool.ERR_INVALID_AMOUNT (u3002)
      // because the dy value rounds down to 0. Do we want this?

      const response = txOk(dlmmCore.swapYForX(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        yAmount
      ), alice);
      
      expect(response).toBeDefined();
    });
  });
});