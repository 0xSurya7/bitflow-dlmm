# Critical Lesson: Real-Time Progress Bars in Vitest Tests

**Issue**: Progress bars written using `console.log`, `console.error`, or `process.stderr.write()` are buffered by Vitest and only appear after the test completes, not in real-time.

**Root Cause**: Vitest captures and buffers all output from stdout and stderr streams, including writes to file descriptor 2 (stderr). This means progress updates don't appear until the test finishes.

**Solution**: Write directly to `/dev/tty` using a file descriptor that's kept open for the entire test duration.

## Implementation Pattern

```typescript
import * as fs from 'fs';

// At the start of your test function:
let ttyFd: number | null = null;
try {
  ttyFd = fs.openSync('/dev/tty', 'w');
} catch (e) {
  // /dev/tty not available, will use stderr fallback
}

// In your progress update loop:
if (ttyFd !== null) {
  try {
    fs.writeSync(ttyFd, progressLine + '\r'); // Use \r to overwrite same line
  } catch (e) {
    // Fallback to stderr if TTY write fails
    fs.writeSync(2, progressLine + '\r');
  }
} else {
  // Fallback to stderr if /dev/tty not available
  fs.writeSync(2, progressLine + '\r');
}

// At the end of your test function:
if (ttyFd !== null) {
  try {
    fs.closeSync(ttyFd);
  } catch (e) {
    // Ignore errors on close
  }
}
```

## Key Principles

1. **CRITICAL: Do NOT change any test logic**: The progress bar implementation must be purely additive - only add progress output code, do not modify any existing test logic, calculations, assertions, or test flow
2. **Open `/dev/tty` once at the start**: Don't open/close it for each write - keep it open for the entire test duration
3. **Write synchronously**: Use `fs.writeSync()` not async writes - this ensures immediate output
4. **Use `\r` to overwrite**: Use carriage return (`\r`) to overwrite the same line, only add newline (`\n`) on the last update
5. **Handle errors gracefully**: Always have a fallback to stderr in case `/dev/tty` is not available (e.g., in CI environments)

## What DOESN'T Work

- ❌ `console.log()` or `console.error()` - buffered by Vitest
- ❌ `process.stderr.write()` - buffered by Vitest
- ❌ `fs.writeSync(2, ...)` - still buffered by Vitest
- ❌ Opening/closing `/dev/tty` for each write - too slow and may not work
- ❌ Using `fsyncSync()` on file descriptor 2 - fails because stderr is a stream, not a file
- ❌ Using `setImmediate()` or async operations - delays the write

## What DOES Work

- ✅ Opening `/dev/tty` once at the start of the test
- ✅ Writing synchronously with `fs.writeSync(ttyFd, ...)`
- ✅ Using `\r` to overwrite the same line
- ✅ Keeping the file descriptor open for the entire test duration

## Example: Progress Bar Implementation

```typescript
// Open TTY at start
let ttyFd: number | null = null;
try {
  ttyFd = fs.openSync('/dev/tty', 'w');
} catch (e) {
  // Fallback will be used
}

let lastPrintedPercent = -1;

for (let i = 1; i <= total; i++) {
  const currentPercent = Math.floor((i / total) * 100);
  const shouldUpdate = i === 1 || 
                       i === total || 
                       currentPercent !== lastPrintedPercent;
  
  if (shouldUpdate) {
    lastPrintedPercent = currentPercent;
    const percent = ((i / total) * 100).toFixed(1);
    const barWidth = 40;
    const filled = Math.floor((i / total) * barWidth);
    const empty = barWidth - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const progressLine = `📊 [${bar}] ${percent}% (${i}/${total})`;
    
    // Write to TTY with \r to overwrite same line
    const lineEnd = i === total ? '\n' : '\r';
    if (ttyFd !== null) {
      try {
        fs.writeSync(ttyFd, progressLine + lineEnd);
      } catch (e) {
        fs.writeSync(2, progressLine + lineEnd);
      }
    } else {
      fs.writeSync(2, progressLine + lineEnd);
    }
  }
  
  // ... do your work ...
}

// Close TTY at end
if (ttyFd !== null) {
  try {
    fs.closeSync(ttyFd);
  } catch (e) {
    // Ignore
  }
}
```

## Why This Works

- `/dev/tty` is a special device file that represents the controlling terminal
- Writing directly to it bypasses all stream buffering and output capture
- Vitest cannot intercept writes to `/dev/tty` because it's a direct file descriptor operation
- Keeping the file descriptor open avoids the overhead of opening/closing for each write
- Synchronous writes ensure immediate output without waiting for the event loop

## Important Notes

- **CRITICAL CONSTRAINT**: When implementing progress bars, you must NOT change any existing test logic. The progress bar code should be purely additive - only add the progress output mechanism, do not modify calculations, assertions, test flow, or any other test behavior
- This only works when running tests in a real terminal (not in CI environments without a TTY)
- Always provide a fallback to stderr for environments where `/dev/tty` is not available
- The progress bar will update in real-time when running tests directly in a terminal
- When output is piped or captured, the progress bars may still appear buffered, but they will work in real-time in an interactive terminal

## Reference Implementation

See: `tests/dlmm-core-comprehensive-fuzz.test.ts` lines 2571-2623 for the complete working implementation.

