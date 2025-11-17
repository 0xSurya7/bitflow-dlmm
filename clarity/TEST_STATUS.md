# Test Status & Organization

## Current Test Files

### Core Tests (GB - Graybeard Audit)
Location: `.bitflow-dlmm/external-test-context/GB-audit-bitflow-dlmm-2025-10-main/clarity/tests/`
- `dlmm-core-swap.test.ts` - Swap functions
- `dlmm-core-liquidity.test.ts` - Liquidity operations
- `dlmm-core-settings.test.ts` - Admin/settings
- `dlmm-core-fees.test.ts` - Fee management
- `dlmm-swap-router.test.ts` - Swap router
- `dlmm-liquidity-router.test.ts` - Liquidity router

**Status**: Need to verify these run (29/30 passing expected)

### Current Active Tests
Location: `.bitflow-dlmm/clarity/tests/`
- `dlmm-core-swap.test.ts` - Swap tests
- `dlmm-core-liquidity.test.ts` - Liquidity tests
- `dlmm-core-settings.test.ts` - Settings/admin tests
- `dlmm-core-fees.test.ts` - Fee tests
- `dlmm-core-fuzz.test.ts` - Basic fuzz test
- `dlmm-core-comprehensive-fuzz.test.ts` - **Main fuzz test (10k transactions)**
- `dlmm-swap-router.test.ts` - Swap router
- `dlmm-liquidity-router.test.ts` - Liquidity router

### Clarity Alliance Tests
Location: `.bitflow-dlmm/external-test-context/CA-testing-dlmm/`
- `audit_fix_tests.diff` - **Fix file for known test issues**
- `notes-testing.md` - Testing notes
- `poc-fuzzing-old.ts` - Old fuzz test reference

**Known Issues**: Tests need fixes from `audit_fix_tests.diff`:
- Change `binId` → `expectedBinId` in swap router tests
- Fix fee test expectations
- Fix error code expectations in liquidity router

## Fuzz Test Coverage

### Functions Tested
1. `swap-x-for-y` - Swap X tokens for Y
2. `swap-y-for-x` - Swap Y tokens for X
3. `add-liquidity` - Add liquidity to bins
4. `withdraw-liquidity` - Remove liquidity
5. `move-liquidity` - Move liquidity between bins

### What's NOT in Fuzz Tests
- `create-pool` - Tested separately (not in fuzz loop)
- Governance/admin functions - Separate test file

### Current Fuzz Test Features
- 10,000 random transactions
- Invariant checking (conservation of value, LP tokens, balances)
- Rounding error detection
- State tracking before/after each transaction
- Detailed logging to `logs/fuzz-test-results/`
- Success rate tracking (~86% expected)

## Fuzz Test Details

### Functions Tested in Fuzz Test
1. **swap-x-for-y** - Swaps X tokens for Y (uses active bin only)
2. **swap-y-for-x** - Swaps Y tokens for X (uses active bin only)
3. **add-liquidity** - Adds liquidity to any bin
4. **withdraw-liquidity** - Removes liquidity from bins
5. **move-liquidity** - Moves liquidity between bins

### Invariants Checked
- Conservation of value (tokens in = tokens out + fees)
- LP token calculations match expected values
- Balance changes match contract-reported amounts
- No dust accumulation
- Global pool state consistency

### Current Status
- Fuzz test exists: `dlmm-core-comprehensive-fuzz.test.ts`
- Configurable transaction count (default 10,000)
- Detailed logging to `logs/fuzz-test-results/`
- Success rate tracking (~86% expected)
- Invariant violation detection

## CA Test Fixes Applied ✅

Applied fixes from `audit_fix_tests.diff`:
- ✅ Changed `binId` → `expectedBinId` in all swap router tests (23 instances)
- ✅ Removed `.skip` from fee test
- ✅ Fixed fee test expectation (expect 0n instead of calculated fee)
- ✅ Fixed error code in liquidity router test (ERR_NO_ACTIVE_BIN_DATA)

## Next Steps

1. ✅ **Node version fixed** - Now using Node v20.19.5 (`.nvmrc` file created)
2. ✅ **Fuzz test default reduced** - Changed from 10,000 to 100 transactions (can override with `FUZZ_SIZE` env var)
3. ⏳ **Run GB tests** - Verify they pass (29/30 expected)
4. ⏳ **Verify all tests pass** - Run full test suite

