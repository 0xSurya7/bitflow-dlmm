# Agent Prompts

## Agent 0: Verify Swap Rounding Checks

**Todo**: `verify-swap-rounding`

**Your Task**: Verify, audit, and improve the existing swap rounding checks for `swap-x-for-y` and `swap-y-for-x`.

**Context**:
- File: `tests/dlmm-core-comprehensive-fuzz.test.ts`
- Location: Lines 1225-1851 (swap-x-for-y and swap-y-for-x sections)
- Status: Swaps already have float comparison implemented, but need verification and potential improvements

**What to Do**:
1. Read `notes/ROUNDING_EXPLOIT_TESTING_GUIDE.md` to understand the testing philosophy
2. Read `notes/COMPREHENSIVE_PLAN_COORDINATION.md` for full context
3. Review the existing swap rounding check implementation (lines 1225-1851)
4. Verify the implementation is correct by:
   - Checking that float math calculations match contract formulas exactly
   - Verifying all edge cases are covered (zero fees, very small amounts, very large amounts, partial fills)
   - Ensuring bias tracking correctly identifies user-favored vs pool-favored rounding
   - Confirming balance conservation checks are accurate
   - Verifying LP supply conservation is checked
5. Test the implementation:
   - Run a small fuzz test (100 transactions) and verify no calculation mismatches
   - Check that rounding differences are being logged correctly
   - Verify bias analysis is working
6. Identify improvements:
   - Are there edge cases not covered?
   - Can the float math calculation be more accurate?
   - Are there additional checks that should be added?
   - Is the logging comprehensive enough?
7. Document findings and make improvements:
   - Fix any bugs or inaccuracies found
   - Add missing edge case coverage
   - Improve documentation/comments
   - Update your progress file: `notes/agent-progress/TODO-verify-swap-rounding.md`

**Key Requirements**:
- Verify float math matches contract formulas exactly
- Test with various fee configurations (zero, low, normal)
- Test with various amounts (very small, small, medium, large, near limits)
- Verify partial fills are handled correctly
- Ensure all rounding differences are logged
- Verify bias tracking works correctly
- Check that balance conservation is accurate

**Progress File**: Create and maintain `notes/agent-progress/TODO-verify-swap-rounding.md`

**Note**: This is the reference implementation that other agents will follow, so it must be correct and comprehensive.

---

## Agent 1: Add-Liquidity Rounding Checks

**Todo**: `extend-add-liquidity-rounding`

**Your Task**: Add float comparison for `add-liquidity` LP token calculation in the `checkRoundingErrors()` function.

**Context**:
- File: `tests/dlmm-core-comprehensive-fuzz.test.ts`
- Location: Lines 1853-1893 (add-liquidity section)
- Reference: See swap rounding checks at lines 1274-1540 for the pattern to follow

**What to Do**:
1. Read `notes/ROUNDING_EXPLOIT_TESTING_GUIDE.md` to understand the testing philosophy
2. Read `notes/COMPREHENSIVE_PLAN_COORDINATION.md` for full context
3. Study the swap rounding check implementation (lines 1274-1540) as your reference pattern
4. In the `add-liquidity` section (lines 1853-1893), add:
   - Float math calculation for expected LP tokens
   - Formula: `LP = sqrt(xAdded * yAdded)` for new bins, or proportional for existing bins
   - Compare contract LP output vs float-calculated expected LP
   - Log all differences (not just violations) using `logger.logRoundingDifference()`
   - Track cumulative LP rounding bias using `logger.logRoundingBias()`
   - Check balance conservation using `logger.logBalanceConservation()`
5. Follow the exact same structure as the swap checks (Check 1: Exact Integer Match, Check 2: Rounding Error Detection, Adversarial Analysis)
6. Update your progress file: `notes/agent-progress/TODO-extend-add-liquidity-rounding.md`

**Key Requirements**:
- Use float math for expected LP calculation
- Compare `actualLPReceived` vs `expectedLPFloat`
- Log all rounding differences, not just violations
- Track bias direction (user-favored vs pool-favored)
- Verify balance conservation

**Progress File**: Create and maintain `notes/agent-progress/TODO-extend-add-liquidity-rounding.md`

---

## Agent 2: Withdraw-Liquidity Rounding Checks

**Todo**: `extend-withdraw-liquidity-rounding`

**Your Task**: Add float comparison for `withdraw-liquidity` X/Y amount calculation in the `checkRoundingErrors()` function.

**Context**:
- File: `tests/dlmm-core-comprehensive-fuzz.test.ts`
- Location: Lines 1894-1922 (withdraw-liquidity section)
- Reference: See swap rounding checks at lines 1274-1540 for the pattern to follow

**What to Do**:
1. Read `notes/ROUNDING_EXPLOIT_TESTING_GUIDE.md` to understand the testing philosophy
2. Read `notes/COMPREHENSIVE_PLAN_COORDINATION.md` for full context
3. Study the swap rounding check implementation (lines 1274-1540) as your reference pattern
4. In the `withdraw-liquidity` section (lines 1894-1922), add:
   - Float math calculation for expected X and Y withdrawal amounts
   - Formula: `xOut = (lpBurned * xBalance) / totalSupply`, `yOut = (lpBurned * yBalance) / totalSupply`
   - Compare contract output vs float-calculated expected amounts
   - Log all differences (not just violations) using `logger.logRoundingDifference()`
   - Track cumulative withdrawal rounding bias using `logger.logRoundingBias()`
   - Check balance conservation using `logger.logBalanceConservation()`
5. Follow the exact same structure as the swap checks (Check 1: Exact Integer Match, Check 2: Rounding Error Detection, Adversarial Analysis)
6. Update your progress file: `notes/agent-progress/TODO-extend-withdraw-liquidity-rounding.md`

**Key Requirements**:
- Use float math for expected withdrawal amounts
- Compare `actualXOut` and `actualYOut` vs `expectedXFloat` and `expectedYFloat`
- Log all rounding differences, not just violations
- Track bias direction (user-favored vs pool-favored)
- Verify balance conservation

**Progress File**: Create and maintain `notes/agent-progress/TODO-extend-withdraw-liquidity-rounding.md`

---

## Agent 3: Move-Liquidity Rounding Checks

**Todo**: `extend-move-liquidity-rounding`

**Your Task**: Add float comparison for `move-liquidity` X/Y amount calculation in the `checkRoundingErrors()` function.

**Context**:
- File: `tests/dlmm-core-comprehensive-fuzz.test.ts`
- Location: Currently missing - needs to be added after line 1922
- Reference: See swap rounding checks at lines 1274-1540 for the pattern to follow

**What to Do**:
1. Read `notes/ROUNDING_EXPLOIT_TESTING_GUIDE.md` to understand the testing philosophy
2. Read `notes/COMPREHENSIVE_PLAN_COORDINATION.md` for full context
3. Study the swap rounding check implementation (lines 1274-1540) as your reference pattern
4. After line 1922, add a new `else if (functionName === 'move-liquidity')` section with:
   - Float math calculation for expected X and Y amounts moved
   - Formula: Based on source bin composition and destination bin price
   - Compare contract output vs float-calculated expected amounts
   - Log all differences (not just violations) using `logger.logRoundingDifference()`
   - Track cumulative move rounding bias using `logger.logRoundingBias()`
   - Check balance conservation using `logger.logBalanceConservation()`
5. Follow the exact same structure as the swap checks (Check 1: Exact Integer Match, Check 2: Rounding Error Detection, Adversarial Analysis)
6. Update your progress file: `notes/agent-progress/TODO-extend-move-liquidity-rounding.md`

**Key Requirements**:
- Understand how move-liquidity works (source bin → destination bin)
- Use float math for expected moved amounts
- Compare actual moved amounts vs expected float amounts
- Log all rounding differences, not just violations
- Track bias direction (user-favored vs pool-favored)
- Verify balance conservation

**Progress File**: Create and maintain `notes/agent-progress/TODO-extend-move-liquidity-rounding.md`

**Note**: You'll need to understand the move-liquidity contract logic to calculate expected amounts correctly. Check the contract code and existing test patterns.

---

## Agent 4: Mathematical Proof Document

**Todo**: `create-mathematical-proof`

**Your Task**: Create a formal mathematical proof document proving rounding bounds and that rounding differences cannot be exploited.

**Context**:
- File: `notes/ROUNDING_BEHAVIOR_MATHEMATICAL_PROOF.md` (create new file)
- Reference: See `notes/ADVERSARIAL_ROUNDING_IMPACT_FINAL_REPORT.md` for empirical data

**What to Do**:
1. Read `notes/ROUNDING_EXPLOIT_TESTING_GUIDE.md` to understand the testing philosophy
2. Read `notes/COMPREHENSIVE_PLAN_COORDINATION.md` for full context
3. Review `notes/ADVERSARIAL_ROUNDING_IMPACT_FINAL_REPORT.md` for empirical data
4. Create `notes/ROUNDING_BEHAVIOR_MATHEMATICAL_PROOF.md` with formal proofs for:
   - **Integer Division Properties**: Prove that integer division always rounds down
   - **Ceiling Rounding in max-amount**: Prove ceiling rounding formula `(a + b - 1) / b` behavior
   - **Swap Rounding Bounds**: Prove maximum rounding difference per swap
   - **Cumulative Rounding Bounds**: Prove that rounding differences cannot compound unboundedly
   - **Pool Value Conservation**: Prove that pool value is conserved (within rounding tolerance)
   - **User Bias Analysis**: Prove that any user-favored rounding is bounded and compensated by fees
5. Include key theorems:
   - Maximum rounding difference per operation: `max_diff <= 1 token` (for swaps), `max_diff <= sqrt(x*y)` (for LP)
   - Cumulative rounding bound: `total_diff <= n * max_diff` where n is number of operations
   - Pool value conservation: `|actual_pool_value - expected_pool_value| <= tolerance`
6. Update your progress file: `notes/agent-progress/TODO-create-mathematical-proof.md`

**Key Requirements**:
- Formal mathematical proofs, not just explanations
- Reference contract formulas and integer math behavior
- Prove bounds on rounding differences
- Prove pool value conservation
- Prove user bias is bounded

**Progress File**: Create and maintain `notes/agent-progress/TODO-create-mathematical-proof.md`

---

## Coordination Notes

All agents should:
- Work in parallel but be aware of file conflicts
- Agent 0 (swap verification) should complete first as it's the reference implementation
- Agents 1-3 are modifying the same file but different sections (should be safe)
- Agent 4 works on a different file (mathematical proof) - completely independent
- Update progress files regularly
- Update the coordination file when complete
- Document any blockers or issues in progress files

**Recommended Start Order**:
1. Start Agent 0 (swap verification) first - this is the reference implementation
2. Start Agents 1-4 in parallel after Agent 0 is complete (or start Agent 4 immediately as it's independent)

