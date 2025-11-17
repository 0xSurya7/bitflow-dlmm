#!/bin/bash
cd /Users/dylanfloyd/Documents/Bitflow/git/hodlmm-tests/.bitflow-dlmm/clarity

echo "🔍 Checking fuzz test results..."
echo ""

# Check if test is still running
if pgrep -f "vitest.*comprehensive-fuzz" > /dev/null; then
    echo "⏳ Test is still running..."
    echo ""
    echo "Recent progress:"
    tail -10 fuzz-test-full.log 2>/dev/null | grep -E "(Progress|📈|✅)" || tail -5 fuzz-test-full.log 2>/dev/null
    echo ""
    echo "To see full progress: tail -f fuzz-test-full.log"
else
    echo "✅ Test has completed!"
    echo ""
fi

# Check for results
if [ -d "fuzz-test-results" ]; then
    echo "📁 Results directory found:"
    ls -lh fuzz-test-results/ | tail -10
    echo ""
    
    # Show latest summary
    LATEST_SUMMARY=$(ls -t fuzz-test-results/*.md 2>/dev/null | head -1)
    if [ -n "$LATEST_SUMMARY" ]; then
        echo "📊 Latest Summary:"
        echo "=================="
        cat "$LATEST_SUMMARY"
        echo ""
    fi
    
    # Show latest JSON stats
    LATEST_JSON=$(ls -t fuzz-test-results/*.json 2>/dev/null | head -1)
    if [ -n "$LATEST_JSON" ]; then
        echo "📈 Quick Stats from JSON:"
        echo "========================"
        cat "$LATEST_JSON" | grep -A 10 '"stats"' | head -15
        echo ""
    fi
else
    echo "⚠️  No results directory yet. Test may still be initializing."
fi

echo ""
echo "📝 Full log: fuzz-test-full.log"
echo "📁 Results: fuzz-test-results/"

