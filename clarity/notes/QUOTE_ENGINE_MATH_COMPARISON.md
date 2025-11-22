# Quote Engine Math Comparison: Python vs TypeScript vs Clarity

This document provides a side-by-side comparison of swap calculation formulas across three implementations:
1. **Python Quote Engine** (`pricing.py`): Production reference implementation
2. **TypeScript Fuzz Tests** (current implementation): Test validation logic
3. **Clarity Contract** (`dlmm-core-v-1-1.clar`): On-chain implementation

## Constants

| Implementation | PRICE_SCALE_BPS | FEE_SCALE_BPS |
|----------------|-----------------|---------------|
| Python | `Decimal('100000000')` (1e8) | `Decimal('10000')` (1e4) |
| TypeScript | `100000000n` (BigInt) | `10000n` (BigInt) |
| Clarity | `PRICE_SCALE_BPS` (u100000000) | `FEE_SCALE_BPS` (u10000) |

## Fee Rate Calculation

### Python (pricing.py lines 100-122)
```python
if swap_for_y:
    fee_rate = (
        Decimal(str(pool_data.x_protocol_fee)) + 
        Decimal(str(pool_data.x_provider_fee)) + 
        Decimal(str(pool_data.x_variable_fee))
    ) / Decimal('10000')
else:
    fee_rate = (
        Decimal(str(pool_data.y_protocol_fee)) + 
        Decimal(str(pool_data.y_provider_fee)) + 
        Decimal(str(pool_data.y_variable_fee))
    ) / Decimal('10000')
```

**Note**: Python divides by 10000 to get a decimal rate (e.g., 30 BPS = 0.003)

### TypeScript (fuzz test)
```typescript
const protocolFee = Number(poolData.xProtocolFee || 0n);
const providerFee = Number(poolData.xProviderFee || 0n);
const variableFee = Number(poolData.xVariableFee || 0n);
const swapFeeTotal = protocolFee + providerFee + variableFee;
```

**Note**: TypeScript uses BPS directly (e.g., 30 BPS = 30), not divided by 10000

### Clarity Contract
```clarity
(swap-fee-total (+ protocol-fee provider-fee variable-fee))
```

**Note**: Clarity uses BPS directly (e.g., 30 BPS = 30)

## Swap X for Y (swap-x-for-y)

### Step 1: Calculate Max X Amount (with ceiling rounding)

**Purpose**: Calculate the maximum X tokens that can be swapped based on available Y reserves.

#### Python (pricing.py line 926)
```python
max_x_amount = ((reserve_y * PRICE_SCALE_BPS + (bin_price - Decimal('1'))) // bin_price) if bin_price > 0 else Decimal('0')
```

#### Clarity Contract (line 1260)
```clarity
(max-x-amount (/ (+ (* y-balance PRICE_SCALE_BPS) (- bin-price u1)) bin-price))
```

#### TypeScript (fuzz test line 1361)
```typescript
const maxXAmountBigInt = ((yBalanceBeforeSwapBigInt * PRICE_SCALE_BPS_BIGINT) + binPriceBigInt - 1n) / binPriceBigInt;
```

**Analysis**: ✅ All three match. The `+ bin_price - 1` term implements ceiling rounding: `(a + b - 1) / b`

### Step 2: Adjust Max Amount for Fees

**Purpose**: Account for fees when calculating the maximum input amount.

#### Python (pricing.py lines 929-932)
```python
if fee_rate > Decimal('0'):
    updated_max_x_amount = (max_x_amount * Decimal('10000')) // (Decimal('10000') - fee_rate * Decimal('10000'))
else:
    updated_max_x_amount = max_x_amount
```

**Note**: Python uses `fee_rate` which is already divided by 10000, so `fee_rate * 10000` gives BPS.

#### Clarity Contract (line 1261)
```clarity
(updated-max-x-amount (if (> swap-fee-total u0) (/ (* max-x-amount FEE_SCALE_BPS) (- FEE_SCALE_BPS swap-fee-total)) max-x-amount))
```

#### TypeScript (fuzz test lines 1365-1367)
```typescript
const updatedMaxXAmountBigInt = swapFeeTotalBigInt > 0n
  ? (maxXAmountBigInt * FEE_SCALE_BPS_BIGINT) / (FEE_SCALE_BPS_BIGINT - swapFeeTotalBigInt)
  : maxXAmountBigInt;
```

**Analysis**: ⚠️ **DISCREPANCY FOUND**: 
- Python: Uses `fee_rate * 10000` (which equals BPS total)
- Clarity/TypeScript: Use `swap-fee-total` directly (already in BPS)
- These should be equivalent IF Python's fee_rate is calculated correctly
- **Verification needed**: Ensure Python's fee_rate calculation matches

### Step 3: Cap Input Amount

**Purpose**: Use the smaller of requested amount or maximum allowed amount.

#### Python (pricing.py line 935)
```python
updated_x_amount = min(remaining, updated_max_x_amount)
```

#### Clarity Contract (line 1264)
```clarity
(updated-x-amount (if (>= x-amount updated-max-x-amount) updated-max-x-amount x-amount))
```

#### TypeScript (fuzz test)
```typescript
// Uses actualSwappedIn from contract result (already capped)
const updatedXAmountBigInt = BigInt(actualSwappedIn);
```

**Analysis**: ✅ Logic matches (Python uses min, Clarity uses conditional, both equivalent)

### Step 4: Calculate Fees

**Purpose**: Calculate total fees from the capped input amount.

#### Python (pricing.py line 938)
```python
x_amount_fees_total = (updated_x_amount * fee_rate * Decimal('10000')) // Decimal('10000')
```

**Note**: Since `fee_rate` is already divided by 10000, multiplying by 10000 gives: `updated_x_amount * fee_rate`

#### Clarity Contract (line 1267)
```clarity
(x-amount-fees-total (/ (* updated-x-amount swap-fee-total) FEE_SCALE_BPS))
```

#### TypeScript (fuzz test line 1382)
```typescript
const xAmountFeesTotalBigInt = (updatedXAmountBigInt * swapFeeTotalBigInt) / FEE_SCALE_BPS_BIGINT;
```

**Analysis**: ⚠️ **DISCREPANCY FOUND**:
- Python: `(updated_x_amount * fee_rate * 10000) // 10000` = `updated_x_amount * fee_rate` (since fee_rate is already /10000)
- Clarity/TypeScript: `(updated_x_amount * swap_fee_total) / 10000` (where swap_fee_total is in BPS)
- These are equivalent IF `fee_rate = swap_fee_total / 10000`
- **Verification needed**: Confirm Python's fee_rate matches this

### Step 5: Calculate Effective Input (dx)

**Purpose**: Calculate the amount after fees are deducted.

#### Python (pricing.py line 939)
```python
dx = updated_x_amount - x_amount_fees_total
```

#### Clarity Contract (line 1271)
```clarity
(dx (- updated-x-amount x-amount-fees-total))
```

#### TypeScript (fuzz test line 1385)
```typescript
const dxBigInt = updatedXAmountBigInt - xAmountFeesTotalBigInt;
```

**Analysis**: ✅ All match

### Step 6: Calculate Output (dy)

**Purpose**: Calculate Y tokens to return, capped at available reserves.

#### Python (pricing.py line 942)
```python
out_this = min((dx * bin_price) // PRICE_SCALE_BPS, reserve_y)
```

#### Clarity Contract (lines 1274-1275)
```clarity
(dy-before-cap (/ (* dx bin-price) PRICE_SCALE_BPS))
(dy (if (> dy-before-cap y-balance) y-balance dy-before-cap))
```

#### TypeScript (fuzz test lines 1388-1391)
```typescript
const dyBeforeCapBigInt = (dxBigInt * binPriceBigInt) / PRICE_SCALE_BPS_BIGINT;
const expectedDyInteger = dyBeforeCapBigInt > yBalanceBeforeSwapBigInt ? yBalanceBeforeSwapBigInt : dyBeforeCapBigInt;
```

**Analysis**: ✅ All match

## Swap Y for X (swap-y-for-x)

### Step 1: Calculate Max Y Amount (with ceiling rounding)

#### Python (pricing.py line 951)
```python
max_y_amount = ((reserve_x * bin_price + (PRICE_SCALE_BPS - Decimal('1'))) // PRICE_SCALE_BPS)
```

#### Clarity Contract (line 1405)
```clarity
(max-y-amount (/ (+ (* x-balance bin-price) (- PRICE_SCALE_BPS u1)) PRICE_SCALE_BPS))
```

#### TypeScript (fuzz test line 1766)
```typescript
const maxYAmountBigInt = ((xBalanceBeforeSwapBigInt * binPriceBigInt) + PRICE_SCALE_BPS_BIGINT - 1n) / PRICE_SCALE_BPS_BIGINT;
```

**Analysis**: ✅ All match

### Step 2: Adjust Max Amount for Fees

#### Python (pricing.py lines 954-957)
```python
if fee_rate > Decimal('0'):
    updated_max_y_amount = (max_y_amount * Decimal('10000')) // (Decimal('10000') - fee_rate * Decimal('10000'))
else:
    updated_max_y_amount = max_y_amount
```

#### Clarity Contract (line 1406)
```clarity
(updated-max-y-amount (if (> swap-fee-total u0) (/ (* max-y-amount FEE_SCALE_BPS) (- FEE_SCALE_BPS swap-fee-total)) max-y-amount))
```

#### TypeScript (fuzz test lines 1770-1772)
```typescript
const updatedMaxYAmountBigInt = swapFeeTotalBigInt > 0n
  ? (maxYAmountBigInt * FEE_SCALE_BPS_BIGINT) / (FEE_SCALE_BPS_BIGINT - swapFeeTotalBigInt)
  : maxYAmountBigInt;
```

**Analysis**: ⚠️ Same discrepancy as swap-x-for-y regarding fee_rate vs swap-fee-total

### Step 3: Cap Input Amount

#### Python (pricing.py line 960)
```python
updated_y_amount = min(remaining, updated_max_y_amount)
```

#### Clarity Contract (line 1409)
```clarity
(updated-y-amount (if (>= y-amount updated-max-y-amount) updated-max-y-amount y-amount))
```

**Analysis**: ✅ Logic matches

### Step 4: Calculate Fees

#### Python (pricing.py line 963)
```python
y_amount_fees_total = (updated_y_amount * fee_rate * Decimal('10000')) // Decimal('10000')
```

#### Clarity Contract (line 1412)
```clarity
(y-amount-fees-total (/ (* updated-y-amount swap-fee-total) FEE_SCALE_BPS))
```

**Analysis**: ⚠️ Same discrepancy as swap-x-for-y

### Step 5: Calculate Effective Input (dy)

#### Python (pricing.py line 964)
```python
dy = updated_y_amount - y_amount_fees_total
```

#### Clarity Contract (line 1416)
```clarity
(dy (- updated-y-amount y-amount-fees-total))
```

**Analysis**: ✅ All match

### Step 6: Calculate Output (dx)

#### Python (pricing.py line 967)
```python
out_this = (min((dy * PRICE_SCALE_BPS) // bin_price, reserve_x) if bin_price > 0 else Decimal('0'))
```

#### Clarity Contract (lines 1419-1420)
```clarity
(dx-before-cap (/ (* dy PRICE_SCALE_BPS) bin-price))
(dx (if (> dx-before-cap x-balance) x-balance dx-before-cap))
```

**Analysis**: ✅ All match

## Key Findings

### ✅ Matches
1. Max amount calculation with ceiling rounding
2. Effective input calculation (dx/dy after fees)
3. Output calculation and capping
4. Overall formula structure

### ⚠️ Potential Discrepancies
1. **Fee Rate Calculation**: Python divides by 10000 to get a decimal rate, then multiplies by 10000 in calculations. This should be equivalent to using BPS directly, but needs verification.
2. **Fee Adjustment Formula**: Python uses `fee_rate * 10000` while Clarity/TypeScript use `swap-fee-total` directly. These should be equivalent if `fee_rate = swap-fee-total / 10000`.

### 🔍 Verification Needed
1. Verify that Python's `fee_rate` calculation produces the same results as using BPS directly
2. Test with actual values to ensure all three implementations produce identical results
3. Check edge cases: zero fees, maximum fees, very large values

## Next Steps
1. Create helper functions matching Python's API exactly
2. Create test harness to compare Python and TypeScript outputs
3. Fix any discrepancies found
4. Ensure TypeScript uses BigInt consistently to avoid precision loss

