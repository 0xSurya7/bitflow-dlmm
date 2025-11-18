# Integer vs Float Math Separation - Critical Lesson

**Date**: 2025-01-27  
**Agent**: Agent 0  
**Context**: Verifying swap rounding checks in `dlmm-core-comprehensive-fuzz.test.ts`

## The Problem

When replicating contract integer math in tests, it's critical to use **BigInt for ALL calculations**, including intermediate values. Mixing float math for intermediate calculations will cause calculation mismatches even when the formulas look correct.

## What Went Wrong

The test was calculating intermediate values (`maxXAmount`, `updatedMaxXAmount`) using JavaScript float math:

```typescript
// ❌ WRONG - Uses float division
const maxXAmount = (yBalanceBeforeSwap * PRICE_SCALE_BPS + binPrice - 1) / binPrice;
const updatedMaxXAmount = swapFeeTotal > 0 
  ? (maxXAmount * FEE_SCALE_BPS) / (FEE_SCALE_BPS - swapFeeTotal)
  : maxXAmount;
```

But the contract uses integer division with ceiling rounding:

```clarity
;; Contract uses integer division
(max-x-amount (/ (+ (* y-balance PRICE_SCALE_BPS) (- bin-price u1)) bin-price))
```

Even though the formula looked correct, float precision differences caused calculation mismatches when comparing to the contract's integer output.

## The Fix

### CHECK 1: Integer Math Replication (Must Match Exactly)

Use **BigInt for ALL calculations**, including intermediate values:

```typescript
// ✅ CORRECT - Uses BigInt integer division
const yBalanceBeforeSwapBigInt = beforeBin.yBalance;
const maxXAmountBigInt = ((yBalanceBeforeSwapBigInt * PRICE_SCALE_BPS_BIGINT) + binPriceBigInt - 1n) / binPriceBigInt;
const updatedMaxXAmountBigInt = swapFeeTotalBigInt > 0n
  ? (maxXAmountBigInt * FEE_SCALE_BPS_BIGINT) / (FEE_SCALE_BPS_BIGINT - swapFeeTotalBigInt)
  : maxXAmountBigInt;
```

### CHECK 2: Float Math Comparison (For Rounding Analysis)

Separately calculate float values for rounding analysis:

```typescript
// ✅ CORRECT - Separate float calculations for rounding analysis
const maxXAmountFloat = (yBalanceBeforeSwap * PRICE_SCALE_BPS + binPrice - 1) / binPrice;
const updatedMaxXAmountFloat = swapFeeTotal > 0 
  ? (maxXAmountFloat * FEE_SCALE_BPS) / (FEE_SCALE_BPS - swapFeeTotal)
  : maxXAmountFloat;
```

## Key Principles

1. **When replicating contract integer math, ALL calculations must use BigInt and integer arithmetic**
   - This includes intermediate values like `maxXAmount`, `updatedMaxXAmount`
   - Don't use float math for any part of the integer replication

2. **Separate integer math replication (CHECK 1) from float math comparison (CHECK 2)**
   - CHECK 1: Replicate contract's integer math exactly (must match 0 difference)
   - CHECK 2: Compare contract output to ideal float math (shows rounding differences)

3. **No tolerance for integer matches**
   - Changed from `if (integerDiff > 2n)` to `if (integerDiff > 0n)`
   - Integer arithmetic MUST match exactly (0 difference)
   - Any difference indicates test logic error, not acceptable tolerance

## Additional Related Fix

### Fee Exemption Handling

The contract checks for fee exemptions and sets fees to 0 if exempt. The test must also check:

```typescript
// ✅ CORRECT - Check fee exemption
const poolId = poolData.poolId || 1n;
const swapFeeExemption = rovOk(dlmmCore.getSwapFeeExemptionById(user, poolId));
const protocolFee = swapFeeExemption ? 0 : Number(poolData.xProtocolFee || 0n);
const providerFee = swapFeeExemption ? 0 : Number(poolData.xProviderFee || 0n);
const variableFee = swapFeeExemption ? 0 : Number(poolData.xVariableFee || 0n);
```

## Impact

This fix resolved 12 calculation mismatches that were being detected in the test suite. The mismatches were false positives caused by float precision differences, not actual contract bugs.

## Files Affected

- `tests/dlmm-core-comprehensive-fuzz.test.ts`
  - Lines 1347-1391: `swap-x-for-y` integer math replication
  - Lines 1704-1748: `swap-y-for-x` integer math replication

## For Other Agents

When implementing rounding checks for other functions (`add-liquidity`, `withdraw-liquidity`, `move-liquidity`):

1. **Always use BigInt for integer math replication**
2. **Separate integer replication from float comparison**
3. **Check for fee exemptions if applicable**
4. **No tolerance - must match exactly (0 difference)**

## References

- Contract formulas: `dlmm-core-v-1-1.clar` lines 1258-1275 (swap-x-for-y), 1403-1420 (swap-y-for-x)
- Test implementation: `tests/dlmm-core-comprehensive-fuzz.test.ts` lines 1228-1851
- Progress file: `notes/agent-progress/TODO-verify-swap-rounding.md`

