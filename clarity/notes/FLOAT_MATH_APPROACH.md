# Float Math Approach for Quote Engine Comparison

## Decision: Float Math Without Ceiling Rounding

### Rationale

For the quote engine validation, we compare against **ideal float math** (without ceiling rounding) because:

1. **Ceiling rounding is an artifact of integer math**: The `+ bin_price - 1` term in the max amount calculation is needed for integer division to implement ceiling rounding. In true float math, we don't need this.

2. **Quote engine uses ideal math**: The Python quote engine uses Decimal (which is still discrete), but for comparison purposes, we want the "ideal" result that represents what the math would produce with perfect precision.

3. **Security check**: We're checking if the contract returns MORE than the ideal float math allows. Using ideal float math (without ceiling rounding) gives us the true upper bound.

### Implementation

**Integer Math** (matches contract exactly):
```typescript
const max_x_amount = ((reserve_y * PRICE_SCALE_BPS + (bin_price - 1n)) / bin_price);
```
- Uses ceiling rounding: `+ bin_price - 1`
- Matches contract's integer division exactly

**Float Math** (ideal comparison):
```typescript
const max_x_amount = (reserve_y * PRICE_SCALE_BPS_FLOAT) / bin_price;
```
- No ceiling rounding term
- Represents ideal float result
- Used for exploit detection (contract should not exceed this)

### Comparison with Existing Test

The existing comprehensive fuzz test uses ceiling rounding even in float calculations:
```typescript
const maxXAmountFloat = (yBalanceBeforeSwap * PRICE_SCALE_BPS + binPrice - 1) / binPrice;
```

However, for quote engine validation, we use ideal float math (without ceiling rounding) because:
- We want to detect if contract returns MORE than ideal math allows
- Ideal float math provides the true upper bound
- Ceiling rounding in float math would give a slightly higher bound, which is less strict

### Conclusion

The approach is correct:
- **Integer math**: Uses ceiling rounding to match contract exactly
- **Float math**: Uses ideal math (no ceiling rounding) for strict upper bound comparison
- **Exploit detection**: Fails if `actualSwappedOut > expectedFloat` (ideal float result)

This ensures we catch any case where the contract returns more than the ideal mathematical result allows.


