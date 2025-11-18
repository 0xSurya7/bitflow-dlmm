#!/bin/bash
clear
echo "📊 FUZZ TEST STATUS - $(date)"
echo "=============================="
echo ""
echo "Test Running: $(pgrep -f 'vitest.*dlmm-core-comprehensive-fuzz' | wc -l | tr -d ' ')"
echo ""
if [ -f fuzz-10000-progress.log ]; then
  echo "Log file: $(wc -l < fuzz-10000-progress.log) lines"
  echo ""
  PROGRESS=$(tail -500 fuzz-10000-progress.log 2>/dev/null | grep -E "\[.*█.*\]" | tail -1)
  if [ -n "$PROGRESS" ]; then
    echo "$PROGRESS"
    tail -500 fuzz-10000-progress.log 2>/dev/null | grep -E "Success:|Rate:|ETA:" | tail -3
  else
    echo "⏳ Initializing... (checking for 'Starting' message)"
    tail -50 fuzz-10000-progress.log 2>/dev/null | grep -E "Starting|Transaction" | tail -3
    if [ -z "$(tail -50 fuzz-10000-progress.log 2>/dev/null | grep -E 'Starting|Transaction')" ]; then
      echo "Still in setup phase..."
      tail -3 fuzz-10000-progress.log 2>/dev/null
    fi
  fi
else
  echo "Log file not created yet"
fi
echo ""
echo "💡 Run: ./status.sh (refreshes every 2s)"
