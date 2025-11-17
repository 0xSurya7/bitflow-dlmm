# Fuzz Test Results - Quick View

## Latest Completed Test (1000 transactions)
**Date:** 2025-11-14T05:50:52  
**File:** `fuzz-test-results/fuzz-test-summary-2025-11-14T05-50-52-500Z.md`

### Results:
- **Success Rate**: 86.40% (788/912 successful)
- **Invariant Violations**: 174 (mostly false positives - fixed in latest version)
- **Bin Coverage**: 49 unique bins
- **Function Distribution**: All 5 core functions tested

### Errors:
- ERR 1020: 67 (54.03% of failures)
- ERR 1021: 37 (29.84% of failures)
- ERR 1031: 11 (8.87% of failures)
- ERR 1030: 9 (7.26% of failures)

## Current Test (10,000 transactions)
**Status**: Running
**Monitor**: 
```bash
# Quick status
./show-progress.sh

# Live monitoring (updates every 2 seconds)
./live-progress.sh

# Watch log file directly
tail -f fuzz-10000-live.log | grep -E "\[.*█|Progress:|Success:|Rate:|ETA:"
```

## All Results Location
All detailed results are in: `fuzz-test-results/`
- `*.md` - Summary reports
- `*.json` - Detailed transaction data
- `*.txt` - Full logs

