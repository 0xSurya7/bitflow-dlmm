# Multi-Bin Swap Implementation Plan

## Overview

This document outlines the plan for implementing multi-bin swap testing in the fuzz tests, based on the multi-bin implementation in `pricing.py`'s `MultiBinDLMMStrategy.calculate_amount_out` method.

## Current State

- **Active-bin swaps**: ✅ Fully implemented and validated
- **Multi-bin swaps**: ⏳ Not yet implemented in fuzz tests
- **Quote engine**: ✅ Has full multi-bin implementation in `pricing.py`

## Key Concepts from pricing.py

### Bin Traversal Logic

1. **Direction Determination**:
   - **X→Y swap**: Traverse LEFT (lower prices) to find Y tokens
   - **Y→X swap**: Traverse RIGHT (higher prices) to find X tokens

2. **Bin Selection Strategy**:
   - Start from active bin
   - Estimate bins needed based on trade size
   - Use adaptive loading (exponential backoff if not enough bins)
   - Load bins in price-sorted order

3. **Execution Path**:
   - Build execution path by traversing bins sequentially
   - Each bin uses `_calculate_bin_swap` to determine swap amounts
   - Accumulate fees and outputs across all bins
   - Include empty bins in path if needed for traversal

### Key Functions from pricing.py

1. **`_estimate_bins_needed()`** (lines 800-850):
   - Estimates how many bins are needed based on trade size
   - Uses active bin capacity and average liquidity per bin
   - Returns conservative estimate with safety margin

2. **`_get_adaptive_max_attempts()`** (lines 857-860):
   - Returns max attempts for adaptive bin loading (default: 3)
   - Each attempt tries more bins (exponential backoff)

3. **Bin Loading** (lines 195-262):
   - Uses Redis ZSET to get bins in price range
   - For X→Y: `get_bin_prices_reverse_range(pool_id, active_bin_price, 0)`
   - For Y→X: `get_bin_prices_in_range(pool_id, active_bin_price, inf)`
   - Sorts bins by price in correct order

4. **Bin Traversal** (lines 337-486):
   - Iterates through bins sequentially
   - Uses `_calculate_bin_swap` for each bin
   - Accumulates amounts and fees
   - Stops when trade is complete or all bins exhausted

## Implementation Strategy for Fuzz Tests

### Phase 1: Direct Contract Calls (No Redis)

Since fuzz tests run locally with Clarigen and don't have Redis infrastructure:

1. **Get Bin Data from Contract**:
   - Use `sbtcUsdcPool.getBinBalances(unsignedBinId)` to get reserves
   - Use `dlmmCore.getBinPrice(initialPrice, binStep, binId)` to get prices
   - Query bins directly from contract instead of Redis ZSET

2. **Bin Discovery**:
   - Start from active bin
   - Query adjacent bins sequentially (binId ± 1, ±2, etc.)
   - Check if bin has liquidity for swap direction
   - Continue until enough bins found or range exhausted

3. **Price-Based Sorting**:
   - Calculate price for each bin using `getBinPrice`
   - Sort bins by price in correct order:
     - X→Y: Descending price (right to left)
     - Y→X: Ascending price (left to right)

### Phase 2: Multi-Bin Swap Calculation

1. **Use Helper Functions**:
   - Reuse `calculateBinSwap()` from `swap-calculations.ts`
   - Call for each bin in sequence
   - Accumulate results

2. **Execution Path Building**:
   - Track which bins were used
   - Record amounts swapped in each bin
   - Build execution path similar to pricing.py

3. **Fee Accumulation**:
   - Fees calculated per bin using `_calculate_bin_swap`
   - Total fees = sum of fees from all bins

### Phase 3: Transaction Construction

1. **Use Swap Router** (if available):
   - Swap router handles multi-bin swaps
   - Can set `min-amount-returned = 0` to allow partial fills
   - Core contract allows partial fills automatically

2. **Direct Core Calls** (if needed):
   - Call `swap-x-for-y` or `swap-y-for-x` for each bin
   - Must ensure bins are traversed in correct order
   - Active bin must be used first

3. **Validation**:
   - Compare contract result with quote engine calculation
   - Verify execution path matches expected bins
   - Check that total output matches quote engine

## Implementation Steps

### Step 1: Create Bin Discovery Helper

```typescript
async function discoverBinsForSwap(
  poolState: PoolState,
  activeBinId: bigint,
  swapForY: boolean,
  estimatedBinsNeeded: number
): Promise<Array<{ binId: bigint; price: bigint; reserves: BinData }>> {
  // Query bins from contract
  // Sort by price
  // Return bins with liquidity
}
```

### Step 2: Create Multi-Bin Calculation Helper

```typescript
function calculateMultiBinSwap(
  bins: Array<{ binId: bigint; price: bigint; reserves: BinData }>,
  amountIn: bigint,
  feeRateBPS: bigint,
  swapForY: boolean
): {
  totalOut: bigint;
  totalFees: bigint;
  executionPath: Array<{ binId: bigint; in: bigint; out: bigint; fees: bigint }>;
} {
  // Traverse bins
  // Use calculateBinSwap for each
  // Accumulate results
}
```

### Step 3: Add Multi-Bin Test Cases

1. **Small Multi-Bin Swaps**:
   - Swaps that require 2-3 bins
   - Validate execution path
   - Compare with quote engine

2. **Large Multi-Bin Swaps**:
   - Swaps that require many bins
   - Test adaptive bin loading
   - Validate partial fills

3. **Edge Cases**:
   - Empty bins in path
   - Bins with very small liquidity
   - Maximum bin traversal

### Step 4: Integration with Validation Test

1. **Add Multi-Bin Mode**:
   - Extend `dlmm-core-quote-engine-validation-fuzz.test.ts`
   - Add option to test multi-bin swaps
   - Use same validation logic (compare with quote engine)

2. **Execution Path Validation**:
   - Verify bins are traversed in correct order
   - Verify amounts match quote engine per bin
   - Verify total output matches quote engine

## Challenges and Solutions

### Challenge 1: No Redis ZSET for Price-Based Queries

**Solution**: Query bins sequentially from contract and sort by price

### Challenge 2: Efficient Bin Discovery

**Solution**: 
- Start from active bin
- Query adjacent bins in correct direction
- Stop when enough liquidity found or range exhausted
- Cache bin prices to avoid repeated queries

### Challenge 3: Transaction Construction

**Solution**:
- Use swap router if available (handles multi-bin automatically)
- Otherwise, construct multiple transactions (one per bin)
- Ensure correct order and active bin usage

### Challenge 4: Partial Fills

**Solution**:
- Set `min-amount-returned = 0` in swap router
- Core contract allows partial fills automatically
- Validate that partial fills match quote engine

## Testing Strategy

1. **Unit Tests**:
   - Test bin discovery logic
   - Test multi-bin calculation helper
   - Test execution path building

2. **Integration Tests**:
   - Test small multi-bin swaps (2-3 bins)
   - Test large multi-bin swaps (10+ bins)
   - Test edge cases (empty bins, partial fills)

3. **Fuzz Tests**:
   - Add multi-bin swaps to validation fuzz test
   - Random trade sizes that require multiple bins
   - Validate against quote engine for all cases

## Success Criteria

- [ ] Bin discovery works correctly (finds bins with liquidity)
- [ ] Multi-bin calculation matches quote engine exactly
- [ ] Execution paths are built correctly
- [ ] Transaction construction works (swap router or direct calls)
- [ ] Validation tests pass (contract matches quote engine)
- [ ] Edge cases handled correctly (empty bins, partial fills)

## Future Enhancements

1. **Optimization**:
   - Cache bin prices to reduce contract calls
   - Parallel bin queries where possible
   - Smart bin range estimation

2. **Advanced Features**:
   - Cross-pool swaps (if needed)
   - Complex execution paths
   - Gas optimization validation

## References

- `pricing.py` lines 124-777: Multi-bin implementation
- `pricing.py` lines 800-902: Bin estimation and helper functions
- Clarity contract: `dlmm-core-v-1-1.clar` swap functions
- Swap router documentation: https://docs.bitflow.finance/bitflow-documentation/developers/hodlmm-api-documentation#getting-swap-parameters

