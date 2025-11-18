# Comprehensive Rounding Fuzz Testing - Coordination File

**Last Updated**: 2025-11-17
**Status**: Active

## Plan Overview

This is the central coordination file for the comprehensive rounding fuzz testing strategy. All agents working on this plan should check this file for current status and context.

## Goal

Establish a simple, complete, and guaranteed test suite that proves rounding differences in DLMM contracts are acceptable and cannot be exploited, covering all operations with clear mathematical foundations.

## Current Status

| Todo ID | Description | Status | Agent Progress File | Assigned To |
|---------|-------------|--------|---------------------|-------------|
| setup-coordination | Setup coordination structure | ✅ Complete | - | - |
| verify-swap-rounding | Verify and improve swap rounding checks | ⏳ Pending | [TODO-verify-swap-rounding.md](./agent-progress/TODO-verify-swap-rounding.md) | - |
| extend-add-liquidity-rounding | Add float comparison for add-liquidity | ⏳ Pending | [TODO-extend-add-liquidity-rounding.md](./agent-progress/TODO-extend-add-liquidity-rounding.md) | - |
| extend-withdraw-liquidity-rounding | Add float comparison for withdraw-liquidity | ⏳ Pending | [TODO-extend-withdraw-liquidity-rounding.md](./agent-progress/TODO-extend-withdraw-liquidity-rounding.md) | - |
| extend-move-liquidity-rounding | Add float comparison for move-liquidity | ⏳ Pending | [TODO-extend-move-liquidity-rounding.md](./agent-progress/TODO-extend-move-liquidity-rounding.md) | - |
| create-mathematical-proof | Create mathematical proof document | ⏳ Pending | [TODO-create-mathematical-proof.md](./agent-progress/TODO-create-mathematical-proof.md) | - |
| unified-analysis-script | Create unified analysis script | ⏳ Pending | [TODO-unified-analysis-script.md](./agent-progress/TODO-unified-analysis-script.md) | - |
| comprehensive-report-template | Create comprehensive report template | ⏳ Pending | [TODO-comprehensive-report-template.md](./agent-progress/TODO-comprehensive-report-template.md) | - |
| run-comprehensive-test | Run 1000-transaction test | ⏳ Pending | [TODO-run-comprehensive-test.md](./agent-progress/TODO-run-comprehensive-test.md) | - |
| verify-stopping-criteria | Verify all stopping criteria | ⏳ Pending | [TODO-verify-stopping-criteria.md](./agent-progress/TODO-verify-stopping-criteria.md) | - |

## Key Files

### Main Test File
- **File**: `tests/dlmm-core-comprehensive-fuzz.test.ts`
- **Purpose**: Main fuzz test with rounding checks for all operations
- **Key Function**: `checkRoundingErrors()` (starts at line 1202)

### Reference Implementation
- **Swaps**: Lines 1225-1851 (swap-x-for-y and swap-y-for-x have full float comparison) - **Needs verification and potential improvements**
- **Add Liquidity**: Lines 1853-1893 (needs float comparison added)
- **Withdraw Liquidity**: Lines 1894-1922 (needs float comparison added)
- **Move Liquidity**: Missing (needs to be added after line 1922)

### Testing Guide
- `ROUNDING_EXPLOIT_TESTING_GUIDE.md` - **START HERE** - White-hat hacker approach to rounding exploit testing

### Existing Analysis Files
- `ADVERSARIAL_ROUNDING_IMPACT_FINAL_REPORT.md` - Empirical rounding analysis
- `ROUNDING_DIFFERENCES_ANALYSIS_REPORT.md` - Rounding difference categorization
- `ZERO_FEE_EXPLOIT_TEST_RESULTS.md` - Zero-fee exploit test results

### Existing Scripts
- `scripts/analyze-rounding-differences.ts` - Pattern for analysis scripts
- `scripts/analyze-adversarial-impact.ts` - Pattern for adversarial analysis

## Lessons Learned

See [lessons-learned/](./lessons-learned/) directory for shared knowledge, patterns, and gotchas.

## Agent Onboarding

**Start here**: Read `ROUNDING_EXPLOIT_TESTING_GUIDE.md` for the testing philosophy and approach.

When starting work on a todo:

1. **Read `ROUNDING_EXPLOIT_TESTING_GUIDE.md`** - Understand the white-hat hacker approach
2. **Read this coordination file** for full context
3. **Check the agent progress file** for your specific todo (see table above)
4. **Review the reference implementation** (swap checks at lines 1274-1540)
5. **Check lessons-learned/** for relevant patterns
6. **Update your progress file** as you work
7. **Update this coordination file** when you complete your todo

## Progress File Template

Each agent should maintain a progress file with:
- **Status**: Pending / In Progress / Blocked / Complete
- **Context**: What you're working on and why
- **Progress**: What you've done so far
- **Blockers**: Any issues preventing progress
- **Next Steps**: What needs to happen next
- **Onboarding Notes**: Key information for another agent to take over

## Dependencies

- Todo 1 (verify swap rounding) can be done in parallel with todos 2-4
- Todos 2-4 (extend rounding checks) must complete before todo 6 (unified analysis script)
- Todo 6 must complete before todo 7 (comprehensive report)
- Todos 1-4 must complete before todo 8 (run comprehensive test)
- Todos 5, 7, 8 must complete before todo 9 (verify stopping criteria)

## Stopping Criteria

The plan is complete when:
1. ✅ Swap rounding checks verified and comprehensive (todo 1)
2. ✅ All operations have float comparison (todos 2-4)
3. ✅ Mathematical proof exists (todo 5)
4. ✅ Zero violations in comprehensive test (todo 8)
5. ✅ Rounding differences documented (todo 6)
6. ✅ Cumulative impact analyzed (todo 6)
7. ✅ Adversarial scenarios tested (already done)
8. ✅ Unified reporting complete (todo 7)

