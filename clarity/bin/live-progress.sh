#!/bin/bash

# Live progress monitor - shows progress bar and stats
cd "$(dirname "$0")"

LOG_FILE="fuzz-10000-live.log"

echo "🔍 LIVE FUZZ TEST PROGRESS MONITOR"
echo "==================================="
echo ""
echo "Watching: $LOG_FILE"
echo "Press Ctrl+C to stop"
echo ""

if [ ! -f "$LOG_FILE" ]; then
  echo "⏳ Waiting for log file to be created..."
  while [ ! -f "$LOG_FILE" ]; do
    sleep 1
  done
fi

# Clear screen and show progress
while true; do
  clear
  echo "🔍 LIVE FUZZ TEST PROGRESS"
  echo "=========================="
  echo ""
  
  # Check if test is running
  if ! pgrep -f "vitest.*dlmm-core-comprehensive-fuzz" > /dev/null; then
    echo "❌ Test is NOT running"
    echo ""
    echo "Latest results:"
    LATEST=$(ls -t fuzz-test-results/*.md 2>/dev/null | head -1)
    if [ -n "$LATEST" ]; then
      tail -30 "$LATEST"
    fi
    break
  fi
  
  # Extract latest progress bar
  PROGRESS_BAR=$(tail -200 "$LOG_FILE" 2>/dev/null | grep -E "\[.*█.*\]" | tail -1)
  STATS=$(tail -200 "$LOG_FILE" 2>/dev/null | grep -E "Success:|Rate:|ETA:" | tail -3)
  LATEST_TX=$(tail -200 "$LOG_FILE" 2>/dev/null | grep -E "Transaction [0-9]+" | tail -1)
  
  if [ -n "$PROGRESS_BAR" ]; then
    echo "$PROGRESS_BAR"
    echo ""
    echo "$STATS"
  else
    echo "⏳ Test is starting up..."
    echo ""
    echo "Last 5 lines:"
    tail -5 "$LOG_FILE" 2>/dev/null
  fi
  
  if [ -n "$LATEST_TX" ]; then
    echo ""
    echo "Latest: $LATEST_TX"
  fi
  
  # Count errors
  ERRORS=$(tail -500 "$LOG_FILE" 2>/dev/null | grep -cE "INVARIANT|ERROR" || echo "0")
  if [ "$ERRORS" -gt 0 ]; then
    echo ""
    echo "⚠️  $ERRORS errors/violations in recent transactions"
  fi
  
  echo ""
  echo "Refreshing in 2 seconds... (Ctrl+C to stop)"
  sleep 2
done

