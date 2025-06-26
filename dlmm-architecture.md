# DLMM Contract Architecture

## 1. Contracts

### Core
- `dlmm-core-v-1-1`
- `dlmm-pool-trait-v-1-1`
- `dlmm-pool-stx-aeusdc-v-1-1` (example pool)
- `dlmm-router-v-1-1`

### External
- `sip-010-trait-ft-standard-v-1-1`
- `token-stx-v-1-2`

## 2. dlmm-core-v-1-1

### Traits
- `dlmm-pool-trait-v-1-1` (use)
- `sip-010-trait-ft-standard-v-1-1` (use)

### Constants
- Core error codes
- `CONTRACT_DEPLOYER` (`tx-sender`)
- `NUM_OF_BINS` (`u1000`)
- `BPS` (`u10000`)

### Data Variables

#### Admin-Configurable
Set via public admin functions
- `admins` (`(list 5 principal)`): List of principals with admin permissions
- `bin-steps` (`list 10 uint`): List of allowed bin steps
- `minimum-total-shares` (`uint`): Minimum shares to mint when creating a pool
- `minimum-burnt-shares` (`uint`): Minimum shares to burn when creating a pool
- `public-pool-creation` (`bool`): Allow pool creation by anyone or admins only

#### Indirectly Modified
Updated only as a side-effect of other functions
- `admin-helper` (`principal`): Helper variable for removing an admin
- `last-pool-id` (`uint`): ID of last created pool

### Mappings
- `pools` (`uint { id: uint, name: (string-ascii 32), symbol: (string-ascii 32), pool-contract: principal }`)  
  _May add `pool-status` and `fee-address` here instead of in each pool contract_

### Admin Functions
Follows the same design as XYK Core

**Read-only**
- `get-admins`: Returns `admins`
- `get-admin-helper`: Returns `admin-helper`

**Public**
- `add-admin`: Add principal to `admins` (admin-only)
- `remove-admin`: Remove principal from `admins` (admin-only)

**Private**
- `admin-not-removable`: Helper for removing a principal from `admins`

### Pool Management Functions
Manage or retrieve data about pools

**Read-only**
- `get-last-pool-id`: Returns `last-pool-id`
- `get-pool-by-id`: Returns data about a pool from `pools` mapping

**Public**
- `set-pool-uri`: Set URI for a pool (admin-only)
- `set-pool-status`: Set pool status (admin-only)
- `set-fee-address`: Set fee address (admin-only)
- `set-x-fees`: Set X protocol and provider fees (admin-only)
- `set-y-fees`: Set Y protocol and provider fees (admin-only)
- `set-pool-uri-multi`: Batch version of `set-pool-uri` (120 max)
- `set-pool-status-multi`: Batch version of `set-pool-status` (120 max)
- `set-fee-address-multi`: Batch version of `set-fee-address` (120 max)
- `set-x-fees-multi`: Batch version of `set-x-fees` (120 max)
- `set-y-fees-multi`: Batch version of `set-y-fees` (120 max)

**Private**
- `is-valid-pool`: Check the validity of a pool

### Core Management Functions
Manage or retrieve data about the core contract

**Read-only**
- `get-bin-steps`: Returns `bin-steps`
- `get-minimum-total-shares`: Returns `minimum-total-shares`
- `get-minimum-burnt-shares`: Returns `minimum-burnt-shares`
- `get-public-pool-creation`: Returns `public-pool-creation`

**Public**
- `add-bin-step`: Add bin step to `bin-steps` (admin-only)
- `remove-bin-step`: Remove bin step from `bin-steps` (admin-only)  
  _What if we removed a bin step used in an active pool?_
- `set-minimum-shares`: Set minimum total and burnt shares (admin-only)
- `set-public-pool-creation`: Enable or disable public pool creation (admin-only)

### Pool Creation Functions
Create new pools

**Public**
- `create-pool`: Create a new pool (admin-only when `public-pool-creation` is false)  
  _If `public-pool-creation` is `true`, anyone can create pools. Otherwise, only admins can create pools_

**Private**
- `create-symbol`: Create pool symbol using token symbols

### Quote Functions
Retrieve quotes using a single bin in a pool

**Public** (read-only if possible)
- `get-dy`: Return token X -> Y quote
- `get-dx`: Return token Y -> X quote
- `get-dlp`: Return number of shares to mint for adding liquidity

### Swap Functions
Swap using a single bin in a pool

**Public**
- `swap-x-for-y`: Swap token X -> Y
- `swap-y-for-x`: Swap token Y -> X

### Liquidity Functions
Add or withdraw liquidity using a single bin in a pool

**Public**
- `add-liquidity`: Add proportional liquidity (single-sided for non-active bins)
- `withdraw-liquidity`: Withdraw proportional liquidity

### Variable Fees Functions
Manage or retrieve data about variable fees for a single bin in a pool 

**Public**
- `set-variable-fees`: Set variable fees (admin and manager-only)
- `set-variable-fees-manager`: Set variable fees manager (admin-only)
- `set-variable-fees-cooldown`: Set the cooldown period (Stacks blocks) for resetting variable fees (admin-only)
- `freeze-variable-fees-manager`: Freeze the variable fees manager address (admin-only)
- `reset-variable-fees`: Reset variable fees if the cooldown period has passed
- `set-variable-fees-multi`: Batch version of `set-variable-fees` (120 max)
- `set-variable-fee-manager-multi`: Batch version of `set-variable-fees-manager` (120 max)
- `set-variable-fees-cooldown-multi`: Batch version of `set-variable-fees-cooldown` (120 max)
- `set-freeze-variable-fees-manager-multi`: Batch version of `set-freeze-variable-fees-manager` (120 max)

## dlmm-pool-trait-v-1-1 (w.i.p.)

### Traits
- `sip-010-trait-ft-standard-v-1-1` (use)
- `dlmm-pool-trait` (define)

### Trait Definition
- `get-name`: () (response (string-ascii 32) uint)
- `get-symbol`: () (response (string-ascii 32) uint)
- `get-decimals`: () (response uint uint)
- `get-token-uri`: () (response (optional (string-utf8 256)) uint)
- `get-total-supply`: () (response uint uint)
- `get-balance`: (principal) (response uint uint)
- `get-pool`: ...
- `set-pool-uri`: ...
- `set-pool-status`: ...  
  _Remove if `pool-status` is managed in the core contract_
- `set-variable-fees-manager`:
- `set-fee-address`:
  _Remove if `fee-address` is managed in the core contract_

## dlmm-pool-stx-aeusdc-v-1-1

### Traits
- `dlmm-pool-trait-v-1-1` (implement)
- `sip-010-trait-ft-standard-v-1-1` (use)

### Constants
- Pool and SIP-010 error codes
- `CORE_ADDRESS` (`.dlmm-core-v-1-1`)
- `CONTRACT_DEPLOYER` (`tx-sender`)

### Data Variables

#### Pool Creation
Set via the core contract only at pool creation
- `pool-id` (`uint`): ID of pool (`(+ last-pool-id u1)`)
- `pool-name` (`string-ascii 32`): Pool and `pool-token` name
- `pool-symbol` (`string-ascii 32`): Pool and `pool-token` symbol
- `pool-created` (`bool`): Pool creation status
- `creation-height` (`uint`): Burn block height when the pool was created
- `x-token` (`principal`): X token principal
- `y-token` (`principal`): Y token principal
- `bin-step` (`uint`): Pool bin step

#### Admin-Configurable
Set via the core contract using admin functions
- `pool-uri` (`string-utf8 256`): Pool and `pool-token` URI
- `pool-status` (`bool`): Status of the pool (`swap-x-for-y`, `swap-y-for-x`, `add-liquidity`)  
  _May add this in the `pools` mapping in the core contract instead of here_
- `variable-fees-manager`: Principal authorized to set variable fees 
- `fee-address` (`principal`): Principal to send protocol fees to  
  _May add this in the `pools` mapping in the core contract instead of here_
- `x-protocol-fee` (`uint`): Protocol fee charged for protocol when swapping X -> Y
- `x-provider-fee` (`uint`): Provider fee charged for providers when swapping X -> Y
- `x-variable-fee` (`uint`): Variable fee charged for providers when swapping X -> Y
- `y-protocol-fee` (`uint`): Protocol fee charged for protocol when swapping Y -> X
- `y-provider-fee` (`uint`): Protocol fee charged for providers when swapping Y -> X
- `y-variable-fee` (`uint`): Variable fee charged for providers when swapping Y -> X
- `variable-fees-cooldown`: Variable fees can be reset after this cooldown (Stacks blocks) is reached
- `freeze-variable-fees-manager`: If `true`, `variable-fees-manager` is permanently frozen

#### Indirectly Modified
Updated only as a side-effect of other functions
- `active-bin-id`: ID of the active bin
- `last-variable-fees-update`: Latest variable fees update (Stacks block)

### Mappings
- `balances-at-bin` (`int { x-balance: uint, y-balance: uint, total-shares: uint }`)
- `user-balance-at-bin` (`{ user: principal, id: int } uint`)

### SIP-010 Functions
Interact or retrieve data about the `pool-token` (SIP-010-compliant)

**Read-only**
- `get-name`: Returns `pool-name`
- `get-symbol`: Returns `pool-symbol`
- `get-decimals`: Returns `pool-token` decimals
- `get-token-uri`: Returns `pool-uri`
- `get-total-supply`: Returns total `pool-token` supply
- `get-balance`: Returns `pool-token` balance for a principal

**Public**
- `transfer`: Transfer `pool-token`

### Pool Management Functions
Manage or retrieve data about the pool contract

**Read-only**
- `get-pool`: Returns base pool data
- `get-active-bin-id`: Returns `active-bin-id`
- `get-balances-at-bin`: Returns data about a bin from `balances-at-bin` mapping
- `get-user-balance-at-bin`: Returns user data at a bin from `user-balance-at-bin` mapping

**Public** (callable by core only)
- `set-pool-uri`: Called via `set-pool-uri` in core
- `set-pool-status`: Called via `set-pool-status` in core  
  _Remove if `pool-status` is managed in the core contract_
- `set-fee-address`: Called via `set-fee-address` in core  
  _Remove if `fee-address` is managed in the core contract_
- `set-x-fees`: Called via `set-x-fees` in core
- `set-y-fees`: Called via `set-y-fees` in core
- `set-variable-fees`: Called via `set-variable-fees` in core
- `set-variable-fees-cooldown`: Called via `set-variable-fees-cooldown` in core
- `set-freeze-variable-fees-manager`: Called via `set-freeze-variable-fees-manager` in core
- `set-active-bin`: Set current active bin via pool creation, swap, and liquidity functions in core
- `update-bin-balances`: Update the `balances-at-bin` mapping via pool creation, swap, and liquidity functions in core
- `update-user-balance`: Update the `user-balance-at-bin` mapping via the transfer function in pool, and through pool creation and liquidity functions in core
- `pool-transfer`: Transfer X / Y token from the pool via swap and withdraw liquidity functions in core
- `pool-mint`: Mint new `pool-token` via pool creation and add liquidity functions in core
- `pool-burn`: Burn existing `pool-token` via `withdraw-liquidity` in core
- `create-pool`: Called via `create-pool` in core

## dlmm-router-v-1-1 (w.i.p.)