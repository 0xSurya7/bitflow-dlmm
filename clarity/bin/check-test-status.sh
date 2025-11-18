#!/bin/bash

echo "🔍 FUZZ TEST STATUS CHECKER"
echo "=========================="
echo ""

# Check for running tests
RUNNING=$(ps aux | grep -E "vitest.*dlmm-core-comprehensive-fuzz|node.*test.*fuzz" | grep -v grep | wc -l | tr -d ' ')

if [ "$RUNNING" -gt 0 ]; then
  echo "✅ Tests are RUNNING ($RUNNING processes)"
  echo ""
  echo "Recent activity:"
  if [ -f "fuzz-10000.log" ]; then
    echo "📄 10,000 transaction test:"
    tail -n 5 fuzz-10000.log | grep -E "Progress|Success|Rate" || tail -n 3 fuzz-10000.log
  elif [ -f "fuzz-1000.log" ]; then
    echo "📄 1,000 transaction test:"
    tail -n 5 fuzz-1000.log | grep -E "Progress|Success|Rate" || tail -n 3 fuzz-1000.log
  fi
else
  echo "⏸️  No tests currently running"
fi

echo ""
echo "📊 Latest Results:"
LATEST=$(ls -t fuzz-test-results/*.md 2>/dev/null | head -1)
if [ -n "$LATEST" ]; then
  echo "📄 $LATEST"
  echo ""
  tail -n 25 "$LATEST"
else
  echo "   No results found yet"
fi

echo ""
echo "📁 Log Files:"
ls -lht fuzz-*.log 2>/dev/null | head -3 | awk '{print "   " $9 " (" $5 ")"}'

echo ""
echo "To monitor live:"
echo "  tail -f fuzz-10000.log"

