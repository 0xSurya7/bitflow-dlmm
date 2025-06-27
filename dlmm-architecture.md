# DLMM Contract Architecture

## 1. Contracts

### Core
- `dlmm-core-v-1-1`
- `dlmm-pool-trait-v-1-1`
- `dlmm-pool-stx-sbtc-v-1-1` (example pool)
- `dlmm-router-v-1-1`

### External
- `sip-010-trait-ft-standard-v-1-1`
- `sip-013-trait-ft-standard-v-1-1`
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
- `bin-steps` (`(list 10 uint)`): List of allowed bin steps (initial: 1, 5, 10, and 20)
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

#### Read-only
- `get-admins`: Returns `admins`
- `get-admin-helper`: Returns `admin-helper`

#### Public
- `add-admin`: Add principal to `admins` (admin-only)
- `remove-admin`: Remove principal from `admins` (admin-only)

#### Private
- `admin-not-removable`: Helper for removing a principal from `admins`

### Pool Management Functions
Manage or retrieve data about pools

#### Read-only
- `get-last-pool-id`: Returns `last-pool-id`
- `get-pool-by-id`: Returns data about a pool from `pools` mapping

#### Public
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

#### Private
- `is-valid-pool`: Check the validity of a pool

### Core Management Functions
Manage or retrieve data about the core contract

#### Read-only
- `get-bin-steps`: Returns `bin-steps`
- `get-minimum-total-shares`: Returns `minimum-total-shares`
- `get-minimum-burnt-shares`: Returns `minimum-burnt-shares`
- `get-public-pool-creation`: Returns `public-pool-creation`

#### Public
- `add-bin-step`: Add bin step to `bin-steps` (admin-only)
- `remove-bin-step`: Remove bin step from `bin-steps` (admin-only)  
  _What if we removed a bin step used in an active pool?_
- `set-minimum-shares`: Set minimum total and burnt shares (admin-only)
- `set-public-pool-creation`: Enable or disable public pool creation (admin-only)

### Pool Creation Functions
Create new pools

#### Public
- `create-pool`: Create a new pool (admin-only when `public-pool-creation` is false)  
  _If `public-pool-creation` is `true`, anyone can create pools. Otherwise, only admins can create pools_

#### Private
- `create-symbol`: Create pool symbol using token symbols

### Quote Functions
Retrieve quotes using a single bin in a pool

#### Public (read-only if possible)
- `get-dy`: Return token X → Y quote
- `get-dx`: Return token Y → X quote
- `get-dlp`: Return number of shares to mint for adding liquidity

### Swap Functions
Swap using a single bin in a pool

#### Public
- `swap-x-for-y`: Swap token X → Y
- `swap-y-for-x`: Swap token Y → X

### Liquidity Functions
Add or withdraw liquidity using a single bin in a pool

#### Public
- `add-liquidity`: Add proportional liquidity (single-sided for non-active bins)
- `withdraw-liquidity`: Withdraw proportional liquidity

### Variable Fees Functions
Manage or retrieve data about variable fees for a single bin in a pool 

#### Public
- `set-variable-fees`: Set variable fees (admin and manager-only)
- `set-variable-fees-manager`: Set variable fees manager (admin-only)
- `set-variable-fees-cooldown`: Set the cooldown period (Stacks blocks) for resetting variable fees (admin-only)
- `freeze-variable-fees-manager`: Freeze the variable fees manager address (admin-only)
- `reset-variable-fees`: Reset variable fees if the cooldown period has passed
- `set-variable-fees-multi`: Batch version of `set-variable-fees` (120 max)
- `set-variable-fees-manager-multi`: Batch version of `set-variable-fees-manager` (120 max)
- `set-variable-fees-cooldown-multi`: Batch version of `set-variable-fees-cooldown` (120 max)
- `set-freeze-variable-fees-manager-multi`: Batch version of `set-freeze-variable-fees-manager` (120 max)

## 3. dlmm-pool-trait-v-1-1 (w.i.p.)

### Traits
- `sip-010-trait-ft-standard-v-1-1` (use)
- `sip-013-trait-ft-standard-v-1-1` (use)
- `dlmm-pool-trait` (define)

### Trait Definition
- `get-name`: () (response (string-ascii 32) uint)
- `get-symbol`: () (response (string-ascii 32) uint)
- `get-decimals`: (uint) (response uint uint)
- `get-token-uri`: (uint) (response (optional (string-utf8 256)) uint)
- `get-total-supply`: (uint) (response uint uint)
- `get-overall-supply`: () (response uint uint)
- `get-balance`: (uint principal) (response uint uint)
- `get-overall-balance`: (principal) (response uint uint)
- `get-pool`: ...
- `get-active-bin-id`: () (response uint uint)
- `get-balances-at-bin`: ...
- `get-user-bins`: ...
- `set-pool-uri`: ((string-utf8 256)) (response bool uint)
- `set-pool-status`: (bool) (response bool uint)  
  _Remove if `pool-status` is managed in the core contract_
- `set-variable-fees-manager`: (principal) (response bool uint)
- `set-fee-address`: (principal) (response bool uint)  
  _Remove if `fee-address` is managed in the core contract_
- `set-x-fees`: (uint uint) (response bool uint)
- `set-y-fees`: (uint uint) (response bool uint)
- `set-variable-fees`: (uint uint) (response bool uint)
- `set-variable-fees-cooldown`: (uint) (response bool uint)
- `set-freeze-variable-fees-manager`: () (response bool uint)
- `update-bin-balances`: ...
- `update-user-balances`: ...
- `transfer`: (uint uint principal principal) (response bool uint)
- `transfer-memo`: (uint uint principal principal (buff 34)) (response bool uint)
- `transfer-many`: ((list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal})) (response bool uint)
- `transfer-many-memo`: ((list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal, memo: (buff 34)})) (response bool uint)
- `pool-transfer`: (\<sip-010-trait> uint principal) (response bool uint)
- `pool-mint`: (uint uint principal) (response bool uint)
- `pool-burn`: (uint uint principal) (response bool uint)
- `create-pool`: ...

## 4. dlmm-pool-stx-sbtc-v-1-1

### Traits
- `dlmm-pool-trait-v-1-1` (implement)
- `sip-013-trait-ft-standard-v-1-1` (implement)
- `sip-013-transfer-many-trait-v-1-1` (implement)
- `sip-013-trait-ft-standard-v-1-1` (use)

### Token Definitions
- `define-fungible-token pool-token`
- `define-non-fungible-token pool-token-id {id: uint, owner: principal}`

### Constants
- Pool and SIP-013 error codes
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
- `x-protocol-fee` (`uint`): Protocol fee charged for protocol when swapping X → Y
- `x-provider-fee` (`uint`): Provider fee charged for providers when swapping X → Y
- `x-variable-fee` (`uint`): Variable fee charged for providers when swapping X → Y
- `y-protocol-fee` (`uint`): Protocol fee charged for protocol when swapping Y → X
- `y-provider-fee` (`uint`): Protocol fee charged for providers when swapping Y → X
- `y-variable-fee` (`uint`): Variable fee charged for providers when swapping Y → X
- `variable-fees-cooldown`: Variable fees can be reset after this cooldown (Stacks blocks) is reached
- `freeze-variable-fees-manager`: If `true`, `variable-fees-manager` is permanently frozen

#### Indirectly Modified
Updated only as a side-effect of other functions
- `active-bin-id`: ID of the active bin
- `last-variable-fees-update`: Latest variable fees update (Stacks block)

### Mappings
- `balances-at-bin` (`uint { x-balance: uint, y-balance: uint, total-shares: uint }`)
- `user-balance-at-bin` (`{ id: uint, user: principal } uint`)
- `user-bins` (`principal (list 1000 uint)`)

### SIP-013 Functions
Interact or retrieve data about the `pool-token` and `pool-token-id` (SIP-013-compliant)

#### Read-only
- `get-name`: Returns `pool-name`
- `get-symbol`: Returns `pool-symbol`
- `get-decimals`: Returns `pool-token` decimals
- `get-token-uri`: Returns `pool-uri`
- `get-total-supply`: Returns total `pool-token` supply
- `get-overall-supply`: Returns overall total `pool-token` supply
- `get-balance`: Returns `pool-token` balance for a principal at a bin
- `get-overall-balance`: Returns overall `pool-token` balance for a principal

#### Public
- `transfer`: Transfer `pool-token` (single bin)
- `transfer-memo`: Transfer `pool-token` (single bin) with memo
- `transfer-many`: Transfer many `pool-token` (different bins)
- `transfer-many-memo`: Transfer many `pool-token` (different bins) with memo

#### Private
- `tag-pool-token-id`: Burn `pool-token-id` from one principal and mint to another

### Pool Management Functions
Manage or retrieve data about the pool contract

#### Read-only
- `get-pool`: Returns base pool data
- `get-active-bin-id`: Returns `active-bin-id`
- `get-balances-at-bin`: Returns data about a bin from `balances-at-bin` mapping
- `get-user-balance-at-bin`: Returns user data at a bin from `user-balance-at-bin` mapping
- `get-user-bins`: Returns list of user bins from `user-bins` mapping

#### Public (callable by core only)
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
- `update-user-balance`: Update the `user-balance-at-bin` mapping via the mint, burn, and transfer functions in pool
- `pool-transfer`: Transfer X / Y token from the pool via swap and withdraw liquidity functions in core
- `pool-mint`: Mint new `pool-token` via pool creation and add liquidity functions in core
- `pool-burn`: Burn existing `pool-token` via `withdraw-liquidity` in core
- `create-pool`: Called via `create-pool` in core

## 5. dlmm-router-v-1-1

### Constants
- Router error codes

### Traits
- `dlmm-pool-trait-v-1-1` (use)
- `sip-010-trait-ft-standard-v-1-1` (use)

### Quote Functions
Retrieve quotes using a single or multiple bins in a pool

#### Public (read-only if possible)
- `get-dy-multi`: Return token X → Y quote (100 max)
- `get-dx-multi`: Return token Y → X quote (100 max)
- `get-dlp-multi`: Return number of shares to mint for adding liquidity (100 max)

#### Private
- `fold-get-dy`: Used to batch `get-dy` calls via core
- `fold-get-dx`: Used to batch `get-dx` calls via core
- `fold-get-dlp`: Used to batch `get-dlp` calls via core

### Swap Functions
Swap using a single or multiple bins in a pool

#### Public
- `swap-x-for-y-multi`: Swap token X → Y (100 max)
- `swap-y-for-x-multi`: Swap token Y → X (100 max)

#### Private
- `fold-swap-x-for-y`: Used to batch `swap-x-for-y` calls via core
- `fold-swap-y-for-x`: Used to batch `swap-y-for-x` calls via core

### Liquidity Functions
Add or withdraw liquidity using a single or multiple bins in a pool

#### Public
- `add-liquidity-multi`: Add proportional liquidity (single-sided for non-active bins) (100 max)
- `withdraw-liquidity-multi`: Withdraw proportional liquidity (100 max)

#### Private
- `fold-add-liquidity`: Used to batch `add-liquidity` calls via core
- `fold-withdraw-liquidity`: Used to batch `withdraw-liquidity` calls via core