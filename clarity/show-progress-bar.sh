#!/bin/bash

# Progress bar display script
cd "$(dirname "$0")"

LOG_FILE="fuzz-10000-progress.log"

clear
echo "📊 FUZZ TEST PROGRESS MONITOR"
echo "=============================="
echo ""

while true; do
  clear
  echo "📊 FUZZ TEST PROGRESS - $(date '+%H:%M:%S')"
  echo "=============================="
  echo ""
  
  # Check if test is running
  if ! pgrep -f 'vitest.*dlmm-core-comprehensive-fuzz' > /dev/null; then
    echo "❌ Test is NOT running"
    echo ""
    echo "Latest completed results:"
    LATEST=$(ls -t fuzz-test-results/*.md 2>/dev/null | head -1)
    if [ -n "$LATEST" ]; then
      tail -30 "$LATEST"
    fi
    echo ""
    echo "Press Ctrl+C to exit"
    sleep 5
    continue
  fi
  
  echo "✅ Test is RUNNING"
  echo ""
  
  if [ ! -f "$LOG_FILE" ]; then
    echo "⏳ Log file not created yet..."
    sleep 2
    continue
  fi
  
  # Extract latest progress bar
  PROGRESS_BAR=$(tail -500 "$LOG_FILE" 2>/dev/null | grep -E "\[.*█.*\]" | tail -1)
  
  if [ -n "$PROGRESS_BAR" ]; then
    echo "$PROGRESS_BAR"
    echo ""
    
    # Get stats
    STATS=$(tail -500 "$LOG_FILE" 2>/dev/null | grep -E "Success:|Rate:|ETA:" | tail -3)
    echo "$STATS"
    
    # Latest transaction
    LATEST_TX=$(tail -200 "$LOG_FILE" 2>/dev/null | grep -E "Transaction [0-9]+" | tail -1)
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
  else
    echo "⏳ Test is initializing..."
    echo ""
    echo "Last 5 lines from log:"
    tail -5 "$LOG_FILE" 2>/dev/null
    echo ""
    echo "Waiting for progress output..."
  fi
  
  echo ""
  echo "Refreshing every 2 seconds... (Ctrl+C to stop)"
  sleep 2
done

