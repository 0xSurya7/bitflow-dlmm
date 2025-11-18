# Onboarding Guide: Large-Scale Fuzz Testing for DLMM Core

## Overview

Your goal is to create a comprehensive fuzz test that executes **at least 10,000 transactions** in random order with randomly decided amounts. This test will validate the core DLMM (Dynamic Liquidity Market Maker) contract's robustness, ensure invariants are maintained, and catch potential rounding errors or edge cases in Clarity.

## Project Context

- **Main Contract**: `dlmm-core-v-1-1` (DLMM Core Contract)
- **Test Framework**: Vitest with Clarigen
- **Language**: TypeScript
- **Smart Contract Language**: Clarity 4
- **Current Status**: Graybeard tests are passing (29/30 tests), basic test infrastructure is in place

## Critical Functions to Test

The following 6 user-facing permissionless functions are **CRITICAL** and must achieve 100% coverage:

1. **`swap-x-for-y`** - Swap X tokens for Y tokens
2. **`swap-y-for-x`** - Swap Y tokens for X tokens  
3. **`add-liquidity`** - Add liquidity to a specific bin
4. **`withdraw-liquidity`** - Remove liquidity from a bin
5. **`move-liquidity`** - Move liquidity between bins
6. **`create-pool`** - Create a new pool (test separately, not in main fuzz loop)

## Test Requirements

### 1. Scale & Randomization
- **Minimum 10,000 transactions** executed in random order
- Random selection of:
  - Function to call (from the 5 main functions above)
  - User/caller (deployer, alice, bob, charlie, etc.)
  - Bin ID (within valid range: -500 to 500)
  - Amounts (must be smart - see below)

### 2. Smart Random Amount Generation

**CRITICAL**: Random amounts must be feasible based on current pool state. You cannot just use arbitrary random numbers.

#### For Swaps (`swap-x-for-y`, `swap-y-for-x`):
- Query the pool state to get current bin balances
- Calculate maximum swapable amounts using pool state
- Generate random amounts between 1% and 95% of maximum (leave buffer for fees)
- Consider active bin vs non-active bins (different rules apply)
- For non-active bins: only one direction is possible (X-only or Y-only)

#### For Liquidity Operations:
- **`add-liquidity`**: 
  - Check user's token balances first
  - Generate amounts based on available user balance
  - Respect minimum liquidity requirements
  - For active bin: both X and Y can be added
  - For negative bins: only Y tokens
  - For positive bins: only X tokens
  
- **`withdraw-liquidity`**:
  - Check user's LP token balance for the target bin
  - Generate withdrawal amounts based on available LP tokens
  - Respect minimum withdrawal requirements
  
- **`move-liquidity`**:
  - Check user's LP token balance in source bin
  - Generate move amounts based on available LP tokens
  - Ensure destination bin is valid

### 3. Invariants to Check

After **EVERY** transaction, verify these invariants:

#### Global Invariants:
- Total supply of LP tokens for each bin must be non-negative
- Bin balances (X and Y) must be non-negative
- Active bin ID must remain within valid range (-500 to 500)
- Pool must remain in valid state

#### Function-Specific Invariants:

**`swap-x-for-y`**:
- X balance in bin MUST increase (by input amount - fees)
- Y balance in bin MUST decrease (by output amount)
- Total LP supply for bin MUST remain unchanged
- User's X token balance MUST decrease
- User's Y token balance MUST increase
- Protocol fees MUST increase (if applicable)

**`swap-y-for-x`**:
- Y balance in bin MUST increase (by input amount - fees)
- X balance in bin MUST decrease (by output amount)
- Total LP supply for bin MUST remain unchanged
- User's Y token balance MUST decrease
- User's X token balance MUST increase
- Protocol fees MUST increase (if applicable)

**`add-liquidity`**:
- LP token supply for bin MUST increase
- X balance in bin MUST increase (if X added)
- Y balance in bin MUST increase (if Y added)
- User's LP token balance MUST increase
- User's X/Y token balances MUST decrease
- Liquidity value calculation must be consistent

**`withdraw-liquidity`**:
- LP token supply for bin MUST decrease
- X balance in bin MUST decrease
- Y balance in bin MUST decrease
- User's LP token balance MUST decrease
- User's X/Y token balances MUST increase
- Withdrawn amounts must match expected values (accounting for fees)

**`move-liquidity`**:
- LP token supply in source bin MUST decrease
- LP token supply in destination bin MUST increase
- X/Y balances in source bin MUST decrease proportionally
- X/Y balances in destination bin MUST increase proportionally
- User's total LP token balance across bins MUST remain unchanged
- User's X/Y token balances MUST remain unchanged

### 4. Rounding Error Detection

Clarity uses integer arithmetic, which can lead to rounding errors. Check for:
- Accumulated rounding errors over many transactions
- Price calculations that drift from expected values
- Liquidity calculations that don't match expected formulas
- Fee calculations that don't sum correctly

**Strategy**: 
- Track expected vs actual values for key calculations
- Flag when discrepancies exceed acceptable thresholds (e.g., > 1 unit)
- Log all rounding discrepancies for analysis

### 5. State Tracking

Maintain comprehensive state tracking:
- Pool state (active bin, balances, fees)
- User balances (X tokens, Y tokens, LP tokens per bin)
- Protocol fee accumulations
- Transaction history (for debugging)

### 6. Logging & Error Handling

**CRITICAL**: When a transaction fails, you need detailed logs to reproduce the issue.

#### Logging Strategy:
- Use file-based logging (not just console.log)
- Log to a file: `fuzz-test-log-<timestamp>.txt`
- For each transaction, log:
  - Transaction number
  - Function called
  - Caller address
  - Parameters (bin, amounts, etc.)
  - Pool state BEFORE transaction
  - Transaction result (success/failure)
  - Pool state AFTER transaction (if successful)
  - Invariant check results
  - Any errors or warnings

#### Error Handling:
- Wrap each transaction in try-catch
- Log all errors with full context
- Continue test execution even if some transactions fail
- Track failure rate and types of failures
- At end of test, generate summary report

### 7. Coverage Requirements

Run coverage analysis:
```bash
npm run test:report:coverage
```

Ensure 100% coverage for:
- All 5 main functions (swap-x-for-y, swap-y-for-x, add-liquidity, withdraw-liquidity, move-liquidity)
- All code paths within these functions
- Error handling paths
- Edge cases (empty bins, minimum amounts, maximum amounts)

## Implementation Strategy

### Phase 1: Foundation (Start Here)

1. **Create test file**: `tests/dlmm-core-comprehensive-fuzz.test.ts`

2. **Set up test infrastructure**:
   - Import helpers from `helpers.ts`
   - Set up pool with initial liquidity
   - Initialize multiple users with token balances
   - Create helper functions for state tracking

3. **Create invariant checker functions**:
   - `checkSwapInvariants(beforeState, afterState, params)`
   - `checkAddLiquidityInvariants(beforeState, afterState, params)`
   - `checkWithdrawLiquidityInvariants(beforeState, afterState, params)`
   - `checkMoveLiquidityInvariants(beforeState, afterState, params)`
   - `checkGlobalInvariants(state)`

4. **Create smart random amount generators**:
   - `generateRandomSwapAmount(poolState, binId, direction)`
   - `generateRandomAddLiquidityAmount(userBalance, binId, poolState)`
   - `generateRandomWithdrawAmount(userLpBalance, binId)`
   - `generateRandomMoveAmount(userLpBalance, sourceBinId)`

5. **Create logging system**:
   - `initLogFile()`
   - `logTransaction(txNumber, functionName, params, beforeState, result, afterState)`
   - `logError(txNumber, error, context)`
   - `generateSummaryReport()`

### Phase 2: Basic Fuzz Test (Swaps Only)

1. Start with swaps only (simpler to validate)
2. Execute 1,000 random swaps
3. Verify invariants after each swap
4. Log all transactions
5. Validate no rounding errors accumulate

### Phase 3: Add Liquidity Operations

1. Add `add-liquidity` to the random function pool
2. Execute 2,000 transactions (mix of swaps and add-liquidity)
3. Ensure liquidity additions are feasible
4. Verify invariants

### Phase 4: Add Withdraw Operations

1. Add `withdraw-liquidity` to the random function pool
2. Execute 3,000 transactions (mix of all three operations)
3. Ensure withdrawals are feasible (users have LP tokens)
4. Verify invariants

### Phase 5: Add Move Operations

1. Add `move-liquidity` to the random function pool
2. Execute 4,000 transactions (mix of all four operations)
3. Ensure moves are feasible
4. Verify invariants

### Phase 6: Full Scale Test

1. Execute 10,000+ transactions with all 5 functions
2. Randomize everything: function, user, bin, amounts
3. Comprehensive invariant checking
4. Rounding error detection
5. Generate final coverage report

## Key Helper Functions Reference

From `helpers.ts`, you have access to:
- `setupTokens()` - Mint tokens to users
- `createTestPool()` - Create initial pool
- `addLiquidityToBins()` - Add liquidity to multiple bins
- `generateBinFactors()` - Generate bin factors for bin step registration

## Pool State Queries

You'll need to query pool state frequently. Key read-only functions:
- `sbtcUsdcPool.getActiveBinId()` - Get current active bin
- `sbtcUsdcPool.getBinBalances(binId)` - Get X/Y balances for a bin
- `sbtcUsdcPool.getBalance(binId, user)` - Get user's LP balance for a bin
- `sbtcUsdcPool.getTotalSupply(binId)` - Get total LP supply for a bin
- `mockSbtcToken.balanceOf(user)` - Get user's X token balance
- `mockUsdcToken.balanceOf(user)` - Get user's Y token balance

## Example Transaction Flow

```typescript
// 1. Select random function
const functions = ['swap-x-for-y', 'swap-y-for-x', 'add-liquidity', 'withdraw-liquidity', 'move-liquidity'];
const selectedFunction = functions[Math.floor(Math.random() * functions.length)];

// 2. Select random user
const users = [deployer, alice, bob, charlie];
const caller = users[Math.floor(Math.random() * users.length)];

// 3. Get current pool state
const activeBinId = rovOk(sbtcUsdcPool.getActiveBinId());
const poolState = await getPoolState(); // Your helper function

// 4. Generate feasible random parameters
const params = generateRandomParams(selectedFunction, caller, poolState);

// 5. Capture state before
const beforeState = await captureState();

// 6. Execute transaction
try {
  const result = await executeTransaction(selectedFunction, params, caller);
  
  // 7. Capture state after
  const afterState = await captureState();
  
  // 8. Check invariants
  checkInvariants(selectedFunction, beforeState, afterState, params);
  
  // 9. Log success
  logTransaction(txNumber, selectedFunction, params, beforeState, result, afterState);
} catch (error) {
  // 10. Log error
  logError(txNumber, error, { function: selectedFunction, params, beforeState });
}
```

## Testing Bin Coverage

As per the original notes, consider implementing a bin traversal test:
- Start at bin 0 (initial bin)
- Move to minimum bin (-500)
- Move to maximum bin (500)
- Return to bin 0
- In each bin, perform multiple operations before moving to next bin

This ensures coverage across all bins, not just the active bin.

## Running the Test

```bash
# Run the fuzz test
npm test -- dlmm-core-comprehensive-fuzz.test.ts

# Run with coverage
npm run test:report:coverage

# The test may take a long time (10-30 minutes for 10,000 transactions)
# Consider adding a progress indicator
```

## Success Criteria

Your fuzz test is successful when:
1. ✅ Executes 10,000+ transactions without critical failures
2. ✅ All invariants pass for every transaction
3. ✅ No unexpected rounding errors detected
4. ✅ 100% code coverage for the 5 main functions
5. ✅ Comprehensive logs generated for debugging
6. ✅ Test can be run multiple times with different random seeds
7. ✅ Failure rate is low (< 1% expected failures due to edge cases)

## Notes from Previous Testing

Reference: `external-test-context/CA-testing-dlmm/notes-testing.md` (lines 128-171)

Key points:
- The test should be equivalent to both a fuzz test and an integration test
- Think about invariants: what properties MUST change and what MUST NOT change
- Logging is critical - use file logs, not console.log
- Start simple (swaps only), then add complexity incrementally
- The old `poc-fuzzing-old.ts` file exists as a reference (but may not work out-of-the-box)

## Additional Resources

- **Clarigen Docs**: https://www.clarigen.dev/
- **Existing Tests**: Review `dlmm-core-swap.test.ts`, `dlmm-core-liquidity.test.ts` for patterns
- **Helpers**: All helper functions in `helpers.ts`
- **Contract Docs**: Generated in `docs/dlmm-core-v-1-1.md`

## Questions to Consider

1. How do you handle transactions that fail due to insufficient balance? (Should retry with different params or skip?)
2. How do you ensure good distribution of operations across all bins?
3. How do you detect and handle Clarity-specific edge cases (integer overflow/underflow)?
4. How do you validate that fees are calculated correctly across many transactions?
5. How do you ensure the test is deterministic enough to reproduce failures?

## Final Notes

- **Take your time**: This is a complex test. Build it incrementally.
- **Test thoroughly**: Run the test multiple times with different seeds
- **Document everything**: Future developers need to understand your test
- **Be smart about randomness**: Feasible random amounts are more valuable than pure randomness
- **Focus on invariants**: They are your safety net

Good luck! 🚀

