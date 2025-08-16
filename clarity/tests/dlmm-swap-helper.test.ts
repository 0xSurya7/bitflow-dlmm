import {
  alice,
  deployer,
  dlmmSwapHelper,
  errors,
  sbtcUsdcPool,
  mockSbtcToken,
  mockUsdcToken,
  mockPool,
  setupTestEnvironment
} from "./helpers";

import { describe, it, expect, beforeEach } from 'vitest';
import {
  cvToValue,
} from '@clarigen/core';
import { txErr, txOk, rovOk } from '@clarigen/test';

let addBulkLiquidityOutput: { bin: bigint; xAmount: bigint; yAmount: bigint; liquidity: bigint;}[];

describe('DLMM Swap Helper Functions', () => {
  
  beforeEach(async () => {
    addBulkLiquidityOutput = setupTestEnvironment();
  });

  describe('swap-helper Function', () => {
    it('should successfully execute single swap with valid parameters', async () => {
      const swaps = [{
        poolTrait: sbtcUsdcPool.identifier,
        xTokenTrait: mockSbtcToken.identifier,
        yTokenTrait: mockUsdcToken.identifier,
        binId: 0,
        amount: 1000000n, // 0.01 BTC
        xForY: true
      }];
      const minReceived = 1n;
      const maxUnfavorableBins = 5n;
      
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      const response = txOk(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const received = cvToValue(response.result);
      
      expect(finalXBalance).toBeLessThan(initialXBalance);
      expect(finalYBalance).toBe(initialYBalance + received);
      expect(received).toBeGreaterThan(0n);
    });

    it('should successfully execute 2 swaps in same pool', async () => {
      const swaps = [
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 0,
          amount: 500000n, // 0.005 BTC
          xForY: true
        },
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 1,
          amount: 500000n, // 0.005 BTC
          xForY: true
        }
      ];
      const minReceived = 1n;
      const maxUnfavorableBins = 10n;
      
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      const response = txOk(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const received = cvToValue(response.result);
      
      expect(finalXBalance).toBe(initialXBalance - 1000000n); // Total amount swapped
      expect(finalYBalance).toBe(initialYBalance + received);
      expect(received).toBeGreaterThan(0n);
    });

    it('should successfully execute 3 swaps in same pool (different bins)', async () => {
      const swaps = [
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 0,
          amount: 300000n, // 0.003 BTC
          xForY: true
        },
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 1,
          amount: 300000n, // 0.003 BTC
          xForY: true
        },
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 2,
          amount: 300000n, // 0.003 BTC
          xForY: true
        }
      ];
      const minReceived = 1n;
      const maxUnfavorableBins = 10n;
      
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      const response = txOk(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const received = cvToValue(response.result);
      
      expect(finalXBalance).toBe(initialXBalance - 900000n); // Total amount swapped (3 * 300000n)
      expect(finalYBalance).toBe(initialYBalance + received);
      expect(received).toBeGreaterThan(0n);
    });

    it('should successfully execute 2 swaps in same pool in the same bin', async () => {
      const swaps = [
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 0,
          amount: 400000n, // 0.004 BTC
          xForY: true
        },
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 0,
          amount: 600000n, // 0.006 BTC
          xForY: true
        }
      ];
      const minReceived = 1n;
      const maxUnfavorableBins = 5n;
      
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      const response = txOk(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const received = cvToValue(response.result);
      
      expect(finalXBalance).toBe(initialXBalance - 1000000n); // Total amount swapped (400000n + 600000n)
      expect(finalYBalance).toBe(initialYBalance + received);
      expect(received).toBeGreaterThan(0n);
    });

    it('should execute Y for X swaps successfully', async () => {
      const swaps = [{
        poolTrait: sbtcUsdcPool.identifier,
        xTokenTrait: mockSbtcToken.identifier,
        yTokenTrait: mockUsdcToken.identifier,
        binId: 0,
        amount: 50000000n, // 50 USDC
        xForY: false
      }];
      const minReceived = 1n;
      const maxUnfavorableBins = 5n;
      
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      const response = txOk(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const received = cvToValue(response.result);
      
      expect(finalXBalance).toBe(initialXBalance + received);
      expect(finalYBalance).toBeLessThan(initialYBalance);
      expect(received).toBeGreaterThan(0n);
    });

    it('should fail when minimum received not met', async () => {
      const swaps = [{
        poolTrait: sbtcUsdcPool.identifier,
        xTokenTrait: mockSbtcToken.identifier,
        yTokenTrait: mockUsdcToken.identifier,
        binId: 0,
        amount: 1000000n,
        xForY: true
      }];
      const minReceived = 999999999999n; // Unreasonably high minimum
      const maxUnfavorableBins = 5n;
      
      const response = txErr(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmSwapHelper.ERR_MINIMUM_RECEIVED);
    });

    it('should fail when unfavorable bins exceed maximum', async () => {
      const swaps = [{
        poolTrait: sbtcUsdcPool.identifier,
        xTokenTrait: mockSbtcToken.identifier,
        yTokenTrait: mockUsdcToken.identifier,
        binId: -10, // Very unfavorable bin for X for Y swap
        amount: 1000000n,
        xForY: true
      }];
      const minReceived = 1n;
      const maxUnfavorableBins = 5n; // Lower than the unfavorable bin count
      
      const response = txErr(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmSwapHelper.ERR_BIN_SLIPPAGE);
    });

    it('should handle empty swap list', async () => {
      const swaps: any[] = [];
      const minReceived = 0n;
      const maxUnfavorableBins = 5n;
      
      const response = txOk(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      const received = cvToValue(response.result);
      expect(received).toBe(0n);
    });

    it('should handle swaps with zero amounts', async () => {
      const swaps = [{
        poolTrait: sbtcUsdcPool.identifier,
        xTokenTrait: mockSbtcToken.identifier,
        yTokenTrait: mockUsdcToken.identifier,
        binId: 0,
        amount: 0n,
        xForY: true
      }];
      const minReceived = 0n;
      const maxUnfavorableBins = 5n;
      
      // This should fail at the core swap level with invalid amount
      const response = txErr(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      // The error should propagate from the dlmm-core swap function
      expect(cvToValue(response.result)).toBe(errors.dlmmCore.ERR_INVALID_AMOUNT);
    });

    it('should calculate unfavorable bins correctly for X for Y swaps', async () => {
      // For X for Y swaps, bins with ID less than active bin are unfavorable
      // bin-id-delta = active-bin-id - bin-id, unfavorable when bin-id-delta > 0
      const swaps = [{
        poolTrait: sbtcUsdcPool.identifier,
        xTokenTrait: mockSbtcToken.identifier,
        yTokenTrait: mockUsdcToken.identifier,
        binId: -3, // active-bin(0) - (-3) = 3, unfavorable since 3 > 0
        amount: 1000000n,
        xForY: true
      }];
      const minReceived = 1n;
      const maxUnfavorableBins = 2n; // Should fail as unfavorable count is 3
      
      const response = txErr(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmSwapHelper.ERR_BIN_SLIPPAGE);
    });

    it('should calculate unfavorable bins correctly for Y for X swaps', async () => {
      // For Y for X swaps, bins with ID greater than active bin are unfavorable  
      // bin-id-delta = active-bin-id - bin-id, unfavorable when bin-id-delta < 0
      const swaps = [{
        poolTrait: sbtcUsdcPool.identifier,
        xTokenTrait: mockSbtcToken.identifier,
        yTokenTrait: mockUsdcToken.identifier,
        binId: 3, // active-bin(0) - 3 = -3, unfavorable since -3 < 0
        amount: 50000000n,
        xForY: false
      }];
      const minReceived = 1n;
      const maxUnfavorableBins = 2n; // Should fail as unfavorable count is 3
      
      const response = txErr(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmSwapHelper.ERR_BIN_SLIPPAGE);
    });

    it('should handle mixed favorable and unfavorable swaps', async () => {
      const swaps = [
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 0, // Favorable (active bin)
          amount: 500000n,
          xForY: true
        },
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 2, // Unfavorable (2 bins away)
          amount: 500000n,
          xForY: true
        }
      ];
      const minReceived = 1n;
      const maxUnfavorableBins = 3n; // Should pass as total unfavorable is 2
      
      const response = txOk(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      const received = cvToValue(response.result);
      expect(received).toBeGreaterThan(0n);
    });

    it('should document ERR_NO_ACTIVE_BIN_DATA error condition', async () => {
      // ERR_NO_ACTIVE_BIN_DATA occurs when pool-trait.get-active-bin-id() fails
      // This is difficult to trigger with valid contracts as get-active-bin-id is a simple read
      // In practice, this error would occur if:
      // 1. The pool contract is not properly initialized
      // 2. The pool contract has internal state corruption
      // 3. The pool contract explicitly returns an error from get-active-bin-id
      
      // without this the pool does not revert on get-active-bin-id
      txOk(mockPool.setRevert(true), deployer);

      const swaps = [{
        poolTrait: mockPool.identifier,
        xTokenTrait: mockSbtcToken.identifier,
        yTokenTrait: mockUsdcToken.identifier,
        binId: 0,
        amount: 1000000n,
        xForY: true
      }];
      const minReceived = 1n;
      const maxUnfavorableBins = 5n;
      
      const response = txErr(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);

      expect(cvToValue(response.result)).toBe(errors.dlmmSwapHelper.ERR_NO_ACTIVE_BIN_DATA);
    });

    it('should handle edge case with extremely large unfavorable bin count', async () => {
      const swaps = [{
        poolTrait: sbtcUsdcPool.identifier,
        xTokenTrait: mockSbtcToken.identifier,
        yTokenTrait: mockUsdcToken.identifier,
        binId: -500, // Very far from active bin to maximize unfavorable count
        amount: 1000000n,
        xForY: true
      }];
      const minReceived = 1n;
      const maxUnfavorableBins = 1n; // Very low threshold
      
      const response = txErr(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      expect(cvToValue(response.result)).toBe(errors.dlmmSwapHelper.ERR_BIN_SLIPPAGE);
    });

    it('should document attempt to trigger ERR_NO_RESULT_DATA through multiple complex swaps', async () => {
      // ERR_NO_RESULT_DATA occurs when the result parameter in fold-swap-helper is an error
      // This is challenging to trigger directly as it's an internal fold state
      // This test documents the theoretical scenario
      const swaps = [
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 0,
          amount: 1000000n,
          xForY: true
        }
      ];
      const minReceived = 1n;
      const maxUnfavorableBins = 5n;
      
      // In normal circumstances this should succeed
      // ERR_NO_RESULT_DATA would require internal fold failure
      const response = txOk(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      expect(cvToValue(response.result)).toBeGreaterThan(0n);
    });

    it('should handle maximum number of swaps in a single call', async () => {
      // Test with multiple swaps to stress test the fold function
      const swaps = Array.from({ length: 10 }, (_, i) => ({
        poolTrait: sbtcUsdcPool.identifier,
        xTokenTrait: mockSbtcToken.identifier,
        yTokenTrait: mockUsdcToken.identifier,
        binId: i - 5, // Range from -5 to 4
        amount: 100000n, // 0.001 BTC each
        xForY: true
      }));
      const minReceived = 1n;
      const maxUnfavorableBins = 50n; // High threshold to allow all swaps
      
      const initialXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const initialYBalance = rovOk(mockUsdcToken.getBalance(alice));
      
      const response = txOk(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      const finalXBalance = rovOk(mockSbtcToken.getBalance(alice));
      const finalYBalance = rovOk(mockUsdcToken.getBalance(alice));
      const received = cvToValue(response.result);
      
      expect(finalXBalance).toBe(initialXBalance - 1000000n); // Total: 10 * 100000n
      expect(finalYBalance).toBe(initialYBalance + received);
      expect(received).toBeGreaterThan(0n);
    });

    it('should handle mixed X-for-Y and Y-for-X swaps', async () => {
      const swaps = [
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 0,
          amount: 500000n, // 0.005 BTC
          xForY: true
        },
        {
          poolTrait: sbtcUsdcPool.identifier,
          xTokenTrait: mockSbtcToken.identifier,
          yTokenTrait: mockUsdcToken.identifier,
          binId: 0,
          amount: 25000000n, // 25 USDC
          xForY: false
        }
      ];
      const minReceived = 0n; // Allow any amount since we're doing opposite swaps
      const maxUnfavorableBins = 5n;
      
      const response = txOk(dlmmSwapHelper.swapHelper(
        swaps,
        minReceived,
        maxUnfavorableBins
      ), alice);
      
      const received = cvToValue(response.result);
      expect(received).toBeGreaterThanOrEqual(0n);
    });
  });
});