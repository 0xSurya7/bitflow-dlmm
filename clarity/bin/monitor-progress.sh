#!/bin/bash

# Progress monitor with visual progress bar
cd "$(dirname "$0")"

echo "🔍 FUZZ TEST PROGRESS MONITOR"
echo "=============================="
echo ""

# Check if test is running
RUNNING=$(ps aux | grep -E "vitest.*dlmm-core-comprehensive-fuzz|node.*test.*fuzz" | grep -v grep | wc -l | tr -d ' ')

if [ "$RUNNING" -eq 0 ]; then
  echo "❌ No tests currently running"
  echo ""
  echo "Latest results:"
  LATEST=$(ls -t fuzz-test-results/*.md 2>/dev/null | head -1)
  if [ -n "$LATEST" ]; then
    echo "📄 $LATEST"
    tail -n 30 "$LATEST"
  fi
  exit 0
fi

echo "✅ Test is RUNNING"
echo ""

# Try to extract progress from log
LOG_FILE="fuzz-10000.log"
if [ ! -f "$LOG_FILE" ]; then
  LOG_FILE="fuzz-1000.log"
fi

if [ -f "$LOG_FILE" ]; then
  # Extract latest progress line
  PROGRESS_LINE=$(tail -100 "$LOG_FILE" | grep -E "Progress: [0-9]+/[0-9]+" | tail -1)
  
  if [ -n "$PROGRESS_LINE" ]; then
    # Extract numbers: Progress: X/Y
    CURRENT=$(echo "$PROGRESS_LINE" | grep -oE "Progress: [0-9]+" | grep -oE "[0-9]+" | head -1)
    TOTAL=$(echo "$PROGRESS_LINE" | grep -oE "/[0-9]+" | grep -oE "[0-9]+" | head -1)
    SUCCESS_RATE=$(echo "$PROGRESS_LINE" | grep -oE "Success: [0-9.]+%" | grep -oE "[0-9.]+")
    RATE=$(echo "$PROGRESS_LINE" | grep -oE "Rate: [0-9.]+" | grep -oE "[0-9.]+")
    ELAPSED=$(echo "$PROGRESS_LINE" | grep -oE "Elapsed: [0-9.]+" | grep -oE "[0-9.]+")
    
    if [ -n "$CURRENT" ] && [ -n "$TOTAL" ]; then
      PERCENT=$((CURRENT * 100 / TOTAL))
      
      echo "📊 Progress: $CURRENT / $TOTAL transactions ($PERCENT%)"
      echo "✅ Success Rate: ${SUCCESS_RATE}%"
      echo "⚡ Rate: ${RATE} tx/s"
      echo "⏱️  Elapsed: ${ELAPSED}s"
      echo ""
      
      # Progress bar (50 chars wide)
      BAR_WIDTH=50
      FILLED=$((PERCENT * BAR_WIDTH / 100))
      EMPTY=$((BAR_WIDTH - FILLED))
      
      printf "Progress: ["
      printf "%${FILLED}s" | tr ' ' '█'
      printf "%${EMPTY}s" | tr ' ' '░'
      printf "] %d%%\n" "$PERCENT"
      echo ""
      
      # Estimate time remaining
      if [ -n "$RATE" ] && [ "$RATE" != "0" ] && [ -n "$ELAPSED" ]; then
        REMAINING=$((TOTAL - CURRENT))
        TIME_REMAINING=$(echo "scale=0; $REMAINING / $RATE" | bc 2>/dev/null || echo "?")
        if [ "$TIME_REMAINING" != "?" ]; then
          MINUTES=$((TIME_REMAINING / 60))
          SECONDS=$((TIME_REMAINING % 60))
          echo "⏳ Estimated time remaining: ${MINUTES}m ${SECONDS}s"
        fi
      fi
    fi
  fi
  
  echo ""
  echo "Recent activity:"
  tail -n 5 "$LOG_FILE" | grep -v "^$" | tail -3
fi

echo ""
echo "📁 Latest Results:"
LATEST=$(ls -t fuzz-test-results/*.md 2>/dev/null | head -1)
if [ -n "$LATEST" ]; then
  echo "   $LATEST"
  echo ""
  tail -n 15 "$LATEST" | head -10
fi

echo ""
echo "💡 To watch live: tail -f $LOG_FILE | grep Progress"

