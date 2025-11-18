#!/bin/bash

echo "🔍 Checking fuzz test progress..."
echo ""

# Check if test is running
if pgrep -f "vitest.*dlmm-core-comprehensive-fuzz" > /dev/null; then
  echo "✅ Test is RUNNING"
  echo ""
  echo "Recent output:"
  tail -n 20 fuzz-test-execution.log 2>/dev/null || echo "No log file yet"
else
  echo "⏸️  Test is NOT running"
  echo ""
  echo "Last results:"
  if [ -d "fuzz-test-results" ]; then
    LATEST=$(ls -t fuzz-test-results/*.md 2>/dev/null | head -1)
    if [ -n "$LATEST" ]; then
      echo "📄 Latest summary: $LATEST"
      tail -n 30 "$LATEST"
    fi
  fi
fi

echo ""
echo "To run a new test:"
echo "  FUZZ_SIZE=1000 npm test -- dlmm-core-comprehensive-fuzz.test.ts"

