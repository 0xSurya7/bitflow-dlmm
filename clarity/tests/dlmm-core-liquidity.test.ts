import {
  alice,
  bob,
  deployer,
  dlmmCore,
  errors,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  mockPool,
  mockRandomToken,
  setupTestEnvironment,
  getSbtcUsdcPoolLpBalance,
  addLiquidityToBins
} from "./helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import {
  cvToValue,
} from '@clarigen/core';
import { txErr, txOk, rovOk } from '@clarigen/test';
import {
  captureBinState,
  captureUserState,
  checkAddLiquidityInvariants,
  checkWithdrawLiquidityInvariants,
  checkMoveLiquidityInvariants,
} from "./invariants";

let addBulkLiquidityOutput: { bin: bigint; xAmount: bigint; yAmount: bigint; liquidity: bigint;}[];

describe('DLMM Core Liquidity Functions', () => {
  
  beforeEach(async () => {
    addBulkLiquidityOutput = setupTestEnvironment();
      const poolData = rovOk(sbtcUsdcPool.getPool());
      expect(poolData.poolCreated).toBe(true);
      expect(poolData.binStep).toBe(25n);
      expect(poolData.activeBinId).toBe(0n);

      expect(addBulkLiquidityOutput.length).toBe(9);
      
      // Verify active bin has both tokens
      const activeBinEntry = addBulkLiquidityOutput.find(entry => entry.bin === 0n);
      expect(activeBinEntry).toBeDefined();
      expect(activeBinEntry!.xAmount).toBeGreaterThan(0n);
      expect(activeBinEntry!.yAmount).toBeGreaterThan(0n);
      expect(activeBinEntry!.liquidity).toBeGreaterThan(0n);
      
      // Verify negative bins have only Y tokens
      const negativeBinEntry = addBulkLiquidityOutput.find(entry => entry.bin === -1n);
      expect(negativeBinEntry).toBeDefined();
      expect(negativeBinEntry!.xAmount).toBe(0n);
      expect(negativeBinEntry!.yAmount).toBeGreaterThan(0n);
      expect(negativeBinEntry!.liquidity).toBeGreaterThan(0n);
      
      // Verify positive bins have only X tokens
      const positiveBinEntry = addBulkLiquidityOutput.find(entry => entry.bin === 1n);
      expect(positiveBinEntry).toBeDefined();
      expect(positiveBinEntry!.xAmount).toBeGreaterThan(0n);
      expect(positiveBinEntry!.yAmount).toBe(0n);
      expect(positiveBinEntry!.liquidity).toBeGreaterThan(0n);

  });

  describe('add-liquidity Function', () => {
    it('should successfully add liquidity to active bin', async () => {
      const binId = 0n; // Active bin
      const xAmount = 1000000n; // 0.01 BTC
      const yAmount = 500000000n; // 500 USDC
      const minDlp = 1n;
      
      // Capture state before add liquidity
      const beforeBin = captureBinState(binId);
      const beforeUser = captureUserState(alice, binId);
      
      const response = txOk(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount,
        yAmount,
        minDlp,
        1000000n, // max-x-liquidity-fee
        1000000n  // max-y-liquidity-fee
      ), alice);
      
      // Capture state after add liquidity
      const afterBin = captureBinState(binId);
      const afterUser = captureUserState(alice, binId);
      const liquidityReceived = cvToValue(response.result);
      
      // Check balances changed correctly
      expect(afterUser.xTokenBalance).toBe(beforeUser.xTokenBalance - xAmount);
      expect(afterUser.yTokenBalance).toBe(beforeUser.yTokenBalance - yAmount);
      expect(afterUser.lpTokenBalance).toBe(beforeUser.lpTokenBalance + liquidityReceived);
      expect(liquidityReceived).toBeGreaterThan(0n);
      expect(liquidityReceived).toBeGreaterThanOrEqual(minDlp);
      
      // Check invariants
      const invariantCheck = checkAddLiquidityInvariants(
        beforeBin,
        afterBin,
        beforeUser,
        afterUser,
        xAmount,
        yAmount,
        liquidityReceived,
        minDlp
      );
      
      if (!invariantCheck.passed) {
        throw new Error(`Invariant violations: ${invariantCheck.errors.join('; ')}`);
      }
    });

    it('should successfully add only Y tokens to bin below active', async () => {
      const binId = -2n; // Below active bin
      const xAmount = 0n; // No X tokens for bins below active
      const yAmount = 500000000n; // 500 USDC
      const minDlp = 1n;
      
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      // Alice initially has no liquidity in this bin
      const initialLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      
      const response = txOk(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount,
        yAmount,
        minDlp,
        1000000n, // max-x-liquidity-fee
        1000000n  // max-y-liquidity-fee
      ), alice);
      
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const finalLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const liquidityReceived = cvToValue(response.result);
      
      expect(finalYBalance).toBe(initialYBalance - yAmount);
      expect(finalLiquidityBalance).toBe(initialLiquidityBalance + liquidityReceived);
      expect(liquidityReceived).toBeGreaterThan(0n);
    });

    it('should successfully add only X tokens to bin above active', async () => {
      const binId = 2n; // Above active bin
      const xAmount = 1000000n; // 0.01 BTC
      const yAmount = 0n; // No Y tokens for bins above active
      const minDlp = 1n;
      
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      // Alice initially has no liquidity in this bin
      const initialLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      
      const response = txOk(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount,
        yAmount,
        minDlp,
        1000000n, // max-x-liquidity-fee
        1000000n  // max-y-liquidity-fee
      ), alice);
      
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const liquidityReceived = cvToValue(response.result);
      
      expect(finalXBalance).toBe(initialXBalance - xAmount);
      expect(finalLiquidityBalance).toBe(initialLiquidityBalance + liquidityReceived);
      expect(liquidityReceived).toBeGreaterThan(0n);
    });

    it('should fail when minimum DLP not met', async () => {
      const binId = 0n;
      const xAmount = 100n; // Very small amount
      const yAmount = 50000n; // Very small amount  
      const minDlp = 999999999999n; // Unreasonably high minimum
      
      const response = txErr(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount,
        yAmount,
        minDlp,
        1000000n, // max-x-liquidity-fee
        1000000n  // max-y-liquidity-fee
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_MINIMUM_LP_AMOUNT);
    });

    it('should fail when using random X token', async () => {
      const binId = 0n;
      const xAmount = 1000000n;
      const yAmount = 500000000n;
      const minDlp = 1n;
      
      // Mint random tokens for testing
      txOk(mockRandomToken.mint(xAmount, alice), deployer);
      
      const response = txErr(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockRandomToken.identifier,
        mockUsdcToken.identifier,
        binId,
        xAmount,
        yAmount,
        minDlp,
        1000000n, // max-x-liquidity-fee
        1000000n  // max-y-liquidity-fee
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_X_TOKEN);
    });

    it('should fail when using random Y token', async () => {
      const binId = 0n;
      const xAmount = 1000000n;
      const yAmount = 500000000n;
      const minDlp = 1n;
      
      // Mint random tokens for testing
      txOk(mockRandomToken.mint(yAmount, alice), deployer);
      
      const response = txErr(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockRandomToken.identifier,
        binId,
        xAmount,
        yAmount,
        minDlp,
        1000000n, // max-x-liquidity-fee
        1000000n  // max-y-liquidity-fee
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_Y_TOKEN);
    });
  });

  describe('withdraw-liquidity Function', () => {

    beforeEach(async () => {
      // Add initial liquidity for alice to enable withdrawal tests using helper function
      const binsToAddLiquidity = [
        { bin: 0n, xAmount: 10000000n, yAmount: 5000000000n }, // Active bin
        { bin: 1n, xAmount: 5000000n, yAmount: 0n }, // Above active bin - only X tokens
        { bin: -1n, xAmount: 0n, yAmount: 2500000000n }, // Below active bin - only Y tokens
      ];
      
      addLiquidityToBins(
        binsToAddLiquidity,
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        alice
      );
    });

    it('should successfully withdraw liquidity from active bin', async () => {
      const binId = 0n; // Active bin
      
      // Capture state before withdraw
      const beforeBin = captureBinState(binId);
      const beforeUser = captureUserState(alice, binId);
      
      // Use existing liquidity from beforeEach
      const initialLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const amountToWithdraw = initialLiquidityBalance / 2n; // Withdraw half
      const minXAmount = 1n;
      const minYAmount = 1n;
      
      const response = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        minXAmount,
        minYAmount
      ), alice);
      
      // Capture state after withdraw
      const afterBin = captureBinState(binId);
      const afterUser = captureUserState(alice, binId);
      const withdrawResult = cvToValue(response.result);
      
      // Check balances changed correctly
      expect(afterUser.xTokenBalance).toBe(beforeUser.xTokenBalance + withdrawResult.xAmount);
      expect(afterUser.yTokenBalance).toBe(beforeUser.yTokenBalance + withdrawResult.yAmount);
      expect(afterUser.lpTokenBalance).toBe(beforeUser.lpTokenBalance - amountToWithdraw);
      expect(withdrawResult.xAmount).toBeGreaterThan(0n);
      expect(withdrawResult.yAmount).toBeGreaterThan(0n);
      expect(withdrawResult.xAmount).toBeGreaterThanOrEqual(minXAmount);
      expect(withdrawResult.yAmount).toBeGreaterThanOrEqual(minYAmount);
      
      // Check invariants
      const invariantCheck = checkWithdrawLiquidityInvariants(
        beforeBin,
        afterBin,
        beforeUser,
        afterUser,
        amountToWithdraw,
        withdrawResult.xAmount,
        withdrawResult.yAmount,
        minXAmount,
        minYAmount
      );
      
      if (!invariantCheck.passed) {
        throw new Error(`Invariant violations: ${invariantCheck.errors.join('; ')}`);
      }
    });

    it('should successfully withdraw Y tokens from bin below active', async () => {
      const binId = -1n; // Below active bin - has only Y tokens
      
      // Use existing liquidity from beforeEach
      const initialLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const amountToWithdraw = initialLiquidityBalance / 3n; // Withdraw one third
      const minXAmount = 0n; // Don't expect X tokens
      const minYAmount = 1n; // Expect Y tokens
      
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      const response = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        minXAmount,
        minYAmount
      ), alice);
      
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const finalLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const withdrawResult = cvToValue(response.result);
      
      expect(finalXBalance).toBe(initialXBalance + withdrawResult.xAmount);
      expect(finalYBalance).toBe(initialYBalance + withdrawResult.yAmount);
      expect(finalLiquidityBalance).toBe(initialLiquidityBalance - amountToWithdraw);
      expect(withdrawResult.xAmount).toBe(0n); // No X tokens from bin below active
      expect(withdrawResult.yAmount).toBeGreaterThan(0n);
      expect(withdrawResult.yAmount).toBeGreaterThanOrEqual(minYAmount);
    });

    it('should successfully withdraw X tokens from bin above active', async () => {
      const binId = 1n; // Above active bin - has only X tokens
      const liquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const amountToWithdraw = liquidityBalance / 3n; // Withdraw one third
      const minXAmount = 1n; // Expect X tokens
      const minYAmount = 0n; // Don't expect Y tokens

      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const initialLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      

      const response = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        minXAmount,
        minYAmount
      ), alice);

      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const finalLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const withdrawResult = cvToValue(response.result);

      expect(finalXBalance).toBe(initialXBalance + withdrawResult.xAmount);
      expect(finalYBalance).toBe(initialYBalance + withdrawResult.yAmount);
      expect(finalLiquidityBalance).toBe(initialLiquidityBalance - amountToWithdraw);
      expect(withdrawResult.xAmount).toBeGreaterThan(0n);
      expect(withdrawResult.yAmount).toBe(0n); // No Y tokens from bin above active
      expect(withdrawResult.xAmount).toBeGreaterThanOrEqual(minXAmount);
    });

    it('should withdraw complete liquidity position', async () => {
      const binId = 0n; // Active bin
      const liquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const amountToWithdraw = liquidityBalance; // Withdraw all
      const minXAmount = 1n;
      const minYAmount = 1n;
      
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      const response = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        minXAmount,
        minYAmount
      ), alice);
      
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const finalLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const withdrawResult = cvToValue(response.result);
      
      expect(finalXBalance).toBe(initialXBalance + withdrawResult.xAmount);
      expect(finalYBalance).toBe(initialYBalance + withdrawResult.yAmount);
      expect(finalLiquidityBalance).toBe(0n); // All liquidity withdrawn
      expect(withdrawResult.xAmount).toBeGreaterThan(0n);
      expect(withdrawResult.yAmount).toBeGreaterThan(0n);
    });

    it('should withdraw multiple partial amounts from same bin', async () => {
      const binId = 0n; // Active bin
      const initialLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const firstWithdrawAmount = initialLiquidityBalance / 4n; // Withdraw 1/4
      const secondWithdrawAmount = initialLiquidityBalance / 4n; // Withdraw another 1/4
      const minXAmount = 1n;
      const minYAmount = 1n;
      
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      // First withdrawal
      const firstResponse = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        firstWithdrawAmount,
        minXAmount,
        minYAmount
      ), alice);
      
      const afterFirstLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const firstWithdrawResult = cvToValue(firstResponse.result);
      
      // Second withdrawal
      const secondResponse = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        secondWithdrawAmount,
        minXAmount,
        minYAmount
      ), alice);
      
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const finalLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const secondWithdrawResult = cvToValue(secondResponse.result);
      
      expect(afterFirstLiquidityBalance).toBe(initialLiquidityBalance - firstWithdrawAmount);
      expect(finalLiquidityBalance).toBe(initialLiquidityBalance - firstWithdrawAmount - secondWithdrawAmount);
      expect(finalXBalance).toBe(initialXBalance + firstWithdrawResult.xAmount + secondWithdrawResult.xAmount);
      expect(finalYBalance).toBe(initialYBalance + firstWithdrawResult.yAmount + secondWithdrawResult.yAmount);
    });

    it('should fail when minimum X amount not met', async () => {
      const binId = 0n; // Active bin
      const liquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const amountToWithdraw = liquidityBalance / 10n; // Small withdrawal
      const minXAmount = 999999999999n; // Unreasonably high minimum
      const minYAmount = 1n;
      
      const response = txErr(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        minXAmount,
        minYAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_MINIMUM_X_AMOUNT);
    });

    it('should fail when minimum Y amount not met', async () => {
      const binId = 0n; // Active bin
      const liquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const amountToWithdraw = liquidityBalance / 10n; // Small withdrawal
      const minXAmount = 1n;
      const minYAmount = 999999999999n; // Unreasonably high minimum
      
      const response = txErr(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        minXAmount,
        minYAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_MINIMUM_Y_AMOUNT);
    });

    it('should fail when withdrawing more liquidity than available', async () => {
      const binId = 0n; // Active bin
      const liquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const amountToWithdraw = liquidityBalance + 1000000n; // More than available
      const minXAmount = 1n;
      const minYAmount = 1n;
      
      const response = txErr(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        minXAmount,
        minYAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.sbtcUsdcPool.ERR_INVALID_AMOUNT);
    });

    it('should fail when withdrawing zero amount', async () => {
      const binId = 0n; // Active bin
      const amountToWithdraw = 0n; // Zero amount
      const minXAmount = 0n;
      const minYAmount = 0n;
      
      const response = txErr(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        minXAmount,
        minYAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_AMOUNT);
    });

    it('should fail when pool fails to execute get-pool', async () => {
      const binId = 0n;
      const amountToWithdraw = 1000000n;
      const minXAmount = 1n;
      const minYAmount = 1n;

      // Set mock pool to revert
      txOk(mockPool.setRevert(true), deployer);

      const response = txErr(dlmmCore.withdrawLiquidity(
        mockPool.identifier, // Invalid pool that reverts
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        minXAmount,
        minYAmount
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_NO_POOL_DATA);
    });

    it('should fail when withdrawing from bin with no liquidity', async () => {
      const binId = 10n; // Bin with no liquidity added
      const liquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      expect(liquidityBalance).toBe(0n); // Verify no liquidity exists
      
      const amountToWithdraw = 1000000n;
      const minXAmount = 1n;
      const minYAmount = 1n;
      
      // This test reveals a division by zero bug in the contract when totalSupply is 0
     const response = txErr(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        minXAmount,
        minYAmount
      ), alice);
      // expect to revert and will set error code once it's set
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_NO_BIN_SHARES);
    });

    it('should handle withdrawals from different users independently', async () => {
      const binId = 0n; // Active bin
      
      // Add liquidity for bob
      txOk(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        3000000n, // 0.03 BTC
        1500000000n, // 1500 USDC
        1n,
        1000000n, // max-x-liquidity-fee
        1000000n  // max-y-liquidity-fee
      ), bob);
      
      const aliceLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const bobLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, bob);
      const aliceWithdrawAmount = aliceLiquidityBalance / 2n;
      const bobWithdrawAmount = bobLiquidityBalance / 3n;
      
      const initialAliceX = rovOk(mockSbtcToken.getBalance(alice));
      const initialBobX = rovOk(mockSbtcToken.getBalance(bob));
      
      // Alice withdraws
      const aliceResponse = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        aliceWithdrawAmount,
        1n,
        1n
      ), alice);
      
      // Bob withdraws  
      const bobResponse = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        bobWithdrawAmount,
        1n,
        1n
      ), bob);
      
      const finalAliceX = rovOk(mockSbtcToken.getBalance(alice));
      const finalBobX = rovOk(mockSbtcToken.getBalance(bob));
      const finalAliceLiquidity = getSbtcUsdcPoolLpBalance(binId, alice);
      const finalBobLiquidity = getSbtcUsdcPoolLpBalance(binId, bob);
      
      const aliceResult = cvToValue(aliceResponse.result);
      const bobResult = cvToValue(bobResponse.result);
      
      expect(finalAliceX).toBe(initialAliceX + aliceResult.xAmount);
      expect(finalBobX).toBe(initialBobX + bobResult.xAmount);
      expect(finalAliceLiquidity).toBe(aliceLiquidityBalance - aliceWithdrawAmount);
      expect(finalBobLiquidity).toBe(bobLiquidityBalance - bobWithdrawAmount);
    });

    it('should handle edge case with very small withdrawal amounts', async () => {
      const binId = 0n; // Active bin
      const initialLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const amountToWithdraw = initialLiquidityBalance / 10n; // Small but not too small
      const minXAmount = 1n; // Allow any amount since withdrawal is tiny
      const minYAmount = 0n;
      
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      const response = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        minXAmount,
        minYAmount
      ), alice);
      
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const finalLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const withdrawResult = cvToValue(response.result);
      
      expect(finalXBalance).toBe(initialXBalance + withdrawResult.xAmount);
      expect(finalYBalance).toBe(initialYBalance + withdrawResult.yAmount);
      expect(finalLiquidityBalance).toBe(initialLiquidityBalance - amountToWithdraw);
      expect(withdrawResult.xAmount).toBeGreaterThanOrEqual(0n);
      expect(withdrawResult.yAmount).toBeGreaterThanOrEqual(0n);
    });

    it('should calculate proportional token amounts correctly', async () => {
      const binId = 0n; // Active bin
      
      // Get current bin balances to calculate expected proportions
      const binBalances = rovOk(sbtcUsdcPool.getBinBalances(binId + 500n)); // Bin ID + CENTER_BIN_ID
      const totalSupply = rovOk(sbtcUsdcPool.getTotalSupply(binId));
      const liquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const amountToWithdraw = liquidityBalance / 2n;
      
      // Skip test if totalSupply is 0 to avoid division by zero
      if (totalSupply === 0n) {
        expect(true).toBe(true); // Skip test
        return;
      }
      
      // Calculate expected proportional amounts
      const expectedXAmount = (binBalances.xBalance * amountToWithdraw) / totalSupply;
      const expectedYAmount = (binBalances.yBalance * amountToWithdraw) / totalSupply;
      
      const response = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        0n, // Allow any amount for proportionality test
        0n
      ), alice);
      
      const withdrawResult = cvToValue(response.result);
      
      // Allow for small rounding differences
      const tolerance = 10n;
      expect(withdrawResult.xAmount).toBeGreaterThanOrEqual(expectedXAmount - tolerance);
      expect(withdrawResult.xAmount).toBeLessThanOrEqual(expectedXAmount + tolerance);
      expect(withdrawResult.yAmount).toBeGreaterThanOrEqual(expectedYAmount - tolerance);
      expect(withdrawResult.yAmount).toBeLessThanOrEqual(expectedYAmount + tolerance);
    });
  });

  describe('Mixed Liquidity Operations', () => {
    it('should handle add then withdraw in same bin', async () => {
      const binId = 3n; // Above active bin - only X tokens
      const xAmountToAdd = 2000000n; // 0.02 BTC
      const yAmountToAdd = 0n; // No Y tokens for bins above active
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
        1000000n, // max-x-liquidity-fee
        1000000n  // max-y-liquidity-fee
      ), alice);
      
      const liquidityAdded = cvToValue(addResponse.result);
      expect(liquidityAdded).toBeGreaterThan(0n);
      
      // Then withdraw half of it
      const withdrawAmount = liquidityAdded / 2n;
      const withdrawResponse = txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        withdrawAmount,
        1n, // Expect X tokens
        0n  // Don't expect Y tokens
      ), alice);
      
      const withdrawResult = cvToValue(withdrawResponse.result);
      const finalLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      
      expect(withdrawResult.xAmount).toBeGreaterThan(0n);
      expect(withdrawResult.yAmount).toBe(0n); // No Y tokens from bin above active
      expect(finalLiquidityBalance).toBe(liquidityAdded - withdrawAmount);
    });

    it('should handle multiple add/withdraw cycles', async () => {
      const binId = 0n; // Active bin
      const initialLiquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      
      // First add
      txOk(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        1000000n, // 0.01 BTC
        500000000n, // 500 USDC
        1n,
        1000000n, // max-x-liquidity-fee
        1000000n  // max-y-liquidity-fee
      ), alice);
      
      const afterFirstAdd = getSbtcUsdcPoolLpBalance(binId, alice);
      expect(afterFirstAdd).toBeGreaterThan(initialLiquidityBalance);
      
      // First withdraw
      txOk(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        (afterFirstAdd - initialLiquidityBalance) / 2n,
        1n,
        1n
      ), alice);
      
      const afterFirstWithdraw = getSbtcUsdcPoolLpBalance(binId, alice);
      expect(afterFirstWithdraw).toBeLessThan(afterFirstAdd);
      expect(afterFirstWithdraw).toBeGreaterThan(initialLiquidityBalance);
      
      // Second add
      txOk(dlmmCore.addLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockUsdcToken.identifier,
        binId,
        2000000n, // 0.02 BTC
        1000000000n, // 1000 USDC
        1n,
        1000000n, // max-x-liquidity-fee
        1000000n  // max-y-liquidity-fee
      ), alice);
      
      const afterSecondAdd = getSbtcUsdcPoolLpBalance(binId, alice);
      expect(afterSecondAdd).toBeGreaterThan(afterFirstWithdraw);
      
      // Final state should be more than initial
      expect(afterSecondAdd).toBeGreaterThan(initialLiquidityBalance);
    });

    it('should fail when withdrawing with random X token', async () => {
      const binId = 0n;
      const liquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const amountToWithdraw = liquidityBalance / 2n;
      
      // Mint random tokens for testing
      txOk(mockRandomToken.mint(1000000n, alice), deployer);
      
      const response = txErr(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockRandomToken.identifier,
        mockUsdcToken.identifier,
        binId,
        amountToWithdraw,
        1n,
        1n
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_X_TOKEN);
    });

    it('should fail when withdrawing with random Y token', async () => {
      const binId = 0n;
      const liquidityBalance = getSbtcUsdcPoolLpBalance(binId, alice);
      const amountToWithdraw = liquidityBalance / 2n;
      
      // Mint random tokens for testing
      txOk(mockRandomToken.mint(1000000n, alice), deployer);
      
      const response = txErr(dlmmCore.withdrawLiquidity(
        sbtcUsdcPool.identifier,
        mockSbtcToken.identifier,
        mockRandomToken.identifier,
        binId,
        amountToWithdraw,
        1n,
        1n
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_Y_TOKEN);
    });
  });
});