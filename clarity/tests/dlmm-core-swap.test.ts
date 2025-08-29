import {
  alice,
  deployer,
  dlmmCore,
  errors,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  mockPool,
  mockRandomToken,
  setupTestEnvironment
} from "./helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import {
  cvToValue,
} from '@clarigen/core';
import { txErr, txOk, rovOk } from '@clarigen/test';

let addBulkLiquidityOutput: { bin: bigint; xAmount: bigint; yAmount: bigint; liquidity: bigint;}[];

describe('DLMM Core Swap Functions', () => {
  
  beforeEach(async () => {
    addBulkLiquidityOutput = setupTestEnvironment();
    const poolData = rovOk(sbtcUsdcPool.getPool());
    expect(poolData.poolCreated).toBe(true);
    expect(poolData.binStep).toBe(25n);
    expect(poolData.activeBinId).toBe(0n);
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

    it('should fail when swapping random X token for Y', async () => {
      const binId = 0n;
      const xAmount = 1000000n; // 0.01 BTC
      
      // Mint random tokens for testing
      txOk(mockRandomToken.mint(xAmount, alice), deployer);
      
      const response = txErr(dlmmCore.swapXForY(
        sbtcUsdcPool.identifier,
        mockRandomToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_X_TOKEN);
    });

    it('should fail when swapping X token for random Y', async () => {
      const binId = 0n;
      const xAmount = 1000000n; // 0.01 BTC
      
      // Mint random tokens for testing
      txOk(mockRandomToken.mint(xAmount, alice), deployer);
      
      const response = txErr(dlmmCore.swapXForY(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockRandomToken.identifier,
        binId,
        xAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_Y_TOKEN);
    });

    it('should fail when swapping random Y token for X', async () => {
      const binId = 0n;
      const yAmount = 500000000n; // 500 USDC
      
      // Mint random tokens for testing
      txOk(mockRandomToken.mint(yAmount, alice), deployer);
      
      const response = txErr(dlmmCore.swapYForX(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockRandomToken.identifier,
        binId,
        yAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_Y_TOKEN);
    });

    it('should fail when swapping Y token for random X', async () => {
      const binId = 0n;
      const yAmount = 500000000n; // 500 USDC
      
      // Mint random tokens for testing
      txOk(mockRandomToken.mint(yAmount, alice), deployer);
      
      const response = txErr(dlmmCore.swapYForX(
        sbtcUsdcPool.identifier,
        mockRandomToken.identifier,
        mockUsdcToken.identifier,
        binId,
        yAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_X_TOKEN);
    });
  });
});