# Testing Context and Philosophy

## Core Testing Focus

After two audits, the primary remaining concern is **rounding differences** between integer math (contract) and float math (ideal) that could be exploited.

## Testing Philosophy

**Approach**: Pretend you are a world-class white-hat hacker looking to provide a proof-of-concept exploit that:
1. Can be reproduced reliably
2. Occurs because of differences between integer rounding and float math
3. Allows unfair value extraction from the pool
4. Can be compounded over multiple transactions

## Key Distinctions

### Active Bin Swaps vs Multi-Bin Swaps

- **`swap-x-for-y` / `swap-y-for-x`** (dlmm-core):
  - **Only work on the active bin**
  - Direct swaps within a single bin
  - Use these for testing active bin rounding behavior

- **Swap Router** (`dlmm-swap-router-v-1-1`):
  - Allows swaps across **multiple bins** in a single transaction
  - Can traverse multiple bins if constructed properly
  - Use for testing bin coverage and multi-bin rounding accumulation
  - More complex but allows broader coverage

- **Liquidity Router** (`dlmm-liquidity-router-v-1-1`):
  - Handles liquidity operations across multiple bins/pools
  - Can add/remove liquidity across multiple positions
  - Use for testing liquidity operation rounding across bins

**Priority**: Focus on the 5 core functions first. Multi-bin swaps via routers are important for coverage but secondary to proving basic rounding exploits don't exist.

## Testing Priority

1. **First**: Prove basic rounding exploits don't exist in the 5 core functions
2. **Second**: Test multi-bin scenarios via routers for coverage
3. **Third**: Test complex scenarios across multiple pools

## The Core Question

**Can integer rounding differences be exploited to extract more value than float math suggests?**

If `actualOutput > expectedFloat`, that's user-favored bias and a potential exploit.

