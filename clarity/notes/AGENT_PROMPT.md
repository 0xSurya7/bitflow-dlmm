# Prompt for New Agent: Fix Fuzz Test Invariant Violations

## Context

You're taking over work on a Clarity smart contract fuzz testing suite. The previous agent incorrectly "fixed" invariant violations by disabling checks and adding large tolerances, which is wrong. We need to actually fix the calculation logic.

## The Problem

The fuzz test (`dlmm-core-comprehensive-fuzz.test.ts`) is detecting **14-18 invariant violations per run**. These are NOT false positives - they indicate our TypeScript code is incorrectly calculating expected swap outputs.

**Pattern observed**: Actual contract outputs are consistently ~60% of our calculated expected values, suggesting a systematic error in our calculation logic.

## Your Task

1. **Read the onboarding document**: `FUZZ_TEST_INVARIANT_FIX_ONBOARDING.md`
2. **Understand what invariants mean**: Mathematical properties that MUST hold true
3. **Fix the calculation logic** to correctly mirror the contract's behavior
4. **Verify against contract state**: Use read-only functions and print statements
5. **Achieve zero violations**: Not by disabling checks, but by fixing the math

## Key Principles

- **Use floats for calculations**: Don't try to replicate integer arithmetic - use JavaScript numbers
- **Verify against contract**: Compare your calculations to what the contract actually did
- **No large tolerances**: Only 1-2 token difference for legitimate rounding
- **Log everything**: We need to see where calculations diverge
- **Don't disable checks**: That's what the previous agent did wrong

## Success Criteria

- Zero invariant violations in fuzz test runs
- Calculations match contract output within 1-2 tokens
- All intermediate steps verified against contract state
- Clear explanation of what was wrong and how you fixed it

## Files to Start With

1. `FUZZ_TEST_INVARIANT_FIX_ONBOARDING.md` - Read this first
2. `tests/dlmm-core-comprehensive-fuzz.test.ts` - The test file with violations
3. `contracts/dlmm-core-v-1-1.clar` - The contract being tested

## Questions to Answer

1. Why is actual output ~60% of expected? (This is the key question)
2. What balance does the contract use for calculations? (Before or after swap?)
3. How can we verify intermediate values from the contract?
4. What's the exact order of operations in the contract?

Start by reading the onboarding document, then investigate the violations, and fix the calculation logic properly.

