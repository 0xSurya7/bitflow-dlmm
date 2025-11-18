# Swap Calculation Logic Analysis

## Contract Logic (swap-y-for-x)

```pseudocode
// Contract does this (lines 1247-1420):
1. Get bin balances at swap time:
   xBalance = getBinBalances(binId).xBalance
   yBalance = getBinBalances(binId).yBalance

2. Get bin price:
   binPrice = getBinPrice(initialPrice, binStep, binId)

3. Get fees:
   protocolFee = poolData.protocolFee
   providerFee = poolData.providerFee
   variableFee = poolData.variableFee
   swapFeeTotal = protocolFee + providerFee + variableFee

4. Calculate MAX input amount (first cap - lines 1405-1406):
   maxYAmount = ((xBalance * binPrice) + (PRICE_SCALE_BPS - 1)) / PRICE_SCALE_BPS
   updatedMaxYAmount = if swapFeeTotal > 0:
                         (maxYAmount * FEE_SCALE_BPS) / (FEE_SCALE_BPS - swapFeeTotal)
                       else:
                         maxYAmount

5. Cap the input amount (line 1409):
   updatedYAmount = min(yAmount, updatedMaxYAmount)

6. Calculate fees (line 1412):
   yAmountFeesTotal = (updatedYAmount * swapFeeTotal) / FEE_SCALE_BPS

7. Calculate dy (amount after fees) (line 1416):
   dy = updatedYAmount - yAmountFeesTotal

8. Calculate dx before cap (line 1419):
   dxBeforeCap = (dy * PRICE_SCALE_BPS) / binPrice

9. Cap the output (line 1420):
   dx = min(dxBeforeCap, xBalance)

10. Return:
    {in: updatedYAmount, out: dx}
```

## Our Test Logic (Current Implementation)

```pseudocode
// Our test does this:
1. Get pool data:
   poolData = getPool()
   binStep = poolData.binStep
   initialPrice = poolData.initialPrice

2. Get bin price:
   binPrice = getBinPrice(initialPrice, binStep, binId)

3. Get fees:
   protocolFee = poolData.protocolFee || 0
   providerFee = poolData.providerFee || 0
   variableFee = poolData.variableFee || 0
   swapFeeTotal = protocolFee + providerFee + variableFee

4. Get actual swapped amount from result:
   updatedYAmount = result.in  // This is the actual amount swapped (already capped at step 5 of contract)

5. Calculate fees:
   yAmountFeesTotal = (updatedYAmount * swapFeeTotal) / FEE_SCALE_BPS

6. Calculate dy:
   dy = updatedYAmount - yAmountFeesTotal

7. Calculate dx before cap:
   dxBeforeCap = (dy * PRICE_SCALE_BPS) / binPrice

8. Get xBalance from BEFORE state:
   xBalance = beforeBin.xBalance  // ⚠️ POTENTIAL ISSUE

9. Cap the output:
   expectedDx = min(dxBeforeCap, xBalance)

10. Compare:
    if expectedDx != result.out:
        ERROR: Mismatch
```

## Critical Evaluation

### ✅ What We're Doing Correctly:
1. We're using `result.in` which is `updatedYAmount` (already capped at contract step 5)
2. We're calculating fees correctly (step 5-6)
3. We're calculating `dy` correctly (step 6)
4. We're calculating `dxBeforeCap` correctly (step 7)
5. We're applying the cap at step 9

### ❌ Potential Issues:

#### Issue 1: Balance Timing
**Problem**: We use `beforeBin.xBalance` from our captured state, but the contract uses `xBalance` from `getBinBalances()` at swap execution time.

**Why this matters**: 
- If there were other transactions between our state capture and the swap, the balance might be different
- However, we capture state RIGHT BEFORE the transaction, so this should be the same... unless there's a race condition or state capture issue

**Verdict**: This is likely NOT the issue, but worth verifying.

#### Issue 2: We're Not Verifying the First Cap
**Problem**: The contract caps the INPUT amount first (step 4-5), but we're not verifying that `result.in` matches what we'd expect from that cap calculation.

**Why this matters**:
- If the input was capped at step 5, then `result.in` is the capped amount
- But we're not checking if that cap was applied correctly
- We're just using `result.in` directly and assuming it's correct

**Example**:
- User requests: 200,331,868 Y tokens
- Contract calculates: maxYAmount = 150,000,000 (hypothetical)
- Contract caps: updatedYAmount = min(200,331,868, 150,000,000) = 150,000,000
- Contract returns: {in: 150,000,000, out: ...}
- We use: updatedYAmount = 150,000,000 ✅ (correct)
- But we never verify that 150,000,000 was the correct cap!

**Verdict**: This is a MISSING CHECK, but it shouldn't cause our calculation to be wrong - it just means we're not catching errors in the first cap.

#### Issue 3: Balance Used for Capping
**Problem**: We use `beforeBin.xBalance` for the output cap, but the contract uses `xBalance` from `getBinBalances()`.

**Critical Question**: Are these the same?

**Analysis**:
- Contract gets balance: `xBalance = getBinBalances(binId).xBalance` (at swap time)
- We get balance: `beforeBin.xBalance` (from state captured before swap)
- These SHOULD be the same if we capture state correctly

**BUT**: There's a subtle issue - the contract uses the balance to calculate BOTH:
1. The max input cap (step 4): `maxYAmount = ((xBalance * binPrice) + ...) / PRICE_SCALE_BPS`
2. The output cap (step 9): `dx = min(dxBeforeCap, xBalance)`

If the balance changes between these two uses (it shouldn't, they're in the same transaction), or if we're using a different balance, we'll get wrong results.

**Verdict**: This is likely the issue! We need to verify we're using the SAME balance the contract uses.

#### Issue 4: Fee Reading
**Problem**: We're reading fees from `poolData.protocolFee`, `poolData.providerFee`, `poolData.variableFee`, but we're not sure if these are the correct fields.

**Why this matters**:
- If fees are wrong, our `dy` calculation is wrong
- If `dy` is wrong, `dxBeforeCap` is wrong
- If `dxBeforeCap` is wrong, our expected output is wrong

**Verdict**: Need to verify we're reading fees correctly. The error message showed `fees: 0`, which might be correct (no fees set) or might be wrong (fees not read correctly).

## The Real Issue (Most Likely)

Looking at transaction 95:
- Expected: 400,663
- Actual: 240,398
- Difference: 160,265 (40% less)

This suggests the output was capped at 240,398, meaning `xBalance` was 240,398.

But transaction 94 added 1.3B X tokens to bin -6, so the balance should be much higher.

**Hypothesis**: We're using the wrong balance, or the balance we're reading is stale/incorrect.

**Solution**: We need to:
1. Verify we're reading the balance correctly
2. Verify we're using the balance at the right time
3. Add logging to see what balance we're actually using vs what the contract uses

## Corrected Logic (What We Should Do)

```pseudocode
// For swap-y-for-x verification:
1. Get pool data and bin price (same as before)

2. Get bin balances AT THE TIME OF THE SWAP:
   // This should match what the contract sees
   binBalances = getBinBalances(binId)  // Get fresh, not from beforeBin
   xBalance = binBalances.xBalance
   yBalance = binBalances.yBalance

3. Get fees (verify we're reading correctly)

4. Verify the input cap (optional but good):
   maxYAmount = ((xBalance * binPrice) + (PRICE_SCALE_BPS - 1)) / PRICE_SCALE_BPS
   updatedMaxYAmount = if swapFeeTotal > 0:
                         (maxYAmount * FEE_SCALE_BPS) / (FEE_SCALE_BPS - swapFeeTotal)
                       else:
                         maxYAmount
   expectedUpdatedYAmount = min(requestedYAmount, updatedMaxYAmount)
   if result.in != expectedUpdatedYAmount:
       WARNING: Input cap doesn't match (but continue anyway)

5. Calculate fees and dy (same as before)

6. Calculate dxBeforeCap (same as before)

7. Cap using the SAME balance the contract uses:
   expectedDx = min(dxBeforeCap, xBalance)  // Use fresh balance, not beforeBin

8. Compare (same as before)
```

## Key Fix Needed

**We should use the balance from `getBinBalances()` at verification time, not `beforeBin.xBalance`.**

However, there's a timing issue: we verify AFTER the swap, so the balance has changed. We need to use the balance from `beforeBin` (which is correct), but we need to verify it matches what the contract saw.

Actually, wait - we capture `beforeBin` BEFORE the transaction, so it should match what the contract sees. Unless... there's an issue with how we capture state.

Let me check: do we capture state correctly? Do we get the balance for the right bin?

