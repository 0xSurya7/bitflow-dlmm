# Failed Transactions Analysis

## Summary

**Total Failed**: 11 transactions
- All failures are `move-liquidity` operations
- ERR 1020 (ERR_INVALID_X_AMOUNT): 2 transactions
- ERR 1021 (ERR_INVALID_Y_AMOUNT): 9 transactions

## Failed Transactions

1. **Tx 34**: move-liquidity from -7 to 3 → ERR 1021
2. **Tx 38**: move-liquidity from -2 to -14 → ERR 1020
3. **Tx 41**: move-liquidity from -10 to -1 → ERR 1021
4. **Tx 53**: move-liquidity from -13 to 3 → ERR 1021
5. **Tx 54**: move-liquidity from -8 to 3 → ERR 1021
6. **Tx 56**: move-liquidity from -14 to 2 → ERR 1021
7. **Tx 57**: move-liquidity from -12 to -2 → ERR 1021
8. **Tx 61**: move-liquidity from -7 to -3 → ERR 1021
9. **Tx 69**: move-liquidity from -14 to -2 → ERR 1021
10. **Tx 73**: move-liquidity from -1 to -7 → ERR 1020
11. **Tx 94**: move-liquidity from -7 to 3 → ERR 1021

## Root Cause

### Contract Constraints (lines 1931-1932)

The `move-liquidity` function has strict constraints on which tokens can be moved to which bins:

```clarity
;; Assert correct token amounts are being added based on to-bin-id and active-bin-id
(asserts! (or (>= to-bin-id active-bin-id) (is-eq x-amount u0)) ERR_INVALID_X_AMOUNT)
(asserts! (or (<= to-bin-id active-bin-id) (is-eq y-amount u0)) ERR_INVALID_Y_AMOUNT)
```

**Translation**:
- If `to-bin-id < active-bin-id`: Can only move **Y tokens** (x-amount must be 0)
- If `to-bin-id > active-bin-id`: Can only move **X tokens** (y-amount must be 0)
- If `to-bin-id == active-bin-id`: Can move **both X and Y tokens**

### Why This Causes Failures

When moving liquidity, the contract:
1. Withdraws liquidity from the source bin (which contains both X and Y tokens based on the bin's composition)
2. Calculates how much X and Y to move based on the source bin's token ratio
3. Tries to add that liquidity to the destination bin

**The Problem**: If the source bin has tokens of a type that the destination bin cannot accept, the transaction fails.

**Example (Tx 34)**:
- Active bin: ~0 (assumed)
- Source bin: -7 (negative bin, has Y tokens, may have some X)
- Destination bin: 3 (positive bin, can ONLY accept X tokens, cannot accept Y tokens)
- When moving liquidity from -7 to 3, the contract calculates X and Y amounts from the source bin
- If the source bin has any Y tokens, the contract tries to move Y tokens to bin 3
- Bin 3 cannot accept Y tokens (it's > active-bin-id), so ERR_INVALID_Y_AMOUNT

**Example (Tx 38)**:
- Source bin: -2 (negative bin, has Y tokens)
- Destination bin: -14 (very negative bin, can ONLY accept Y tokens, cannot accept X tokens)
- If the source bin has any X tokens, the contract tries to move X tokens to bin -14
- Bin -14 cannot accept X tokens (it's < active-bin-id), so ERR_INVALID_X_AMOUNT

## Pattern Analysis

### ERR 1021 (ERR_INVALID_Y_AMOUNT) - 9 failures
All failures are moving liquidity to bins with **positive IDs** (2, 3) or bins close to active (0, -1, -2, -3).

**Pattern**: Moving from negative bins (which have Y tokens) to positive bins (which can only accept X tokens).

### ERR 1020 (ERR_INVALID_X_AMOUNT) - 2 failures
Both failures are moving liquidity to bins with **very negative IDs** (-14, -7).

**Pattern**: Moving from bins that might have X tokens to very negative bins (which can only accept Y tokens).

## Current Test Logic

Our test currently:
1. Selects a random source bin (from bins where user has LP tokens)
2. Selects a random destination bin (within -10 to +10 of active bin)
3. Ensures destination ≠ source
4. **Does NOT check if the move is valid based on token types**

## Solution

We need to ensure that when selecting a destination bin for `move-liquidity`, we respect the contract's constraints:

1. **If source bin is negative** (has Y tokens):
   - Destination must be `<= active-bin-id` (can accept Y tokens)
   - OR we need to ensure the source bin has no X tokens

2. **If source bin is positive** (has X tokens):
   - Destination must be `>= active-bin-id` (can accept X tokens)
   - OR we need to ensure the source bin has no Y tokens

3. **If source bin is active** (has both X and Y):
   - Destination can be any bin

**Better approach**: Check the source bin's token composition and select a compatible destination bin.

## Recommended Fix

Update the move-liquidity logic to:
1. Check the source bin's token composition (X and Y balances)
2. Select a destination bin that can accept the tokens from the source bin:
   - If source has both X and Y: destination must be active bin (can accept both)
   - If source has only X: destination must be >= activeBinId (can accept X)
   - If source has only Y: destination must be <= activeBinId (can accept Y)

## Fix Applied

✅ **Fixed**: Updated the destination bin selection logic to respect contract constraints:
- Source with both X and Y → destination within -2 to +2 of active bin (prefers active bin)
- Source with only X → destination >= activeBinId (positive bins)
- Source with only Y → destination <= activeBinId (negative bins)

This should significantly reduce failures and make the fuzz test more effective.

