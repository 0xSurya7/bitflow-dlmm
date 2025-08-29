
# dlmm-core-v-1-1

[`dlmm-core-v-1-1.clar`](..\contracts\dlmm-core-v-1-1.clar)

dlmm-core-v-1-1

**Public functions:**

- [`add-bin-step`](#add-bin-step)
- [`set-minimum-shares`](#set-minimum-shares)
- [`set-public-pool-creation`](#set-public-pool-creation)
- [`add-verified-pool-code-hash`](#add-verified-pool-code-hash)
- [`claim-protocol-fees`](#claim-protocol-fees)
- [`set-pool-uri`](#set-pool-uri)
- [`set-pool-status`](#set-pool-status)
- [`set-variable-fees-manager`](#set-variable-fees-manager)
- [`set-fee-address`](#set-fee-address)
- [`set-variable-fees`](#set-variable-fees)
- [`set-x-fees`](#set-x-fees)
- [`set-y-fees`](#set-y-fees)
- [`set-variable-fees-cooldown`](#set-variable-fees-cooldown)
- [`set-freeze-variable-fees-manager`](#set-freeze-variable-fees-manager)
- [`set-dynamic-config`](#set-dynamic-config)
- [`reset-variable-fees`](#reset-variable-fees)
- [`create-pool`](#create-pool)
- [`swap-x-for-y`](#swap-x-for-y)
- [`swap-y-for-x`](#swap-y-for-x)
- [`add-liquidity`](#add-liquidity)
- [`withdraw-liquidity`](#withdraw-liquidity)
- [`add-admin`](#add-admin)
- [`remove-admin`](#remove-admin)
- [`claim-protocol-fees-multi`](#claim-protocol-fees-multi)
- [`set-pool-uri-multi`](#set-pool-uri-multi)
- [`set-pool-status-multi`](#set-pool-status-multi)
- [`set-variable-fees-manager-multi`](#set-variable-fees-manager-multi)
- [`set-fee-address-multi`](#set-fee-address-multi)
- [`set-variable-fees-multi`](#set-variable-fees-multi)
- [`set-x-fees-multi`](#set-x-fees-multi)
- [`set-y-fees-multi`](#set-y-fees-multi)
- [`set-variable-fees-cooldown-multi`](#set-variable-fees-cooldown-multi)
- [`set-freeze-variable-fees-manager-multi`](#set-freeze-variable-fees-manager-multi)
- [`reset-variable-fees-multi`](#reset-variable-fees-multi)
- [`set-dynamic-config-multi`](#set-dynamic-config-multi)

**Read-only functions:**

- [`get-admins`](#get-admins)
- [`get-admin-helper`](#get-admin-helper)
- [`get-last-pool-id`](#get-last-pool-id)
- [`get-pool-by-id`](#get-pool-by-id)
- [`get-allowed-token-direction`](#get-allowed-token-direction)
- [`get-unclaimed-protocol-fees-by-id`](#get-unclaimed-protocol-fees-by-id)
- [`get-bin-steps`](#get-bin-steps)
- [`get-bin-factors-by-step`](#get-bin-factors-by-step)
- [`get-minimum-bin-shares`](#get-minimum-bin-shares)
- [`get-minimum-burnt-shares`](#get-minimum-burnt-shares)
- [`get-public-pool-creation`](#get-public-pool-creation)
- [`get-verified-pool-code-hashes`](#get-verified-pool-code-hashes)
- [`get-unsigned-bin-id`](#get-unsigned-bin-id)
- [`get-signed-bin-id`](#get-signed-bin-id)
- [`get-bin-price`](#get-bin-price)
- [`get-liquidity-value`](#get-liquidity-value)

**Private functions:**

- [`admin-not-removable`](#admin-not-removable)
- [`create-symbol`](#create-symbol)
- [`is-valid-pool`](#is-valid-pool)
- [`is-enabled-pool`](#is-enabled-pool)

**Maps**

- [`bin-factors`](#bin-factors)
- [`pools`](#pools)
- [`allowed-token-direction`](#allowed-token-direction)
- [`unclaimed-protocol-fees`](#unclaimed-protocol-fees)

**Variables**

- [`admins`](#admins)
- [`admin-helper`](#admin-helper)
- [`last-pool-id`](#last-pool-id)
- [`bin-steps`](#bin-steps)
- [`minimum-bin-shares`](#minimum-bin-shares)
- [`minimum-burnt-shares`](#minimum-burnt-shares)
- [`public-pool-creation`](#public-pool-creation)
- [`verified-pool-code-hashes`](#verified-pool-code-hashes)

**Constants**

- [`ERR_NOT_AUTHORIZED`](#err_not_authorized)
- [`ERR_INVALID_AMOUNT`](#err_invalid_amount)
- [`ERR_INVALID_PRINCIPAL`](#err_invalid_principal)
- [`ERR_ALREADY_ADMIN`](#err_already_admin)
- [`ERR_ADMIN_LIMIT_REACHED`](#err_admin_limit_reached)
- [`ERR_ADMIN_NOT_IN_LIST`](#err_admin_not_in_list)
- [`ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER`](#err_cannot_remove_contract_deployer)
- [`ERR_NO_POOL_DATA`](#err_no_pool_data)
- [`ERR_POOL_NOT_CREATED`](#err_pool_not_created)
- [`ERR_POOL_DISABLED`](#err_pool_disabled)
- [`ERR_POOL_ALREADY_CREATED`](#err_pool_already_created)
- [`ERR_INVALID_POOL`](#err_invalid_pool)
- [`ERR_INVALID_POOL_URI`](#err_invalid_pool_uri)
- [`ERR_INVALID_POOL_SYMBOL`](#err_invalid_pool_symbol)
- [`ERR_INVALID_POOL_NAME`](#err_invalid_pool_name)
- [`ERR_INVALID_TOKEN_DIRECTION`](#err_invalid_token_direction)
- [`ERR_MATCHING_TOKEN_CONTRACTS`](#err_matching_token_contracts)
- [`ERR_INVALID_X_TOKEN`](#err_invalid_x_token)
- [`ERR_INVALID_Y_TOKEN`](#err_invalid_y_token)
- [`ERR_MINIMUM_X_AMOUNT`](#err_minimum_x_amount)
- [`ERR_MINIMUM_Y_AMOUNT`](#err_minimum_y_amount)
- [`ERR_MINIMUM_LP_AMOUNT`](#err_minimum_lp_amount)
- [`ERR_MAXIMUM_X_AMOUNT`](#err_maximum_x_amount)
- [`ERR_MAXIMUM_Y_AMOUNT`](#err_maximum_y_amount)
- [`ERR_INVALID_LIQUIDITY_VALUE`](#err_invalid_liquidity_value)
- [`ERR_INVALID_FEE`](#err_invalid_fee)
- [`ERR_MINIMUM_BURN_AMOUNT`](#err_minimum_burn_amount)
- [`ERR_INVALID_MIN_BURNT_SHARES`](#err_invalid_min_burnt_shares)
- [`ERR_INVALID_BIN_STEP`](#err_invalid_bin_step)
- [`ERR_ALREADY_BIN_STEP`](#err_already_bin_step)
- [`ERR_BIN_STEP_LIMIT_REACHED`](#err_bin_step_limit_reached)
- [`ERR_NO_BIN_FACTORS`](#err_no_bin_factors)
- [`ERR_INVALID_BIN_FACTOR`](#err_invalid_bin_factor)
- [`ERR_INVALID_BIN_FACTORS_LENGTH`](#err_invalid_bin_factors_length)
- [`ERR_INVALID_INITIAL_PRICE`](#err_invalid_initial_price)
- [`ERR_INVALID_BIN_PRICE`](#err_invalid_bin_price)
- [`ERR_NOT_ACTIVE_BIN`](#err_not_active_bin)
- [`ERR_VARIABLE_FEES_COOLDOWN`](#err_variable_fees_cooldown)
- [`ERR_VARIABLE_FEES_MANAGER_FROZEN`](#err_variable_fees_manager_frozen)
- [`ERR_INVALID_DYNAMIC_CONFIG`](#err_invalid_dynamic_config)
- [`ERR_INVALID_VERIFIED_POOL_CODE_HASH`](#err_invalid_verified_pool_code_hash)
- [`ERR_ALREADY_VERIFIED_POOL_CODE_HASH`](#err_already_verified_pool_code_hash)
- [`ERR_VERIFIED_POOL_CODE_HASH_LIMIT_REACHED`](#err_verified_pool_code_hash_limit_reached)
- [`ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA`](#err_no_unclaimed_protocol_fees_data)
- [`ERR_INVALID_X_AMOUNT`](#err_invalid_x_amount)
- [`ERR_INVALID_Y_AMOUNT`](#err_invalid_y_amount)
- [`ERR_INVALID_MIN_DLP_AMOUNT`](#err_invalid_min_dlp_amount)
- [`ERR_NO_BIN_SHARES`](#err_no_bin_shares)
- [`CONTRACT_DEPLOYER`](#contract_deployer)
- [`NUM_OF_BINS`](#num_of_bins)
- [`CENTER_BIN_ID`](#center_bin_id)
- [`MIN_BIN_ID`](#min_bin_id)
- [`MAX_BIN_ID`](#max_bin_id)
- [`FEE_SCALE_BPS`](#fee_scale_bps)
- [`PRICE_SCALE_BPS`](#price_scale_bps)


## Functions

### get-admins

[View in file](..\contracts\dlmm-core-v-1-1.clar#L112)

`(define-read-only (get-admins () (response (list 5 principal) none))`

Get admins list

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-admins)
  (ok (var-get admins))
)
```
</details>




### get-admin-helper

[View in file](..\contracts\dlmm-core-v-1-1.clar#L117)

`(define-read-only (get-admin-helper () (response principal none))`

Get admin helper var

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-admin-helper)
  (ok (var-get admin-helper))
)
```
</details>




### get-last-pool-id

[View in file](..\contracts\dlmm-core-v-1-1.clar#L122)

`(define-read-only (get-last-pool-id () (response uint none))`

Get ID of last created pool

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-last-pool-id)
  (ok (var-get last-pool-id))
)
```
</details>




### get-pool-by-id

[View in file](..\contracts\dlmm-core-v-1-1.clar#L127)

`(define-read-only (get-pool-by-id ((id uint)) (response (optional (tuple (id uint) (name (string-ascii 32)) (pool-contract principal) (status bool) (symbol (string-ascii 32)) (verified bool))) none))`

Get a pool by pool ID

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-pool-by-id (id uint))
  (ok (map-get? pools id))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | uint |

### get-allowed-token-direction

[View in file](..\contracts\dlmm-core-v-1-1.clar#L132)

`(define-read-only (get-allowed-token-direction ((x-token principal) (y-token principal)) (response (optional bool) none))`

Get allowed-token-direction for pool creation

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-allowed-token-direction (x-token principal) (y-token principal))
  (ok (map-get? allowed-token-direction {x-token: x-token, y-token: y-token}))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| x-token | principal |
| y-token | principal |

### get-unclaimed-protocol-fees-by-id

[View in file](..\contracts\dlmm-core-v-1-1.clar#L137)

`(define-read-only (get-unclaimed-protocol-fees-by-id ((id uint)) (response (optional (tuple (x-fee uint) (y-fee uint))) none))`

Get allowed-token-direction for pool creation

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-unclaimed-protocol-fees-by-id (id uint))
  (ok (map-get? unclaimed-protocol-fees id))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | uint |

### get-bin-steps

[View in file](..\contracts\dlmm-core-v-1-1.clar#L142)

`(define-read-only (get-bin-steps () (response (list 1000 uint) none))`

Get allowed bin steps

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-bin-steps)
  (ok (var-get bin-steps))
)
```
</details>




### get-bin-factors-by-step

[View in file](..\contracts\dlmm-core-v-1-1.clar#L147)

`(define-read-only (get-bin-factors-by-step ((step uint)) (response (optional (list 1001 uint)) none))`

Get bin factors by bin step

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-bin-factors-by-step (step uint))
  (ok (map-get? bin-factors step))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| step | uint |

### get-minimum-bin-shares

[View in file](..\contracts\dlmm-core-v-1-1.clar#L152)

`(define-read-only (get-minimum-bin-shares () (response uint none))`

Get minimum shares required to mint for the active bin when creating a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-minimum-bin-shares)
  (ok (var-get minimum-bin-shares))
)
```
</details>




### get-minimum-burnt-shares

[View in file](..\contracts\dlmm-core-v-1-1.clar#L157)

`(define-read-only (get-minimum-burnt-shares () (response uint none))`

Get minimum shares required to burn for the active bin when creating a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-minimum-burnt-shares)
  (ok (var-get minimum-burnt-shares))
)
```
</details>




### get-public-pool-creation

[View in file](..\contracts\dlmm-core-v-1-1.clar#L162)

`(define-read-only (get-public-pool-creation () (response bool none))`

Get public pool creation status

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-public-pool-creation)
  (ok (var-get public-pool-creation))
)
```
</details>




### get-verified-pool-code-hashes

[View in file](..\contracts\dlmm-core-v-1-1.clar#L167)

`(define-read-only (get-verified-pool-code-hashes () (response (list 10000 (buff 32)) none))`

Get verified pool code hashes list

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-verified-pool-code-hashes)
  (ok (var-get verified-pool-code-hashes))
)
```
</details>




### get-unsigned-bin-id

[View in file](..\contracts\dlmm-core-v-1-1.clar#L172)

`(define-read-only (get-unsigned-bin-id ((bin-id int)) (response uint none))`

Get bin ID as unsigned int

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-unsigned-bin-id (bin-id int))
  (ok (to-uint (+ bin-id (to-int CENTER_BIN_ID))))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| bin-id | int |

### get-signed-bin-id

[View in file](..\contracts\dlmm-core-v-1-1.clar#L177)

`(define-read-only (get-signed-bin-id ((bin-id uint)) (response int none))`

Get bin ID as signed int

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-signed-bin-id (bin-id uint))
  (ok (- (to-int bin-id) (to-int CENTER_BIN_ID)))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| bin-id | uint |

### get-bin-price

[View in file](..\contracts\dlmm-core-v-1-1.clar#L182)

`(define-read-only (get-bin-price ((initial-price uint) (bin-step uint) (bin-id int)) (response uint uint))`

Get price for a specific bin

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-bin-price (initial-price uint) (bin-step uint) (bin-id int))
  (let (
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))
    (bin-factors-list (unwrap! (map-get? bin-factors bin-step) ERR_NO_BIN_FACTORS))
    (bin-factor (unwrap! (element-at? bin-factors-list unsigned-bin-id) ERR_INVALID_BIN_FACTOR))
  )
    (ok (/ (* initial-price bin-factor) PRICE_SCALE_BPS))
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| initial-price | uint |
| bin-step | uint |
| bin-id | int |

### get-liquidity-value

[View in file](..\contracts\dlmm-core-v-1-1.clar#L193)

`(define-read-only (get-liquidity-value ((x-amount uint) (y-amount uint) (bin-price uint)) (response uint none))`

Get liquidity value when adding liquidity to a bin by rebasing x-amount to y-units

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-liquidity-value (x-amount uint) (y-amount uint) (bin-price uint))
  (ok (+ (* bin-price x-amount) y-amount))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| x-amount | uint |
| y-amount | uint |
| bin-price | uint |

### add-bin-step

[View in file](..\contracts\dlmm-core-v-1-1.clar#L198)

`(define-public (add-bin-step ((step uint) (factors (list 1001 uint))) (response bool uint))`

Add a new bin step and its factors

<details>
  <summary>Source code:</summary>

```clarity
(define-public (add-bin-step (step uint) (factors (list 1001 uint)))
  (let (
    (bin-steps-list (var-get bin-steps))
    (caller tx-sender)
  )
    ;; Assert caller is an admin and step is greater than 0
    (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
    (asserts! (> step u0) ERR_INVALID_AMOUNT)

    ;; Assert step is not in bin-steps-list
    (asserts! (is-none (index-of bin-steps-list step)) ERR_ALREADY_BIN_STEP)

    ;; Assert factors list length is 1001
    (asserts! (is-eq (len factors) u1001) ERR_INVALID_BIN_FACTORS_LENGTH)

    ;; Add bin step to list with max length of 1000
    (var-set bin-steps (unwrap! (as-max-len? (append bin-steps-list step) u1000) ERR_BIN_STEP_LIMIT_REACHED))

    ;; Add bin factors to bin-factors mapping
    (map-set bin-factors step factors)

    ;; Print function data and return true
    (print {action: "add-bin-step", caller: caller, data: {step: step, factors: factors}})
    (ok true)
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| step | uint |
| factors | (list 1001 uint) |

### set-minimum-shares

[View in file](..\contracts\dlmm-core-v-1-1.clar#L226)

`(define-public (set-minimum-shares ((min-bin uint) (min-burnt uint)) (response bool uint))`

Set minimum shares required to mint and burn for the active bin when creating a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-minimum-shares (min-bin uint) (min-burnt uint))
  (let (
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and amounts are greater than 0
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (and (> min-bin u0) (> min-burnt u0)) ERR_INVALID_AMOUNT)

      ;; Assert that min-bin is greater than min-burnt
      (asserts! (> min-bin min-burnt) ERR_INVALID_MIN_BURNT_SHARES)

      ;; Update minimum-bin-shares and minimum-burnt-shares
      (var-set minimum-bin-shares min-bin)
      (var-set minimum-burnt-shares min-burnt)

      ;; Print function data and return true
      (print {
        action: "set-minimum-shares",
        caller: caller,
        data: {
          min-bin: min-bin,
          min-burnt: min-burnt
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| min-bin | uint |
| min-burnt | uint |

### set-public-pool-creation

[View in file](..\contracts\dlmm-core-v-1-1.clar#L257)

`(define-public (set-public-pool-creation ((status bool)) (response bool uint))`

Enable or disable public pool creation

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-public-pool-creation (status bool))
  (let (
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)

      ;; Set public-pool-creation to status
      (var-set public-pool-creation status)

      ;; Print function data and return true
      (print {action: "set-public-pool-creation", caller: caller, data: {status: status}})
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| status | bool |

### add-verified-pool-code-hash

[View in file](..\contracts\dlmm-core-v-1-1.clar#L276)

`(define-public (add-verified-pool-code-hash ((hash (buff 32))) (response bool uint))`

Add a new verified pool code hash

<details>
  <summary>Source code:</summary>

```clarity
(define-public (add-verified-pool-code-hash (hash (buff 32)))
  (let (
    (verified-pool-code-hashes-list (var-get verified-pool-code-hashes))
    (caller tx-sender)
  )
    ;; Assert caller is an admin and new code hash is not already in list
    (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
    (asserts! (is-none (index-of verified-pool-code-hashes-list hash)) ERR_ALREADY_VERIFIED_POOL_CODE_HASH)

    ;; Assert that hash is greater than zero
    (asserts! (> (len hash) u0) ERR_INVALID_VERIFIED_POOL_CODE_HASH)

    ;; Add code hash to verified pool code hashes list with max length of 10000
    (var-set verified-pool-code-hashes (unwrap! (as-max-len? (append verified-pool-code-hashes-list hash) u10000) ERR_VERIFIED_POOL_CODE_HASH_LIMIT_REACHED))

    ;; Print function data and return true
    (print {action: "add-verified-pool-code-hash", caller: caller, data: {hash: hash}})
    (ok true)
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| hash | (buff 32) |

### claim-protocol-fees

[View in file](..\contracts\dlmm-core-v-1-1.clar#L298)

`(define-public (claim-protocol-fees ((pool-trait trait_reference) (x-token-trait trait_reference) (y-token-trait trait_reference)) (response bool uint))`

Claim protocol fees for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (claim-protocol-fees
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
  )
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool-for-swap true) ERR_NO_POOL_DATA))
    (pool-id (get pool-id pool-data))
    (pool-contract (contract-of pool-trait))
    (pool-validity-check (asserts! (is-valid-pool pool-id pool-contract) ERR_INVALID_POOL))
    (fee-address (get fee-address pool-data))
    (x-token (get x-token pool-data))
    (y-token (get y-token pool-data))
    
    ;; Get current unclaimed protocol fees for pool
    (current-unclaimed-protocol-fees (unwrap! (map-get? unclaimed-protocol-fees pool-id) ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA))
    (unclaimed-x-fees (get x-fee current-unclaimed-protocol-fees))
    (unclaimed-y-fees (get y-fee current-unclaimed-protocol-fees))
    (caller tx-sender)
  )
    (begin
      ;; Assert that correct token traits are used
      (asserts! (is-eq (contract-of x-token-trait) x-token) ERR_INVALID_X_TOKEN)
      (asserts! (is-eq (contract-of y-token-trait) y-token) ERR_INVALID_Y_TOKEN)

      ;; Transfer unclaimed-x-fees x tokens from pool-contract to fee-address
      (if (> unclaimed-x-fees u0)
        (try! (contract-call? pool-trait pool-transfer x-token-trait unclaimed-x-fees fee-address))
        false)

      ;; Transfer unclaimed-y-fees y tokens from pool-contract to fee-address
      (if (> unclaimed-y-fees u0)
        (try! (contract-call? pool-trait pool-transfer y-token-trait unclaimed-y-fees fee-address))
        false)

      ;; Print function data and return true
      (print {
        action: "claim-protocol-fees",
        caller: caller,
        data: {
          pool-id: pool-id,
          pool-name: (get pool-name pool-data),
          pool-contract: pool-contract,
          x-token: x-token,
          y-token: y-token,
          unclaimed-x-fees: unclaimed-x-fees,
          unclaimed-y-fees: unclaimed-y-fees
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| x-token-trait | trait_reference |
| y-token-trait | trait_reference |

### set-pool-uri

[View in file](..\contracts\dlmm-core-v-1-1.clar#L353)

`(define-public (set-pool-uri ((pool-trait trait_reference) (uri (string-ascii 256))) (response bool uint))`

Set pool uri for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-pool-uri (pool-trait <dlmm-pool-trait>) (uri (string-ascii 256)))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and pool is created and valid
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-valid-pool (get pool-id pool-data) (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Assert that uri length is greater than 0
      (asserts! (> (len uri) u0) ERR_INVALID_POOL_URI)

      ;; Set pool uri for pool
      (try! (contract-call? pool-trait set-pool-uri uri))

      ;; Print function data and return true
      (print {
        action: "set-pool-uri",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait),
          uri: uri
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| uri | (string-ascii 256) |

### set-pool-status

[View in file](..\contracts\dlmm-core-v-1-1.clar#L388)

`(define-public (set-pool-status ((pool-trait trait_reference) (status bool)) (response bool uint))`

Set pool status for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-pool-status (pool-trait <dlmm-pool-trait>) (status bool))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (pool-map-data (unwrap! (map-get? pools (get pool-id pool-data)) ERR_NO_POOL_DATA))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and pool is created and valid
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-valid-pool (get pool-id pool-data) (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Set pool status for pool
      (map-set pools (get pool-id pool-data) (merge pool-map-data {status: status}))

      ;; Print function data and return true
      (print {
        action: "set-pool-status",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait),
          status: status
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| status | bool |

### set-variable-fees-manager

[View in file](..\contracts\dlmm-core-v-1-1.clar#L421)

`(define-public (set-variable-fees-manager ((pool-trait trait_reference) (manager principal)) (response bool uint))`

Set variable fees manager for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees-manager (pool-trait <dlmm-pool-trait>) (manager principal))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (freeze-variable-fees-manager (get freeze-variable-fees-manager pool-data))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and pool is created and valid
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-valid-pool (get pool-id pool-data) (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Assert that variable fees manager is not frozen
      (asserts! (not freeze-variable-fees-manager) ERR_VARIABLE_FEES_MANAGER_FROZEN)

      ;; Assert that address is standard principal
      (asserts! (is-standard manager) ERR_INVALID_PRINCIPAL) 

      ;; Set variable fees manager for pool
      (try! (contract-call? pool-trait set-variable-fees-manager manager))

      ;; Print function data and return true
      (print {
        action: "set-variable-fees-manager",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait),
          manager: manager
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| manager | principal |

### set-fee-address

[View in file](..\contracts\dlmm-core-v-1-1.clar#L460)

`(define-public (set-fee-address ((pool-trait trait_reference) (address principal)) (response bool uint))`

Set fee address for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-fee-address (pool-trait <dlmm-pool-trait>) (address principal))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and pool is created and valid
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-valid-pool (get pool-id pool-data) (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Assert that address is standard principal
      (asserts! (is-standard address) ERR_INVALID_PRINCIPAL)

      ;; Set fee address for pool
      (try! (contract-call? pool-trait set-fee-address address))

      ;; Print function data and return true
      (print {
        action: "set-fee-address",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait),
          address: address
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| address | principal |

### set-variable-fees

[View in file](..\contracts\dlmm-core-v-1-1.clar#L495)

`(define-public (set-variable-fees ((pool-trait trait_reference) (x-fee uint) (y-fee uint)) (response bool uint))`

Set variable fees for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees (pool-trait <dlmm-pool-trait>) (x-fee uint) (y-fee uint))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (variable-fees-manager (get variable-fees-manager pool-data))
    (freeze-variable-fees-manager (get freeze-variable-fees-manager pool-data))
    (x-protocol-fee (get x-protocol-fee pool-data))
    (x-provider-fee (get x-provider-fee pool-data))
    (y-protocol-fee (get y-protocol-fee pool-data))
    (y-provider-fee (get y-provider-fee pool-data))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin or variable fees manager and pool is created and valid
      (asserts! (or (is-some (index-of (var-get admins) caller)) (is-eq variable-fees-manager caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-valid-pool (get pool-id pool-data) (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Assert that caller is variable fees manager if variable fees manager is frozen
      (asserts! (or (is-eq variable-fees-manager caller) (not freeze-variable-fees-manager)) ERR_NOT_AUTHORIZED)

      ;; Assert x-fee + x-protocol-fee + x-provider-fee is less than maximum FEE_SCALE_BPS
      (asserts! (< (+ x-fee x-protocol-fee x-provider-fee) FEE_SCALE_BPS) ERR_INVALID_FEE)

      ;; Assert y-fee + y-protocol-fee + y-provider-fee is less than maximum FEE_SCALE_BPS
      (asserts! (< (+ y-fee y-protocol-fee y-provider-fee) FEE_SCALE_BPS) ERR_INVALID_FEE)

      ;; Set variable fees for pool
      (try! (contract-call? pool-trait set-variable-fees x-fee y-fee))

      ;; Print function data and return true
      (print {
        action: "set-variable-fees",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait),
          x-protocol-fee: x-protocol-fee,
          x-provider-fee: x-provider-fee,
          x-variable-fee: x-fee,
          y-protocol-fee: y-protocol-fee,
          y-provider-fee: y-provider-fee,
          y-variable-fee: y-fee
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| x-fee | uint |
| y-fee | uint |

### set-x-fees

[View in file](..\contracts\dlmm-core-v-1-1.clar#L547)

`(define-public (set-x-fees ((pool-trait trait_reference) (protocol-fee uint) (provider-fee uint)) (response bool uint))`

Set x fees for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-x-fees (pool-trait <dlmm-pool-trait>) (protocol-fee uint) (provider-fee uint))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (x-variable-fee (get x-variable-fee pool-data))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and pool is created and valid
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-valid-pool (get pool-id pool-data) (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Assert protocol-fee + provider-fee + x-variable-fee is less than maximum FEE_SCALE_BPS
      (asserts! (< (+ protocol-fee provider-fee x-variable-fee) FEE_SCALE_BPS) ERR_INVALID_FEE)

      ;; Set x fees for pool
      (try! (contract-call? pool-trait set-x-fees protocol-fee provider-fee))

      ;; Print function data and return true
      (print {
        action: "set-x-fees",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait),
          x-protocol-fee: protocol-fee,
          x-provider-fee: provider-fee,
          x-variable-fee: x-variable-fee
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| protocol-fee | uint |
| provider-fee | uint |

### set-y-fees

[View in file](..\contracts\dlmm-core-v-1-1.clar#L585)

`(define-public (set-y-fees ((pool-trait trait_reference) (protocol-fee uint) (provider-fee uint)) (response bool uint))`

Set y fees for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-y-fees (pool-trait <dlmm-pool-trait>) (protocol-fee uint) (provider-fee uint))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (y-variable-fee (get y-variable-fee pool-data))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and pool is created and valid
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-valid-pool (get pool-id pool-data) (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Assert protocol-fee + provider-fee + y-variable-fee is less than maximum FEE_SCALE_BPS
      (asserts! (< (+ protocol-fee provider-fee y-variable-fee) FEE_SCALE_BPS) ERR_INVALID_FEE)

      ;; Set y fees for pool
      (try! (contract-call? pool-trait set-y-fees protocol-fee provider-fee))

      ;; Print function data and return true
      (print {
        action: "set-y-fees",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait),
          y-protocol-fee: protocol-fee,
          y-provider-fee: provider-fee,
          y-variable-fee: y-variable-fee
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| protocol-fee | uint |
| provider-fee | uint |

### set-variable-fees-cooldown

[View in file](..\contracts\dlmm-core-v-1-1.clar#L623)

`(define-public (set-variable-fees-cooldown ((pool-trait trait_reference) (cooldown uint)) (response bool uint))`

Set variable fees cooldown for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees-cooldown (pool-trait <dlmm-pool-trait>) (cooldown uint))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and pool is created and valid
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-valid-pool (get pool-id pool-data) (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Set variable fees cooldown for pool
      (try! (contract-call? pool-trait set-variable-fees-cooldown cooldown))

      ;; Print function data and return true
      (print {
        action: "set-variable-fees-cooldown",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait),
          cooldown: cooldown
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| cooldown | uint |

### set-freeze-variable-fees-manager

[View in file](..\contracts\dlmm-core-v-1-1.clar#L655)

`(define-public (set-freeze-variable-fees-manager ((pool-trait trait_reference)) (response bool uint))`

Make variable fees manager immutable for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-freeze-variable-fees-manager (pool-trait <dlmm-pool-trait>))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (freeze-variable-fees-manager (get freeze-variable-fees-manager pool-data))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and pool is created and valid
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-valid-pool (get pool-id pool-data) (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Assert that variable fees manager is not frozen
      (asserts! (not freeze-variable-fees-manager) ERR_VARIABLE_FEES_MANAGER_FROZEN)

      ;; Set freeze variable fees manager for pool
      (try! (contract-call? pool-trait set-freeze-variable-fees-manager))

      ;; Print function data and return true
      (print {
        action: "set-freeze-variable-fees-manager",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait)
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |

### set-dynamic-config

[View in file](..\contracts\dlmm-core-v-1-1.clar#L690)

`(define-public (set-dynamic-config ((pool-trait trait_reference) (config (buff 4096))) (response bool uint))`

Set dynamic config for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-dynamic-config (pool-trait <dlmm-pool-trait>) (config (buff 4096)))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (variable-fees-manager (get variable-fees-manager pool-data))
    (freeze-variable-fees-manager (get freeze-variable-fees-manager pool-data))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin or variable fees manager and pool is created and valid
      (asserts! (or (is-some (index-of (var-get admins) caller)) (is-eq variable-fees-manager caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-valid-pool (get pool-id pool-data) (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Assert that caller is variable fees manager if variable fees manager is frozen
      (asserts! (or (is-eq variable-fees-manager caller) (not freeze-variable-fees-manager)) ERR_NOT_AUTHORIZED)

      ;; Assert that config is greater than zero
      (asserts! (> (len config) u0) ERR_INVALID_DYNAMIC_CONFIG)

      ;; Set dynamic config for pool
      (try! (contract-call? pool-trait set-dynamic-config config))

      ;; Print function data and return true
      (print {
        action: "set-dynamic-config",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait),
          config: config
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| config | (buff 4096) |

### reset-variable-fees

[View in file](..\contracts\dlmm-core-v-1-1.clar#L730)

`(define-public (reset-variable-fees ((pool-trait trait_reference)) (response bool uint))`

Reset variable fees for a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (reset-variable-fees (pool-trait <dlmm-pool-trait>))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (last-variable-fees-update (get last-variable-fees-update pool-data))
    (variable-fees-cooldown (get variable-fees-cooldown pool-data))
    (caller tx-sender)
  )
    (begin
      ;; Assert that pool is created and valid
      (asserts! (is-valid-pool (get pool-id pool-data) (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Assert that variable fees cooldown period has passed
      (asserts! (>= stacks-block-height (+ last-variable-fees-update variable-fees-cooldown)) ERR_VARIABLE_FEES_COOLDOWN)

      ;; Reset variable fees for pool
      (try! (contract-call? pool-trait set-variable-fees u0 u0))

      ;; Print function data and return true
      (print {
        action: "reset-variable-fees",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait)
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |

### create-pool

[View in file](..\contracts\dlmm-core-v-1-1.clar#L765)

`(define-public (create-pool ((pool-trait trait_reference) (x-token-trait trait_reference) (y-token-trait trait_reference) (x-amount-active-bin uint) (y-amount-active-bin uint) (burn-amount-active-bin uint) (x-protocol-fee uint) (x-provider-fee uint) (y-protocol-fee uint) (y-provider-fee uint) (bin-step uint) (variable-fees-cooldown uint) (freeze-variable-fees-manager bool) (fee-address principal) (uri (string-ascii 256)) (status bool)) (response bool uint))`

Create a new pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (create-pool 
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (x-amount-active-bin uint) (y-amount-active-bin uint) (burn-amount-active-bin uint)
    (x-protocol-fee uint) (x-provider-fee uint)
    (y-protocol-fee uint) (y-provider-fee uint)
    (bin-step uint) (variable-fees-cooldown uint) (freeze-variable-fees-manager bool)
    (fee-address principal)
    (uri (string-ascii 256)) (status bool)
  )
  (let (
    ;; Gather all pool data and pool contract
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (pool-contract (contract-of pool-trait))

    ;; Get pool ID and create pool symbol and name
    (new-pool-id (+ (var-get last-pool-id) u1))
    (symbol (unwrap! (create-symbol x-token-trait y-token-trait) ERR_INVALID_POOL_SYMBOL))
    (name (concat symbol "-LP"))

    ;; Check if pool code hash is verified @NOTE use contract-hash?
    (pool-verified-check (is-some (index-of (var-get verified-pool-code-hashes) 0x)))

    ;; Get token contracts
    (x-token-contract (contract-of x-token-trait))
    (y-token-contract (contract-of y-token-trait))

    ;; Get initial price at active bin
    (initial-price (/ (* y-amount-active-bin PRICE_SCALE_BPS) x-amount-active-bin))

    ;; Scale up y-amount-active-bin
    (y-amount-active-bin-scaled (* y-amount-active-bin PRICE_SCALE_BPS))

    ;; Get liquidity value and calculate dlp
    (add-liquidity-value (unwrap! (get-liquidity-value x-amount-active-bin y-amount-active-bin-scaled initial-price) ERR_INVALID_LIQUIDITY_VALUE))
    (dlp (sqrti add-liquidity-value))
    (caller tx-sender)
  )
    (begin
      ;; Assert that caller is an admin or public-pool-creation is true
      (asserts! (or (is-some (index-of (var-get admins) caller)) (var-get public-pool-creation)) ERR_NOT_AUTHORIZED)

      ;; Assert that pool is not created
      (asserts! (not (get pool-created pool-data)) ERR_POOL_ALREADY_CREATED)

      ;; Assert that x-token-contract and y-token-contract are not matching
      (asserts! (not (is-eq x-token-contract y-token-contract)) ERR_MATCHING_TOKEN_CONTRACTS)

      ;; Assert that addresses are standard principals
      (asserts! (is-standard x-token-contract) ERR_INVALID_PRINCIPAL)
      (asserts! (is-standard y-token-contract) ERR_INVALID_PRINCIPAL)
      (asserts! (is-standard fee-address) ERR_INVALID_PRINCIPAL)

      ;; Assert that reverse token direction is not registered
      (asserts! (is-none (map-get? allowed-token-direction {x-token: y-token-contract, y-token: x-token-contract})) ERR_INVALID_TOKEN_DIRECTION)

      ;; Assert that x-amount-active-bin and y-amount-active-bin are greater than 0
      (asserts! (and (> x-amount-active-bin u0) (> y-amount-active-bin u0)) ERR_INVALID_AMOUNT)

      ;; Assert that dlp minted meets minimum total shares required
      (asserts! (>= dlp (var-get minimum-bin-shares)) ERR_MINIMUM_LP_AMOUNT)

      ;; Assert that burn-amount-active-bin meets minimum shares required to burn
      (asserts! (>= burn-amount-active-bin (var-get minimum-burnt-shares)) ERR_MINIMUM_BURN_AMOUNT)

      ;; Assert that dlp is greater than or equal to 0 after subtracting burn amount
      (asserts! (>= (- dlp burn-amount-active-bin) u0) ERR_MINIMUM_LP_AMOUNT)

      ;; Assert that length of pool uri, symbol, and name is greater than 0
      (asserts! (> (len uri) u0) ERR_INVALID_POOL_URI)
      (asserts! (> (len symbol) u0) ERR_INVALID_POOL_SYMBOL)
      (asserts! (> (len name) u0) ERR_INVALID_POOL_NAME)

      ;; Assert that fees are less than maximum BPS
      (asserts! (< (+ x-protocol-fee x-provider-fee) FEE_SCALE_BPS) ERR_INVALID_FEE)
      (asserts! (< (+ y-protocol-fee y-provider-fee) FEE_SCALE_BPS) ERR_INVALID_FEE)

      ;; Assert that bin step is valid
      (asserts! (is-some (index-of (var-get bin-steps) bin-step)) ERR_INVALID_BIN_STEP)

      ;; Create pool, set fees, and set variable fees cooldown
      (try! (contract-call? pool-trait create-pool x-token-contract y-token-contract CONTRACT_DEPLOYER fee-address caller 0 bin-step initial-price new-pool-id name symbol uri))
      (try! (contract-call? pool-trait set-x-fees x-protocol-fee x-provider-fee))
      (try! (contract-call? pool-trait set-y-fees y-protocol-fee y-provider-fee))
      (try! (contract-call? pool-trait set-variable-fees-cooldown variable-fees-cooldown))

      ;; Freeze variable fees manager if freeze-variable-fees-manager is true
      (if freeze-variable-fees-manager (try! (contract-call? pool-trait set-freeze-variable-fees-manager)) false)

      ;; Update ID of last created pool, add pool to pools map, and add pool to unclaimed-protocol-fees map
      (var-set last-pool-id new-pool-id)
      (map-set pools new-pool-id {id: new-pool-id, name: name, symbol: symbol, pool-contract: pool-contract, verified: pool-verified-check, status: status})
      (map-set unclaimed-protocol-fees new-pool-id {x-fee: u0, y-fee: u0})

      ;; Update allowed-token-direction map if needed
      (if (is-none (map-get? allowed-token-direction {x-token: x-token-contract, y-token: y-token-contract}))
          (map-set allowed-token-direction {x-token: x-token-contract, y-token: y-token-contract} true)
          false)

      ;; Transfer x-amount-active-bin x tokens and y-amount-active-bin y tokens from caller to pool-contract
      (try! (contract-call? x-token-trait transfer x-amount-active-bin caller pool-contract none))
      (try! (contract-call? y-token-trait transfer y-amount-active-bin caller pool-contract none))

      ;; Update bin balances
      (try! (contract-call? pool-trait update-bin-balances CENTER_BIN_ID x-amount-active-bin y-amount-active-bin))

      ;; Mint LP tokens to caller
      (try! (contract-call? pool-trait pool-mint CENTER_BIN_ID (- dlp burn-amount-active-bin) caller))

      ;; Mint burn amount LP tokens to pool-contract
      (try! (contract-call? pool-trait pool-mint CENTER_BIN_ID burn-amount-active-bin pool-contract))

      ;; Print create pool data and return true
      (print {
        action: "create-pool",
        caller: caller,
        data: {
          pool-id: new-pool-id,
          pool-name: name,
          pool-contract: pool-contract,
          pool-verified: pool-verified-check,
          x-token: x-token-contract,
          y-token: y-token-contract,
          x-protocol-fee: x-protocol-fee,
          x-provider-fee: x-provider-fee,
          x-variable-fee: u0,
          y-protocol-fee: y-protocol-fee,
          y-provider-fee: y-provider-fee,
          y-variable-fee: u0,
          x-amount-active-bin: x-amount-active-bin,
          y-amount-active-bin: y-amount-active-bin,
          burn-amount-active-bin: burn-amount-active-bin,
          dlp: dlp,
          add-liquidity-value: add-liquidity-value,
          pool-symbol: symbol,
          pool-uri: uri,
          pool-status: status,
          creation-height: burn-block-height,
          active-bin-id: 0,
          bin-step: bin-step,
          initial-price: initial-price,
          variable-fees-manager: CONTRACT_DEPLOYER,
          fee-address: fee-address,
          variable-fees-cooldown: variable-fees-cooldown,
          freeze-variable-fees-manager: freeze-variable-fees-manager
        }
      })
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| x-token-trait | trait_reference |
| y-token-trait | trait_reference |
| x-amount-active-bin | uint |
| y-amount-active-bin | uint |
| burn-amount-active-bin | uint |
| x-protocol-fee | uint |
| x-provider-fee | uint |
| y-protocol-fee | uint |
| y-provider-fee | uint |
| bin-step | uint |
| variable-fees-cooldown | uint |
| freeze-variable-fees-manager | bool |
| fee-address | principal |
| uri | (string-ascii 256) |
| status | bool |

### swap-x-for-y

[View in file](..\contracts\dlmm-core-v-1-1.clar#L918)

`(define-public (swap-x-for-y ((pool-trait trait_reference) (x-token-trait trait_reference) (y-token-trait trait_reference) (bin-id int) (x-amount uint)) (response uint uint))`

Swap x token for y token via a bin in a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (swap-x-for-y
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (bin-id int) (x-amount uint)
  )
  (let (
    ;; Gather all pool data and check if pool is valid
    (pool-data (unwrap! (contract-call? pool-trait get-pool-for-swap true) ERR_NO_POOL_DATA))
    (pool-id (get pool-id pool-data))
    (pool-contract (contract-of pool-trait))
    (pool-validity-check (asserts! (is-valid-pool pool-id pool-contract) ERR_INVALID_POOL))
    (fee-address (get fee-address pool-data))
    (x-token (get x-token pool-data))
    (y-token (get y-token pool-data))
    (bin-step (get bin-step pool-data))
    (initial-price (get initial-price pool-data))
    (active-bin-id (get active-bin-id pool-data))
    (protocol-fee (get protocol-fee pool-data))
    (provider-fee (get provider-fee pool-data))
    (variable-fee (get variable-fee pool-data))

    ;; Convert bin-id to an unsigned bin-id
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))

    ;; Get balances at bin
    (bin-balances (try! (contract-call? pool-trait get-bin-balances unsigned-bin-id)))
    (x-balance (get x-balance bin-balances))
    (y-balance (get y-balance bin-balances))

    ;; Get price at bin
    (bin-price (unwrap! (get-bin-price initial-price bin-step bin-id) ERR_INVALID_BIN_PRICE))

    ;; Calculate maximum x-amount with fees
    (max-x-amount (/ (* y-balance PRICE_SCALE_BPS) bin-price))
    (max-x-amount-fees-total (/ (* max-x-amount (+ protocol-fee provider-fee variable-fee)) FEE_SCALE_BPS))
    (updated-max-x-amount (+ max-x-amount max-x-amount-fees-total))

    ;; Assert that x-amount is less than or equal to updated-max-x-amount
    (x-amount-check (asserts! (<= x-amount updated-max-x-amount) ERR_MAXIMUM_X_AMOUNT))

    ;; Calculate fees and dx
    (x-amount-fees-protocol (/ (* x-amount protocol-fee) FEE_SCALE_BPS))
    (x-amount-fees-provider (/ (* x-amount provider-fee) FEE_SCALE_BPS))
    (x-amount-fees-variable (/ (* x-amount variable-fee) FEE_SCALE_BPS))
    (x-amount-fees-total (+ x-amount-fees-protocol x-amount-fees-provider x-amount-fees-variable))
    (dx (- x-amount x-amount-fees-total))

    ;; Calculate dy
    (dy (/ (* dx bin-price) PRICE_SCALE_BPS))

    ;; Calculate updated bin balances
    (updated-x-balance (+ x-balance dx x-amount-fees-provider x-amount-fees-variable))
    (updated-y-balance (- y-balance dy))

    ;; Calculate new active bin ID (default to bin-id if at the edge of the bin range)
    (updated-active-bin-id (if (and (is-eq updated-y-balance u0) (> bin-id MIN_BIN_ID))
                               (- bin-id 1)
                               bin-id))

    ;; Get current unclaimed protocol fees for pool
    (current-unclaimed-protocol-fees (unwrap! (map-get? unclaimed-protocol-fees pool-id) ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA))
    (caller tx-sender)
  )
    (begin
      ;; Assert that pool-status is true and correct token traits are used
      (asserts! (is-enabled-pool pool-id) ERR_POOL_DISABLED)
      (asserts! (is-eq (contract-of x-token-trait) x-token) ERR_INVALID_X_TOKEN)
      (asserts! (is-eq (contract-of y-token-trait) y-token) ERR_INVALID_Y_TOKEN)

      ;; Assert that x-amount is greater than 0
      (asserts! (> x-amount u0) ERR_INVALID_AMOUNT)

      ;; Assert that bin-id is equal to active-bin-id
      (asserts! (is-eq bin-id active-bin-id) ERR_NOT_ACTIVE_BIN)

      ;; Transfer dx + x-amount-fees-total x tokens from caller to pool-contract
      (try! (contract-call? x-token-trait transfer (+ dx x-amount-fees-total) caller pool-contract none))

      ;; Transfer dy y tokens from pool-contract to caller
      (try! (contract-call? pool-trait pool-transfer y-token-trait dy caller))

      ;; Update unclaimed-protocol-fees for pool
      (if (> x-amount-fees-protocol u0)
          (map-set unclaimed-protocol-fees pool-id (merge current-unclaimed-protocol-fees {
            x-fee: (+ (get x-fee current-unclaimed-protocol-fees) x-amount-fees-protocol)
          }))
          false)

      ;; Update bin balances
      (try! (contract-call? pool-trait update-bin-balances unsigned-bin-id updated-x-balance updated-y-balance))

      ;; Set active bin ID
      (if (not (is-eq updated-active-bin-id active-bin-id))
          (try! (contract-call? pool-trait set-active-bin-id updated-active-bin-id))
          false)

      ;; Print swap data and return number of y tokens the caller received
      (print {
        action: "swap-x-for-y",
        caller: caller,
        data: {
          pool-id: pool-id,
          pool-name: (get pool-name pool-data),
          pool-contract: pool-contract,
          x-token: x-token,
          y-token: y-token,
          bin-step: bin-step,
          initial-price: initial-price,
          bin-price: bin-price,
          active-bin-id: active-bin-id,
          updated-active-bin-id: updated-active-bin-id,
          bin-id: bin-id,
          unsigned-bin-id: unsigned-bin-id,
          x-amount: x-amount,
          max-x-amount: updated-max-x-amount,
          x-amount-fees-protocol: x-amount-fees-protocol,
          x-amount-fees-provider: x-amount-fees-provider,
          x-amount-fees-variable: x-amount-fees-variable,
          dx: dx,
          dy: dy,
          updated-x-balance: updated-x-balance,
          updated-y-balance: updated-y-balance
        }
      })
      (ok dy)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| x-token-trait | trait_reference |
| y-token-trait | trait_reference |
| bin-id | int |
| x-amount | uint |

### swap-y-for-x

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1048)

`(define-public (swap-y-for-x ((pool-trait trait_reference) (x-token-trait trait_reference) (y-token-trait trait_reference) (bin-id int) (y-amount uint)) (response uint uint))`

Swap y token for x token via a bin in a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (swap-y-for-x
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (bin-id int) (y-amount uint)
  )
  (let (
    ;; Gather all pool data and check if pool is valid
    (pool-data (unwrap! (contract-call? pool-trait get-pool-for-swap false) ERR_NO_POOL_DATA))
    (pool-id (get pool-id pool-data))
    (pool-contract (contract-of pool-trait))
    (pool-validity-check (asserts! (is-valid-pool pool-id pool-contract) ERR_INVALID_POOL))
    (fee-address (get fee-address pool-data))
    (x-token (get x-token pool-data))
    (y-token (get y-token pool-data))
    (bin-step (get bin-step pool-data))
    (initial-price (get initial-price pool-data))
    (active-bin-id (get active-bin-id pool-data))
    (protocol-fee (get protocol-fee pool-data))
    (provider-fee (get provider-fee pool-data))
    (variable-fee (get variable-fee pool-data))

    ;; Convert bin-id to an unsigned bin-id
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))

    ;; Get balances at bin
    (bin-balances (try! (contract-call? pool-trait get-bin-balances unsigned-bin-id)))
    (x-balance (get x-balance bin-balances))
    (y-balance (get y-balance bin-balances))

    ;; Get price at bin
    (bin-price (unwrap! (get-bin-price initial-price bin-step bin-id) ERR_INVALID_BIN_PRICE))

    ;; Calculate maximum y-amount with fees
    (max-y-amount (/ (* x-balance bin-price) PRICE_SCALE_BPS))
    (max-y-amount-fees-total (/ (* max-y-amount (+ protocol-fee provider-fee variable-fee)) FEE_SCALE_BPS))
    (updated-max-y-amount (+ max-y-amount max-y-amount-fees-total))

    ;; Assert that y-amount is less than or equal to updated-max-y-amount
    (y-amount-check (asserts! (<= y-amount updated-max-y-amount) ERR_MAXIMUM_Y_AMOUNT))

    ;; Calculate fees and dy
    (y-amount-fees-protocol (/ (* y-amount protocol-fee) FEE_SCALE_BPS))
    (y-amount-fees-provider (/ (* y-amount provider-fee) FEE_SCALE_BPS))
    (y-amount-fees-variable (/ (* y-amount variable-fee) FEE_SCALE_BPS))
    (y-amount-fees-total (+ y-amount-fees-protocol y-amount-fees-provider y-amount-fees-variable))
    (dy (- y-amount y-amount-fees-total))

    ;; Calculate dx
    (dx (/ (* dy PRICE_SCALE_BPS) bin-price))

    ;; Calculate updated bin balances
    (updated-x-balance (- x-balance dx))
    (updated-y-balance (+ y-balance dy y-amount-fees-provider y-amount-fees-variable))

    ;; Calculate new active bin ID (default to bin-id if at the edge of the bin range)
    (updated-active-bin-id (if (and (is-eq updated-x-balance u0) (< bin-id MAX_BIN_ID))
                               (+ bin-id 1)
                               bin-id))

    ;; Get current unclaimed protocol fees for pool
    (current-unclaimed-protocol-fees (unwrap! (map-get? unclaimed-protocol-fees pool-id) ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA))
    (caller tx-sender)
  )
    (begin
      ;; Assert that pool-status is true and correct token traits are used
      (asserts! (is-enabled-pool pool-id) ERR_POOL_DISABLED)
      (asserts! (is-eq (contract-of x-token-trait) x-token) ERR_INVALID_X_TOKEN)
      (asserts! (is-eq (contract-of y-token-trait) y-token) ERR_INVALID_Y_TOKEN)

      ;; Assert that y-amount is greater than 0
      (asserts! (> y-amount u0) ERR_INVALID_AMOUNT)

      ;; Assert that bin-id is equal to active-bin-id
      (asserts! (is-eq bin-id active-bin-id) ERR_NOT_ACTIVE_BIN)

      ;; Transfer dy + y-amount-fees-total y tokens from caller to pool-contract
      (try! (contract-call? y-token-trait transfer (+ dy y-amount-fees-total) caller pool-contract none))

      ;; Transfer dx x tokens from pool-contract to caller
      (try! (contract-call? pool-trait pool-transfer x-token-trait dx caller))

      ;; Update unclaimed-protocol-fees for pool
      (if (> y-amount-fees-protocol u0)
          (map-set unclaimed-protocol-fees pool-id (merge current-unclaimed-protocol-fees {
            y-fee: (+ (get y-fee current-unclaimed-protocol-fees) y-amount-fees-protocol)
          }))
          false)

      ;; Update bin balances
      (try! (contract-call? pool-trait update-bin-balances unsigned-bin-id updated-x-balance updated-y-balance))

      ;; Set active bin ID
      (if (not (is-eq updated-active-bin-id active-bin-id))
          (try! (contract-call? pool-trait set-active-bin-id updated-active-bin-id))
          false)

      ;; Print swap data and return number of x tokens the caller received
      (print {
        action: "swap-y-for-x",
        caller: caller,
        data: {
          pool-id: pool-id,
          pool-name: (get pool-name pool-data),
          pool-contract: pool-contract,
          x-token: x-token,
          y-token: y-token,
          bin-step: bin-step,
          initial-price: initial-price,
          bin-price: bin-price,
          active-bin-id: active-bin-id,
          updated-active-bin-id: updated-active-bin-id,
          bin-id: bin-id,
          unsigned-bin-id: unsigned-bin-id,
          y-amount: y-amount,
          max-y-amount: updated-max-y-amount,
          y-amount-fees-protocol: y-amount-fees-protocol,
          y-amount-fees-provider: y-amount-fees-provider,
          y-amount-fees-variable: y-amount-fees-variable,
          dy: dy,
          dx: dx,
          updated-x-balance: updated-x-balance,
          updated-y-balance: updated-y-balance
        }
      })
      (ok dx)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| x-token-trait | trait_reference |
| y-token-trait | trait_reference |
| bin-id | int |
| y-amount | uint |

### add-liquidity

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1178)

`(define-public (add-liquidity ((pool-trait trait_reference) (x-token-trait trait_reference) (y-token-trait trait_reference) (bin-id int) (x-amount uint) (y-amount uint) (min-dlp uint)) (response uint uint))`

Add liquidity to a bin in a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (add-liquidity
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (bin-id int) (x-amount uint) (y-amount uint) (min-dlp uint)
  )
  (let (
    ;; Gather all pool data and check if pool is valid
    (pool-data (unwrap! (contract-call? pool-trait get-pool-for-add) ERR_NO_POOL_DATA))
    (pool-contract (contract-of pool-trait))
    (pool-validity-check (asserts! (is-valid-pool (get pool-id pool-data) pool-contract) ERR_INVALID_POOL))
    (x-token (get x-token pool-data))
    (y-token (get y-token pool-data))
    (bin-step (get bin-step pool-data))
    (initial-price (get initial-price pool-data))
    (active-bin-id (get active-bin-id pool-data))

    ;; Convert bin-id to an unsigned bin-id
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))

    ;; Get balances at bin
    (bin-balances (try! (contract-call? pool-trait get-bin-balances unsigned-bin-id)))
    (x-balance (get x-balance bin-balances))
    (y-balance (get y-balance bin-balances))
    (bin-shares (get bin-shares bin-balances))

    ;; Get price at bin
    (bin-price (unwrap! (get-bin-price initial-price bin-step bin-id) ERR_INVALID_BIN_PRICE))

    ;; Scale up y-amount and y-balance
    (y-amount-scaled (* y-amount PRICE_SCALE_BPS))
    (y-balance-scaled (* y-balance PRICE_SCALE_BPS))

    ;; Get current liquidity values and calculate dlp without fees
    (add-liquidity-value (unwrap! (get-liquidity-value x-amount y-amount-scaled bin-price) ERR_INVALID_LIQUIDITY_VALUE))
    (bin-liquidity-value (unwrap! (get-liquidity-value x-balance y-balance-scaled bin-price) ERR_INVALID_LIQUIDITY_VALUE))
    (dlp (if (or (is-eq bin-shares u0) (is-eq bin-liquidity-value u0))
             (sqrti add-liquidity-value)
             (/ (* add-liquidity-value bin-shares) bin-liquidity-value)))

    ;; Calculate liquidity fees if adding liquidity to active bin based on ratio of bin balances
    (x-amount-fees-liquidity (if (is-eq bin-id active-bin-id)
      (let (
        (x-liquidity-fee (+ (get x-protocol-fee pool-data) (get x-provider-fee pool-data) (get x-variable-fee pool-data)))

        ;; Calculate withdrawable x-amount without fees
        (x-amount-withdrawable (/ (* dlp (+ x-balance x-amount)) (+ bin-shares dlp)))

        ;; Calculate max liquidity fee for x-amount
        (max-x-amount-fees-liquidity (if (> x-amount-withdrawable x-amount)
                                           (/ (* (- x-amount-withdrawable x-amount) x-liquidity-fee) FEE_SCALE_BPS)
                                           u0))
      )
        ;; Calculate final liquidity fee for x-amount
        (if (> x-amount max-x-amount-fees-liquidity) max-x-amount-fees-liquidity x-amount)
      )
      u0
    ))
    (y-amount-fees-liquidity (if (is-eq bin-id active-bin-id)
      (let (
        (y-liquidity-fee (+ (get y-protocol-fee pool-data) (get y-provider-fee pool-data) (get y-variable-fee pool-data)))

        ;; Calculate withdrawable y-amount without fees
        (y-amount-withdrawable (/ (* dlp (+ y-balance y-amount)) (+ bin-shares dlp)))

        ;; Calculate max liquidity fee for y-amount
        (max-y-amount-fees-liquidity (if (> y-amount-withdrawable y-amount)
                                           (/ (* (- y-amount-withdrawable y-amount) y-liquidity-fee) FEE_SCALE_BPS)
                                           u0))
      )
        ;; Calculate final liquidity fee for y-amount
        (if (> y-amount max-y-amount-fees-liquidity) max-y-amount-fees-liquidity y-amount)
      )
      u0
    ))

    ;; Calculate final x and y amounts post fees
    (x-amount-post-fees (- x-amount x-amount-fees-liquidity))
    (y-amount-post-fees (- y-amount y-amount-fees-liquidity))
    (y-amount-post-fees-scaled (* y-amount-post-fees PRICE_SCALE_BPS))

    ;; Get final liquidity value and calculate dlp post fees
    (add-liquidity-value-post-fees (unwrap! (get-liquidity-value x-amount-post-fees y-amount-post-fees-scaled bin-price) ERR_INVALID_LIQUIDITY_VALUE))
    (dlp-post-fees (if (or (is-eq bin-shares u0) (is-eq bin-liquidity-value u0))
                       (sqrti add-liquidity-value-post-fees)
                       (/ (* add-liquidity-value-post-fees bin-shares) bin-liquidity-value)))

    ;; Calculate updated bin balances
    (updated-x-balance (+ x-balance x-amount))
    (updated-y-balance (+ y-balance y-amount))
    (caller tx-sender)
  )
    (begin
      ;; Assert that pool-status is true and correct token traits are used
      (asserts! (is-enabled-pool (get pool-id pool-data)) ERR_POOL_DISABLED)
      (asserts! (is-eq (contract-of x-token-trait) x-token) ERR_INVALID_X_TOKEN)
      (asserts! (is-eq (contract-of y-token-trait) y-token) ERR_INVALID_Y_TOKEN)

      ;; Assert that x-amount + y-amount is greater than 0
      (asserts! (> (+ x-amount y-amount) u0) ERR_INVALID_AMOUNT)

      ;; Assert that correct token amounts are being added based on bin-id and active-bin-id
      (asserts! (or (>= bin-id active-bin-id) (is-eq x-amount u0)) ERR_INVALID_X_AMOUNT)
      (asserts! (or (<= bin-id active-bin-id) (is-eq y-amount u0)) ERR_INVALID_Y_AMOUNT)

      ;; Assert that min-dlp is greater than 0 and dlp-post-fees is greater than or equal to min-dlp
      (asserts! (> min-dlp u0) ERR_INVALID_MIN_DLP_AMOUNT)
      (asserts! (>= dlp-post-fees min-dlp) ERR_MINIMUM_LP_AMOUNT)

      ;; Transfer x-amount x tokens from caller to pool-contract (includes x-amount-fees-liquidity)
      (if (> x-amount u0)
          (try! (contract-call? x-token-trait transfer x-amount caller pool-contract none))
          false)

      ;; Transfer y-amount y tokens from caller to pool-contract (includes y-amount-fees-liquidity)
      (if (> y-amount u0)
          (try! (contract-call? y-token-trait transfer y-amount caller pool-contract none))
          false)

      ;; Update bin balances
      (try! (contract-call? pool-trait update-bin-balances unsigned-bin-id updated-x-balance updated-y-balance))

      ;; Mint LP tokens to caller
      (try! (contract-call? pool-trait pool-mint unsigned-bin-id dlp-post-fees caller))

      ;; Print add liquidity data and return number of LP tokens the caller received
      (print {
        action: "add-liquidity",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: pool-contract,
          x-token: x-token,
          y-token: y-token,
          bin-step: bin-step,
          initial-price: initial-price,
          bin-price: bin-price,
          active-bin-id: active-bin-id,
          bin-id: bin-id,
          unsigned-bin-id: unsigned-bin-id,
          x-amount: x-amount-post-fees,
          y-amount: y-amount-post-fees,
          x-amount-fees-liquidity: x-amount-fees-liquidity,
          y-amount-fees-liquidity: y-amount-fees-liquidity,
          dlp: dlp-post-fees,
          min-dlp: min-dlp,
          add-liquidity-value: add-liquidity-value-post-fees,
          bin-liquidity-value: bin-liquidity-value,
          updated-x-balance: updated-x-balance,
          updated-y-balance: updated-y-balance,
          updated-bin-shares: (+ bin-shares dlp)
        }
      })
      (ok dlp-post-fees)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| x-token-trait | trait_reference |
| y-token-trait | trait_reference |
| bin-id | int |
| x-amount | uint |
| y-amount | uint |
| min-dlp | uint |

### withdraw-liquidity

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1337)

`(define-public (withdraw-liquidity ((pool-trait trait_reference) (x-token-trait trait_reference) (y-token-trait trait_reference) (bin-id int) (amount uint) (min-x-amount uint) (min-y-amount uint)) (response (tuple (x-amount uint) (y-amount uint)) uint))`

Withdraw liquidity from a bin in a pool

<details>
  <summary>Source code:</summary>

```clarity
(define-public (withdraw-liquidity
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (bin-id int) (amount uint) (min-x-amount uint) (min-y-amount uint)
  )
  (let (
    ;; Gather all pool data and check if pool is valid
    (pool-data (unwrap! (contract-call? pool-trait get-pool-for-withdraw) ERR_NO_POOL_DATA))
    (pool-contract (contract-of pool-trait))
    (pool-validity-check (asserts! (is-valid-pool (get pool-id pool-data) pool-contract) ERR_INVALID_POOL))
    (x-token (get x-token pool-data))
    (y-token (get y-token pool-data))

    ;; Convert bin-id to an unsigned bin-id
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))

    ;; Get balances at bin
    (bin-balances (try! (contract-call? pool-trait get-bin-balances unsigned-bin-id)))
    (x-balance (get x-balance bin-balances))
    (y-balance (get y-balance bin-balances))
    (bin-shares (get bin-shares bin-balances))

    ;; Assert that bin shares is greater than 0
    (bin-shares-check (asserts! (> bin-shares u0) ERR_NO_BIN_SHARES))

    ;; Calculate x-amount and y-amount to transfer
    (x-amount (/ (* amount x-balance) bin-shares))
    (y-amount (/ (* amount y-balance) bin-shares))

    ;; Calculate updated bin balances and total shares
    (updated-x-balance (- x-balance x-amount))
    (updated-y-balance (- y-balance y-amount))
    (updated-bin-shares (- bin-shares amount))
    (caller tx-sender)
  )
    (begin
      ;; Assert that correct token traits are used
      (asserts! (is-eq (contract-of x-token-trait) x-token) ERR_INVALID_X_TOKEN)
      (asserts! (is-eq (contract-of y-token-trait) y-token) ERR_INVALID_Y_TOKEN)

      ;; Assert that amount is greater than 0
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)

      ;; Assert that min-x-amount + min-y-amount is greater than 0
      (asserts! (> (+ min-x-amount min-y-amount) u0) ERR_INVALID_AMOUNT)

      ;; Assert that x-amount + y-amount is greater than 0
      (asserts! (> (+ x-amount y-amount) u0) ERR_INVALID_AMOUNT)

      ;; Assert that x-amount is greater than or equal to min-x-amount
      (asserts! (>= x-amount min-x-amount) ERR_MINIMUM_X_AMOUNT)

      ;; Assert that y-amount is greater than or equal to min-y-amount
      (asserts! (>= y-amount min-y-amount) ERR_MINIMUM_Y_AMOUNT)

      ;; Transfer x-amount x tokens from pool-contract to caller
      (if (> x-amount u0)
          (try! (contract-call? pool-trait pool-transfer x-token-trait x-amount caller))
          false)

      ;; Transfer y-amount y tokens from pool-contract to caller
      (if (> y-amount u0)
          (try! (contract-call? pool-trait pool-transfer y-token-trait y-amount caller))
          false)

      ;; Update bin balances
      (try! (contract-call? pool-trait update-bin-balances-on-withdraw unsigned-bin-id updated-x-balance updated-y-balance updated-bin-shares))

      ;; Burn LP tokens from caller
      (try! (contract-call? pool-trait pool-burn unsigned-bin-id amount caller))

      ;; Print withdraw liquidity data and return number of x and y tokens the caller received
      (print {
        action: "withdraw-liquidity",
        caller: caller,
        data: {
          pool-id: (get pool-id pool-data),
          pool-name: (get pool-name pool-data),
          pool-contract: pool-contract,
          x-token: x-token,
          y-token: y-token,
          bin-id: bin-id,
          unsigned-bin-id: unsigned-bin-id,
          amount: amount,
          x-amount: x-amount,
          y-amount: y-amount,
          min-x-amount: min-x-amount,
          min-y-amount: min-y-amount,
          updated-x-balance: updated-x-balance,
          updated-y-balance: updated-y-balance,
          updated-bin-shares: updated-bin-shares
        }
      })
      (ok {x-amount: x-amount, y-amount: y-amount})
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-trait | trait_reference |
| x-token-trait | trait_reference |
| y-token-trait | trait_reference |
| bin-id | int |
| amount | uint |
| min-x-amount | uint |
| min-y-amount | uint |

### add-admin

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1436)

`(define-public (add-admin ((admin principal)) (response bool uint))`

Add an admin to the admins list

<details>
  <summary>Source code:</summary>

```clarity
(define-public (add-admin (admin principal))
  (let (
    (admins-list (var-get admins))
    (caller tx-sender)
  )
    ;; Assert caller is an existing admin and new admin is not in admins-list
    (asserts! (is-some (index-of admins-list caller)) ERR_NOT_AUTHORIZED)
    (asserts! (is-none (index-of admins-list admin)) ERR_ALREADY_ADMIN)

    ;; Add admin to list with max length of 5
    (var-set admins (unwrap! (as-max-len? (append admins-list admin) u5) ERR_ADMIN_LIMIT_REACHED))

    ;; Print add admin data and return true
    (print {action: "add-admin", caller: caller, data: {admin: admin}})
    (ok true)
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| admin | principal |

### remove-admin

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1455)

`(define-public (remove-admin ((admin principal)) (response bool uint))`

Remove an admin from the admins list

<details>
  <summary>Source code:</summary>

```clarity
(define-public (remove-admin (admin principal))
  (let (
    (admins-list (var-get admins))
    (caller tx-sender)
  )
    ;; Assert caller is an existing admin and admin to remove is in admins-list
    (asserts! (is-some (index-of admins-list caller)) ERR_NOT_AUTHORIZED)
    (asserts! (is-some (index-of admins-list admin)) ERR_ADMIN_NOT_IN_LIST)

    ;; Assert contract deployer cannot be removed
    (asserts! (not (is-eq admin CONTRACT_DEPLOYER)) ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER)

    ;; Set admin-helper to admin to remove and filter admins-list to remove admin
    (var-set admin-helper admin)
    (var-set admins (filter admin-not-removable admins-list))

    ;; Print remove admin data and return true
    (print {action: "remove-admin", caller: caller, data: {admin: admin}})
    (ok true)
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| admin | principal |

### claim-protocol-fees-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1478)

`(define-public (claim-protocol-fees-multi ((pool-traits (list 120 trait_reference)) (x-token-traits (list 120 trait_reference)) (y-token-traits (list 120 trait_reference))) (response (list 120 (response bool uint)) none))`

Claim protocol fees for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (claim-protocol-fees-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (x-token-traits (list 120 <sip-010-trait>))
    (y-token-traits (list 120 <sip-010-trait>))
  )
  (ok (map claim-protocol-fees pool-traits x-token-traits y-token-traits))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |
| x-token-traits | (list 120 trait_reference) |
| y-token-traits | (list 120 trait_reference) |

### set-pool-uri-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1487)

`(define-public (set-pool-uri-multi ((pool-traits (list 120 trait_reference)) (uris (list 120 (string-ascii 256)))) (response (list 120 (response bool uint)) none))`

Set pool uri for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-pool-uri-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (uris (list 120 (string-ascii 256)))
  )
  (ok (map set-pool-uri pool-traits uris))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |
| uris | (list 120 (string-ascii 256)) |

### set-pool-status-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1495)

`(define-public (set-pool-status-multi ((pool-traits (list 120 trait_reference)) (statuses (list 120 bool))) (response (list 120 (response bool uint)) none))`

Set pool status for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-pool-status-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (statuses (list 120 bool))
  )
  (ok (map set-pool-status pool-traits statuses))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |
| statuses | (list 120 bool) |

### set-variable-fees-manager-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1503)

`(define-public (set-variable-fees-manager-multi ((pool-traits (list 120 trait_reference)) (managers (list 120 principal))) (response (list 120 (response bool uint)) none))`

Set variable fees manager for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees-manager-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (managers (list 120 principal))
  )
  (ok (map set-variable-fees-manager pool-traits managers))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |
| managers | (list 120 principal) |

### set-fee-address-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1511)

`(define-public (set-fee-address-multi ((pool-traits (list 120 trait_reference)) (addresses (list 120 principal))) (response (list 120 (response bool uint)) none))`

Set fee address for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-fee-address-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (addresses (list 120 principal))
  )
  (ok (map set-fee-address pool-traits addresses))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |
| addresses | (list 120 principal) |

### set-variable-fees-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1519)

`(define-public (set-variable-fees-multi ((pool-traits (list 120 trait_reference)) (x-fees (list 120 uint)) (y-fees (list 120 uint))) (response (list 120 (response bool uint)) none))`

Set variable fees for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (x-fees (list 120 uint))
    (y-fees (list 120 uint))
  )
  (ok (map set-variable-fees pool-traits x-fees y-fees))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |
| x-fees | (list 120 uint) |
| y-fees | (list 120 uint) |

### set-x-fees-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1528)

`(define-public (set-x-fees-multi ((pool-traits (list 120 trait_reference)) (protocol-fees (list 120 uint)) (provider-fees (list 120 uint))) (response (list 120 (response bool uint)) none))`

Set x fees for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-x-fees-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (protocol-fees (list 120 uint))
    (provider-fees (list 120 uint))
  )
  (ok (map set-x-fees pool-traits protocol-fees provider-fees))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |
| protocol-fees | (list 120 uint) |
| provider-fees | (list 120 uint) |

### set-y-fees-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1537)

`(define-public (set-y-fees-multi ((pool-traits (list 120 trait_reference)) (protocol-fees (list 120 uint)) (provider-fees (list 120 uint))) (response (list 120 (response bool uint)) none))`

Set y fees for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-y-fees-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (protocol-fees (list 120 uint))
    (provider-fees (list 120 uint))
  )
  (ok (map set-y-fees pool-traits protocol-fees provider-fees))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |
| protocol-fees | (list 120 uint) |
| provider-fees | (list 120 uint) |

### set-variable-fees-cooldown-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1546)

`(define-public (set-variable-fees-cooldown-multi ((pool-traits (list 120 trait_reference)) (cooldowns (list 120 uint))) (response (list 120 (response bool uint)) none))`

Set variable fees cooldown for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees-cooldown-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (cooldowns (list 120 uint))
  )
  (ok (map set-variable-fees-cooldown pool-traits cooldowns))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |
| cooldowns | (list 120 uint) |

### set-freeze-variable-fees-manager-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1554)

`(define-public (set-freeze-variable-fees-manager-multi ((pool-traits (list 120 trait_reference))) (response (list 120 (response bool uint)) none))`

Set freeze variable fees manager for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-freeze-variable-fees-manager-multi (pool-traits (list 120 <dlmm-pool-trait>)))
  (ok (map set-freeze-variable-fees-manager pool-traits))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |

### reset-variable-fees-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1559)

`(define-public (reset-variable-fees-multi ((pool-traits (list 120 trait_reference))) (response (list 120 (response bool uint)) none))`

Reset variable fees for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (reset-variable-fees-multi (pool-traits (list 120 <dlmm-pool-trait>)))
  (ok (map reset-variable-fees pool-traits))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |

### set-dynamic-config-multi

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1564)

`(define-public (set-dynamic-config-multi ((pool-traits (list 120 trait_reference)) (configs (list 120 (buff 4096)))) (response (list 120 (response bool uint)) none))`

Set dynamic config for multiple pools

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-dynamic-config-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (configs (list 120 (buff 4096)))
  )
  (ok (map set-dynamic-config pool-traits configs))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| pool-traits | (list 120 trait_reference) |
| configs | (list 120 (buff 4096)) |

### admin-not-removable

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1572)

`(define-private (admin-not-removable ((admin principal)) bool)`

Helper function for removing an admin

<details>
  <summary>Source code:</summary>

```clarity
(define-private (admin-not-removable (admin principal))
  (not (is-eq admin (var-get admin-helper)))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| admin | principal |

### create-symbol

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1577)

`(define-private (create-symbol ((x-token-trait trait_reference) (y-token-trait trait_reference)) (optional (string-ascii 29)))`

Create pool symbol using x token and y token symbols

<details>
  <summary>Source code:</summary>

```clarity
(define-private (create-symbol (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>))
  (let (
    ;; Get x token and y token symbols
    (x-symbol (unwrap-panic (contract-call? x-token-trait get-symbol)))
    (y-symbol (unwrap-panic (contract-call? y-token-trait get-symbol)))

    ;; Truncate symbols if length exceeds 14
    (x-truncated 
      (if (> (len x-symbol) u14)
          (unwrap-panic (slice? x-symbol u0 u14))
          x-symbol))
    (y-truncated
      (if (> (len y-symbol) u14)
          (unwrap-panic (slice? y-symbol u0 u14))
          y-symbol))
  )
    ;; Return pool symbol with max length of 29
    (as-max-len? (concat x-truncated (concat "-" y-truncated)) u29)
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| x-token-trait | trait_reference |
| y-token-trait | trait_reference |

### is-valid-pool

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1599)

`(define-private (is-valid-pool ((id uint) (contract principal)) bool)`

Check if a pool is valid

<details>
  <summary>Source code:</summary>

```clarity
(define-private (is-valid-pool (id uint) (contract principal))
  (let (
    (pool-data (unwrap! (map-get? pools id) false))
  )
    (is-eq contract (get pool-contract pool-data))
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | uint |
| contract | principal |

### is-enabled-pool

[View in file](..\contracts\dlmm-core-v-1-1.clar#L1608)

`(define-private (is-enabled-pool ((id uint)) bool)`

Check if a pool is enabled

<details>
  <summary>Source code:</summary>

```clarity
(define-private (is-enabled-pool (id uint))
  (let (
    (pool-data (unwrap! (map-get? pools id) false))
  )
    (is-eq (get status pool-data) true)
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | uint |

## Maps

### bin-factors



```clarity
(define-map bin-factors uint (list 1001 uint))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L81)

### pools

Define pools map

```clarity
(define-map pools uint {
  id: uint,
  name: (string-ascii 32),
  symbol: (string-ascii 32),
  pool-contract: principal,
  verified: bool,
  status: bool
})
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L96)

### allowed-token-direction

Define allowed-token-direction map

```clarity
(define-map allowed-token-direction {x-token: principal, y-token: principal} bool)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L106)

### unclaimed-protocol-fees

Define unclaimed-protocol-fees map

```clarity
(define-map unclaimed-protocol-fees uint {x-fee: uint, y-fee: uint})
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L109)

## Variables

### admins

(list 5 principal)

Admins list and helper var used to remove admins

```clarity
(define-data-var admins (list 5 principal) (list tx-sender))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L73)

### admin-helper

principal



```clarity
(define-data-var admin-helper principal tx-sender)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L74)

### last-pool-id

uint

ID of last created pool

```clarity
(define-data-var last-pool-id uint u0)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L77)

### bin-steps

(list 1000 uint)

Allowed bin steps and factors

```clarity
(define-data-var bin-steps (list 1000 uint) (list u1 u5 u10 u20 u25))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L80)

### minimum-bin-shares

uint

Minimum shares required to mint into the active bin when creating a pool

```clarity
(define-data-var minimum-bin-shares uint u10000)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L84)

### minimum-burnt-shares

uint

Minimum shares required to burn from the active bin when creating a pool

```clarity
(define-data-var minimum-burnt-shares uint u1000)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L87)

### public-pool-creation

bool

Data var used to enable or disable pool creation by anyone

```clarity
(define-data-var public-pool-creation bool false)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L90)

### verified-pool-code-hashes

(list 10000 (buff 32))

List of verified pool code hashes

```clarity
(define-data-var verified-pool-code-hashes (list 10000 (buff 32)) (list 0x))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L93)

## Constants

### ERR_NOT_AUTHORIZED



Error constants

```clarity
(define-constant ERR_NOT_AUTHORIZED (err u1001))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L8)

### ERR_INVALID_AMOUNT





```clarity
(define-constant ERR_INVALID_AMOUNT (err u1002))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L9)

### ERR_INVALID_PRINCIPAL





```clarity
(define-constant ERR_INVALID_PRINCIPAL (err u1003))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L10)

### ERR_ALREADY_ADMIN





```clarity
(define-constant ERR_ALREADY_ADMIN (err u1004))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L11)

### ERR_ADMIN_LIMIT_REACHED





```clarity
(define-constant ERR_ADMIN_LIMIT_REACHED (err u1005))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L12)

### ERR_ADMIN_NOT_IN_LIST





```clarity
(define-constant ERR_ADMIN_NOT_IN_LIST (err u1006))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L13)

### ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER





```clarity
(define-constant ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER (err u1007))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L14)

### ERR_NO_POOL_DATA





```clarity
(define-constant ERR_NO_POOL_DATA (err u1008))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L15)

### ERR_POOL_NOT_CREATED





```clarity
(define-constant ERR_POOL_NOT_CREATED (err u1009))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L16)

### ERR_POOL_DISABLED





```clarity
(define-constant ERR_POOL_DISABLED (err u1010))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L17)

### ERR_POOL_ALREADY_CREATED





```clarity
(define-constant ERR_POOL_ALREADY_CREATED (err u1011))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L18)

### ERR_INVALID_POOL





```clarity
(define-constant ERR_INVALID_POOL (err u1012))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L19)

### ERR_INVALID_POOL_URI





```clarity
(define-constant ERR_INVALID_POOL_URI (err u1013))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L20)

### ERR_INVALID_POOL_SYMBOL





```clarity
(define-constant ERR_INVALID_POOL_SYMBOL (err u1014))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L21)

### ERR_INVALID_POOL_NAME





```clarity
(define-constant ERR_INVALID_POOL_NAME (err u1015))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L22)

### ERR_INVALID_TOKEN_DIRECTION





```clarity
(define-constant ERR_INVALID_TOKEN_DIRECTION (err u1016))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L23)

### ERR_MATCHING_TOKEN_CONTRACTS





```clarity
(define-constant ERR_MATCHING_TOKEN_CONTRACTS (err u1017))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L24)

### ERR_INVALID_X_TOKEN





```clarity
(define-constant ERR_INVALID_X_TOKEN (err u1018))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L25)

### ERR_INVALID_Y_TOKEN





```clarity
(define-constant ERR_INVALID_Y_TOKEN (err u1019))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L26)

### ERR_MINIMUM_X_AMOUNT





```clarity
(define-constant ERR_MINIMUM_X_AMOUNT (err u1020))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L27)

### ERR_MINIMUM_Y_AMOUNT





```clarity
(define-constant ERR_MINIMUM_Y_AMOUNT (err u1021))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L28)

### ERR_MINIMUM_LP_AMOUNT





```clarity
(define-constant ERR_MINIMUM_LP_AMOUNT (err u1022))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L29)

### ERR_MAXIMUM_X_AMOUNT





```clarity
(define-constant ERR_MAXIMUM_X_AMOUNT (err u1023))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L30)

### ERR_MAXIMUM_Y_AMOUNT





```clarity
(define-constant ERR_MAXIMUM_Y_AMOUNT (err u1024))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L31)

### ERR_INVALID_LIQUIDITY_VALUE





```clarity
(define-constant ERR_INVALID_LIQUIDITY_VALUE (err u1025))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L32)

### ERR_INVALID_FEE





```clarity
(define-constant ERR_INVALID_FEE (err u1026))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L33)

### ERR_MINIMUM_BURN_AMOUNT





```clarity
(define-constant ERR_MINIMUM_BURN_AMOUNT (err u1027))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L34)

### ERR_INVALID_MIN_BURNT_SHARES





```clarity
(define-constant ERR_INVALID_MIN_BURNT_SHARES (err u1028))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L35)

### ERR_INVALID_BIN_STEP





```clarity
(define-constant ERR_INVALID_BIN_STEP (err u1029))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L36)

### ERR_ALREADY_BIN_STEP





```clarity
(define-constant ERR_ALREADY_BIN_STEP (err u1030))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L37)

### ERR_BIN_STEP_LIMIT_REACHED





```clarity
(define-constant ERR_BIN_STEP_LIMIT_REACHED (err u1031))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L38)

### ERR_NO_BIN_FACTORS





```clarity
(define-constant ERR_NO_BIN_FACTORS (err u1032))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L39)

### ERR_INVALID_BIN_FACTOR





```clarity
(define-constant ERR_INVALID_BIN_FACTOR (err u1033))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L40)

### ERR_INVALID_BIN_FACTORS_LENGTH





```clarity
(define-constant ERR_INVALID_BIN_FACTORS_LENGTH (err u1034))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L41)

### ERR_INVALID_INITIAL_PRICE





```clarity
(define-constant ERR_INVALID_INITIAL_PRICE (err u1035))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L42)

### ERR_INVALID_BIN_PRICE





```clarity
(define-constant ERR_INVALID_BIN_PRICE (err u1036))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L43)

### ERR_NOT_ACTIVE_BIN





```clarity
(define-constant ERR_NOT_ACTIVE_BIN (err u1037))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L44)

### ERR_VARIABLE_FEES_COOLDOWN





```clarity
(define-constant ERR_VARIABLE_FEES_COOLDOWN (err u1038))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L45)

### ERR_VARIABLE_FEES_MANAGER_FROZEN





```clarity
(define-constant ERR_VARIABLE_FEES_MANAGER_FROZEN (err u1039))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L46)

### ERR_INVALID_DYNAMIC_CONFIG





```clarity
(define-constant ERR_INVALID_DYNAMIC_CONFIG (err u1040))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L47)

### ERR_INVALID_VERIFIED_POOL_CODE_HASH





```clarity
(define-constant ERR_INVALID_VERIFIED_POOL_CODE_HASH (err u1041))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L48)

### ERR_ALREADY_VERIFIED_POOL_CODE_HASH





```clarity
(define-constant ERR_ALREADY_VERIFIED_POOL_CODE_HASH (err u1042))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L49)

### ERR_VERIFIED_POOL_CODE_HASH_LIMIT_REACHED





```clarity
(define-constant ERR_VERIFIED_POOL_CODE_HASH_LIMIT_REACHED (err u1043))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L50)

### ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA





```clarity
(define-constant ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA (err u1044))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L51)

### ERR_INVALID_X_AMOUNT





```clarity
(define-constant ERR_INVALID_X_AMOUNT (err u1045))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L52)

### ERR_INVALID_Y_AMOUNT





```clarity
(define-constant ERR_INVALID_Y_AMOUNT (err u1046))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L53)

### ERR_INVALID_MIN_DLP_AMOUNT





```clarity
(define-constant ERR_INVALID_MIN_DLP_AMOUNT (err u1047))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L54)

### ERR_NO_BIN_SHARES





```clarity
(define-constant ERR_NO_BIN_SHARES (err u1048))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L55)

### CONTRACT_DEPLOYER



Contract deployer address

```clarity
(define-constant CONTRACT_DEPLOYER tx-sender)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L58)

### NUM_OF_BINS



Number of bins per pool and center bin ID as unsigned ints

```clarity
(define-constant NUM_OF_BINS u1001)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L61)

### CENTER_BIN_ID





```clarity
(define-constant CENTER_BIN_ID (/ NUM_OF_BINS u2))
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L62)

### MIN_BIN_ID



Minimum and maximum bin IDs as signed ints

```clarity
(define-constant MIN_BIN_ID -500)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L65)

### MAX_BIN_ID





```clarity
(define-constant MAX_BIN_ID 500)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L66)

### FEE_SCALE_BPS



Maximum BPS

```clarity
(define-constant FEE_SCALE_BPS u10000)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L69)

### PRICE_SCALE_BPS





```clarity
(define-constant PRICE_SCALE_BPS u100000000)
```

[View in file](..\contracts\dlmm-core-v-1-1.clar#L70)
  