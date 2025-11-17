# Fuzz Test Invariant Violations - Onboarding & Next Steps

## Problem Statement

The comprehensive fuzz test (`dlmm-core-comprehensive-fuzz.test.ts`) is detecting **14-18 invariant violations** per run, indicating that our test calculation logic does not correctly mirror the Clarity smart contract's swap calculations.

### Current Status
- **All 161 unit tests pass** (3 intentionally skipped)
- **Fuzz test passes** but reports invariant violations
- **Pattern observed**: Actual swap outputs are consistently ~60% of our calculated expected values
- **Root cause**: Our TypeScript calculation attempting to replicate the contract's integer arithmetic is incorrect

## What Are Invariant Violations?

### Mathematical Definition

An **invariant** is a property that must hold true before and after a transaction. If an invariant is violated, it means the contract's behavior does not match the expected mathematical properties.

### For Swap Operations

For `swap-x-for-y` and `swap-y-for-x`, the core invariants are:

1. **Conservation of Value**: The value of tokens in the pool must be preserved (accounting for fees)
2. **Correct Output Calculation**: Given input amount `in` and pool state, output amount `out` must match the contract's calculation
3. **Balance Consistency**: 
   - `beforeBalance + input - fees = afterBalance + output` (for input token)
   - `beforeBalance - output = afterBalance` (for output token)
4. **LP Supply Unchanged**: LP token supply must remain constant during swaps
5. **Fee Accounting**: Protocol fees must increase by the correct amount

### Current Violations

The violations are in the **"Rounding error: Swap calculation mismatch"** checks, where:
- **Expected output** (our calculation): `expectedOut`
- **Actual output** (from contract): `actualOut`
- **Difference**: Often 40-60% of expected value

This indicates our calculation is fundamentally wrong, not just a rounding issue.

## Why Our Current Approach Is Wrong

1. **Integer Arithmetic Replication**: We're trying to replicate Clarity's integer division in TypeScript, which is error-prone
2. **Missing Contract State**: We're not using the contract's actual state at the time of calculation
3. **No Verification**: We're not comparing against the contract's own print statements or read-only functions

## Correct Approach

### 1. Use Float Calculations for Expected Values

Instead of trying to replicate integer arithmetic:
- Use JavaScript `number` (float) for intermediate calculations
- Apply the contract's formulas using floats
- Round only at the final step to compare with contract's integer result
- This will help identify if the issue is in our formula or just rounding

### 2. Verify Against Contract's Actual State

Use the contract's read-only functions and print statements to verify:
- What balances did the contract actually use?
- What was the actual `updated-x-amount` or `updated-y-amount` after capping?
- What fees were actually calculated?
- What was the actual `dx` and `dy` before capping?

### 3. Compare Step-by-Step

For each swap, log and compare:
1. Input amount requested
2. Max amount calculated by contract (from print or read-only)
3. Actual amount swapped (from `result.in`)
4. Fees calculated (from print or read-only)
5. `dx`/`dy` before cap (from print or read-only)
6. Final output (from `result.out`)

## Files to Review

### Primary Files
- `/Users/dylanfloyd/Documents/Bitflow/git/hodlmm-tests/.bitflow-dlmm/clarity/tests/dlmm-core-comprehensive-fuzz.test.ts`
  - Lines 898-960: `swap-x-for-y` calculation check
  - Lines 989-1070: `swap-y-for-x` calculation check
  - Lines 537-616: `checkSwapInvariants` function

### Contract Files
- `/Users/dylanfloyd/Documents/Bitflow/git/hodlmm-tests/.bitflow-dlmm/clarity/contracts/dlmm-core-v-1-1.clar`
  - Lines 1219-1289: `swap-x-for-y` function
  - Lines 1365-1435: `swap-y-for-x` function

### Invariant Definitions
- `/Users/dylanfloyd/Documents/Bitflow/git/hodlmm-tests/.bitflow-dlmm/clarity/tests/invariants.ts`
  - Core invariant checking functions

## Next Steps

### Step 1: Add Contract State Verification
- Add read-only calls to get actual balances used by contract
- Add logging to capture contract's print statements
- Compare our captured state vs contract's actual state

### Step 2: Rewrite Calculations Using Floats
- Convert all calculations to use JavaScript `number` type
- Implement contract formulas exactly as written, but with float math
- Only convert to `bigint` for final comparison
- This will help identify formula errors vs rounding errors

### Step 3: Add Step-by-Step Verification
- For each swap, log:
  - Input amount
  - Max amount (from contract calculation)
  - Capped amount (from `result.in`)
  - Fees (calculate and verify)
  - `dx`/`dy` before cap
  - Final output (from `result.out`)
- Compare each step with contract's actual values

### Step 4: Fix the Calculation Logic
- Once we identify where the calculation diverges, fix it
- The ~60% pattern suggests we're missing a multiplication or division step
- Possible issues:
  - Wrong balance being used (before vs after)
  - Missing fee adjustment
  - Incorrect capping logic
  - Wrong formula for `dx`/`dy` calculation

### Step 5: Re-enable Strict Checks
- Once calculations match, remove tolerance
- Only allow 1-2 token difference for legitimate integer rounding
- Any larger differences indicate real bugs

## Key Questions to Answer

1. **What balance does the contract use for max-amount calculation?**
   - Before swap or after swap?
   - How do we verify this?

2. **What is the exact order of operations?**
   - Cap input → Calculate fees → Calculate output → Cap output?
   - Or is there a different order?

3. **How do we get the contract's intermediate values?**
   - Can we use print statements?
   - Are there read-only functions?
   - Can we add temporary read-only functions for debugging?

4. **Why is actual output ~60% of expected?**
   - Are we missing a division by 1.67 (or multiplication by 0.6)?
   - Are we using the wrong balance?
   - Are fees being calculated incorrectly?

## Success Criteria

- **Zero invariant violations** in fuzz test runs
- **Calculations match contract output** within 1-2 tokens (legitimate rounding)
- **All intermediate steps verified** against contract's actual state
- **Clear documentation** of how calculations work

## Running the Tests

```bash
cd /Users/dylanfloyd/Documents/Bitflow/git/hodlmm-tests/.bitflow-dlmm/clarity
source ~/.nvm/nvm.sh
nvm use 20
npm test -- tests/dlmm-core-comprehensive-fuzz.test.ts
```

Check the logs in `logs/fuzz-test-results/` for detailed violation information.

## Important Notes

- **Do NOT disable checks** - that's what the previous agent did incorrectly
- **Do NOT add large tolerances** - that hides real problems
- **Do verify against contract state** - don't just replicate formulas
- **Do use floats for calculations** - it's easier to debug than integer math
- **Do log everything** - we need to see where the calculation diverges

## Contract Formulas Reference

### swap-x-for-y (lines 1260-1275)
```
max-x-amount = (y-balance * PRICE_SCALE_BPS + bin-price - 1) / bin-price
updated-max-x-amount = max-x-amount * FEE_SCALE_BPS / (FEE_SCALE_BPS - swap-fee-total)
updated-x-amount = min(x-amount, updated-max-x-amount)
x-amount-fees-total = (updated-x-amount * swap-fee-total) / FEE_SCALE_BPS
dx = updated-x-amount - x-amount-fees-total
dy-before-cap = (dx * bin-price) / PRICE_SCALE_BPS
dy = min(dy-before-cap, y-balance)
```

### swap-y-for-x (lines 1405-1420)
```
max-y-amount = (x-balance * bin-price + PRICE_SCALE_BPS - 1) / PRICE_SCALE_BPS
updated-max-y-amount = max-y-amount * FEE_SCALE_BPS / (FEE_SCALE_BPS - swap-fee-total)
updated-y-amount = min(y-amount, updated-max-y-amount)
y-amount-fees-total = (updated-y-amount * swap-fee-total) / FEE_SCALE_BPS
dy = updated-y-amount - y-amount-fees-total
dx-before-cap = (dy * PRICE_SCALE_BPS) / bin-price
dx = min(dx-before-cap, x-balance)
```

## Constants
- `PRICE_SCALE_BPS = 100000000` (100 million)
- `FEE_SCALE_BPS = 10000` (10 thousand)
- `CENTER_BIN_ID = 500` (for converting signed to unsigned bin IDs)

