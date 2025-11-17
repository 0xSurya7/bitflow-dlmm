#!/bin/bash

# Simple progress checker with progress bar
cd "$(dirname "$0")"

LOG="fuzz-10000-progress.log"

echo "📊 FUZZ TEST PROGRESS"
echo "===================="
echo ""

# Check if running
if ! pgrep -f "vitest.*dlmm-core-comprehensive-fuzz" > /dev/null; then
  echo "❌ Test is NOT running"
  echo ""
  echo "Latest completed results:"
  ls -t fuzz-test-results/*.md 2>/dev/null | head -1 | xargs tail -30
  exit 0
fi

echo "✅ Test is RUNNING"
echo ""

if [ ! -f "$LOG" ]; then
  echo "⏳ Log file not created yet (test starting up)..."
  exit 0
fi

# Get latest progress
PROGRESS=$(tail -500 "$LOG" 2>/dev/null | grep -E "\[.*█.*\]" | tail -1)

if [ -n "$PROGRESS" ]; then
  echo "$PROGRESS"
  echo ""
  # Get stats
  tail -500 "$LOG" 2>/dev/null | grep -E "Success:|Rate:|ETA:" | tail -3
  echo ""
  # Latest transaction
  LATEST=$(tail -200 "$LOG" 2>/dev/null | grep -E "Transaction [0-9]+" | tail -1)
  if [ -n "$LATEST" ]; then
    echo "Latest: $LATEST"
  fi
else
  echo "⏳ Test is initializing..."
  echo ""
  echo "Last 5 lines:"
  tail -5 "$LOG" 2>/dev/null
fi

echo ""
echo "💡 To watch live: tail -f $LOG | grep -E '\[.*█|Progress:|Success:|Rate:'"

