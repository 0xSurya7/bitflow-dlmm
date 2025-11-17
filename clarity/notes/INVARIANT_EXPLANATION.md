# What Are Invariant Violations?

## Definition

**Invariants** are fundamental properties that **MUST always be true** before and after every transaction. An **invariant violation** means one of these properties was broken, indicating a potential bug or unexpected behavior.

## What We're Testing For

### 1. **Function-Specific Invariants**

These check that each function behaves correctly according to its intended logic:

#### **Swaps** (`swap-x-for-y`, `swap-y-for-x`):
- ✅ **LP supply unchanged**: Swaps should NOT mint or burn LP tokens
- ✅ **Balance direction correct**: 
  - For `swap-x-for-y`: X balance increases, Y balance decreases
  - For `swap-y-for-x`: Y balance increases, X balance decreases
- ✅ **User balance matches contract transfer**: The user's balance change must exactly match `result.in`, which is the amount the contract actually transferred (not the requested amount). The contract returns `{in: updated-x-amount, out: dy}` where `in` is the actual amount transferred from the user (line 1302-1303 of the contract transfers `updated-x-amount`, and line 1359 returns it as `result.in`). This accounts for partial fills when liquidity is limited.
- ✅ **No negative balances**: Bin balances must never go negative

#### **Add Liquidity** (`add-liquidity`):
- ✅ **LP supply increases**: Must mint LP tokens when liquidity is added
- ✅ **Bin balances increase**: X/Y balances must increase if amounts were added
- ✅ **LP tokens received**: User must receive LP tokens if liquidity was added

#### **Withdraw Liquidity** (`withdraw-liquidity`):
- ✅ **LP supply decreases**: Must burn LP tokens when liquidity is withdrawn
- ✅ **Bin balances decrease**: X/Y balances must decrease if tokens were withdrawn
- ✅ **User receives tokens**: User must receive X/Y tokens proportional to LP burned

#### **Move Liquidity** (`move-liquidity`):
- ✅ **Source bin decreases**: LP supply and balances decrease in source bin
- ✅ **Destination bin increases**: LP supply and balances increase in destination bin
- ✅ **Total conservation**: Total liquidity value should be conserved (minus fees)

### 2. **Rounding Error Checks**

These verify that calculations are **exact** with **no discrepancies**:

- ✅ **User balance changes match contract output**: 
  - User's token balance change must exactly equal what the contract says was transferred
  - For swaps: User balance change must exactly match `result.in` (the amount the contract actually transferred, which may be less than the requested amount due to partial fills)
  - Example: If contract returns `{in: 100, out: 50}`, the user's balance must decrease by exactly 100 tokens (not the requested amount, which might have been 200)
  
- ✅ **Swap calculation verification** (NEW):
  - **Outside of Clarity, we replicate the contract's swap math** to verify it matches the contract's output
  - For each swap, we:
    1. Get the bin price, fees, and pool state
    2. Calculate expected output using the same formula the contract uses:
       - `fees = (amount * swapFeeTotal) / FEE_SCALE_BPS`
       - `dx = amount - fees` (for swap-x-for-y)
       - `expectedOut = (dx * binPrice) / PRICE_SCALE_BPS` (capped at available liquidity)
    3. Compare expected output to `result.out` from the contract
  - **Any difference indicates a rounding error** in the contract's calculations (strict equality required)
  - This catches subtle bugs where the contract's internal math doesn't match expected behavior

- ✅ **No unexpected discrepancies**:
  - Pool balance changes must match expected amounts (accounting for fees)
  - No "missing" tokens or "extra" tokens appearing

- ✅ **Conservation of value**:
  - Tokens in = tokens out + fees (for swaps)
  - LP tokens minted/burned must match liquidity added/removed (for liquidity operations)

### 3. **Global Invariants**

These must hold true at all times:

- ✅ **Active bin in valid range**: Must be between -500 and 500
- ✅ **No negative balances**: All bin balances must be >= 0
- ✅ **LP supply non-negative**: Total supply of LP tokens per bin must be >= 0

## What Counts as a Violation?

A violation is flagged when:

1. **A property that should always be true becomes false**
   - Example: LP supply changes during a swap (should never happen)
   - Example: User balance decreases by 100 but contract says (`result.in`) 50 was transferred - this indicates a mismatch between what was actually transferred and what the contract recorded

2. **A calculation doesn't match expected result**
   - Example: Contract says it transferred 100 tokens (`result.in = 100`) but user balance only decreased by 95 - this indicates the transfer didn't match what the contract recorded
   - Example: Added 1000 tokens but bin balance only increased by 900 (and fees don't account for the difference)

3. **State becomes invalid**
   - Example: Bin balance goes negative
   - Example: Active bin moves outside valid range

## What Does NOT Count as a Violation?

- ✅ **Transaction failures** (ERR codes) - These are expected when parameters are invalid
- ✅ **Partial fills** - When swaps are capped at available liquidity, the contract transfers less than requested and returns the actual amount in `result.in`. This is expected behavior, and the test correctly compares user balance changes to `result.in` (the actual amount transferred), not the requested amount.
- ✅ **Fee deductions** - When fees reduce amounts (this is expected and accounted for)

## Why This Matters

Invariant violations indicate:
- **Rounding errors** that could compound over time
- **Logic bugs** in the contract
- **State corruption** that could lead to loss of funds
- **Calculation errors** that break conservation laws

## Current Test Status

The test checks for violations **after every successful transaction** and reports:
- The transaction number
- The function that was called
- What invariant was violated
- The specific values that caused the violation

**Goal**: Zero invariant violations means the contract maintains all its fundamental properties correctly.

