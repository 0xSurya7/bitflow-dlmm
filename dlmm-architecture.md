# DLMM Contract Architecture

## 1. Contracts

### Core
- `dlmm-core-v-1-1`
- `dlmm-pool-trait-v-1-1`
- `dlmm-pool-btc-usdc-v-1-1` (example pool)
- `dlmm-router-v-1-1`

### External
- `sip-010-trait-ft-standard-v-1-1`
- `sip-013-trait-sft-standard-v-1-1`
- `sip-013-transfer-many-trait-v-1-1`
- `token-stx-v-1-2`

## 2. dlmm-core-v-1-1

### Traits
- `dlmm-pool-trait-v-1-1` (use)
- `sip-010-trait-ft-standard-v-1-1` (use)

### Constants
- Core error codes
- `CONTRACT_DEPLOYER` (`tx-sender`)
- `NUM_OF_BINS` (`u1001`)
- `BPS` (`u10000`)

### Data Variables

#### Admin-Configurable
Set via public admin functions
- `admins` (`(list 5 principal)`): List of principals with admin permissions
- `bin-steps` (`(list 1000 uint)`): List of allowed bin steps (initial: 1, 5, 10, and 20)
- `minimum-total-shares` (`uint`): Minimum shares to mint when creating a pool
- `minimum-burnt-shares` (`uint`): Minimum shares to burn when creating a pool
- `public-pool-creation` (`bool`): Allow pool creation by anyone or admins only

#### Indirectly Modified
Updated as a side-effect of other functions
- `admin-helper` (`principal`): Helper variable for removing an admin
- `last-pool-id` (`uint`): ID of last created pool

### Mappings
- `pools` (`uint {id: uint, name: (string-ascii 32), symbol: (string-ascii 32), pool-contract: principal, status: bool}`)  
  _May add `fee-address` here instead of in each pool contract_

### Admin Functions
Follows the same design as XYK Core

#### Read-only
- `get-admins`: Returns `admins`
- `get-admin-helper`: Returns `admin-helper`

#### Public
- `add-admin`: Add principal to `admins` (admin-only)
  - Parameters: `(admin principal)`
- `remove-admin`: Remove principal from `admins` (admin-only)
  - Parameters: `(admin principal)`

#### Private
- `admin-not-removable`: Helper for removing a principal from `admins`
  - Parameters: `(admin principal)`

### Pool Management Functions
Manage or retrieve data about pools

#### Read-only
- `get-last-pool-id`: Returns `last-pool-id`
- `get-pool-by-id`: Returns data about a pool from `pools` mapping
  - Parameters: `(id uint)`

#### Public
- `set-pool-uri`: Set URI for a pool (admin-only)
  - Parameters: `(pool-trait <dlmm-pool-trait>) (uri (string-utf8 256))`
- `set-pool-status`: Set pool status (admin-only)
  - Parameters: `(pool-trait <dlmm-pool-trait>) (status bool)`
- `set-fee-address`: Set fee address (admin-only)
  - Parameters: `(pool-trait <dlmm-pool-trait>) (address principal)`
- `set-x-fees`: Set X protocol and provider fees (admin-only)
  - Parameters: `(pool-trait <dlmm-pool-trait>) (protocol-fee uint) (provider-fee uint)`
- `set-y-fees`: Set Y protocol and provider fees (admin-only)
  - Parameters: `(pool-trait <dlmm-pool-trait>) (protocol-fee uint) (provider-fee uint)`
- `set-pool-uri-multi`: Batch version of `set-pool-uri` (120 max)
  - Parameters: `(pool-traits (list 120 <dlmm-pool-trait>)) (uris (list 120 (string-utf8 256)))`
- `set-pool-status-multi`: Batch version of `set-pool-status` (120 max)
  - Parameters: `(pool-traits (list 120 <dlmm-pool-trait>)) (statuses (list 120 bool))`
- `set-fee-address-multi`: Batch version of `set-fee-address` (120 max)
  - Parameters: `(pool-traits (list 120 <dlmm-pool-trait>)) (addresses (list 120 principal))`
- `set-x-fees-multi`: Batch version of `set-x-fees` (120 max)
  - Parameters: `(pool-traits (list 120 <dlmm-pool-trait>)) (protocol-fees (list 120 uint)) (provider-fees (list 120 uint))`
- `set-y-fees-multi`: Batch version of `set-y-fees` (120 max)
  - Parameters: `(pool-traits (list 120 <dlmm-pool-trait>)) (protocol-fees (list 120 uint)) (provider-fees (list 120 uint))`

#### Private
- `is-valid-pool`: Check the validity of a pool
  - Parameters: `(id uint) (contract principal)`

### Core Management Functions
Manage or retrieve data about the core contract

#### Read-only
- `get-bin-steps`: Returns `bin-steps`
- `get-minimum-total-shares`: Returns `minimum-total-shares`
- `get-minimum-burnt-shares`: Returns `minimum-burnt-shares`
- `get-public-pool-creation`: Returns `public-pool-creation`

#### Public
- `add-bin-step`: Add bin step to `bin-steps` (admin-only)
  - Parameters: `(step uint)`
- `set-minimum-shares`: Set minimum total and burnt shares (admin-only)
  - Parameters: `(min-total uint) (min-burnt uint)`
- `set-public-pool-creation`: Enable or disable public pool creation (admin-only)
  - Parameters: `(status bool)`

### Pool Creation Functions
Create new pools

#### Public
- `create-pool`: Create a new pool (admin-only when `public-pool-creation` is false)
  - Parameters: `(pool-trait <dlmm-pool-trait>) (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>) (x-amount uint) (y-amount uint) (burn-amount uint) (bin-step uint) (x-protocol-fee uint) (x-provider-fee uint) (x-variable-fee uint) (y-protocol-fee uint) (y-provider-fee uint) (y-variable-fee uint) (variable-fees-cooldown uint) (freeze-variable-fees-manager bool) (fee-address principal) (uri (string-utf8 256)) (status bool)`  
  _If `public-pool-creation` is `true`, anyone can create pools. Otherwise, only admins can create pools_

#### Private
- `create-symbol`: Create pool symbol using token symbols
  - Parameters: `(x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)`

### Quote Functions
Retrieve quotes using a single bin in a pool

#### Public (read-only if possible)
- `get-dy`: Return token X → Y quote
  - Parameters: `(pool-trait  <dlmm-pool-trait>) (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>) (x-amount uint)`
- `get-dx`: Return token Y → X quote
  - Parameters: `(pool-trait  <dlmm-pool-trait>) (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>) (y-amount uint)`
- `get-dlp`: Return number of shares to mint for adding liquidity
  - Parameters: `(pool-trait  <dlmm-pool-trait>) (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>) (bin-id uint) (x-amount uint) (y-amount uint)`

### Swap Functions
Swap using a single bin in a pool

#### Public
- `swap-x-for-y`: Swap token X → Y
  - Parameters: `(pool-trait  <dlmm-pool-trait>) (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>) (x-amount uint) (min-dy uint)`
- `swap-y-for-x`: Swap token Y → X
  - Parameters: `(pool-trait  <dlmm-pool-trait>) (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>) (y-amount uint) (min-dx uint)`

### Liquidity Functions
Add or withdraw liquidity using a single bin in a pool

#### Public
- `add-liquidity`: Add proportional liquidity (single-sided for non-active bins)
  - Parameters: `(pool-trait <dlmm-pool-trait>) (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>) (bin-id uint) (x-amount uint) (y-amount uint) (min-dlp uint)`
- `withdraw-liquidity`: Withdraw proportional liquidity
  - Parameters: `(pool-trait <dlmm-pool-trait>) (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>) (bin-id uint) (dlp-amount uint) (min-x uint) (min-y uint)`

### Variable Fees Functions
Manage or retrieve data about variable fees for a single bin in a pool 

#### Public
- `set-variable-fees`: Set variable fees (admin and manager-only)
  - Parameters: `(pool-trait <dlmm-pool-trait>) (x-fee uint) (y-fee uint)`
- `set-variable-fees-manager`: Set variable fees manager (admin-only)
  - Parameters: `(pool-trait <dlmm-pool-trait>) (manager principal)`
- `set-variable-fees-cooldown`: Set the cooldown period (Stacks blocks) for resetting variable fees (admin-only)
  - Parameters: `(pool-trait <dlmm-pool-trait>) (cooldown uint)`
- `freeze-variable-fees-manager`: Freeze the variable fees manager address (admin-only)
  - Parameters: `(pool-trait <dlmm-pool-trait>)`
- `reset-variable-fees`: Reset variable fees if the cooldown period has passed
  - Parameters: `(pool-trait <dlmm-pool-trait>)`
- `set-variable-fees-multi`: Batch version of `set-variable-fees` (120 max)
  - Parameters: `(pool-traits (list 120 <dlmm-pool-trait>)) (x-fees (list 120 uint)) (y-fees (list 120 uint))`
- `set-variable-fees-manager-multi`: Batch version of `set-variable-fees-manager` (120 max)
  - Parameters: `(pool-traits (list 120 <dlmm-pool-trait>)) (managers (list 120 principal))`
- `set-variable-fees-cooldown-multi`: Batch version of `set-variable-fees-cooldown` (120 max)
  - Parameters: `(pool-traits (list 120 <dlmm-pool-trait>)) (cooldowns (list 120 uint))`
- `set-freeze-variable-fees-manager-multi`: Batch version of `set-freeze-variable-fees-manager` (120 max)
  - Parameters: `(pool-traits (list 120 <dlmm-pool-trait>))`

## 3. dlmm-pool-trait-v-1-1

### Traits
- `sip-010-trait-ft-standard-v-1-1` (use)
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
- `get-pool`: () (response {pool-id: uint, pool-name: (string-ascii 32), pool-symbol: (string-ascii 32), pool-uri: (string-utf8 256), pool-created: bool, creation-height: uint, core-address: principal, variable-fees-manager: principal, fee-address: principal, x-token: principal, y-token: principal, pool-token: principal, x-balance: uint, y-balance: uint, bin-step: uint, active-bin-id: uint, x-protocol-fee: uint, x-provider-fee: uint, x-variable-fee: uint, y-protocol-fee: uint, y-provider-fee: uint, y-variable-fee: uint, last-variable-fees-update: uint, variable-fees-cooldown: uint, freeze-variable-fees-manager: bool} uint)
- `get-active-bin-id`: () (response uint uint)
- `get-balances-at-bin`: (uint) (response uint uint)
- `get-user-bins`: () (response (list 1001 uint) uint)
- `set-pool-uri`: ((string-utf8 256)) (response bool uint)
- `set-variable-fees-manager`: (principal) (response bool uint)
- `set-fee-address`: (principal) (response bool uint)  
  _Remove if `fee-address` is managed in the core contract_
- `set-x-fees`: (uint uint) (response bool uint)
- `set-y-fees`: (uint uint) (response bool uint)
- `set-variable-fees`: (uint uint) (response bool uint)
- `set-variable-fees-cooldown`: (uint) (response bool uint)
- `set-freeze-variable-fees-manager`: () (response bool uint)
- `update-bin-balances`: (uint uint uint uint) (response bool uint)
- `update-user-balance`: (uint principal uint) (response bool uint)
- `transfer`: (uint uint principal principal) (response bool uint)
- `transfer-memo`: (uint uint principal principal (buff 34)) (response bool uint)
- `transfer-many`: ((list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal})) (response bool uint)
- `transfer-many-memo`: ((list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal, memo: (buff 34)})) (response bool uint)
- `pool-transfer`: (\<sip-010-trait> uint principal) (response bool uint)
- `pool-mint`: (uint uint principal) (response bool uint)
- `pool-burn`: (uint uint principal) (response bool uint)
- `create-pool`: (principal principal principal uint principal principal uint (string-ascii 32) (string-ascii 32) (string-utf8 256)) (response bool uint)

## 4. dlmm-pool-btc-usdc-v-1-1

### Traits
- `dlmm-pool-trait-v-1-1` (implement)
- `sip-013-trait-sft-standard-v-1-1` (implement)
- `sip-013-transfer-many-trait-v-1-1` (implement)
- `sip-010-trait-ft-standard-v-1-1` (use)

### Token Definitions
- `define-fungible-token pool-token`
- `define-non-fungible-token pool-token-id {token-id: uint, owner: principal}`

### Constants
- Pool and SIP 013 error codes
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
Updated as a side-effect of other functions
- `x-balance` (`uint`): Overall X balance in the pool
- `y-balance` (`uint`): Overall Y balance in the pool
- `active-bin-id` (`uint`): ID of the active bin
- `last-variable-fees-update` (`uint`): Latest variable fees update (Stacks block)

### Mappings
- `balances-at-bin` (`uint {x-balance: uint, y-balance: uint, total-shares: uint}`)
- `user-balance-at-bin` (`{id: uint, user: principal} uint`)
- `user-bins` (`principal (list 1001 uint)`)

### SIP 013 Functions
Interact or retrieve data about the `pool-token` and `pool-token-id` (SIP 013-compliant)

#### Read-only
- `get-name`: Returns `pool-name`
- `get-symbol`: Returns `pool-symbol`
- `get-decimals`: Returns `pool-token` decimals
  - Parameters: `(token-id uint)`
- `get-token-uri`: Returns `pool-uri`
  - Parameters: `(token-id uint)`
- `get-total-supply`: Returns total `pool-token` supply
  - Parameters: `(token-id uint)`
- `get-overall-supply`: Returns overall total `pool-token` supply
- `get-balance`: Returns `pool-token` balance for a principal at a bin
  - Parameters: `(token-id uint) (user principal)`
- `get-overall-balance`: Returns overall `pool-token` balance for a principal
  - Parameters: `(user principal)`

#### Public
- `transfer`: Transfer `pool-token` (single bin)
  - Parameters: `(token-id uint) (amount uint) (sender principal) (recipient principal)`
- `transfer-memo`: Transfer `pool-token` (single bin) with memo
  - Parameters: `(token-id uint) (amount uint) (sender principal) (recipient principal) (memo (buff 34))`
- `transfer-many`: Transfer many `pool-token` (different bins)
  - Parameters: `(transfers (list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal}))`
- `transfer-many-memo`: Transfer many `pool-token` (different bins) with memo
  - Parameters: `(transfers (list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal, memo: (buff 34)}))`

#### Private
- `tag-pool-token-id`: Burn `pool-token-id` from one principal and mint to another
  - Parameters: `(id {token-id: uint, owner: principal})`

### Pool Management Functions
Manage or retrieve data about the pool contract

#### Read-only
- `get-pool`: Returns base pool data
- `get-active-bin-id`: Returns `active-bin-id`
- `get-balances-at-bin`: Returns data about a bin from `balances-at-bin` mapping
  - Parameters: `(id uint)`
- `get-user-balance-at-bin`: Returns user data at a bin from `user-balance-at-bin` mapping
  - Parameters: `(id uint) (user principal)`
- `get-user-bins`: Returns list of user bins from `user-bins` mapping
  - Parameters: `(user principal)`

#### Public (callable by core only)
- `set-pool-uri`: Called via `set-pool-uri` in core
  - Parameters: `(uri (string-utf8 256))`
- `set-fee-address`: Called via `set-fee-address` in core
  - Parameters: `(address principal)`  
  _Remove if `fee-address` is managed in the core contract_
- `set-x-fees`: Called via `set-x-fees` in core
  - Parameters: `(protocol-fee uint) (provider-fee uint)`
- `set-y-fees`: Called via `set-y-fees` in core
  - Parameters: `(protocol-fee uint) (provider-fee uint)`
- `set-variable-fees`: Called via `set-variable-fees` in core
  - Parameters: `(x-fee uint) (y-fee uint)`
- `set-variable-fees-cooldown`: Called via `set-variable-fees-cooldown` in core
  - Parameters: `(cooldown uint)`
- `set-freeze-variable-fees-manager`: Called via `set-freeze-variable-fees-manager` in core
- `set-active-bin`: Set current active bin via pool creation, swap, and liquidity functions in core
  - Parameters: `(id uint)`
- `update-bin-balances`: Update the `balances-at-bin` mapping via pool creation, swap, and liquidity functions in core
  - Parameters: `(id uint) (x-balance uint) (y-balance uint) (total-shares uint)`
- `update-user-balance`: Update the `user-balance-at-bin` mapping via the mint, burn, and transfer functions in pool
  - Parameters: `(id uint) (user principal) (balance uint)`
- `pool-transfer`: Transfer X / Y token from the pool via swap and withdraw liquidity functions in core
  - Parameters: `(token-trait <sip-010-trait>) (amount uint) (recipient principal)`
- `pool-mint`: Mint new `pool-token` via pool creation and add liquidity functions in core
  - Parameters: `(id uint) (amount uint) (user principal)`
- `pool-burn`: Burn existing `pool-token` via `withdraw-liquidity` in core
  - Parameters: `(id uint) (amount uint) (user principal)`
- `create-pool`: Called via `create-pool` in core
  - Parameters: `(x-token-contract principal) (y-token-contract principal) (variable-fees-mgr principal) (step uint) (fee-addr principal) (core-caller principal) (id uint) (name (string-ascii 32)) (symbol (string-ascii 32)) (uri (string-utf8 256))`
 
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
  - Parameters: ...
- `get-dx-multi`: Return token Y → X quote (100 max)
  - Parameters: ...
- `get-dlp-multi`: Return number of shares to mint for adding liquidity (100 max)
  - Parameters: ...

#### Private
- `fold-get-dy`: Used to batch `get-dy` calls via core
  - Parameters: ...
- `fold-get-dx`: Used to batch `get-dx` calls via core
  - Parameters: ...
- `fold-get-dlp`: Used to batch `get-dlp` calls via core
  - Parameters: ...

### Swap Functions
Swap using a single or multiple bins in a pool

#### Public
- `swap-x-for-y-multi`: Swap token X → Y (100 max)
  - Parameters: ...
- `swap-y-for-x-multi`: Swap token Y → X (100 max)
  - Parameters: ...

#### Private
- `fold-swap-x-for-y`: Used to batch `swap-x-for-y` calls via core
  - Parameters: ...
- `fold-swap-y-for-x`: Used to batch `swap-y-for-x` calls via core
  - Parameters: ...

### Liquidity Functions
Add or withdraw liquidity using a single or multiple bins in a pool

#### Public
- `add-liquidity-multi`: Add proportional liquidity (single-sided for non-active bins) (100 max)
  - Parameters: ...
- `withdraw-liquidity-multi`: Withdraw proportional liquidity (100 max)
  - Parameters: ...

#### Private
- `fold-add-liquidity`: Used to batch `add-liquidity` calls via core
  - Parameters: ...
- `fold-withdraw-liquidity`: Used to batch `withdraw-liquidity` calls via core
  - Parameters: ...