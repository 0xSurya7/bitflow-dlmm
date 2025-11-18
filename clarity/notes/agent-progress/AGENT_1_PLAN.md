# Agent 1: Add-Liquidity Rounding Checks - Implementation Plan

**Status**: ✅ Ready for Review  
**Created**: 2025-01-XX  
**Agent**: Agent 1  
**Todo**: `extend-add-liquidity-rounding`

## Quick Summary

**Goal**: Add comprehensive float comparison for `add-liquidity` LP token calculation, following the exact pattern from swap checks.

**Location**: `tests/dlmm-core-comprehensive-fuzz.test.ts`, lines 1853-1893

**What to Add**:
1. ✅ CHECK 1: Exact Integer Match (verify test logic matches contract)
2. ✅ CHECK 2: Rounding Error Detection (compare to ideal float math)
3. ✅ Adversarial Analysis: Rounding Bias and Balance Conservation

**Key Challenges**:
- Implement `sqrti` (integer square root) for BigInt
- Replicate complex fee calculation logic
- Handle burn-amount for new bins
- Match contract logic exactly

**Estimated Complexity**: Medium-High (due to fee calculation complexity)

## Executive Summary

Add comprehensive float comparison for `add-liquidity` LP token calculation in the `checkRoundingErrors()` function, following the exact pattern established by swap rounding checks (lines 1274-1540).

## Context

### Current State
- **Location**: `tests/dlmm-core-comprehensive-fuzz.test.ts`, lines 1853-1893
- **Current Implementation**: Basic checks for LP > 0 and balance increases
- **Missing**: Float math comparison, rounding difference logging, bias tracking, balance conservation checks

### Reference Implementation
- **Swap Checks**: Lines 1274-1540 (swap-x-for-y) and 1577-1847 (swap-y-for-x)
- **Pattern to Follow**: 
  1. CHECK 1: Exact Integer Match (verify test logic matches contract)
  2. CHECK 2: Rounding Error Detection (compare to ideal float math)
  3. ADVERSARIAL ANALYSIS: Rounding Bias and Balance Conservation

### Contract Formula (from `dlmm-core-v-1-1.clar`)

**Key Formulas:**
1. `get-liquidity-value(x, y, price) = (bin-price * x-amount) + y-amount` (y already scaled by PRICE_SCALE_BPS)
2. **If bin is empty** (bin-shares == 0 or bin-liquidity-value == 0):
   - `dlp = sqrti(add-liquidity-value)`
3. **If bin has existing liquidity**:
   - `dlp = (add-liquidity-value * bin-shares) / bin-liquidity-value`
4. **Fees calculation** (only for active bin):
   - Calculate withdrawable amounts
   - Calculate max fees based on imbalance
   - Deduct fees from x-amount and y-amount
5. **Final LP calculation** (with post-fee amounts):
   - Recalculate liquidity values with post-fee amounts
   - Apply same formula (empty vs proportional)
   - For empty bins: subtract `burn-amount` (minimum-burnt-shares)

## Implementation Plan

### Phase 1: Understand Contract Logic (DONE - Analysis Complete)

✅ **Completed Analysis:**
- Reviewed contract code (lines 1510-1650)
- Understood `get-liquidity-value` formula
- Identified fee calculation logic
- Understood empty bin vs existing bin logic
- Identified burn-amount handling for new bins

### Phase 2: Implement Float Math Calculation

**Goal**: Replicate contract's LP calculation using float math

**Steps:**
1. Get pool data (binStep, initialPrice, fees, activeBinId)
2. Get bin price using `dlmmCore.getBinPrice()`
3. Get bin state BEFORE add-liquidity:
   - `xBalance`, `yBalance`, `binShares` (totalSupply)
4. Calculate liquidity values:
   - `addLiquidityValue = (binPrice * xAmount) + (yAmount * PRICE_SCALE_BPS)`
   - `binLiquidityValue = (binPrice * xBalance) + (yBalance * PRICE_SCALE_BPS)`
5. Calculate initial DLP (pre-fees):
   - If `binShares == 0 || binLiquidityValue == 0`: `dlp = sqrt(addLiquidityValue)`
   - Otherwise: `dlp = (addLiquidityValue * binShares) / binLiquidityValue`
6. Calculate fees (if active bin and dlp > 0):
   - Get fee rates from pool data
   - Calculate withdrawable amounts
   - Calculate max fees
   - Apply fee deduction
7. Calculate final DLP (post-fees):
   - Recalculate with post-fee amounts
   - Handle burn-amount for new bins
   - Apply same empty vs proportional logic

**Key Constants:**
- `PRICE_SCALE_BPS = 100000000`
- `FEE_SCALE_BPS = 10000`
- `MINIMUM_BIN_SHARES` (from contract)
- `MINIMUM_BURNT_SHARES` (from contract)

### Phase 3: Implement CHECK 1 - Exact Integer Match

**Goal**: Verify our test logic matches contract's integer arithmetic

**Steps:**
1. Replicate contract calculation using BigInt (integer math)
2. Compare `expectedLPInteger` vs `actualLPReceived` (from result)
3. Flag violations if difference > 2 LP tokens
4. Log violation with full context (similar to swap checks)

**Implementation Pattern:**
```typescript
// Calculate using BigInt (matching contract exactly)
const addLiquidityValueBigInt = (binPriceBigInt * xAmountBigInt) + (yAmountBigInt * PRICE_SCALE_BPS_BIGINT);
const binLiquidityValueBigInt = (binPriceBigInt * beforeBin.xBalance) + (beforeBin.yBalance * PRICE_SCALE_BPS_BIGINT);

// Calculate DLP using integer math
let expectedLPInteger: bigint;
if (beforeBin.totalSupply === 0n || binLiquidityValueBigInt === 0n) {
  expectedLPInteger = sqrti(addLiquidityValueBigInt); // Need to implement sqrti
} else {
  expectedLPInteger = (addLiquidityValueBigInt * beforeBin.totalSupply) / binLiquidityValueBigInt;
}

// Apply fees and recalculate (matching contract logic)
// ... fee calculation ...
// ... final DLP calculation ...

// Compare
const integerDiff = expectedLPInteger > lpReceived 
  ? expectedLPInteger - lpReceived 
  : lpReceived - expectedLPInteger;
```

**Challenges:**
- Need to implement `sqrti` for BigInt (integer square root)
- Fee calculation is complex (withdrawable amounts, max fees)
- Burn-amount handling for new bins

### Phase 4: Implement CHECK 2 - Rounding Error Detection

**Goal**: Compare contract output vs ideal float math

**Steps:**
1. Calculate expected LP using float math (same formulas, but with Number type)
2. Convert to BigInt: `expectedLPFloat = BigInt(Math.floor(expectedLPFloat))`
3. Calculate difference: `floatDiff = |actualLPReceived - expectedLPFloat|`
4. Calculate percentage difference
5. Log ALL rounding differences (not just violations) using `logger.logRoundingDifference()`
6. Flag violations if difference is significant (>1% or >100 LP tokens)

**Implementation Pattern:**
```typescript
// Calculate using float math
const addLiquidityValueFloat = (binPrice * xAmount) + (yAmount * PRICE_SCALE_BPS);
const binLiquidityValueFloat = (binPrice * Number(beforeBin.xBalance)) + (Number(beforeBin.yBalance) * PRICE_SCALE_BPS);

let expectedLPFloat: number;
if (beforeBin.totalSupply === 0n || binLiquidityValueFloat === 0) {
  expectedLPFloat = Math.sqrt(addLiquidityValueFloat);
} else {
  expectedLPFloat = (addLiquidityValueFloat * Number(beforeBin.totalSupply)) / binLiquidityValueFloat;
}

// Apply fees and recalculate
// ... fee calculation with float math ...
// ... final DLP calculation ...

const expectedLPFloatBigInt = BigInt(Math.floor(expectedLPFloat));
const floatDiff = expectedLPFloatBigInt > lpReceived
  ? expectedLPFloatBigInt - lpReceived
  : lpReceived - expectedLPFloatBigInt;
```

### Phase 5: Implement Adversarial Analysis

**Goal**: Track rounding bias and verify balance conservation

**Steps:**

#### 5.1 Rounding Bias Tracking
1. Calculate bias: `bias = actualLPReceived - expectedLPFloat`
2. Determine direction:
   - `bias > 0`: user_favored (user gets MORE LP than float math suggests)
   - `bias < 0`: pool_favored (user gets LESS LP than float math suggests)
   - `bias == 0`: neutral
3. Calculate bias percentage
4. Log using `logger.logRoundingBias()`

#### 5.2 Balance Conservation
1. **X Balance**: Verify `afterBin.xBalance = beforeBin.xBalance + xAdded`
2. **Y Balance**: Verify `afterBin.yBalance = beforeBin.yBalance + yAdded`
3. **LP Supply**: Verify `afterBin.totalSupply = beforeBin.totalSupply + lpReceived`
4. **Pool Value**: Calculate pool value before/after and verify it increases by expected amount
5. Log using `logger.logBalanceConservation()`

**Pool Value Calculation:**
- Pool value = `(xBalance * binPrice) / PRICE_SCALE_BPS + yBalance` (in Y token terms)
- Expected change = fees collected (if any)
- Verify actual change matches expected (within tolerance)

### Phase 6: Error Handling and Edge Cases

**Edge Cases to Handle:**
1. **Empty bin** (binShares == 0): Use sqrt formula, handle burn-amount
2. **Active bin with fees**: Complex fee calculation
3. **Non-active bin**: No fees
4. **Very small amounts**: Minimum LP requirements
5. **Very large amounts**: Near bin capacity
6. **Zero fees**: Fee calculation should still work
7. **Partial fees**: When imbalance is small

**Error Handling:**
- Wrap in try-catch (like swap checks)
- If pool data unavailable, skip check (don't fail test)
- Log any calculation errors for debugging

### Phase 7: Testing and Validation

**Testing Steps:**
1. Run existing tests to ensure no regressions
2. Run small fuzz test (100 transactions) and verify:
   - No calculation mismatches (CHECK 1)
   - Rounding differences are logged
   - Bias tracking works
   - Balance conservation checks work
3. Verify logging output format matches swap checks
4. Check that violations are only flagged for significant differences

## Implementation Details

### Helper Functions Needed

1. **`sqrti(value: bigint): bigint`**
   - Integer square root function for BigInt
   - Used for empty bin LP calculation
   - Can use binary search or Newton's method

2. **Fee Calculation Helper**
   - Replicate contract's fee calculation logic
   - Handle withdrawable amounts
   - Calculate max fees based on imbalance

### Data Structures

**Rounding Data (for `logger.logRoundingDifference()`):**
```typescript
{
  txNumber: number;
  functionName: 'add-liquidity';
  binId: number;
  xAmount: number;
  yAmount: number;
  lpReceived: number;
  binPrice: number;
  binSharesBefore: number;
  expectedInteger: number;
  expectedFloat: number;
  integerDiff: number;
  floatDiff: number;
  floatPercentDiff: number;
  activeBinId: number;
}
```

**Bias Data (for `logger.logRoundingBias()`):**
```typescript
{
  txNumber: number;
  functionName: 'add-liquidity';
  biasDirection: 'pool_favored' | 'user_favored' | 'neutral';
  biasAmount: bigint; // Positive = user gets more, Negative = user gets less
  biasPercent: number;
  poolValueBefore: bigint;
  poolValueAfter: bigint;
  poolValueChange: bigint;
  expectedPoolValueChange: bigint;
  poolValueLeakage: bigint;
}
```

## Potential Challenges and Solutions

### Challenge 1: Integer Square Root
**Problem**: Need `sqrti` for BigInt (Clarity's integer square root function)  
**Solution**: Implement binary search algorithm for BigInt. `sqrti` in Clarity returns the floor of the square root. Example implementation:
```typescript
function sqrti(value: bigint): bigint {
  if (value < 0n) throw new Error("sqrti: negative value");
  if (value === 0n) return 0n;
  if (value === 1n) return 1n;
  
  // Binary search for integer square root
  let left = 1n;
  let right = value;
  let result = 0n;
  
  while (left <= right) {
    const mid = (left + right) / 2n;
    const square = mid * mid;
    
    if (square === value) return mid;
    if (square < value) {
      left = mid + 1n;
      result = mid;
    } else {
      right = mid - 1n;
    }
  }
  return result;
}
```

### Challenge 2: Complex Fee Calculation
**Problem**: Fee calculation involves withdrawable amounts and imbalance checks  
**Solution**: Carefully replicate contract logic step-by-step:
1. Calculate withdrawable amounts: `withdrawable = (dlp * (balance + amount)) / (binShares + dlp)`
2. Check imbalance conditions:
   - X fee: if `yWithdrawable > yAmount && xAmount > xWithdrawable`
   - Y fee: if `xWithdrawable > xAmount && yAmount > yWithdrawable`
3. Calculate max fees: `maxFee = ((amount - withdrawable) * feeRate) / FEE_SCALE_BPS`
4. Apply fee: `fee = min(amount, maxFee)`
5. Test with zero fees first, then with normal fees.

### Challenge 3: Burn Amount for New Bins
**Problem**: New bins subtract `minimum-burnt-shares` from LP  
**Solution**: 
- Get `minimum-burnt-shares` using `rovOk(dlmmCore.getMinimumBurntShares())`
- Only apply for empty bins (`binShares == 0`)
- Formula: `finalLP = intendedLP - burnAmount` where `intendedLP = sqrti(addLiquidityValuePostFees)`
- Must also check `intendedLP >= minimumBinShares` before applying burn

### Challenge 4: Matching Contract Logic Exactly
**Problem**: Contract has many edge cases and conditions  
**Solution**: Follow contract code line-by-line. Test each branch separately.

## Success Criteria

✅ **Implementation Complete When:**
1. CHECK 1 implemented and tested
2. CHECK 2 implemented and tested
3. Adversarial analysis implemented and tested
4. All rounding differences logged
5. Bias tracking works correctly
6. Balance conservation verified
7. No regressions in existing tests
8. Code follows same structure as swap checks
9. Progress file updated

## Next Steps After Completion

1. Update progress file: `notes/agent-progress/TODO-extend-add-liquidity-rounding.md`
2. Update coordination file: `notes/COMPREHENSIVE_PLAN_COORDINATION.md`
3. Run comprehensive test to verify implementation
4. Document any findings or issues

## Plan Critique and Iteration

### First Iteration - Initial Plan
- ✅ Identified all key components
- ✅ Mapped contract formulas
- ✅ Identified reference implementation
- ⚠️ Need to verify sqrti implementation
- ⚠️ Need to understand fee calculation details better

### Second Iteration - After Review
- Need to check if helpers.ts has sqrti or similar
- Need to read contract fee calculation more carefully
- Need to verify burn-amount logic

### Final Plan - Ready for Review

**Key Insights from Contract Analysis:**
1. **Fee calculation logic** (lines 1551-1579):
   - Only applies to active bin (`bin-id == active-bin-id`)
   - Only if `dlp > 0`
   - Withdrawable amounts use formula: `(dlp * (balance + amount)) / (binShares + dlp)`
   - Fees are based on imbalance (when withdrawable > added for one token)

2. **Post-fee calculation** (lines 1595-1609):
   - Recalculates liquidity values with post-fee amounts
   - For new bins: subtracts `burn-amount` (minimum-burnt-shares)
   - For existing bins: uses proportional formula

3. **Balance updates** (lines 1611-1613):
   - Final balances include full amounts (fees stay in pool)
   - `updated-x-balance = x-balance + x-amount` (full amount, not post-fees)
   - `updated-y-balance = y-balance + y-amount` (full amount, not post-fees)

**Implementation Order:**
1. Implement `sqrti` helper function
2. Implement basic LP calculation (without fees) - CHECK 1
3. Add fee calculation logic
4. Implement post-fee LP calculation
5. Add float math comparison - CHECK 2
6. Add bias tracking and balance conservation - Adversarial Analysis
7. Test and validate

**Ready for implementation!**

