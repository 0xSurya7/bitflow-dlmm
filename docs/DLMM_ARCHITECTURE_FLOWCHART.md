# DLMM (Dynamic Liquidity Market Maker) Architecture Flowchart

## Overview

This document provides a detailed, properly mapped flowchart of the DLMM (Dynamic Liquidity Market Maker) Clarity smart contract codebase for the Stacks blockchain.

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DLMM SYSTEM ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     DLMM-CORE-V-1-1 (Central Hub)                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    ADMINISTRATION LAYER                         │  │  │
│  │  │  • add-admin()              • set-core-migration-source()     │  │  │
│  │  │  • remove-admin()           • set-core-migration-target()      │  │  │
│  │  │  • add-bin-step()           • set-core-migration-cooldown()    │  │  │
│  │  │  • set-minimum-shares()     • migrate-pool()                    │  │  │
│  │  │  • set-public-pool-creation()                                │  │  │
│  │  │  • add-verified-pool-code-hash()                               │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    POOL MANAGEMENT LAYER                       │  │  │
│  │  │  • create-pool()          • set-pool-uri()                     │  │  │
│  │  │  • set-pool-status()      • set-variable-fees-manager()        │  │  │
│  │  │  • set-fee-address()      • set-variable-fees()                │  │  │
│  │  │  • set-x-fees()           • set-y-fees()                       │  │  │
│  │  │  • set-variable-fees-cooldown()                                │  │  │
│  │  │  • set-freeze-variable-fees-manager()                          │  │  │
│  │  │  • set-dynamic-config()    • reset-variable-fees()             │  │  │
│  │  │  • claim-protocol-fees()   • set-swap-fee-exemption()          │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    CORE TRADING LAYER                          │  │  │
│  │  │  • swap-x-for-y()          • add-liquidity()                   │  │  │
│  │  │  • swap-y-for-x()          • withdraw-liquidity()              │  │  │
│  │  │  • move-liquidity()                                           │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    READ-ONLY FUNCTIONS                          │  │  │
│  │  │  • get-pool-by-id()         • get-bin-price()                   │  │  │
│  │  │  • get-admins()             • get-liquidity-value()             │  │  │
│  │  │  • get-bin-steps()          • get-is-pool-verified()           │  │  │
│  │  │  • get-unclaimed-protocol-fees-by-id()                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│            ┌───────────────────────┼───────────────────────┐                │
│            │                       │                       │                │
│            ▼                       ▼                       ▼                │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐           │
│  │ DLMM-POOL-XXX  │   │ DLMM-SWAP-      │   │ DLMM-LIQUIDITY- │           │
│  │ (Token Pairs)   │   │ ROUTER-V-1-1    │   │ ROUTER-V-1-1    │           │
│  │                 │   │                 │   │                 │           │
│  │ • get-pool()    │   │ • swap-multi()  │   │ • add-liquidity-│           │
│  │ • get-bin-      │   │ • swap-x-for-y- │   │   multi()       │           │
│  │   balances()    │   │   same-multi()  │   │ • withdraw-     │           │
│  │ • update-bin-   │   │ • swap-y-for-x- │   │   liquidity-    │           │
│  │   balances()    │   │   same-multi()  │   │   multi()       │           │
│  │ • pool-mint()   │   │ • swap-x-for-y- │   │ • move-liquidity│           │
│  │ • pool-burn()   │   │   simple-multi()│   │   -multi()      │           │
│  │ • pool-transfer │   │ • swap-y-for-x- │   │                 │           │
│  │                 │   │   simple-multi()│   │                 │           │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘           │
│                                    │                                         │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    DLMM-STAKING-XXX-V-1-1                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    STAKING OPERATIONS                           │  │  │
│  │  │  • stake-lp-tokens()        • unstake-lp-tokens()              │  │  │
│  │  │  • claim-rewards()          • get-claimable-rewards()          │  │  │
│  │  │  • set-rewards-to-distribute()                                │  │  │
│  │  │  • set-reward-period-duration()                               │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Contract Flowchart - Initialization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DLMM-CORE INITIALIZATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  START                                                                          │
│     │                                                                          │
│     ▼                                                                          │
│  ┌──────────────────────────────┐                                              │
│  │ Deploy dlmm-core-v-1-1.clar  │                                              │
│  └──────────────┬───────────────┘                                              │
│                 │                                                               │
│                 ▼                                                               │
│  ┌─────────────────────────────────────────┐                                   │
│  │ Initialize State Variables:               │                                   │
│  │ • admins = [tx-sender]                   │                                   │
│  │ • bin-steps = []                          │                                   │
│  │ • verified-pool-code-hashes = []         │                                   │
│  │ • public-pool-creation = false           │                                   │
│  │ • minimum-bin-shares = 10000             │                                   │
│  │ • minimum-burnt-shares = 1000            │                                   │
│  │ • core-migration-cooldown = 1209600      │                                   │
│  └────────────────────┬────────────────────────┐                               │
│                       │                                │                        │
│                       ▼                                ▼                        │
│              ┌────────────────┐               ┌────────────────┐                │
│              │ Admin Functions│               │ Pool Functions │                │
│              │ Ready          │               │ Available      │                │
│              └────────────────┘               └────────────────┘                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Pool Creation Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      POOL CREATION FLOWCHART                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CALLER ──► create-pool()                                                   │
│     │                                                                        │
│     ▼                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ VALIDATION CHECKS:                                            │            │
│  │ 1. Caller is admin OR public-pool-creation = true            │            │
│  │ 2. Pool not already created                                   │            │
│  │ 3. Token contracts not matching                                │            │
│  │ 4. Reverse token direction not registered                     │            │
│  │ 5. x-amount & y-amount > 0                                    │            │
│  │ 6. dlp >= minimum-bin-shares                                  │            │
│  │ 7. burn-amount >= minimum-burnt-shares                        │            │
│  │ 8. initial-price > 0                                           │            │
│  │ 9. fees < FEE_SCALE_BPS (10000)                               │            │
│  │ 10. bin-step is valid                                          │            │
│  │ 11. URI, symbol, name lengths > 0                              │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│              ┌───────────────┴───────────────┐                                │
│              │ FAIL                            │ PASS                         │
│              ▼                                ▼                                │
│  ┌────────────────────────┐    ┌────────────────────────────────────────┐       │
│  │ Return Error           │    │ CALCULATE INITIAL PARAMETERS:          │       │
│  │ • ERR_NOT_AUTHORIZED   │    │ • new-pool-id = last-pool-id + 1      │       │
│  │ • ERR_POOL_ALREADY_     │    │ • symbol = concat(x-token, "-",       │       │
│  │   CREATED              │    │   y-token) truncated to 29 chars       │       │
│  │ • ERR_INVALID_AMOUNT   │    │ • name = concat(symbol, "-LP")         │       │
│  │ • etc.                 │    │ • initial-price = (y-amount *         │       │
│  └────────────────────────┘    │   PRICE_SCALE_BPS) / x-amount         │       │
│                                 │ • dlp = sqrt(add-liquidity-value)      │       │
│                                 └──────────────────┬───────────────────────┘        │
│                                                    │                            │
│                                                    ▼                            │
│                                 ┌────────────────────────────────────┐            │
│                                 │ EXECUTE POOL CREATION:              │            │
│                                 │ 1. Call pool-trait.create-pool()    │            │
│                                 │ 2. Set x-fees (protocol, provider)  │            │
│                                 │ 3. Set y-fees (protocol, provider)  │            │
│                                 │ 4. Set variable-fees-cooldown        │            │
│                                 │ 5. Freeze variable-fees-manager if   │            │
│                                 │    specified                         │            │
│                                 │ 6. Set dynamic-config if provided    │            │
│                                 └──────────────────┬───────────────────────┘        │
│                                                    │                            │
│                                                    ▼                            │
│                                 ┌────────────────────────────────────┐            │
│                                 │ UPDATE STATE:                       │            │
│                                 │ • var-set last-pool-id = new-id     │            │
│                                 │ • map-set pools {id, name, symbol,  │            │
│                                 │   pool-contract, status}            │            │
│                                 │ • map-set unclaimed-protocol-fees   │            │
│                                 │   {x-fee: 0, y-fee: 0}              │            │
│                                 │ • map-set allowed-token-direction   │            │
│                                 └──────────────────┬───────────────────────┘        │
│                                                    │                            │
│                                                    ▼                            │
│                                 ┌────────────────────────────────────┐            │
│                                 │ TRANSFER TOKENS & MINT LP:          │            │
│                                 │ 1. Transfer x-amount from caller    │            │
│                                 │    to pool-contract                 │            │
│                                 │ 2. Transfer y-amount from caller    │            │
│                                 │    to pool-contract                 │            │
│                                 │ 3. Call pool.update-bin-balances()  │            │
│                                 │    at CENTER_BIN_ID (500)            │            │
│                                 │ 4. Mint (dlp - burn) LP to caller   │            │
│                                 │ 5. Mint burn LP to BURN_ADDRESS     │            │
│                                 └──────────────────┬───────────────────────┘        │
│                                                    │                            │
│                                                    ▼                            │
│                                 ┌────────────────────────────────────┐            │
│                                 │ RETURN: (ok true)                   │            │
│                                 │ Emit print event with pool details  │            │
│                                 └────────────────────────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Swap Operations Flowchart

### 4.1 Swap X for Y (Token X → Token Y)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SWAP-X-FOR-Y FLOWCHART                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CALLER ──► swap-x-for-y(pool-trait, x-token-trait, y-token-trait,        │
│                     bin-id, x-amount)                                        │
│     │                                                                        │
│     ▼                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ GET POOL DATA:                                                 │            │
│  │ • Call pool-trait.get-pool-for-swap(true)                     │            │
│  │ • Get: pool-id, x-token, y-token, bin-step,                   │            │
│  │   initial-price, active-bin-id                                 │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ VALIDATION CHECKS:                                            │            │
│  │ 1. x-amount > 0                                                │            │
│  │ 2. bin-id = active-bin-id                                     │            │
│  │ 3. Correct token traits used                                  │            │
│  │ 4. Pool managed by this core contract                         │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│              ┌───────────────┴───────────────┐                                │
│              │ FAIL                            │ PASS                         │
│              ▼                                ▼                                │
│  ┌────────────────────────┐    ┌────────────────────────────────────┐       │
│  │ Return Error           │    │ GET BIN BALANCES:                  │       │
│  │ • ERR_INVALID_AMOUNT   │    │ • Call pool-trait.get-bin-balances │       │
│  │ • ERR_NOT_ACTIVE_BIN   │    │ • Get x-balance, y-balance,        │       │
│  │ • etc.                 │    │   bin-shares                        │       │
│  └────────────────────────┘    └──────────────────┬───────────────────────┘       │
│                                                   │                            │
│                                                   ▼                            │
│                                 ┌────────────────────────────────────┐            │
│                                 │ CALCULATE BIN PRICE:                │            │
│                                 │ bin-price = (initial-price *        │            │
│                                 │   bin-factor) / PRICE_SCALE_BPS     │            │
│                                 │   (100000000)                       │            │
│                                 └──────────────────┬───────────────────────┘       │
│                                                    │                            │
│                                                    ▼                            │
│                                 ┌────────────────────────────────────┐            │
│                                 │ CALCULATE FEES:                    │            │
│                                 │ • Check if caller is fee exempt     │            │
│                                 │ • swap-fee-total = protocol-fee +   │            │
│                                 │   provider-fee + variable-fee      │            │
│                                 │ • x-amount-fees-total =             │            │
│                                 │   (x-amount * swap-fee-total) /     │            │
│                                 │   FEE_SCALE_BPS                     │            │
│                                 │ • x-amount-fees-protocol =          │            │
│                                 │   (x-amount * protocol-fee) /       │            │
│                                 │   FEE_SCALE_BPS                     │            │
│                                 │ • x-amount-fees-variable =          │            │
│                                 │   (x-amount * variable-fee) /       │            │
│                                 │   FEE_SCALE_BPS                     │            │
│                                 └──────────────────┬───────────────────────┘       │
│                                                    │                            │
│                                                    ▼                            │
│                                 ┌────────────────────────────────────┐            │
│                                 │ CALCULATE OUTPUT (dy):              │            │
│                                 │ dx = x-amount - x-amount-fees-total │            │
│                                 │ dy = min(y-balance,                 │            │
│                                 │   (dx * bin-price) /                │            │
│                                 │   PRICE_SCALE_BPS)                  │            │
│                                 └──────────────────┬───────────────────────┘       │
│                                                    │                            │
│                                                    ▼                            │
│                                 ┌────────────────────────────────────┐            │
│                                 │ EXECUTE TOKEN TRANSFERS:            │            │
│                                 │ 1. Transfer x-amount from caller    │            │
│                                 │    to pool-contract                 │            │
│                                 │ 2. Transfer dy from pool-contract   │            │
│                                 │    to caller                        │            │
│                                 └──────────────────┬───────────────────────┘       │
│                                                    │                            │
│                                                    ▼                            │
│                                 ┌────────────────────────────────────┐            │
│                                 │ UPDATE STATE:                       │            │
│                                 │ 1. Add protocol fees to              │            │
│                                 │    unclaimed-protocol-fees          │            │
│                                 │ 2. Update bin balances:              │            │
│                                 │    x-balance += dx + provider-fee   │            │
│                                 │    y-balance -= dy                   │            │
│                                 │ 3. Update active bin ID if needed    │            │
│                                 │    (if y-balance = 0, move left)    │            │
│                                 └──────────────────┬───────────────────────┘       │
│                                                    │                            │
│                                                    ▼                            │
│                                 ┌────────────────────────────────────┐            │
│                                 │ RETURN: (ok {in: x-amount,          │            │
│                                 │           out: dy})                 │            │
│                                 │ Emit print event with swap details  │            │
│                                 └────────────────────────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Swap Y for X (Token Y → Token X)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SWAP-Y-FOR-X FLOWCHART                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Similar structure to swap-x-for-y, with key differences:                   │
│                                                                             │
│  1. CALLER ──► swap-y-for-x(pool-trait, x-token-trait, y-token-trait,      │
│                     bin-id, y-amount)                                        │
│                                                                             │
│  2. GET POOL DATA:                                                          │
│     • Call pool-trait.get-pool-for-swap(false)                              │
│                                                                             │
│  3. CALCULATE OUTPUT (dx):                                                   │
│     dy = y-amount - y-amount-fees-total                                     │
│     dx = min(x-balance, (dy * PRICE_SCALE_BPS) / bin-price)                │
│                                                                             │
│  4. UPDATE ACTIVE BIN:                                                       │
│     If x-balance = 0, move right (+1 bin)                                    │
│                                                                             │
│  5. RETURN: (ok {in: y-amount, out: dx})                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Liquidity Operations Flowchart

### 5.1 Add Liquidity

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ADD-LIQUIDITY FLOWCHART                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CALLER ──► add-liquidity(pool-trait, x-token-trait, y-token-trait,        │
│            bin-id, x-amount, y-amount, min-dlp, max-x-liquidity-fee,       │
│            max-y-liquidity-fee)                                             │
│     │                                                                        │
│     ▼                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ GET POOL DATA:                                                 │            │
│  │ • Call pool-trait.get-pool-for-add()                          │            │
│  │ • Get: active-bin-id, bin-step, initial-price                 │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ VALIDATION CHECKS:                                            │            │
│  │ 1. x-amount + y-amount > 0                                     │            │
│  │ 2. If bin-id >= active-bin-id → x-amount > 0 allowed         │            │
│  │ 3. If bin-id <= active-bin-id → y-amount > 0 allowed         │            │
│  │ 4. min-dlp > 0                                                │            │
│  │ 5. dlp-post-fees >= min-dlp                                   │            │
│  │ 6. Liquidity fees within max limits                           │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│              ┌───────────────┴───────────────┐                                │
│              │ FAIL                            │ PASS                         │
│              ▼                                ▼                                │
│  ┌────────────────────────┐    ┌────────────────────────────────────┐       │
│  │ Return Error           │    │ CALCULATE LIQUIDITY:              │       │
│  │ • ERR_INVALID_AMOUNT   │    │ • Get bin balances                │       │
│  │ • ERR_INVALID_X/Y_     │    │ • Calculate bin-price             │       │
│  │   AMOUNT               │    │ • Calculate add-liquidity-value    │       │
│  │ • ERR_MINIMUM_LP_      │    │ • dlp = (bin-shares = 0) ?        │       │
│  │   AMOUNT               │    │   sqrt(add-liquidity-value) :     │       │
│  └────────────────────────┘    │   (add-liquidity-value *          │       │
│                                │   bin-shares) / bin-liquidity-    │       │
│                                │   value                            │       │
│                                └──────────────────┬───────────────────────┘       │
│                                                     │                          │
│                                                     ▼                          │
│                                  ┌─────────────────────────────────────┐       │
│                                  │ CALCULATE LIQUIDITY FEES (Active Bin)│       │
│                                  │ Only if bin-id = active-bin-id:      │       │
│                                  │ • x-liquidity-fee = x-protocol +     │       │
│                                  │   x-provider + x-variable             │       │
│                                  │ • y-liquidity-fee = y-protocol +     │       │
│                                  │   y-provider + y-variable             │       │
│                                  │ • Calculate max-x-amount-fees-        │       │
│                                  │   liquidity based on imbalance       │       │
│                                  │ • Calculate max-y-amount-fees-        │       │
│                                  │   liquidity based on imbalance       │       │
│                                  └──────────────────┬───────────────────────┘       │
│                                                       │                          │
│                                                       ▼                          │
│                                  ┌─────────────────────────────────────┐       │
│                                  │ EXECUTE OPERATIONS:                  │       │
│                                  │ 1. Transfer x-amount from caller      │       │
│                                  │    to pool-contract                  │       │
│                                  │ 2. Transfer y-amount from caller      │       │
│                                  │    to pool-contract                  │       │
│                                  │ 3. Update bin balances               │       │
│                                  │ 4. Mint LP tokens to caller          │       │
│                                  │    (dlp-post-fees - burn-amount)     │       │
│                                  │ 5. Mint burn-amount LP to            │       │
│                                  │    BURN_ADDRESS (if new bin)         │       │
│                                  └──────────────────┬───────────────────────┘       │
│                                                        │                      │
│                                                        ▼                      │
│                                  ┌─────────────────────────────────────┐       │
│                                  │ RETURN: (ok dlp-post-fees)           │       │
│                                  │ Emit print event with details        │       │
│                                  └─────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Withdraw Liquidity

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   WITHDRAW-LIQUIDITY FLOWCHART                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CALLER ──► withdraw-liquidity(pool-trait, x-token-trait, y-token-trait,   │
│            bin-id, amount, min-x-amount, min-y-amount)                       │
│     │                                                                        │
│     ▼                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ GET POOL DATA:                                                 │            │
│  │ • Call pool-trait.get-pool-for-withdraw()                      │            │
│  │ • Get: x-token, y-token                                       │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ GET BIN BALANCES:                                             │            │
│  │ • Call pool-trait.get-bin-balances()                          │            │
│  │ • Get: x-balance, y-balance, bin-shares                        │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ VALIDATION CHECKS:                                            │            │
│  │ 1. amount > 0                                                  │            │
│  │ 2. min-x-amount + min-y-amount > 0                            │            │
│  │ 3. x-amount + y-amount > 0                                    │            │
│  │ 4. x-amount >= min-x-amount                                   │            │
│  │ 5. y-amount >= min-y-amount                                   │            │
│  │ 6. bin-shares > 0                                             │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│              ┌───────────────┴───────────────┐                                │
│              │ FAIL                            │ PASS                         │
│              ▼                                ▼                                │
│  ┌────────────────────────┐    ┌────────────────────────────────────┐       │
│  │ Return Error           │    │ CALCULATE WITHDRAWAL AMOUNTS:    │       │
│  │ • ERR_INVALID_AMOUNT   │    │ • x-amount = (amount * x-balance) │       │
│  │ • ERR_MINIMUM_X/Y_     │    │   / bin-shares                    │       │
│  │   AMOUNT               │    │ • y-amount = (amount * y-balance) │       │
│  │ • ERR_NO_BIN_SHARES    │    │   / bin-shares                    │       │
│  └────────────────────────┘    └──────────────────┬───────────────────────┘       │
│                                                     │                          │
│                                                     ▼                          │
│                                  ┌─────────────────────────────────────┐       │
│                                  │ EXECUTE TOKEN TRANSFERS:              │       │
│                                  │ 1. Transfer x-amount from             │       │
│                                  │    pool-contract to caller           │       │
│                                  │ 2. Transfer y-amount from            │       │
│                                  │    pool-contract to caller           │       │
│                                  └──────────────────┬───────────────────────┘       │
│                                                            │                  │
│                                                            ▼                  │
│                                  ┌─────────────────────────────────────┐       │
│                                  │ UPDATE STATE:                        │       │
│                                  │ 1. Update bin balances               │       │
│                                  │ 2. Burn LP tokens from caller        │       │
│                                  │    (amount LP tokens)               │       │
│                                  └──────────────────┬───────────────────────┘       │
│                                                            │                  │
│                                                            ▼                  │
│                                  ┌─────────────────────────────────────┐       │
│                                  │ RETURN: (ok {x-amount, y-amount})   │       │
│                                  │ Emit print event with details       │       │
│                                  └─────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Move Liquidity (Between Bins)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     MOVE-LIQUIDITY FLOWCHART                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CALLER ──► move-liquidity(pool-trait, x-token-trait, y-token-trait,       │
│            from-bin-id, to-bin-id, amount, min-dlp,                         │
│            max-x-liquidity-fee, max-y-liquidity-fee)                        │
│     │                                                                        │
│     ▼                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ VALIDATION CHECKS:                                            │            │
│  │ 1. amount > 0                                                  │            │
│  │ 2. from-bin-id != to-bin-id                                    │            │
│  │ 3. x-amount + y-amount > 0                                    │            │
│  │ 4. Correct amounts for to-bin-id vs active-bin-id             │            │
│  │ 5. min-dlp > 0, dlp-post-fees >= min-dlp                       │            │
│  │ 6. Liquidity fees within max limits                           │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│              ┌───────────────┴───────────────┐                                │
│              │ FAIL                            │ PASS                         │
│              ▼                                ▼                                │
│  ┌────────────────────────┐    ┌────────────────────────────────────┐       │
│  │ Return Error           │    │ CALCULATE WITHDRAWAL FROM:         │       │
│  │ • ERR_MATCHING_BIN_ID   │    │ • Get from-bin balances           │       │
│  │ • ERR_INVALID_AMOUNT    │    │ • x-amount = (amount * x-balance) │       │
│  │ • etc.                 │    │   / bin-shares                     │       │
│  └────────────────────────┘    │ • y-amount = (amount * y-balance) │       │
│                                 │   / bin-shares                     │       │
│                                 └──────────────────┬───────────────────────┘       │
│                                                          │                  │
│                                                          ▼                  │
│                                  ┌─────────────────────────────────────┐       │
│                                  │ CALCULATE ADDITION TO:              │       │
│                                  │ • Get to-bin balances              │       │
│                                  │ • Calculate to-bin price          │       │
│                                  │ • Calculate dlp for to-bin        │       │
│                                  │ • Calculate liquidity fees        │       │
│                                  │   (if to-bin = active-bin)        │       │
│                                  └──────────────────┬───────────────────────┘       │
│                                                            │                  │
│                                                            ▼                  │
│                                  ┌─────────────────────────────────────┐       │
│                                  │ EXECUTE OPERATIONS:                  │       │
│                                  │ 1. Update from-bin balances         │       │
│                                  │ 2. Burn LP tokens for from-bin      │       │
│                                  │ 3. Update to-bin balances          │       │
│                                  │ 4. Mint LP tokens for to-bin       │       │
│                                  └──────────────────┬───────────────────────┘       │
│                                                            │                  │
│                                                            ▼                  │
│                                  ┌─────────────────────────────────────┐       │
│                                  │ RETURN: (ok dlp-post-fees)         │       │
│                                  │ Emit print event with details      │       │
│                                  └─────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Multi-Operation Router Flowchart

### 6.1 Swap Router

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SWAP ROUTER OPERATIONS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ swap-multi(swaps, max-unfavorable-bins)                              │   │
│  │ • Process up to 350 swap operations in sequence                      │   │
│  │ • Track unfavorable bin movements                                    │   │
│  │ • Ensure unfavorable <= max-unfavorable-bins                          │   │
│  │ • Return: {results, unfavorable}                                     │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ swap-x-for-y-same-multi(swaps, x-token-trait, y-token-trait,         │   │
│  │   amount, min-y-amount-total, max-unfavorable-bins)                  │   │
│  │ • Process multiple swaps through same token pair (X→Y)              │   │
│  │ • Accumulate y-amount output                                         │   │
│  │ • Ensure y-amount >= min-y-amount-total                              │   │
│  │ • Return: {results, y-amount, unfavorable}                           │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ swap-y-for-x-same-multi(swaps, x-token-trait, y-token-trait,         │   │
│  │   amount, min-x-amount-total, max-unfavorable-bins)                  │   │
│  │ • Process multiple swaps through same token pair (Y→X)              │   │
│  │ • Accumulate x-amount output                                         │   │
│  │ • Ensure x-amount >= min-x-amount-total                              │   │
│  │ • Return: {results, x-amount, unfavorable}                           │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ swap-x-for-y-simple-multi(pool-trait, x-token-trait, y-token-trait,  │   │
│  │   x-amount, min-dy)                                                   │   │
│  │ • Swap through up to 350 bins in single pool (X→Y)                  │   │
│  │ • Return: {in, out}                                                  │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ swap-y-for-x-simple-multi(pool-trait, x-token-trait, y-token-trait,  │   │
│  │   y-amount, min-dx)                                                   │   │
│  │ • Swap through up to 350 bins in single pool (Y→X)                  │   │
│  │ • Return: {in, out}                                                  │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Liquidity Router

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LIQUIDITY ROUTER OPERATIONS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ add-liquidity-multi(positions)                                       │   │
│  │ • Add liquidity to up to 350 positions across multiple pools        │   │
│  │ • Each position: {pool-trait, x-token-trait, y-token-trait,         │   │
│  │   bin-id, x-amount, y-amount, min-dlp,                              │   │
│  │   max-x-liquidity-fee, max-y-liquidity-fee}                          │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ add-relative-liquidity-multi(positions)                              │   │
│  │ • Add liquidity to multiple positions relative to active bin       │   │
│  │ • Position includes active-bin-id-offset instead of bin-id         │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ add-relative-liquidity-same-multi(positions, pool-trait,             │   │
│  │   x-token-trait, y-token-trait, active-bin-tolerance)               │   │
│  │ • Add liquidity to multiple bins in same pool                        │   │
│  │ • Optional active-bin-tolerance for deviation check                  │   │
│  │ • Return: {results, active-bin-id, active-bin-id-delta}             │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ withdraw-liquidity-multi(positions)                                  │   │
│  │ • Withdraw liquidity from up to 350 positions                       │   │
│  │ • Each position: {pool-trait, x-token-trait, y-token-trait,         │   │
│  │   bin-id, amount, min-x-amount, min-y-amount}                        │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ withdraw-relative-liquidity-multi(positions)                         │   │
│  │ • Withdraw liquidity relative to active bin                         │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ withdraw-liquidity-same-multi(positions, x-token-trait,              │   │
│  │   y-token-trait, min-x-amount-total, min-y-amount-total)            │   │
│  │ • Withdraw from multiple bins in same pool                          │   │
│  │ • Return: {results, x-amount, y-amount}                              │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ move-liquidity-multi(positions)                                      │   │
│  │ • Move liquidity between bins across multiple pools                 │   │
│  │ • Each position: {pool-trait, x-token-trait, y-token-trait,         │   │
│  │   from-bin-id, to-bin-id, amount, min-dlp,                           │   │
│  │   max-x-liquidity-fee, max-y-liquidity-fee}                          │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ move-relative-liquidity-multi(positions)                             │   │
│  │ • Move liquidity relative to active bin                             │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Staking Contract Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STAKING CONTRACT OPERATIONS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CALLER ──► stake-lp-tokens(bin-id, amount)                                 │
│     │                                                                        │
│     ▼                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ VALIDATION:                                                    │            │
│  │ • staking-status = true                                        │            │
│  │ • amount > 0                                                   │            │
│  │ • bin-data exists for bin-id                                   │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ UPDATE STATE:                                                  │            │
│  │ • Update reward index for bin                                  │            │
│  │ • total-lp-staked += amount                                    │            │
│  │ • bin-data[bin-id].lp-staked += amount                         │            │
│  │ • user-data[user].lp-staked += amount                          │            │
│  │ • user-data-at-bin[user, bin-id] += amount + accrued-rewards   │            │
│  │ • Transfer LP tokens from caller to contract                   │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ RETURN: (ok true)                                              │            │
│  │ Emit print event                                               │            │
│  └──────────────────────────────────────────────────────────────┘            │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  CALLER ──► unstake-lp-tokens(bin-id, amount)                               │
│     │                                                                        │
│     ▼                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ VALIDATION:                                                    │            │
│  │ • early-unstake-status OR minimum-staking-duration passed      │            │
│  │ • amount > 0 AND amount <= user lp-staked                      │            │
│  │ • If early-unstake: apply early-unstake-fee                    │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ UPDATE STATE:                                                  │            │
│  │ • Update reward index for bin                                  │            │
│  │ • total-lp-staked -= amount                                    │            │
│  │ • bin-data[bin-id].lp-staked -= amount                         │            │
│  │ • user-data[user].lp-staked -= amount                          │            │
│  │ • user-data-at-bin[user, bin-id] -= amount                     │            │
│  │ • Transfer LP tokens to caller (minus fee)                     │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ RETURN: (ok true)                                              │            │
│  │ Emit print event                                               │            │
│  └──────────────────────────────────────────────────────────────┘            │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  CALLER ──► claim-rewards(bin-id)                                           │
│     │                                                                        │
│     ▼                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ CALCULATE REWARDS:                                              │            │
│  │ • Get updated reward index for bin                             │            │
│  │ • Calculate reward-index-delta                                  │            │
│  │ • pending-rewards = (lp-staked * reward-index-delta) /         │            │
│  │   REWARD_SCALE_BPS                                              │            │
│  │ • claimable-rewards = pending + accrued                         │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ EXECUTE:                                                        │            │
│  │ • Transfer claimable-rewards to caller                         │            │
│  │ • Update user accrued-rewards to 0                             │            │
│  │ • Update total-rewards-claimed                                  │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ RETURN: (ok claimable-rewards)                                 │            │
│  │ Emit print event                                               │            │
│  └──────────────────────────────────────────────────────────────┘            │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  ADMIN ──► set-rewards-to-distribute(bin-id, amount)                       │
│     │                                                                        │
│     ▼                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ VALIDATION:                                                    │            │
│  │ • Caller is admin                                               │            │
│  │ • amount <= contract reward token balance                      │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ CALCULATE:                                                      │            │
│  │ • Update reward index for bin                                  │            │
│  │ • Calculate remaining rewards in current period                │            │
│  │ • updated-rewards-to-distribute = amount + remaining          │            │
│  │ • reward-per-block = updated-rewards / reward-period-duration │            │
│  │ • reward-period-end-block = stacks-block-height + duration    │            │
│  └───────────────────────────┬────────────────────────────────────┘            │
│                              │                                                 │
│                              ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │ UPDATE STATE:                                                  │            │
│  │ • bin-data[bin-id] updated with new reward parameters         │            │
│  └──────────────────────────────────────────────────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Bin Structure and Price Calculation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BIN STRUCTURE AND PRICE MODEL                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  BIN CONFIGURATION:                                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ • NUM_OF_BINS = 1001                                                 │   │
│  │ • CENTER_BIN_ID = 500 (unsigned) / 0 (signed)                       │   │
│  │ • MIN_BIN_ID = -500 (signed)                                         │   │
│  │ • MAX_BIN_ID = +500 (signed)                                         │   │
│  │ • BIN_INDEX_RANGE = 0 to 349 (350 bins for multi operations)       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  BIN ID CONVERSION:                                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ unsigned-bin-id = bin-id + CENTER_BIN_ID                            │   │
│  │ signed-bin-id   = unsigned-bin-id - CENTER_BIN_ID                   │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  PRICE CALCULATION:                                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ bin-price = (initial-price * bin-factor) / PRICE_SCALE_BPS         │   │
│  │                                                                       │   │
│  │ Where:                                                               │   │
│  │ • PRICE_SCALE_BPS = 100,000,000 (10^8)                              │   │
│  │ • bin-factor is pre-calculated for each bin step and bin           │   │
│  │                                                                       │   │
│  │ Example (bin-step = 10, initial-price = 50000):                     │   │
│  │ • CENTER_BIN (bin-id = 0):                                          │   │
│  │   bin-factor = PRICE_SCALE_BPS = 100,000,000                        │   │
│  │   bin-price = 50000 * 100000000 / 100000000 = 50000                │   │
│  │                                                                       │   │
│  │ • BIN +1 (bin-id = 1):                                               │   │
│  │   bin-factor = slightly higher (e.g., 105000000)                    │   │
│  │   bin-price = 50000 * 105000000 / 100000000 = 52500                │   │
│  │                                                                       │   │
│  │ • BIN -1 (bin-id = -1):                                              │   │
│  │   bin-factor = slightly lower (e.g., 95238095)                      │   │
│  │   bin-price = 50000 * 95238095 / 100000000 = 47619                 │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  BIN FACTORS LIST (1001 elements per bin step):                            │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ bin-factors[step] = list of 1001 uint values                         │   │
│  │ • Index 0 = BIN -500 (MIN_BIN_ID)                                    │   │
│  │ • Index 500 = BIN 0 (CENTER_BIN_ID) - factor = PRICE_SCALE_BPS      │   │
│  │ • Index 1000 = BIN +500 (MAX_BIN_ID)                                │   │
│  │ • Must be in ascending order                                        │   │
│  │ • Each factor must be > 0                                            │   │
│  │ • Center factor must equal PRICE_SCALE_BPS                          │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ACTIVE BIN:                                                                │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ • The bin where swaps are executed                                   │   │
│  │ • Identified by active-bin-id (int)                                 │   │
│  │ • Changes when a bin's output token is exhausted                    │   │
│  │                                                                       │   │
│  │ SWAP-X-FOR-Y (Y exhausted):                                         │   │
│  │   active-bin-id moves LEFT (bin-id - 1)                             │   │
│  │                                                                       │   │
│  │ SWAP-Y-FOR-X (X exhausted):                                         │   │
│  │   active-bin-id moves RIGHT (bin-id + 1)                             │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Fee Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FEE STRUCTURE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FEE SCALING:                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ FEE_SCALE_BPS = 10,000 (1 BPS = 0.01%)                                │   │
│  │ PRICE_SCALE_BPS = 100,000,000                                        │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  SWAP FEES (per direction):                                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ Total Swap Fee = Protocol Fee + Provider Fee + Variable Fee         │   │
│  │                                                                       │   │
│  │ • Protocol Fee: Goes to fee-address (claimable via core)            │   │
│  │ • Provider Fee: Added to bin liquidity                               │   │
│  │ • Variable Fee: Dynamic fee (set by variable-fees-manager)           │   │
│  │                                                                       │   │
│  │ Fee Calculation:                                                      │   │
│  │ fees-total = (amount * swap-fee-total) / FEE_SCALE_BPS               │   │
│  │                                                                       │   │
│  │ Example (amount = 1000, fees = 0.3%):                                 │   │
│  │ fees-total = (1000 * 30) / 10000 = 3                                 │   │
│  │                                                                       │   │
│  │ Output Amount = amount - fees-total                                   │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  LIQUIDITY FEES (when adding to active bin):                               │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ Applied when adding liquidity to the active bin                      │   │
│  │ Based on imbalance of token ratios                                   │   │
│  │                                                                       │   │
│  │ If x-amount > proportional x-amount:                                 │   │
│  │   x-amount-fee = (x-amount - proportional-x) * x-fee / BPS          │   │
│  │                                                                       │   │
│  │ If y-amount > proportional y-amount:                                 │   │
│  │   y-amount-fee = (y-amount - proportional-y) * y-fee / BPS          │   │
│  │                                                                       │   │
│  │ Liquidity fees are capped by max-x/y-liquidity-fee parameters        │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  EARLY UNSTAKE FEE (Staking):                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ early-unstake-fee = 50 BPS (0.5% by default)                         │   │
│  │ Goes to early-unstake-fee-address                                    │   │
│  │ Can be changed by admin                                              │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  FEE EXEMPTIONS:                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ • Admins can set swap-fee-exemptions for addresses                  │   │
│  │ • Exempt addresses pay 0 swap fees                                   │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Error Codes Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ERROR CODES REFERENCE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CORE ERRORS (1001-1074):                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ 1001: ERR_NOT_AUTHORIZED                                              │   │
│  │ 1002: ERR_INVALID_AMOUNT                                              │   │
│  │ 1003: ERR_INVALID_PRINCIPAL                                           │   │
│  │ 1004: ERR_ALREADY_ADMIN                                               │   │
│  │ 1005: ERR_ADMIN_LIMIT_REACHED                                         │   │
│  │ 1006: ERR_ADMIN_NOT_IN_LIST                                           │   │
│  │ 1007: ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER                             │   │
│  │ 1008: ERR_NO_POOL_DATA                                                │   │
│  │ 1009: ERR_POOL_NOT_CREATED                                            │   │
│  │ 1010: ERR_POOL_DISABLED                                               │   │
│  │ 1011: ERR_POOL_ALREADY_CREATED                                        │   │
│  │ 1012: ERR_INVALID_POOL                                                │   │
│  │ 1013: ERR_INVALID_POOL_URI                                            │   │
│  │ 1014: ERR_INVALID_POOL_SYMBOL                                         │   │
│  │ 1015: ERR_INVALID_POOL_NAME                                           │   │
│  │ 1016: ERR_INVALID_TOKEN_DIRECTION                                     │   │
│  │ 1017: ERR_MATCHING_TOKEN_CONTRACTS                                    │   │
│  │ 1018: ERR_INVALID_X_TOKEN                                             │   │
│  │ 1019: ERR_INVALID_Y_TOKEN                                             │   │
│  │ 1020: ERR_INVALID_X_AMOUNT                                            │   │
│  │ 1021: ERR_INVALID_Y_AMOUNT                                            │   │
│  │ 1022: ERR_MINIMUM_X_AMOUNT                                            │   │
│  │ 1023: ERR_MINIMUM_Y_AMOUNT                                            │   │
│  │ 1024: ERR_MINIMUM_LP_AMOUNT                                           │   │
│  │ 1025: ERR_MAXIMUM_X_AMOUNT                                            │   │
│  │ 1026: ERR_MAXIMUM_Y_AMOUNT                                            │   │
│  │ 1027: ERR_INVALID_MIN_DLP_AMOUNT                                      │   │
│  │ 1028: ERR_INVALID_LIQUIDITY_VALUE                                     │   │
│  │ 1029: ERR_INVALID_FEE                                                 │   │
│  │ 1030: ERR_MAXIMUM_X_LIQUIDITY_FEE                                     │   │
│  │ 1031: ERR_MAXIMUM_Y_LIQUIDITY_FEE                                     │   │
│  │ 1032: ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA                            │   │
│  │ 1033: ERR_MINIMUM_BURN_AMOUNT                                          │   │
│  │ 1034: ERR_INVALID_MIN_BURNT_SHARES                                    │   │
│  │ 1035: ERR_INVALID_BIN_STEP                                            │   │
│  │ 1036: ERR_ALREADY_BIN_STEP                                             │   │
│  │ 1037: ERR_BIN_STEP_LIMIT_REACHED                                      │   │
│  │ 1038: ERR_NO_BIN_FACTORS                                              │   │
│  │ 1039: ERR_INVALID_BIN_FACTOR                                          │   │
│  │ 1040: ERR_INVALID_FIRST_BIN_FACTOR                                    │   │
│  │ 1041: ERR_INVALID_CENTER_BIN_FACTOR                                   │   │
│  │ 1042: ERR_UNSORTED_BIN_FACTORS_LIST                                   │   │
│  │ 1043: ERR_INVALID_BIN_FACTORS_LENGTH                                  │   │
│  │ 1044: ERR_INVALID_INITIAL_PRICE                                       │   │
│  │ 1045: ERR_INVALID_BIN_PRICE                                            │   │
│  │ 1046: ERR_MATCHING_BIN_ID                                             │   │
│  │ 1047: ERR_NOT_ACTIVE_BIN                                               │   │
│  │ 1048: ERR_NO_BIN_SHARES                                               │   │
│  │ 1049: ERR_INVALID_POOL_CODE_HASH                                      │   │
│  │ 1050: ERR_INVALID_VERIFIED_POOL_CODE_HASH                             │   │
│  │ 1051: ERR_ALREADY_VERIFIED_POOL_CODE_HASH                             │   │
│  │ 1052: ERR_VERIFIED_POOL_CODE_HASH_LIMIT_REACHED                       │   │
│  │ 1053: ERR_VERIFIED_POOL_CODE_HASH_NOT_IN_LIST                         │   │
│  │ 1054: ERR_VARIABLE_FEES_COOLDOWN                                      │   │
│  │ 1055: ERR_VARIABLE_FEES_MANAGER_FROZEN                                │   │
│  │ 1056: ERR_INVALID_DYNAMIC_CONFIG                                      │   │
│  │ 1057: ERR_INVALID_CORE                                                │   │
│  │ 1058: ERR_INVALID_CORE_MIGRATION_COOLDOWN                             │   │
│  │ 1059: ERR_CORE_MIGRATION_COOLDOWN                                     │   │
│  │ 1060: ERR_NOT_MANAGED_POOL                                             │   │
│  │ 1061: ERR_PROTOCOL_FEES_PRESENT                                      │   │
│  │ 1062: ERR_PUBLIC_POOL_CREATION_ENABLED                                │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  SWAP ROUTER ERRORS (2001-2009):                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ 2001: ERR_NO_RESULT_DATA                                              │   │
│  │ 2002: ERR_BIN_SLIPPAGE                                               │   │
│  │ 2003: ERR_MINIMUM_RECEIVED                                            │   │
│  │ 2004: ERR_MINIMUM_X_AMOUNT                                            │   │
│  │ 2005: ERR_MINIMUM_Y_AMOUNT                                            │   │
│  │ 2006: ERR_NO_ACTIVE_BIN_DATA                                          │   │
│  │ 2007: ERR_EMPTY_SWAPS_LIST                                            │   │
│  │ 2008: ERR_RESULTS_LIST_OVERFLOW                                      │   │
│  │ 2009: ERR_INVALID_BIN_ID                                              │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  LIQUIDITY ROUTER ERRORS (5001-5008):                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ 5001: ERR_NO_RESULT_DATA                                              │   │
│  │ 5002: ERR_MINIMUM_X_AMOUNT                                            │   │
│  │ 5003: ERR_MINIMUM_Y_AMOUNT                                            │   │
│  │ 5004: ERR_NO_ACTIVE_BIN_DATA                                          │   │
│  │ 5005: ERR_EMPTY_POSITIONS_LIST                                        │   │
│  │ 5006: ERR_RESULTS_LIST_OVERFLOW                                      │   │
│  │ 5007: ERR_INVALID_BIN_ID                                              │   │
│  │ 5008: ERR_ACTIVE_BIN_TOLERANCE                                        │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  STAKING ERRORS (4001-4026):                                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ 4001: ERR_NOT_AUTHORIZED                                              │   │
│  │ 4002: ERR_INVALID_AMOUNT                                              │   │
│  │ 4003: ERR_INVALID_PRINCIPAL                                           │   │
│  │ 4004: ERR_ALREADY_ADMIN                                               │   │
│  │ 4005: ERR_ADMIN_LIMIT_REACHED                                         │   │
│  │ 4006: ERR_ADMIN_NOT_IN_LIST                                           │   │
│  │ 4007: ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER                             │   │
│  │ 4008: ERR_STAKING_DISABLED                                            │   │
│  │ 4009: ERR_EARLY_UNSTAKE_DISABLED                                      │   │
│  │ 4010: ERR_TOKEN_TRANSFER_FAILED                                       │   │
│  │ 4011: ERR_CANNOT_GET_TOKEN_BALANCE                                    │   │
│  │ 4012: ERR_INSUFFICIENT_TOKEN_BALANCE                                  │   │
│  │ 4013: ERR_INVALID_MIN_STAKING_DURATION                                │   │
│  │ 4014: ERR_MINIMUM_STAKING_DURATION_HAS_NOT_PASSED                     │   │
│  │ 4015: ERR_MINIMUM_STAKING_DURATION_PASSED                             │   │
│  │ 4016: ERR_INVALID_REWARD_PERIOD_DURATION                              │   │
│  │ 4017: ERR_REWARD_PERIOD_HAS_NOT_PASSED                                │   │
│  │ 4018: ERR_BINS_STAKED_OVERFLOW                                        │   │
│  │ 4019: ERR_INVALID_BIN_ID                                               │   │
│  │ 4020: ERR_NO_BIN_DATA                                                 │   │
│  │ 4021: ERR_NO_USER_DATA                                                │   │
│  │ 4022: ERR_NO_USER_DATA_AT_BIN                                         │   │
│  │ 4023: ERR_NO_LP_TO_UNSTAKE                                            │   │
│  │ 4024: ERR_NO_EARLY_LP_TO_UNSTAKE                                      │   │
│  │ 4025: ERR_NO_CLAIMABLE_REWARDS                                        │   │
│  │ 4026: ERR_INVALID_FEE                                                 │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. State Variables Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CORE CONTRACT STATE VARIABLES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  IMMUTABLE CONSTANTS:                                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ • CONTRACT_DEPLOYER: Principal of deployer                            │   │
│  │ • BURN_ADDRESS: Principal for burning (0x16... for mainnet)          │   │
│  │ • NUM_OF_BINS: 1001                                                    │   │
│  │ • CENTER_BIN_ID: 500                                                   │   │
│  │ • MIN_BIN_ID: -500, MAX_BIN_ID: +500                                  │   │
│  │ • FEE_SCALE_BPS: 10000                                                 │   │
│  │ • PRICE_SCALE_BPS: 100000000                                           │   │
│  │ • MIN_CORE_MIGRATION_COOLDOWN: 604800 (1 week)                        │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  DATA VARIABLES:                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ • core-migration-source: principal                                    │   │
│  │ • core-migration-target: principal                                    │   │
│  │ • core-migration-execution-time: uint                                 │   │
│  │ • core-migration-cooldown: uint (default: 1209600 = 2 weeks)          │   │
│  │ • admins: (list 5 principal)                                           │   │
│  │ • admin-helper: principal                                              │   │
│  │ • last-pool-id: uint                                                   │   │
│  │ • bin-steps: (list 1000 uint)                                          │   │
│  │ • bin-factors: uint → (list 1001 uint)                                 │   │
│  │ • minimum-bin-shares: uint (10000)                                     │   │
│  │ • minimum-burnt-shares: uint (1000)                                    │   │
│  │ • public-pool-creation: bool (false)                                   │   │
│  │ • verified-pool-code-hashes: (list 10000 buff32)                      │   │
│  │ • verified-pool-code-hashes-helper: buff32                            │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  MAPS:                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ • pools: uint → {id, name, symbol, pool-contract, status}            │   │
│  │ • allowed-token-direction: {x-token, y-token} → bool                  │   │
│  │ • unclaimed-protocol-fees: uint → {x-fee, y-fee}                      │   │
│  │ • swap-fee-exemptions: {address, id} → bool                           │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Contract Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CONTRACT DEPENDENCY RELATIONSHIPS                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  dlmm-core-v-1-1.clar                                                       │
│      │                                                                     │
│      ├──► IMPLEMENTS: dlmm-core-trait-v-1-1                                │
│      │                                                                     │
│      ├──► USES TRAITS:                                                     │
│      │     ├──► dlmm-core-trait (self)                                    │
│      │     ├──► dlmm-pool-trait                                           │
│      │     └──► sip-010-trait                                             │
│      │                                                                     │
│      └──► CALLS:                                                           │
│            ├──► dlmm-pool-trait functions                                  │
│            └──► sip-010-trait functions                                    │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  dlmm-pool-trait-v-1-1.clar (Trait Definition)                             │
│      │                                                                     │
│      └──► DEFINES INTERFACE FOR:                                           │
│            ├──► dlmm-pool-sbtc-usdc-v-1-1.clar                            │
│            └──► dlmm-core-multi-helper-v-1-1.clar                         │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  dlmm-swap-router-v-1-1.clar                                                │
│      │                                                                     │
│      ├──► USES TRAITS:                                                     │
│      │     ├──► dlmm-pool-trait                                           │
│      │     └──► sip-010-trait                                             │
│      │                                                                     │
│      └──► CALLS:                                                           │
│            └──► dlmm-core-v-1-1                                            │
│                  └──► dlmm-pool-trait functions                            │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  dlmm-liquidity-router-v-1-1.clar                                          │
│      │                                                                     │
│      ├──► USES TRAITS:                                                     │
│      │     ├──► dlmm-pool-trait                                           │
│      │     └──► sip-010-trait                                             │
│      │                                                                     │
│      └──► CALLS:                                                           │
│            └──► dlmm-core-v-1-1                                            │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  dlmm-staking-sbtc-usdc-v-1-1.clar                                          │
│      │                                                                     │
│      ├──► IMPLEMENTS: dlmm-staking-trait-v-1-1                             │
│      │                                                                     │
│      └──► CALLS:                                                           │
│            └──► dlmm-pool-sbtc-usdc-v-1-1                                   │
│                  └──► dlmm-pool-trait functions                             │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  EXTERNAL TRAITS:                                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ • sip-010-trait-ft-standard-v-1-1: SIP-010 fungible token standard   │   │
│  │ • sip-013-trait-sft-standard-v-1-1: SIP-013 SFT standard              │   │
│  │ • sip-013-transfer-many-trait-v-1-1: Batch transfer trait            │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Key Concepts Summary

### 13.1 Bin-Based AMM
- Liquidity is concentrated in discrete price bins
- Each bin has its own price based on bin factor
- Active bin moves as trades consume one side of liquidity

### 13.2 Dynamic Liquidity Provider (DLP) Tokens
- LP tokens represent share of liquidity in a specific bin
- DLP is fungible within a bin
- Users can have positions across multiple bins

### 13.3 Variable Fees
- Protocol fee: Fixed, goes to fee address
- Provider fee: Added to liquidity
- Variable fee: Dynamic, set by fees manager

### 13.4 Core Migration
- Pools can migrate to new core contract
- Requires admin actions and cooldown period
- Ensures continuity of service during upgrades

---

## 14. File Structure Overview

```
clarity/
├── contracts/
│   ├── dlmm-core-v-1-1.clar              (Central hub contract)
│   ├── dlmm-core-trait-v-1-1.clar         (Core trait definition)
│   ├── dlmm-core-multi-helper-v-1-1.clar  (Multi-bin helper)
│   ├── dlmm-pool-trait-v-1-1.clar         (Pool interface)
│   ├── dlmm-pool-sbtc-usdc-v-1-1.clar      (Token pair pool)
│   ├── dlmm-swap-router-v-1-1.clar         (Swap aggregation)
│   ├── dlmm-liquidity-router-v-1-1.clar    (Liquidity aggregation)
│   ├── dlmm-staking-trait-v-1-1.clar       (Staking interface)
│   ├── dlmm-staking-sbtc-usdc-v-1-1.clar   (LP token staking)
│   ├── external/
│   │   ├── sip-010-trait-ft-standard-v-1-1.clar
│   │   ├── sip-013-trait-sft-standard-v-1-1.clar
│   │   ├── sip-013-transfer-many-trait-v-1-1.clar
│   │   └── token-stx-v-1-1.clar
│   └── mocks/
│       ├── mock-pool.clar
│       ├── mock-random-token.clar
│       ├── mock-sbtc-token.clar
│       └── mock-usdc-token.clar
├── tests/                                  (Clarinet tests)
├── deployments/                            (Deployment configs)
├── fuzz/                                   (Property-based tests)
└── scripts/                                (Utility scripts)
```

---

## 15. Summary Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DLMM SYSTEM - HIGH LEVEL FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              USERS                                            │
│                                 │                                             │
│          ┌──────────────────────┼──────────────────────┐                     │
│          │                      │                      │                     │
│          ▼                      ▼                      ▼                     │
│   ┌─────────────┐      ┌─────────────────┐      ┌─────────────┐             │
│   │  ADD/       │      │     SWAP        │      │   STAKING   │             │
│   │ WITHDRAW    │      │   OPERATION     │      │  OPERATION  │             │
│   │ LIQUIDITY   │      │                 │      │             │             │
│   └──────┬──────┘      └────────┬────────┘      └──────┬──────┘             │
│          │                      │                      │                     │
│          │                      ▼                      │                     │
│          │             ┌─────────────────┐             │                     │
│          │             │ DLMM-SWAP-      │             │                     │
│          │             │ ROUTER (Optional)│             │                     │
│          │             └────────┬────────┘             │                     │
│          │                      │                      │                     │
│          ▼                      ▼                      ▼                     │
│   ┌─────────────────────────────────────────────────────────────┐            │
│   │                    DLMM-CORE-V-1-1                          │            │
│   │              (Pool Management & Trading Logic)               │            │
│   └──────────────────────────┬──────────────────────────────────┘            │
│                             │                                               │
│                             ▼                                               │
│              ┌───────────────────────────────┐                                │
│              │      DLMM-POOL-[PAIR]       │                                │
│              │  (Bin State & Token Balances)│                                │
│              └───────────────────────────────┘                                │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                          ADMIN FUNCTIONS                              │   │
│  │  • create-pool()    • set-fees()    • migrate-pool()                 │   │
│  │  • claim-protocol-fees()  • set-variable-fees-manager()               │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Document generated for bitflow-dlmm Clarity smart contract codebase*
*Last updated: 2026-02-07*
