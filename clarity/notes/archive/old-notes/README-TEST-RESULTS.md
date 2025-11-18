# Fuzz Test Results

## ✅ Latest Completed Test

**1000 Transaction Test** - Completed successfully!

- **Success Rate**: 86.40% (788/912 successful)
- **Bin Coverage**: 49 unique bins  
- **Functions Tested**: All 5 core functions
- **Results File**: `fuzz-test-results/fuzz-test-summary-2025-11-14T05-50-52-500Z.md`

### View Results:
```bash
cat fuzz-test-results/fuzz-test-summary-2025-11-14T05-50-52-500Z.md
```

## ⏳ Current Test Status

**10,000 Transaction Test** - Running

### Check Status:
```bash
# Quick status
./status.sh

# Watch progress (if output appears)
tail -f fuzz-10000-progress.log | grep -E '\[.*█|Progress:|Success:|Rate:'

# Check if running
ps aux | grep vitest | grep fuzz
```

### Note:
The test is running (process active, high CPU), but output may be buffered. Progress will appear in the log file once transactions start executing.

## 📁 All Results

All test results are saved in: `fuzz-test-results/`

- `*.md` - Summary reports (read these first!)
- `*.json` - Detailed transaction data
- `*.txt` - Full execution logs

## 📊 Progress Monitoring

The test includes progress bars that show:
- Progress percentage with visual bar: `[████████░░░░] 50%`
- Success rate
- Transaction rate (tx/s)
- Estimated time remaining

Progress updates every 10 transactions for the 10,000 transaction test.

