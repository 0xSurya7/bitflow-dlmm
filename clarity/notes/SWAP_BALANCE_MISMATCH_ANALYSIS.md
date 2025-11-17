# Swap Balance Mismatch Analysis

## The Problem

The fuzz test is detecting that user balance changes don't match the input amount for swaps. This is a critical finding that needs investigation.

## Example: Transaction 11

### What Happened
- **Function**: `swap-x-for-y`
- **Caller**: `ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG`
- **Bin ID**: `-1` (negative bin, should only have Y tokens)
- **Input Amount**: `165,000,110` X tokens
- **Transaction Result**: ✅ **SUCCESS**

### What We Expected
- User's X token balance should decrease by exactly `165,000,110`
- User's Y token balance should increase by some amount (based on swap rate)

### What We Found
- User's X token balance actually decreased by only `6,250,005`
- **Difference**: `158,750,105` tokens (96.2% less than expected!)

### The Discrepancy
```
Expected X balance change: 165,000,110
Actual X balance change:   6,250,005
Difference:                158,750,105 (96.2% missing!)
```

## More Examples

### Transaction 26
- **Input**: `360,000,000` X tokens
- **Actual balance change**: `8,333,335` X tokens
- **Difference**: `351,666,665` (97.7% missing!)

### Transaction 29
- **Input**: `480,000,000` X tokens
- **Actual balance change**: `8,333,335` X tokens
- **Difference**: `471,666,665` (98.3% missing!)

## Pattern Analysis

Notice that transactions 26 and 29 both show the **exact same balance change** (`8,333,335`), despite different input amounts (`360M` and `480M`). This suggests:

1. **The swap is hitting a limit** - possibly maximum swapable amount
2. **The contract is capping the swap** - based on available liquidity
3. **The swap is only partially executing** - but still returning success

## How Swaps Work (From Contract Code)

Looking at `swap-x-for-y` in `dlmm-core-v-1-1.clar`:

1. **Input**: `x-amount` (what the user wants to swap)
2. **Calculation**: Contract calculates `updated-x-amount` based on:
   - Available liquidity in the bin
   - Maximum swapable amount (`max-x-amount`)
   - Fees
3. **Transfer**: Contract transfers `updated-x-amount` (not `x-amount`) from user
4. **Return**: Contract returns the amount swapped in (which should be `updated-x-amount`)

### Key Code Section (lines 1258-1304)

```clarity
;; Calculate max x-amount with fees
(swap-fee-total (+ protocol-fee provider-fee variable-fee))
(max-x-amount (/ (+ (* y-balance PRICE_SCALE_BPS) (- bin-price u1)) bin-price))
(updated-max-x-amount (if (> swap-fee-total u0) 
                          (/ (* max-x-amount FEE_SCALE_BPS) (- FEE_SCALE_BPS swap-fee-total)) 
                          max-x-amount))

;; Calculate actual amount to swap (capped by max)
(updated-x-amount (if (> updated-max-x-amount x-amount) x-amount updated-max-x-amount))

;; Transfer updated-x-amount (not x-amount!)
(if (and (> updated-x-amount u0) (not initial-bin-balances-empty))
    (try! (contract-call? x-token-trait transfer updated-x-amount caller pool-contract none))
    false)

;; Return the amount swapped in
(ok updated-x-amount)
```

## The Root Cause

**The contract is designed to cap swaps at the maximum available liquidity**, but:

1. **The test expects** the user balance to decrease by the full `x-amount` input
2. **The contract actually transfers** only `updated-x-amount` (which may be less)
3. **The swap still succeeds** because it successfully swapped what was available

## Is This a Bug?

This depends on the intended behavior:

### Scenario A: Expected Behavior (Not a Bug)
- Swaps should be capped at available liquidity
- User should only pay for what was actually swapped
- The contract correctly limits the swap amount
- **Issue**: The test expectation is wrong - we should check `updated-x-amount` instead of `x-amount`

### Scenario B: Unexpected Behavior (Potential Bug)
- Swaps should fail if requested amount exceeds available liquidity
- User should not be charged for a partial swap without explicit consent
- The contract should return an error, not a partial success
- **Issue**: The contract allows partial swaps without clear indication

## What the Swap Function Returns

Looking at line 1359 of the contract:
```clarity
(ok {in: updated-x-amount, out: dy})
```

The swap function returns a tuple with:
- `in`: The actual amount swapped in (`updated-x-amount`)
- `out`: The amount of Y tokens received (`dy`)

## What the Test Should Check

**Current (Incorrect) Check:**
```typescript
if (userXChange !== xIn) {
  // Flag as error - compares to input amount
}
```

**Correct Check:**
```typescript
// Get the actual amount swapped from the result
const actualSwapped = result.in; // This is updated-x-amount from contract
if (userXChange !== actualSwapped) {
  // Flag as error - user should pay exactly what was swapped
}
```

The test needs to extract `result.in` (the actual amount swapped) and compare the user balance change to that, not to the input amount.

## Next Steps

1. **Verify the swap return value**: Check what `result` contains - it should be `updated-x-amount`
2. **Update the test**: Compare user balance change to the actual swapped amount, not the input amount
3. **Investigate the contract**: Determine if partial swaps are intended behavior or a bug
4. **Check documentation**: See if the contract is supposed to fail when amount exceeds max

## Answers (Confirmed)

1. **Should swaps fail if `x-amount > max-x-amount`?** 
   - **No** - We allow partial fills. The limit is how much of the other token is in the active bin.

2. **Is partial swap execution intended behavior?**
   - **Yes** - Partial swaps are okay at the core level.

3. **Does the contract return the actual amount swapped?**
   - **Yes** - The contract returns `{in: updated-x-amount, out: dy}` where `in` is the actual amount swapped. The contract also prints detailed information in the print statement (lines 1329-1357) including `updated-x-amount`, `x-amount`, `updated-max-x-amount`, fees, and balances.

4. **Error codes:**
   - `ERR_INVALID_X_AMOUNT` (u1020) - Invalid X amount
   - `ERR_INVALID_Y_AMOUNT` (u1021) - Invalid Y amount
   - `ERR_MAXIMUM_X_AMOUNT` (u1025) - Maximum X amount exceeded
   - `ERR_MAXIMUM_Y_AMOUNT` (u1026) - Maximum Y amount exceeded
   - Note: The contract doesn't error on partial fills - it caps at available liquidity and returns success with the actual amounts swapped.

## Test Fix Applied

The test has been updated to compare user balance changes against `result.in` (the actual amount swapped) instead of the input amount, since partial fills are expected behavior.

