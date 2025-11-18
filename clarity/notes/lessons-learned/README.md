# Lessons Learned

This directory contains shared knowledge, patterns, and insights that all agents should be aware of.

## Purpose

When working on the comprehensive rounding fuzz testing plan, agents may discover:
- Common patterns to follow
- Gotchas to avoid
- Code patterns that work well
- Contract behavior insights
- Testing strategies

Document these here so other agents can benefit.

## How to Use

1. **Before starting work**: Check this directory for relevant lessons
2. **While working**: Document patterns you discover
3. **After completing work**: Add lessons learned to help future agents

## File Naming

Use descriptive names:
- `float-comparison-patterns.md` - Patterns for float comparison
- `contract-behavior-insights.md` - Insights about contract behavior
- `testing-gotchas.md` - Common testing pitfalls

## Current Lessons

- **[integer-vs-float-math-separation.md](./integer-vs-float-math-separation.md)** - Critical: How to properly separate integer math replication from float math comparison when testing contract calculations
- **[adversarial-exploit-detection.md](./adversarial-exploit-detection.md)** - Critical: Adversarial mindset for exploit detection - any user-favored bias (even 1 token) must fail immediately because it can be repeated to create massive exploits
- **[real-time-progress-bars.md](./real-time-progress-bars.md)** - Critical: How to create progress bars that display in real-time during Vitest test execution by writing directly to `/dev/tty`

