# Detailed Explanation of Key Invariants

## 1. "User balance matches contract: User pays exactly what contract says was swapped (`result.in`)"

### What This Means

When a swap executes, there are **two sources of truth**:
1. **The contract's return value**: What the contract says happened
2. **The actual blockchain state**: What actually happened to user balances

These **MUST match exactly** - any discrepancy indicates a bug.

### How It Works

#### Step 1: User Calls Swap
```typescript
// User wants to swap 1,000,000 X tokens
const result = txOk(dlmmCore.swapXForY(
  pool,
  xToken,
  yToken,
  binId,
  1000000n  // User requests 1M tokens
));
```

#### Step 2: Contract Processes Swap
The contract:
1. Calculates how much can actually be swapped (may be less due to liquidity limits)
2. Transfers tokens from user
3. Returns `{in: actualAmountSwapped, out: tokensReceived}`

```clarity
// Contract code (simplified)
(updated-x-amount (if (>= x-amount updated-max-x-amount) updated-max-x-amount x-amount))
(try! (contract-call? x-token-trait transfer updated-x-amount caller pool-contract none))
(ok {in: updated-x-amount, out: dy})
```

#### Step 3: We Check the Invariant

**Before swap:**
- User X balance: 10,000,000

**After swap:**
- User X balance: 9,500,000
- Contract says: `{in: 500000, out: 250000000}`

**The Check:**
```typescript
const userXChange = beforeBalance - afterBalance;  // 10M - 9.5M = 500,000
const actualSwappedIn = result.in;                 // 500,000

if (userXChange !== actualSwappedIn) {
  // VIOLATION! User balance changed by different amount than contract says
}
```

### Why This Matters

If these don't match, it means:
- **The contract transferred a different amount than it says it did** - This is a critical bug
- **User was charged incorrectly** - Could lead to loss of funds
- **Accounting mismatch** - Pool state won't match reality

### Example Violation

**Bad Scenario:**
- User balance decreased by: 500,000
- Contract says swapped: 400,000
- **Violation!** User paid 500k but contract only recorded 400k

This could mean:
- 100k tokens "disappeared"
- Pool accounting is wrong
- User was overcharged

## 2. "No negative balances: Bin balances must never go negative"

### What This Means

Bin balances (X and Y tokens stored in each bin) must **always be >= 0**. Negative balances are impossible in Clarity (unsigned integers) but we check to ensure logic never tries to create them.

### Why This Matters

If a bin balance could go negative, it would mean:
- **Tokens were withdrawn that didn't exist** - Critical bug
- **Pool is insolvent** - Can't fulfill withdrawals
- **State corruption** - Pool accounting is broken

### How We Check

```typescript
// After every transaction
if (afterBin.xBalance < 0n || afterBin.yBalance < 0n) {
  issues.push(`Negative balances detected: x=${afterBin.xBalance}, y=${afterBin.yBalance}`);
}
```

### Example Scenarios

#### ✅ Valid: Normal Withdrawal
- Before: X balance = 1,000,000
- Withdraw: 500,000
- After: X balance = 500,000 ✅

#### ❌ Violation: Over-withdrawal
- Before: X balance = 1,000,000
- Withdraw: 1,500,000 (more than available)
- After: X balance = -500,000 ❌ **VIOLATION!**

This should never happen because:
- The contract should check available balance before withdrawal
- Clarity's unsigned integers prevent negative values
- If this occurs, it indicates a logic error

### Real-World Impact

If negative balances could occur:
- **Pool becomes insolvent** - Can't pay out what it owes
- **LP providers lose funds** - Their deposits are gone
- **Swaps fail** - No liquidity to execute trades
- **System breaks** - Pool becomes unusable

## Summary

These two invariants ensure:
1. **Accounting accuracy**: What the contract says happened matches what actually happened
2. **Solvency**: The pool always has enough tokens to fulfill obligations

Any violation of these indicates a **critical bug** that could lead to loss of funds or pool insolvency.

