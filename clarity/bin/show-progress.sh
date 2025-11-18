#!/bin/bash

# Show current progress with progress bar
cd "$(dirname "$0")"

LOG_FILE="fuzz-10000-full.log"

if [ ! -f "$LOG_FILE" ]; then
  echo "❌ Log file not found: $LOG_FILE"
  exit 1
fi

# Extract latest progress
PROGRESS=$(tail -500 "$LOG_FILE" | grep -E "\[.*█.*\]|Progress: [0-9]+/[0-9]+" | tail -1)

if [ -z "$PROGRESS" ]; then
  echo "⏳ Test is starting up... (no progress yet)"
  echo ""
  echo "Last 10 lines of log:"
  tail -10 "$LOG_FILE"
  exit 0
fi

echo "$PROGRESS"

# Also show the stats lines
tail -500 "$LOG_FILE" | grep -E "Success:|Rate:|ETA:" | tail -3

# Show latest transaction
LATEST_TX=$(tail -200 "$LOG_FILE" | grep -E "Transaction [0-9]+" | tail -1)
if [ -n "$LATEST_TX" ]; then
  echo ""
  echo "Latest: $LATEST_TX"
fi

# Check for errors
ERRORS=$(tail -500 "$LOG_FILE" | grep -cE "INVARIANT|ERROR|Error" || echo "0")
if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "⚠️  $ERRORS errors/violations detected in recent transactions"
fi

