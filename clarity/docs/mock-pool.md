
# mock-pool

[`mock-pool.clar`](..\contracts\mocks\mock-pool.clar)

dlmm-pool-sbtc-usdc-v-1-1

**Public functions:**

- [`set-revert`](#set-revert)
- [`set-pool-uri`](#set-pool-uri)
- [`set-variable-fees-manager`](#set-variable-fees-manager)
- [`set-fee-address`](#set-fee-address)
- [`set-active-bin-id`](#set-active-bin-id)
- [`set-x-fees`](#set-x-fees)
- [`set-y-fees`](#set-y-fees)
- [`set-variable-fees`](#set-variable-fees)
- [`set-variable-fees-cooldown`](#set-variable-fees-cooldown)
- [`set-freeze-variable-fees-manager`](#set-freeze-variable-fees-manager)
- [`update-bin-balances`](#update-bin-balances)
- [`transfer`](#transfer)
- [`transfer-memo`](#transfer-memo)
- [`transfer-many`](#transfer-many)
- [`transfer-many-memo`](#transfer-many-memo)
- [`pool-transfer`](#pool-transfer)
- [`pool-mint`](#pool-mint)
- [`pool-burn`](#pool-burn)
- [`create-pool`](#create-pool)

**Read-only functions:**

- [`get-name`](#get-name)
- [`get-symbol`](#get-symbol)
- [`get-decimals`](#get-decimals)
- [`get-token-uri`](#get-token-uri)
- [`get-total-supply`](#get-total-supply)
- [`get-overall-supply`](#get-overall-supply)
- [`get-balance`](#get-balance)
- [`get-overall-balance`](#get-overall-balance)
- [`get-pool`](#get-pool)
- [`get-bin-balances`](#get-bin-balances)
- [`get-user-bins`](#get-user-bins)

**Private functions:**

- [`fold-transfer-many`](#fold-transfer-many)
- [`fold-transfer-many-memo`](#fold-transfer-many-memo)
- [`get-balance-or-default`](#get-balance-or-default)
- [`update-user-balance`](#update-user-balance)
- [`tag-pool-token-id`](#tag-pool-token-id)

**Maps**

- [`balances-at-bin`](#balances-at-bin)
- [`user-balance-at-bin`](#user-balance-at-bin)
- [`user-bins`](#user-bins)

**Variables**

- [`pool-id`](#pool-id)
- [`pool-name`](#pool-name)
- [`pool-symbol`](#pool-symbol)
- [`pool-uri`](#pool-uri)
- [`pool-created`](#pool-created)
- [`creation-height`](#creation-height)
- [`variable-fees-manager`](#variable-fees-manager)
- [`fee-address`](#fee-address)
- [`x-token`](#x-token)
- [`y-token`](#y-token)
- [`bin-step`](#bin-step)
- [`initial-price`](#initial-price)
- [`active-bin-id`](#active-bin-id)
- [`x-protocol-fee`](#x-protocol-fee)
- [`x-provider-fee`](#x-provider-fee)
- [`x-variable-fee`](#x-variable-fee)
- [`y-protocol-fee`](#y-protocol-fee)
- [`y-provider-fee`](#y-provider-fee)
- [`y-variable-fee`](#y-variable-fee)
- [`bin-change-count`](#bin-change-count)
- [`last-variable-fees-update`](#last-variable-fees-update)
- [`variable-fees-cooldown`](#variable-fees-cooldown)
- [`freeze-variable-fees-manager`](#freeze-variable-fees-manager)
- [`revert`](#revert)

**Constants**

- [`ERR_NOT_AUTHORIZED_SIP_013`](#err_not_authorized_sip_013)
- [`ERR_INVALID_AMOUNT_SIP_013`](#err_invalid_amount_sip_013)
- [`ERR_INVALID_PRINCIPAL_SIP_013`](#err_invalid_principal_sip_013)
- [`ERR_NOT_AUTHORIZED`](#err_not_authorized)
- [`ERR_INVALID_AMOUNT`](#err_invalid_amount)
- [`ERR_INVALID_PRINCIPAL`](#err_invalid_principal)
- [`ERR_NOT_POOL_CONTRACT_DEPLOYER`](#err_not_pool_contract_deployer)
- [`ERR_MAX_NUMBER_OF_BINS`](#err_max_number_of_bins)
- [`CORE_ADDRESS`](#core_address)
- [`CONTRACT_DEPLOYER`](#contract_deployer)


## Functions

### get-name

[View in file](..\contracts\mocks\mock-pool.clar#L71)

`(define-read-only (get-name () (response (string-ascii 32) none))`

Get token name

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-name)
  (ok (var-get pool-name))
)
```
</details>




### get-symbol

[View in file](..\contracts\mocks\mock-pool.clar#L76)

`(define-read-only (get-symbol () (response (string-ascii 32) none))`

Get token symbol

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-symbol)
  (ok (var-get pool-symbol))
)
```
</details>




### get-decimals

[View in file](..\contracts\mocks\mock-pool.clar#L81)

`(define-read-only (get-decimals ((token-id uint)) (response uint none))`

Get token decimals

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-decimals (token-id uint))
  (ok u6)
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| token-id | uint |

### get-token-uri

[View in file](..\contracts\mocks\mock-pool.clar#L86)

`(define-read-only (get-token-uri ((token-id uint)) (response (optional (string-ascii 256)) none))`

SIP 013 function to get token uri

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-token-uri (token-id uint))
  (ok (some (var-get pool-uri)))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| token-id | uint |

### get-total-supply

[View in file](..\contracts\mocks\mock-pool.clar#L91)

`(define-read-only (get-total-supply ((token-id uint)) (response uint none))`

SIP 013 function to get total token supply by ID

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-total-supply (token-id uint))
  (ok (default-to u0 (get bin-shares (map-get? balances-at-bin token-id))))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| token-id | uint |

### get-overall-supply

[View in file](..\contracts\mocks\mock-pool.clar#L96)

`(define-read-only (get-overall-supply () (response uint none))`

SIP 013 function to get overall token supply

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-overall-supply)
  (ok (ft-get-supply pool-token))
)
```
</details>




### get-balance

[View in file](..\contracts\mocks\mock-pool.clar#L101)

`(define-read-only (get-balance ((token-id uint) (user principal)) (response uint none))`

SIP 013 function to get token balance for an user by ID

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-balance (token-id uint) (user principal))
  (ok (get-balance-or-default token-id user))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| token-id | uint |
| user | principal |

### get-overall-balance

[View in file](..\contracts\mocks\mock-pool.clar#L106)

`(define-read-only (get-overall-balance ((user principal)) (response uint none))`

SIP 013 function to get overall token balance for an user

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-overall-balance (user principal))
  (ok (ft-get-balance pool-token user))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| user | principal |

### set-revert

[View in file](..\contracts\mocks\mock-pool.clar#L111)

`(define-public (set-revert ((flag bool)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-revert (flag bool))
  (ok (var-set revert flag))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| flag | bool |

### get-pool

[View in file](..\contracts\mocks\mock-pool.clar#L116)

`(define-read-only (get-pool () (response (tuple (active-bin-id int) (bin-change-count uint) (bin-step uint) (core-address principal) (creation-height uint) (fee-address principal) (freeze-variable-fees-manager bool) (initial-price uint) (last-variable-fees-update uint) (pool-created bool) (pool-id uint) (pool-name (string-ascii 32)) (pool-symbol (string-ascii 32)) (pool-token principal) (pool-uri (string-ascii 256)) (variable-fees-cooldown uint) (variable-fees-manager principal) (x-protocol-fee uint) (x-provider-fee uint) (x-token principal) (x-variable-fee uint) (y-protocol-fee uint) (y-provider-fee uint) (y-token principal) (y-variable-fee uint)) uint))`

Get all pool data

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-pool)
  (begin
    (asserts! (not (var-get revert)) (err u42))
      (ok {
        pool-id: (var-get pool-id),
        pool-name: (var-get pool-name),
        pool-symbol: (var-get pool-symbol),
        pool-uri: (var-get pool-uri),
        pool-created: (var-get pool-created),
        creation-height: (var-get creation-height),
        core-address: CORE_ADDRESS,
        variable-fees-manager: (var-get variable-fees-manager),
        fee-address: (var-get fee-address),
        x-token: (var-get x-token),
        y-token: (var-get y-token),
        pool-token: (as-contract tx-sender),
        bin-step: (var-get bin-step),
        initial-price: (var-get initial-price),
        active-bin-id: (var-get active-bin-id),
        x-protocol-fee: (var-get x-protocol-fee),
        x-provider-fee: (var-get x-provider-fee),
        x-variable-fee: (var-get x-variable-fee),
        y-protocol-fee: (var-get y-protocol-fee),
        y-provider-fee: (var-get y-provider-fee),
        y-variable-fee: (var-get y-variable-fee),
        bin-change-count: (var-get bin-change-count),
        last-variable-fees-update: (var-get last-variable-fees-update),
        variable-fees-cooldown: (var-get variable-fees-cooldown),
        freeze-variable-fees-manager: (var-get freeze-variable-fees-manager)
      })
  )
)
```
</details>




### get-bin-balances

[View in file](..\contracts\mocks\mock-pool.clar#L150)

`(define-read-only (get-bin-balances ((id uint)) (response (tuple (bin-shares uint) (x-balance uint) (y-balance uint)) none))`

Get balance data at a bin

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-bin-balances (id uint))
  (ok (default-to {x-balance: u0, y-balance: u0, bin-shares: u0} (map-get? balances-at-bin id)))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | uint |

### get-user-bins

[View in file](..\contracts\mocks\mock-pool.clar#L155)

`(define-read-only (get-user-bins ((user principal)) (response (list 1001 uint) none))`

Get a list of bins a user has a position in

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-user-bins (user principal))
  (ok (default-to (list ) (map-get? user-bins user)))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| user | principal |

### set-pool-uri

[View in file](..\contracts\mocks\mock-pool.clar#L160)

`(define-public (set-pool-uri ((uri (string-ascii 256))) (response bool uint))`

Set pool uri via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-pool-uri (uri (string-ascii 256)))
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before setting var
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)
      (var-set pool-uri uri)
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| uri | (string-ascii 256) |

### set-variable-fees-manager

[View in file](..\contracts\mocks\mock-pool.clar#L174)

`(define-public (set-variable-fees-manager ((manager principal)) (response bool uint))`

Set variable fees manager via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees-manager (manager principal))
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before setting var
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)
      (var-set variable-fees-manager manager)
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| manager | principal |

### set-fee-address

[View in file](..\contracts\mocks\mock-pool.clar#L188)

`(define-public (set-fee-address ((address principal)) (response bool uint))`

Set fee address via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-fee-address (address principal))
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before setting var
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)
      (var-set fee-address address)
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| address | principal |

### set-active-bin-id

[View in file](..\contracts\mocks\mock-pool.clar#L202)

`(define-public (set-active-bin-id ((id int)) (response bool uint))`

Set active bin ID via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-active-bin-id (id int))
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before setting vars
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)
      (var-set active-bin-id id)
      (var-set bin-change-count (+ (var-get bin-change-count) u1))
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | int |

### set-x-fees

[View in file](..\contracts\mocks\mock-pool.clar#L217)

`(define-public (set-x-fees ((protocol-fee uint) (provider-fee uint)) (response bool uint))`

Set x fees via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-x-fees (protocol-fee uint) (provider-fee uint))
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before setting vars
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)
      (var-set x-protocol-fee protocol-fee)
      (var-set x-provider-fee provider-fee)
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| protocol-fee | uint |
| provider-fee | uint |

### set-y-fees

[View in file](..\contracts\mocks\mock-pool.clar#L232)

`(define-public (set-y-fees ((protocol-fee uint) (provider-fee uint)) (response bool uint))`

Set y fees via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-y-fees (protocol-fee uint) (provider-fee uint))
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before setting vars
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)
      (var-set y-protocol-fee protocol-fee)
      (var-set y-provider-fee provider-fee)
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| protocol-fee | uint |
| provider-fee | uint |

### set-variable-fees

[View in file](..\contracts\mocks\mock-pool.clar#L247)

`(define-public (set-variable-fees ((x-fee uint) (y-fee uint)) (response bool uint))`

Set variable fees via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees (x-fee uint) (y-fee uint))
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before setting vars
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)
      (var-set x-variable-fee x-fee)
      (var-set y-variable-fee y-fee)
      (var-set bin-change-count u0)
      (var-set last-variable-fees-update stacks-block-height)
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| x-fee | uint |
| y-fee | uint |

### set-variable-fees-cooldown

[View in file](..\contracts\mocks\mock-pool.clar#L264)

`(define-public (set-variable-fees-cooldown ((cooldown uint)) (response bool uint))`

Set variable fees cooldown via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees-cooldown (cooldown uint))
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before setting var
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)
      (var-set variable-fees-cooldown cooldown)
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| cooldown | uint |

### set-freeze-variable-fees-manager

[View in file](..\contracts\mocks\mock-pool.clar#L278)

`(define-public (set-freeze-variable-fees-manager () (response bool uint))`

Set freeze variable fees manager via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-freeze-variable-fees-manager)
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before setting var
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)
      (var-set freeze-variable-fees-manager true)
      (ok true)
    )
  )
)
```
</details>




### update-bin-balances

[View in file](..\contracts\mocks\mock-pool.clar#L292)

`(define-public (update-bin-balances ((bin-id uint) (x-balance uint) (y-balance uint)) (response bool uint))`

Update bin balances via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (update-bin-balances (bin-id uint) (x-balance uint) (y-balance uint))
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before setting vars
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)
      (map-set balances-at-bin bin-id (merge (unwrap-panic (get-bin-balances bin-id)) {x-balance: x-balance, y-balance: y-balance}))

      ;; Print function data and return true
      (print {action: "update-bin-balances", data: {bin-id: bin-id, x-balance: x-balance, y-balance: y-balance}})
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| bin-id | uint |
| x-balance | uint |
| y-balance | uint |

### transfer

[View in file](..\contracts\mocks\mock-pool.clar#L309)

`(define-public (transfer ((token-id uint) (amount uint) (sender principal) (recipient principal)) (response bool uint))`

SIP 013 transfer function that transfers pool token

<details>
  <summary>Source code:</summary>

```clarity
(define-public (transfer (token-id uint) (amount uint) (sender principal) (recipient principal))
	(let (
		(sender-balance (get-balance-or-default token-id sender))
    (caller tx-sender)
	)
    (begin
      ;; Assert that caller is sender and sender is not recipient
      (asserts! (is-eq caller sender) ERR_NOT_AUTHORIZED_SIP_013)
      (asserts! (not (is-eq sender recipient)) ERR_INVALID_PRINCIPAL_SIP_013)

      ;; Assert that addresses are standard principals and amount is valid
      (asserts! (is-standard sender) ERR_INVALID_PRINCIPAL_SIP_013)
      (asserts! (is-standard recipient) ERR_INVALID_PRINCIPAL_SIP_013)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT_SIP_013)
      (asserts! (<= amount sender-balance) ERR_INVALID_AMOUNT_SIP_013)

      ;; Try to transfer pool token
      (try! (ft-transfer? pool-token amount sender recipient))

      ;; Try to tag pool token and update balances
      (try! (tag-pool-token-id {token-id: token-id, owner: sender}))
      (try! (tag-pool-token-id {token-id: token-id, owner: recipient}))
      (try! (update-user-balance token-id sender (- sender-balance amount)))
      (try! (update-user-balance token-id recipient (+ (get-balance-or-default token-id recipient) amount)))

      ;; Print SIP 013 data, function data, and return true
      (print {type: "sft_transfer", token-id: token-id, amount: amount, sender: sender, recipient: recipient})
      (print {action: "transfer", caller: caller, data: { id: token-id, sender: sender, recipient: recipient, amount: amount}})
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| token-id | uint |
| amount | uint |
| sender | principal |
| recipient | principal |

### transfer-memo

[View in file](..\contracts\mocks\mock-pool.clar#L343)

`(define-public (transfer-memo ((token-id uint) (amount uint) (sender principal) (recipient principal) (memo (buff 34))) (response bool uint))`

SIP 013 transfer function that transfers pool token with memo

<details>
  <summary>Source code:</summary>

```clarity
(define-public (transfer-memo (token-id uint) (amount uint) (sender principal) (recipient principal) (memo (buff 34)))
	(begin
		(try! (transfer token-id amount sender recipient))
		(print memo)
		(ok true)
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| token-id | uint |
| amount | uint |
| sender | principal |
| recipient | principal |
| memo | (buff 34) |

### transfer-many

[View in file](..\contracts\mocks\mock-pool.clar#L352)

`(define-public (transfer-many ((transfers (list 200 (tuple (amount uint) (recipient principal) (sender principal) (token-id uint))))) (response bool uint))`

SIP 013 transfer function that transfers many pool token

<details>
  <summary>Source code:</summary>

```clarity
(define-public (transfer-many (transfers (list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal})))
	(fold fold-transfer-many transfers (ok true))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| transfers | (list 200 (tuple (amount uint) (recipient principal) (sender principal) (token-id uint))) |

### transfer-many-memo

[View in file](..\contracts\mocks\mock-pool.clar#L357)

`(define-public (transfer-many-memo ((transfers (list 200 (tuple (amount uint) (memo (buff 34)) (recipient principal) (sender principal) (token-id uint))))) (response bool uint))`

SIP 013 transfer function that transfers many pool token with memo

<details>
  <summary>Source code:</summary>

```clarity
(define-public (transfer-many-memo (transfers (list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal, memo: (buff 34)})))
	(fold fold-transfer-many-memo transfers (ok true))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| transfers | (list 200 (tuple (amount uint) (memo (buff 34)) (recipient principal) (sender principal) (token-id uint))) |

### pool-transfer

[View in file](..\contracts\mocks\mock-pool.clar#L362)

`(define-public (pool-transfer ((token-trait trait_reference) (amount uint) (recipient principal)) (response bool uint))`

Transfer tokens from this pool contract via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (pool-transfer (token-trait <sip-010-trait>) (amount uint) (recipient principal))
  (let (
    (token-contract (contract-of token-trait))
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before transferring tokens
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)

      ;; Assert that recipient address is standard principal
      (asserts! (is-standard recipient) ERR_INVALID_PRINCIPAL)

      ;; Assert that amount is greater than 0
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)

      ;; Try to transfer amount of token from pool contract to recipient
      (try! (as-contract (contract-call? token-trait transfer amount tx-sender recipient none)))

      ;; Print function data and return true
      (print {action: "pool-transfer", data: {token: token-contract, amount: amount, recipient: recipient}})
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| token-trait | trait_reference |
| amount | uint |
| recipient | principal |

### pool-mint

[View in file](..\contracts\mocks\mock-pool.clar#L388)

`(define-public (pool-mint ((id uint) (amount uint) (user principal)) (response bool uint))`

Mint pool token to an user via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (pool-mint (id uint) (amount uint) (user principal))
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before minting tokens
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)

      ;; Assert that user is standard principal and amount is greater than 0
      (asserts! (is-standard user) ERR_INVALID_PRINCIPAL)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)

      ;; Try to mint amount pool tokens to user
      (try! (ft-mint? pool-token amount user))

      ;; Try to tag pool token and update balances
      (try! (tag-pool-token-id {token-id: id, owner: user}))
      (try! (update-user-balance id user (+ (get-balance-or-default id user) amount)))
      (map-set balances-at-bin id (merge (unwrap-panic (get-bin-balances id)) {bin-shares: (+ (unwrap-panic (get-total-supply id)) amount)}))

      ;; Print SIP 013 data, function data, and return true
      (print {type: "sft_mint", token-id: id, amount: amount, recipient: user})
      (print {action: "pool-mint", data: {id: id, amount: amount, user: user}})
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | uint |
| amount | uint |
| user | principal |

### pool-burn

[View in file](..\contracts\mocks\mock-pool.clar#L417)

`(define-public (pool-burn ((id uint) (amount uint) (user principal)) (response bool uint))`

Burn pool token from an user via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (pool-burn (id uint) (amount uint) (user principal))
  (let (
    (user-balance (get-balance-or-default id user))
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address before burning tokens
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)

      ;; Assert that user is standard principal and amount is valid
      (asserts! (is-standard user) ERR_INVALID_PRINCIPAL)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      (asserts! (<= amount user-balance) ERR_INVALID_AMOUNT)

      ;; Try to burn amount pool tokens from user
      (try! (ft-burn? pool-token amount user))

      ;; Try to tag pool token and update balances
      (try! (tag-pool-token-id {token-id: id, owner: user}))
      (try! (update-user-balance id user (- user-balance amount)))
      (map-set balances-at-bin id (merge (unwrap-panic (get-bin-balances id)) {bin-shares: (- (unwrap-panic (get-total-supply id)) amount)}))

      ;; Print SIP 013 data, function data, and return true
      (print {type: "sft_burn", token-id: id, amount: amount, sender: user})
      (print {action: "pool-burn", data: {id: id, amount: amount, user: user}})
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | uint |
| amount | uint |
| user | principal |

### create-pool

[View in file](..\contracts\mocks\mock-pool.clar#L448)

`(define-public (create-pool ((x-token-contract principal) (y-token-contract principal) (variable-fees-mgr principal) (fee-addr principal) (core-caller principal) (active-bin int) (step uint) (price uint) (id uint) (name (string-ascii 32)) (symbol (string-ascii 32)) (uri (string-ascii 256))) (response bool uint))`

Create pool using this pool contract via DLMM Core

<details>
  <summary>Source code:</summary>

```clarity
(define-public (create-pool
    (x-token-contract principal) (y-token-contract principal)
    (variable-fees-mgr principal) (fee-addr principal) (core-caller principal)
    (active-bin int) (step uint) (price uint)
    (id uint) (name (string-ascii 32)) (symbol (string-ascii 32)) (uri (string-ascii 256))
  )
  (let (
    (caller contract-caller)
  )
    (begin
      ;; Assert that caller is core address and core caller is contract deployer before setting vars
      (asserts! (is-eq caller CORE_ADDRESS) ERR_NOT_AUTHORIZED)
      (asserts! (is-eq core-caller CONTRACT_DEPLOYER) ERR_NOT_POOL_CONTRACT_DEPLOYER)
      (var-set pool-id id)
      (var-set pool-name name)
      (var-set pool-symbol symbol)
      (var-set pool-uri uri)
      (var-set pool-created true)
      (var-set creation-height burn-block-height)
      (var-set x-token x-token-contract)
      (var-set y-token y-token-contract)
      (var-set active-bin-id active-bin)
      (var-set bin-step step)
      (var-set initial-price price)
      (var-set variable-fees-manager variable-fees-mgr)
      (var-set fee-address fee-addr)
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| x-token-contract | principal |
| y-token-contract | principal |
| variable-fees-mgr | principal |
| fee-addr | principal |
| core-caller | principal |
| active-bin | int |
| step | uint |
| price | uint |
| id | uint |
| name | (string-ascii 32) |
| symbol | (string-ascii 32) |
| uri | (string-ascii 256) |

### fold-transfer-many

[View in file](..\contracts\mocks\mock-pool.clar#L480)

`(define-private (fold-transfer-many ((item (tuple (amount uint) (recipient principal) (sender principal) (token-id uint))) (previous-response (response bool uint))) (response bool uint))`

Helper function to transfer many pool token

<details>
  <summary>Source code:</summary>

```clarity
(define-private (fold-transfer-many (item {token-id: uint, amount: uint, sender: principal, recipient: principal}) (previous-response (response bool uint)))
	(match previous-response prev-ok (transfer-memo (get token-id item) (get amount item) (get sender item) (get recipient item) 0x) prev-err previous-response)
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| item | (tuple (amount uint) (recipient principal) (sender principal) (token-id uint)) |
| previous-response | (response bool uint) |

### fold-transfer-many-memo

[View in file](..\contracts\mocks\mock-pool.clar#L485)

`(define-private (fold-transfer-many-memo ((item (tuple (amount uint) (memo (buff 34)) (recipient principal) (sender principal) (token-id uint))) (previous-response (response bool uint))) (response bool uint))`

Helper function to transfer many pool token with memo

<details>
  <summary>Source code:</summary>

```clarity
(define-private (fold-transfer-many-memo (item {token-id: uint, amount: uint, sender: principal, recipient: principal, memo: (buff 34)}) (previous-response (response bool uint)))
	(match previous-response prev-ok (transfer-memo (get token-id item) (get amount item) (get sender item) (get recipient item) (get memo item)) prev-err previous-response)
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| item | (tuple (amount uint) (memo (buff 34)) (recipient principal) (sender principal) (token-id uint)) |
| previous-response | (response bool uint) |

### get-balance-or-default

[View in file](..\contracts\mocks\mock-pool.clar#L490)

`(define-private (get-balance-or-default ((id uint) (user principal)) uint)`

Helper function to get token balance for an user by ID

<details>
  <summary>Source code:</summary>

```clarity
(define-private (get-balance-or-default (id uint) (user principal))
	(default-to u0 (map-get? user-balance-at-bin {id: id, user: user}))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | uint |
| user | principal |

### update-user-balance

[View in file](..\contracts\mocks\mock-pool.clar#L495)

`(define-private (update-user-balance ((id uint) (user principal) (balance uint)) (response bool uint))`

Update user balances via pool

<details>
  <summary>Source code:</summary>

```clarity
(define-private (update-user-balance (id uint) (user principal) (balance uint))
  (let (
		(user-bins-data (unwrap-panic (get-user-bins user)))
	)
    (begin
      (match (index-of? user-bins-data id) id-index
        (and
          (is-eq balance u0)
          (map-set user-bins user (unwrap-panic (as-max-len? (concat (unwrap-panic (slice? user-bins-data u0 id-index)) (default-to (list) (slice? user-bins-data (+ id-index u1) (len user-bins-data)))) u1001)))
        )
        (and
          (> balance u0)
          (map-set user-bins user (unwrap! (as-max-len? (append user-bins-data id) u1001) ERR_MAX_NUMBER_OF_BINS))
        )
      )
      (map-set user-balance-at-bin {id: id, user: user} balance)
      (ok true)
    )
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | uint |
| user | principal |
| balance | uint |

### tag-pool-token-id

[View in file](..\contracts\mocks\mock-pool.clar#L517)

`(define-private (tag-pool-token-id ((id (tuple (owner principal) (token-id uint)))) (response bool uint))`

Tag pool token

<details>
  <summary>Source code:</summary>

```clarity
(define-private (tag-pool-token-id (id {token-id: uint, owner: principal}))
	(begin
		(and (is-some (nft-get-owner? pool-token-id id)) (try! (nft-burn? pool-token-id id (get owner id))))
		(nft-mint? pool-token-id id (get owner id))
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | (tuple (owner principal) (token-id uint)) |

## Maps

### balances-at-bin



```clarity
(define-map balances-at-bin uint {x-balance: uint, y-balance: uint, bin-shares: uint})
```

[View in file](..\contracts\mocks\mock-pool.clar#L64)

### user-balance-at-bin



```clarity
(define-map user-balance-at-bin {id: uint, user: principal} uint)
```

[View in file](..\contracts\mocks\mock-pool.clar#L66)

### user-bins



```clarity
(define-map user-bins principal (list 1001 uint))
```

[View in file](..\contracts\mocks\mock-pool.clar#L68)

## Variables

### pool-id

uint

Define all pool data vars and maps

```clarity
(define-data-var pool-id uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L28)

### pool-name

(string-ascii 32)



```clarity
(define-data-var pool-name (string-ascii 32) "")
```

[View in file](..\contracts\mocks\mock-pool.clar#L29)

### pool-symbol

(string-ascii 32)



```clarity
(define-data-var pool-symbol (string-ascii 32) "")
```

[View in file](..\contracts\mocks\mock-pool.clar#L30)

### pool-uri

(string-ascii 256)



```clarity
(define-data-var pool-uri (string-ascii 256) "")
```

[View in file](..\contracts\mocks\mock-pool.clar#L31)

### pool-created

bool



```clarity
(define-data-var pool-created bool false)
```

[View in file](..\contracts\mocks\mock-pool.clar#L33)

### creation-height

uint



```clarity
(define-data-var creation-height uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L34)

### variable-fees-manager

principal



```clarity
(define-data-var variable-fees-manager principal tx-sender)
```

[View in file](..\contracts\mocks\mock-pool.clar#L36)

### fee-address

principal



```clarity
(define-data-var fee-address principal tx-sender)
```

[View in file](..\contracts\mocks\mock-pool.clar#L38)

### x-token

principal



```clarity
(define-data-var x-token principal tx-sender)
```

[View in file](..\contracts\mocks\mock-pool.clar#L40)

### y-token

principal



```clarity
(define-data-var y-token principal tx-sender)
```

[View in file](..\contracts\mocks\mock-pool.clar#L41)

### bin-step

uint



```clarity
(define-data-var bin-step uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L43)

### initial-price

uint



```clarity
(define-data-var initial-price uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L45)

### active-bin-id

int



```clarity
(define-data-var active-bin-id int 0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L47)

### x-protocol-fee

uint



```clarity
(define-data-var x-protocol-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L49)

### x-provider-fee

uint



```clarity
(define-data-var x-provider-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L50)

### x-variable-fee

uint



```clarity
(define-data-var x-variable-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L51)

### y-protocol-fee

uint



```clarity
(define-data-var y-protocol-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L53)

### y-provider-fee

uint



```clarity
(define-data-var y-provider-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L54)

### y-variable-fee

uint



```clarity
(define-data-var y-variable-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L55)

### bin-change-count

uint



```clarity
(define-data-var bin-change-count uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L57)

### last-variable-fees-update

uint



```clarity
(define-data-var last-variable-fees-update uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L59)

### variable-fees-cooldown

uint



```clarity
(define-data-var variable-fees-cooldown uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L60)

### freeze-variable-fees-manager

bool



```clarity
(define-data-var freeze-variable-fees-manager bool false)
```

[View in file](..\contracts\mocks\mock-pool.clar#L62)

### revert

bool



```clarity
(define-data-var revert bool false)
```

[View in file](..\contracts\mocks\mock-pool.clar#L110)

## Constants

### ERR_NOT_AUTHORIZED_SIP_013



Error constants

```clarity
(define-constant ERR_NOT_AUTHORIZED_SIP_013 (err u4))
```

[View in file](..\contracts\mocks\mock-pool.clar#L14)

### ERR_INVALID_AMOUNT_SIP_013





```clarity
(define-constant ERR_INVALID_AMOUNT_SIP_013 (err u1))
```

[View in file](..\contracts\mocks\mock-pool.clar#L15)

### ERR_INVALID_PRINCIPAL_SIP_013





```clarity
(define-constant ERR_INVALID_PRINCIPAL_SIP_013 (err u5))
```

[View in file](..\contracts\mocks\mock-pool.clar#L16)

### ERR_NOT_AUTHORIZED





```clarity
(define-constant ERR_NOT_AUTHORIZED (err u3001))
```

[View in file](..\contracts\mocks\mock-pool.clar#L17)

### ERR_INVALID_AMOUNT





```clarity
(define-constant ERR_INVALID_AMOUNT (err u3002))
```

[View in file](..\contracts\mocks\mock-pool.clar#L18)

### ERR_INVALID_PRINCIPAL





```clarity
(define-constant ERR_INVALID_PRINCIPAL (err u3003))
```

[View in file](..\contracts\mocks\mock-pool.clar#L19)

### ERR_NOT_POOL_CONTRACT_DEPLOYER





```clarity
(define-constant ERR_NOT_POOL_CONTRACT_DEPLOYER (err u3004))
```

[View in file](..\contracts\mocks\mock-pool.clar#L20)

### ERR_MAX_NUMBER_OF_BINS





```clarity
(define-constant ERR_MAX_NUMBER_OF_BINS (err u3005))
```

[View in file](..\contracts\mocks\mock-pool.clar#L21)

### CORE_ADDRESS



DLMM Core address and contract deployer address

```clarity
(define-constant CORE_ADDRESS .dlmm-core-v-1-1)
```

[View in file](..\contracts\mocks\mock-pool.clar#L24)

### CONTRACT_DEPLOYER





```clarity
(define-constant CONTRACT_DEPLOYER tx-sender)
```

[View in file](..\contracts\mocks\mock-pool.clar#L25)
  