#!/bin/bash

# Real-time progress watcher with progress bar
cd "$(dirname "$0")"

LOG_FILE="fuzz-10000-full.log"

if [ ! -f "$LOG_FILE" ]; then
  echo "❌ Log file not found: $LOG_FILE"
  echo "Looking for other log files..."
  ls -lht fuzz-*.log 2>/dev/null | head -3
  exit 1
fi

echo "👀 Watching fuzz test progress..."
echo "Press Ctrl+C to stop"
echo ""

# Watch for progress updates
tail -f "$LOG_FILE" 2>/dev/null | while IFS= read -r line; do
  # Show progress bar lines
  if echo "$line" | grep -qE "\[.*█.*\]|Progress:|Success:|Rate:|ETA:"; then
    echo "$line"
  fi
  # Show transaction numbers every 10
  if echo "$line" | grep -qE "Transaction [0-9]+" && echo "$line" | grep -oE "Transaction [0-9]+" | grep -oE "[0-9]+" | awk '{if ($1 % 10 == 0) print}'; then
    echo "$line"
  fi
  # Show any errors or violations
  if echo "$line" | grep -qE "INVARIANT|ERROR|Error|FAIL"; then
    echo "⚠️  $line"
  fi
done

