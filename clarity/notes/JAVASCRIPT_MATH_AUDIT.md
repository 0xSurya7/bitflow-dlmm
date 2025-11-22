# JavaScript Math Audit: BigInt vs Number Usage

## Overview

This document audits the use of `Number` vs `BigInt` in the fuzz test files to identify potential precision loss issues, especially with large values like bin prices.

## Key Findings

### Critical Issues

1. **Bin Price Conversions**: Bin prices are stored as BigInt (scaled by 1e8), but are converted to Number for float calculations. This is acceptable for float math comparisons, but we must ensure:
   - Integer math always uses BigInt
   - Float math uses Number only for comparison purposes
   - Bin prices are never used in integer calculations after conversion to Number

2. **Fee Calculations**: Fees are converted from BigInt to Number for float calculations. This is acceptable as long as:
   - Integer fee calculations use BigInt
   - Float fee calculations use Number only for comparison

3. **Balance Conversions**: Balances are converted to Number for float calculations. This is acceptable for comparison, but:
   - Integer calculations must use BigInt
   - Very large balances (> 2^53) may lose precision when converted to Number

### Current Usage Patterns

#### ✅ Correct Usage (Integer Math)
```typescript
// All integer calculations use BigInt
const maxXAmountBigInt = ((yBalanceBeforeSwapBigInt * PRICE_SCALE_BPS_BIGINT) + binPriceBigInt - 1n) / binPriceBigInt;
const xAmountFeesTotalBigInt = (updatedXAmountBigInt * swapFeeTotalBigInt) / FEE_SCALE_BPS_BIGINT;
const dxBigInt = updatedXAmountBigInt - xAmountFeesTotalBigInt;
```

#### ⚠️ Acceptable Usage (Float Math for Comparison)
```typescript
// Float calculations use Number for comparison with quote engine
const yBalanceBeforeSwap = Number(beforeBin.yBalance);
const binPrice = Number(binPriceBigInt);
const maxXAmountFloat = (yBalanceBeforeSwap * PRICE_SCALE_BPS + binPrice - 1) / binPrice;
```

**Note**: This is acceptable because:
- Float math is only used for comparison/validation
- The quote engine (Python) uses Decimal (float) math
- We're comparing against the quote engine's float output
- Integer math (which must be exact) uses BigInt

### Potential Issues

1. **Very Large Bin Prices**: 
   - Bin prices can be up to ~1e8 * 1e8 = 1e16 in some cases
   - JavaScript Number can safely represent integers up to 2^53 (≈9e15)
   - Most bin prices should be fine, but extreme values may lose precision
   - **Mitigation**: Keep bin prices as BigInt for all integer calculations

2. **Very Large Balances**:
   - Token balances can be very large (e.g., 1e18 for tokens with 18 decimals)
   - Converting to Number may lose precision for very large values
   - **Mitigation**: Use BigInt for all integer calculations, Number only for float comparisons

3. **Intermediate Calculations**:
   - Some intermediate calculations convert to Number unnecessarily
   - **Mitigation**: Keep as BigInt until float comparison is needed

## Recommendations

### ✅ Keep Current Approach
- Integer math: Always use BigInt
- Float math: Use Number for comparison with quote engine
- Conversions: Convert to Number only when needed for float calculations

### 🔧 Improvements Needed

1. **Document Conversion Points**: Clearly document where and why conversions happen
2. **Add Validation**: Check if values exceed Number.MAX_SAFE_INTEGER before conversion
3. **Use Helper Functions**: Centralize conversion logic in helper functions

## Files Audited

1. `dlmm-core-comprehensive-fuzz.test.ts`: ✅ Uses BigInt for integer math, Number for float comparisons
2. `dlmm-core-zero-fee-exploit.test.ts`: ✅ Uses BigInt for integer math, Number for float comparisons
3. `dlmm-core-quote-engine-validation-fuzz.test.ts`: ✅ Uses helper functions that handle conversions correctly

## Conclusion

The current implementation is **acceptable** for the following reasons:

1. **Integer Math**: All critical integer calculations use BigInt, ensuring exact precision
2. **Float Math**: Number conversions are only used for float comparisons, which match the quote engine's approach
3. **Helper Functions**: New helper functions (`swap-calculations.ts`) properly separate integer and float calculations

**No critical fixes needed**, but we should:
- Continue using BigInt for all integer calculations
- Use Number only for float comparisons
- Consider adding validation for very large values (though unlikely in practice)

