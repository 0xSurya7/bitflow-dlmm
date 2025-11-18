# Agent 3: Move-Liquidity Rounding Checks - Implementation Plan

**Status**: Draft - Pending Review  
**Assigned To**: Agent 3  
**Created**: 2025-01-XX

## Executive Summary

Add comprehensive float comparison rounding checks for `move-liquidity` function in the comprehensive fuzz test, following the exact pattern established by swap rounding checks. This will detect potential rounding exploits where integer math differs from ideal float math.

## Context

### What We're Doing
Adding float comparison checks for `move-liquidity` in `checkRoundingErrors()` function to:
1. Calculate expected X/Y amounts moved using float math
2. Calculate expected DLP tokens received using float math  
3. Compare contract results vs float-calculated expectations
4. Log all rounding differences (not just violations)
5. Track cumulative rounding bias (user-favored vs pool-favored)
6. Verify balance conservation across both source and destination bins

### Why It's Important
- `move-liquidity` is a critical permissionless function that moves value between bins
- Rounding differences could be exploited if they systematically favor users
- Completes rounding coverage for all 5 core functions (swaps ✅, add-liquidity ✅, withdraw-liquidity ✅, move-liquidity ⏳)
- Required for comprehensive security audit

### Key Files
- **Main Test File**: `tests/dlmm-core-comprehensive-fuzz.test.ts`
  - **Location**: After line 2297 (after withdraw-liquidity section, before `checkGlobalInvariants`)
  - **Reference Implementation**: Lines 1274-1851 (swap-x-for-y and swap-y-for-x)
  - **Similar Pattern**: Lines 1853-2258 (add-liquidity)

### Contract Logic Understanding

From `dlmm-core-v-1-1.clar` (lines 1791-1997):

**Move-Liquidity Flow**:
1. **Withdraw from source bin** (from-bin-id):
   - `x-amount = (amount * x-balance-a) / bin-shares-a` (integer division)
   - `y-amount = (amount * y-balance-a) / bin-shares-a` (integer division)
   - Updates: `updated-x-balance-a = x-balance-a - x-amount`
   - Updates: `updated-y-balance-a = y-balance-a - y-amount`
   - Burns: `amount` LP tokens from user

2. **Add to destination bin** (to-bin-id):
   - Scales Y: `y-amount-scaled = y-amount * PRICE_SCALE_BPS`
   - Calculates liquidity value: `add-liquidity-value = (bin-price * x-amount) + y-amount-scaled`
   - Calculates DLP pre-fees:
     - If empty bin: `dlp = sqrti(add-liquidity-value)`
     - If existing: `dlp = (add-liquidity-value * bin-shares-b) / bin-liquidity-value`
   - **Fees** (only if active bin and dlp > 0):
     - Calculates withdrawable amounts
     - Applies liquidity fees to X and/or Y based on ratio
   - Calculates post-fee amounts: `x-amount-post-fees`, `y-amount-post-fees`
   - Calculates final DLP post-fees (similar to add-liquidity)
   - Mints: `dlp-post-fees` LP tokens to user

3. **Returns**: `dlp-post-fees` (the LP tokens minted in destination bin)

## Implementation Plan

### Phase 1: Understand Contract Logic & Test Structure

**Tasks**:
1. ✅ Read contract code (lines 1791-1997) - **DONE**
2. ✅ Understand how move-liquidity is called in test (lines 2567-2696) - **DONE**
3. ✅ Review reference implementation (swap checks, lines 1274-1851) - **DONE**
4. ✅ Review similar pattern (add-liquidity, lines 1853-2258) - **DONE**
5. ✅ Identify where to add code (after line 2297) - **DONE**

**Key Insights**:
- Move-liquidity involves TWO bins (source and destination)
- Need to track state changes in both bins
- DLP calculation is similar to add-liquidity (same formula)
- Fees only apply if destination is active bin
- Result is `dlp-post-fees` (LP tokens received), not X/Y amounts

### Phase 2: Extract Required Data from Test Context

**Tasks**:
1. Extract source bin state (before/after) from `beforeState` and `afterState`
2. Extract destination bin state (before/after) from `beforeState` and `afterState`
3. Extract function parameters: `sourceBinId`, `destBinId`, `amount` (LP tokens to move)
4. Extract result: `dlp-post-fees` (LP tokens received in destination bin)
5. Get pool data (fees, bin-step, initial-price)
6. Get bin prices for both source and destination bins

**Code Location**: Inside `checkRoundingErrors()` function, add new `else if (functionName === 'move-liquidity')` block

**Key Variables Needed**:
```typescript
const sourceBinId = params.sourceBinId;
const destBinId = params.destBinId;
const amount = params.amount; // LP tokens to burn from source
const dlpReceived = result; // LP tokens minted in destination (result is bigint)

const beforeSourceBin = beforeState.binBalances.get(sourceBinId);
const afterSourceBin = afterState.binBalances.get(sourceBinId);
const beforeDestBin = beforeState.binBalances.get(destBinId);
const afterDestBin = afterState.binBalances.get(destBinId);
```

### Phase 3: Calculate Expected Values Using Float Math

**Step 3.1: Calculate Expected X/Y Amounts Moved (Float)**

Formula (matching contract lines 1822-1823):
```typescript
// Contract uses integer division: x-amount = (amount * x-balance-a) / bin-shares-a
// Float calculation for comparison
const xAmountFloat = (Number(amount) * Number(beforeSourceBin.xBalance)) / Number(beforeSourceBin.totalSupply);
const yAmountFloat = (Number(amount) * Number(beforeSourceBin.yBalance)) / Number(beforeSourceBin.totalSupply);

// Integer calculation (matching contract exactly)
const expectedXAmountInteger = (amount * beforeSourceBin.xBalance) / beforeSourceBin.totalSupply;
const expectedYAmountInteger = (amount * beforeSourceBin.yBalance) / beforeSourceBin.totalSupply;

// Float calculation (for rounding comparison)
const expectedXAmountFloat = BigInt(Math.floor(xAmountFloat));
const expectedYAmountFloat = BigInt(Math.floor(yAmountFloat));
```

**Step 3.2: Calculate Expected DLP Received (Float)**

This follows the same pattern as add-liquidity (lines 1918-2001). The contract logic (lines 1842-1908):

1. **Scale Y amount**: `yAmountScaled = yAmount * PRICE_SCALE_BPS` (line 1839)
2. **Calculate liquidity values** (lines 1843-1844):
   - `addLiquidityValue = (binPrice * xAmount) + yAmountScaled`
   - `binLiquidityValue = (binPrice * xBalance) + yBalanceScaled`
3. **Calculate DLP pre-fees** (lines 1845-1847):
   - If empty bin OR binLiquidityValue is 0: `dlpPreFees = sqrti(addLiquidityValue)`
   - If existing: `dlpPreFees = (addLiquidityValue * binShares) / binLiquidityValue`
4. **Calculate fees** (if active bin, lines 1850-1878):
   - Calculate withdrawable amounts: `xWithdrawable = (dlp * (xBalance + xAmount)) / (binShares + dlp)`
   - Calculate max fees based on ratio
   - Apply fees: `xAmountFeesLiquidity`, `yAmountFeesLiquidity`
5. **Calculate post-fee amounts** (lines 1886-1888):
   - `xAmountPostFees = xAmount - xAmountFeesLiquidity`
   - `yAmountPostFees = yAmount - yAmountFeesLiquidity`
   - `yAmountPostFeesScaled = yAmountPostFees * PRICE_SCALE_BPS`
6. **Calculate final liquidity values post-fees** (lines 1895-1896):
   - `addLiquidityValuePostFees = (binPrice * xAmountPostFees) + yAmountPostFeesScaled`
   - `binLiquidityValuePostFees = (binPrice * (xBalance + xAmountFeesLiquidity)) + ((yBalance + yAmountFeesLiquidity) * PRICE_SCALE_BPS)`
7. **Calculate final DLP post-fees** (lines 1898-1908):
   - If new bin: `intendedDlp = sqrti(addLiquidityValuePostFees)`, then `dlpPostFees = intendedDlp - burnAmount`
   - If existing and binLiquidityValuePostFees is 0: `dlpPostFees = sqrti(addLiquidityValuePostFees)`
   - If existing: `dlpPostFees = (addLiquidityValuePostFees * binShares) / binLiquidityValuePostFees`

**Important Note**: The contract updates destination bin balances with FULL amounts (line 1911-1912):
- `updatedXBalanceB = xBalanceB + xAmount` (not post-fees)
- `updatedYBalanceB = yBalanceB + yAmount` (not post-fees)
- Fees stay in the pool, so balances increase by full amounts

**Key Constants**:
```typescript
const FEE_SCALE_BPS = 10000;
const PRICE_SCALE_BPS = 100000000;
```

### Phase 4: Implement Check 1 - Exact Integer Match

**Purpose**: Verify our test logic matches contract's integer arithmetic exactly

**Implementation**:
1. Replicate contract's integer math step-by-step
2. Compare `expectedDLPInteger` vs `dlpReceived`
3. If difference > 2, log as `calculation_mismatch` (critical violation)
4. Also compare X/Y amounts moved (integer vs contract)

**Tolerance**: 2 tokens (same as swap/add-liquidity checks)

### Phase 5: Implement Check 2 - Rounding Error Detection

**Purpose**: Compare contract results vs ideal float math

**Implementation**:
1. Calculate float-based expected DLP
2. Compare `expectedDLPFloat` vs `dlpReceived`
3. Calculate float difference and percentage
4. **Log ALL rounding differences** (not just violations) using `logger.logRoundingDifference()`
5. Flag as violation if difference > threshold (>1% or >100 LP tokens)

**Logging Structure** (matching swap pattern):
```typescript
// Calculate actual X/Y amounts moved from balance changes
const actualXAmount = beforeSourceBin.xBalance - afterSourceBin.xBalance;
const actualYAmount = beforeSourceBin.yBalance - afterSourceBin.yBalance;

const roundingData = {
  txNumber,
  functionName: 'move-liquidity',
  sourceBinId: Number(sourceBinId),
  destBinId: Number(destBinId),
  amount: Number(amount), // LP tokens burned from source
  dlpReceived: Number(dlpReceived), // LP tokens minted in dest
  xAmountMoved: Number(actualXAmount),
  yAmountMoved: Number(actualYAmount),
  sourceBinPrice: Number(sourceBinPrice),
  destBinPrice: Number(destBinPrice),
  expectedXAmountInteger: Number(expectedXAmountInteger),
  expectedYAmountInteger: Number(expectedYAmountInteger),
  expectedXAmountFloat: Number(expectedXAmountFloat),
  expectedYAmountFloat: Number(expectedYAmountFloat),
  expectedDLPInteger: Number(expectedDLPInteger),
  expectedDLPFloat: Number(expectedDLPFloat),
  integerDiff: Number(integerDiff), // DLP difference
  floatDiff: Number(floatDiff), // DLP difference
  floatPercentDiff, // DLP percentage difference
  activeBinId: Number(beforeState.activeBinId),
  isDestActiveBin: destBinId === beforeState.activeBinId,
};
logger.logRoundingDifference(roundingData);
```

### Phase 6: Implement Adversarial Analysis

**Step 6.1: Rounding Bias Tracking**

Calculate bias direction:
- If `dlpReceived > expectedDLPFloat`: **user-favored** (user gets more LP tokens than float math suggests)
- If `dlpReceived < expectedDLPFloat`: **pool-favored** (user gets fewer LP tokens than float math suggests)

Track cumulative bias using `logger.logRoundingBias()`. Also track bias for X/Y amounts moved if significant.

**Step 6.2: Balance Conservation Checks**

Verify balance changes match expected values:

1. **Source bin** (lines 1826-1827 in contract):
   - X balance: `afterSourceBin.xBalance = beforeSourceBin.xBalance - xAmount`
   - Y balance: `afterSourceBin.yBalance = beforeSourceBin.yBalance - yAmount`
   - LP supply: `afterSourceBin.totalSupply = beforeSourceBin.totalSupply - amount`
   - Tolerance: 2 tokens for each

2. **Destination bin** (lines 1911-1912 in contract):
   - X balance: `afterDestBin.xBalance = beforeDestBin.xBalance + xAmount` (full amount, fees stay in pool)
   - Y balance: `afterDestBin.yBalance = beforeDestBin.yBalance + yAmount` (full amount, fees stay in pool)
   - LP supply: `afterDestBin.totalSupply = beforeDestBin.totalSupply + dlpReceived + burnAmount`
   - Tolerance: 2 tokens for balances, 2 LP tokens for supply

3. **Pool value conservation**:
   - Calculate pool value for source bin: `value = (xBalance * sourceBinPrice) / PRICE_SCALE_BPS + yBalance`
   - Calculate pool value for dest bin: `value = (xBalance * destBinPrice) / PRICE_SCALE_BPS + yBalance`
   - Source bin value should decrease by: `(xAmount * sourceBinPrice) / PRICE_SCALE_BPS + yAmount`
   - Dest bin value should increase by: `(xAmount * destBinPrice) / PRICE_SCALE_BPS + yAmount`
   - Net change should account for fees (fees stay in dest bin if active)
   - Tolerance: percentage-based (0.1%) or minimum 2 tokens

4. **LP supply conservation**:
   - Total LP supply change: `dlpReceived - amount + burnAmount`
   - Verify this matches: `(afterDestBin.totalSupply - beforeDestBin.totalSupply) - (beforeSourceBin.totalSupply - afterSourceBin.totalSupply)`
   - Tolerance: 2 LP tokens

5. **User LP token balance**:
   - Source bin LP: decreases by `amount`
   - Dest bin LP: increases by `dlpReceived`
   - Net change: `dlpReceived - amount` (should be positive if fees were charged, negative if rounding favored pool)

Use `logger.logBalanceConservation()` to log all conservation checks.

### Phase 7: Error Handling & Edge Cases

**Edge Cases to Handle**:
1. Empty source bin (shouldn't happen, but handle gracefully)
2. Empty destination bin (new bin - uses sqrt formula)
3. Destination is active bin (fees apply)
4. Destination is not active bin (no fees)
5. Very small amounts (rounding may be significant)
6. Very large amounts (near bin capacity)
7. Source and destination are same (shouldn't happen, but handle)

**Error Handling**:
- Wrap calculations in try-catch
- If pool data unavailable, skip checks (don't fail test)
- Log warnings for edge cases

### Phase 8: Testing & Verification

**Tasks**:
1. Run small fuzz test (100 transactions) to verify no syntax errors
2. Verify rounding differences are being logged
3. Verify bias tracking works correctly
4. Verify balance conservation checks are accurate
5. Check that violations are detected correctly
6. Compare output format with swap/add-liquidity logs

**Success Criteria**:
- ✅ Code compiles without errors
- ✅ Tests run without crashing
- ✅ Rounding differences logged for all move-liquidity transactions
- ✅ Bias tracking accumulates correctly
- ✅ Balance conservation checks work
- ✅ Violations detected when appropriate

## Code Structure

### Location
Insert after line 2297 in `checkRoundingErrors()` function, before `return issues;`

### Structure (Following Swap Pattern)
```typescript
} else if (functionName === 'move-liquidity') {
  // Extract parameters and state
  const sourceBinId = params.sourceBinId;
  const destBinId = params.destBinId;
  const amount = params.amount;
  const dlpReceived = result; // bigint
  
  // Get bin states
  const beforeSourceBin = beforeState.binBalances.get(sourceBinId);
  const afterSourceBin = afterState.binBalances.get(sourceBinId);
  const beforeDestBin = beforeState.binBalances.get(destBinId);
  const afterDestBin = afterState.binBalances.get(destBinId);
  
  // Validation checks
  if (!beforeSourceBin || !afterSourceBin || !beforeDestBin || !afterDestBin) {
    return issues; // Skip if bins not found
  }
  
  try {
    // Get pool data and bin prices
    const poolData = rovOk(sbtcUsdcPool.getPool());
    const sourceBinPrice = rovOk(dlmmCore.getBinPrice(...));
    const destBinPrice = rovOk(dlmmCore.getBinPrice(...));
    
    // ========================================================================
    // Calculate expected X/Y amounts moved (float math)
    // ========================================================================
    
    // ========================================================================
    // Calculate expected DLP received (float math)
    // ========================================================================
    
    // ========================================================================
    // CHECK 1: Exact Integer Match
    // ========================================================================
    
    // ========================================================================
    // CHECK 2: Rounding Error Detection
    // ========================================================================
    
    // ========================================================================
    // ADVERSARIAL ANALYSIS: Rounding Bias and Balance Conservation
    // ========================================================================
    
  } catch (e) {
    // Skip if calculation fails
  }
}
```

## Potential Challenges & Solutions

### Challenge 1: Two Bins to Track
**Solution**: Extract both source and destination bin states. Calculate expected values for both. Verify balance changes in both.

### Challenge 2: Complex Fee Calculation
**Solution**: Follow exact same pattern as add-liquidity (lines 1941-1970). Fees only apply if destination is active bin.

### Challenge 3: X/Y Amounts Not Directly Returned
**Solution**: Calculate expected X/Y amounts from source bin composition. Verify by checking balance changes in both bins.

### Challenge 4: Burn Amount for New Bins
**Solution**: Check if destination bin was empty before. If so, `burnAmount = minimumBurntShares`, else `burnAmount = 0`.

### Challenge 5: Matching Contract's Integer Math Exactly
**Solution**: Replicate contract formulas step-by-step using BigInt. Use float math for comparison, but integer math for exact match check.

## Dependencies

- ✅ Swap rounding checks (reference implementation) - **COMPLETE**
- ✅ Add-liquidity rounding checks (similar pattern) - **COMPLETE**
- ✅ Logger functions (`logRoundingDifference`, `logRoundingBias`, `logBalanceConservation`) - **AVAILABLE**
- ✅ Helper functions (`sqrti`, `determineSeverity`) - **AVAILABLE**

## Success Metrics

1. **Code Quality**:
   - Follows exact same structure as swap checks
   - Comprehensive error handling
   - Clear comments explaining each step

2. **Functionality**:
   - All rounding differences logged
   - Bias tracking works correctly
   - Balance conservation verified
   - Violations detected appropriately

3. **Testing**:
   - Tests run without errors
   - No false positives
   - Catches actual rounding issues if they exist

## Next Steps After Completion

1. Update progress file: `notes/agent-progress/TODO-extend-move-liquidity-rounding.md`
2. Update coordination file: `notes/COMPREHENSIVE_PLAN_COORDINATION.md`
3. Run comprehensive test (1000 transactions) to verify
4. Review logs to ensure proper data collection

## Questions / Considerations

1. **Q**: Should we track X/Y amount rounding separately, or just DLP?
   **A**: Track both - X/Y amounts moved are important for balance conservation, DLP is the user-facing result.

2. **Q**: How to handle the case where source bin has no X or Y?
   **A**: Shouldn't happen (contract checks), but handle gracefully by skipping checks.

3. **Q**: Should we verify the actual X/Y amounts moved match our calculations?
   **A**: Yes - verify by checking balance changes in both bins.

4. **Q**: What tolerance to use for balance conservation?
   **A**: Same as swaps/add-liquidity: 2 tokens for individual balances, percentage-based for pool value.

## Quick Reference Checklist

### Implementation Steps (In Order):
1. ✅ Read contract code and understand move-liquidity logic
2. ✅ Review reference implementation (swap checks)
3. ✅ Review similar pattern (add-liquidity checks)
4. ⏳ Add `else if (functionName === 'move-liquidity')` block after line 2297
5. ⏳ Extract source/dest bin states and parameters
6. ⏳ Get pool data and bin prices
7. ⏳ Calculate expected X/Y amounts moved (integer + float)
8. ⏳ Calculate expected DLP received (integer + float)
9. ⏳ Implement Check 1: Exact Integer Match
10. ⏳ Implement Check 2: Rounding Error Detection
11. ⏳ Implement Adversarial Analysis: Bias tracking
12. ⏳ Implement Adversarial Analysis: Balance conservation
13. ⏳ Add error handling and edge case checks
14. ⏳ Test with small fuzz run (100 transactions)
15. ⏳ Verify logging and data collection
16. ⏳ Update progress file
17. ⏳ Update coordination file

### Key Formulas to Implement:
- **X/Y Amounts**: `(amount * balance) / totalSupply`
- **DLP Pre-Fees**: `empty ? sqrt(value) : (value * shares) / binValue`
- **DLP Post-Fees**: Same as pre-fees but with post-fee amounts
- **Fees**: Only if active bin, based on withdrawable amounts
- **Balance Changes**: Source decreases, dest increases by full amounts

### Critical Points:
- ✅ Follow exact same structure as swap checks
- ✅ Log ALL rounding differences (not just violations)
- ✅ Track bias direction (user-favored vs pool-favored)
- ✅ Verify balance conservation in both bins
- ✅ Handle edge cases gracefully (empty bins, etc.)
- ✅ Use same tolerance values as other checks (2 tokens)

## Plan Critique & Iteration

### First Draft Critique:
- ✅ Comprehensive coverage of all aspects
- ✅ Clear structure following reference implementation
- ✅ Addresses edge cases
- ✅ Includes testing strategy
- ✅ Detailed formulas and calculations
- ✅ Quick reference checklist

### Potential Improvements:
- ✅ Added specific examples of float calculations
- ✅ Added detailed contract line references
- ✅ Added balance conservation formulas
- ✅ Added quick reference checklist

### Final Plan:
This plan is comprehensive and ready for implementation. It follows the established patterns, addresses all requirements, includes proper error handling and testing strategy, and provides clear step-by-step guidance with formulas and code structure.

