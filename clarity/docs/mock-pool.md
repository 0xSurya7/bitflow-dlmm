
# mock-pool

[`mock-pool.clar`](..\contracts\mocks\mock-pool.clar)

mock-pool

Minimal mock pool implementation for testing

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
- [`get-active-bin-id`](#get-active-bin-id)
- [`get-bin-balances`](#get-bin-balances)
- [`get-user-bins`](#get-user-bins)

**Private functions:**



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

- [`ERR_NOT_AUTHORIZED`](#err_not_authorized)
- [`ERR_INVALID_AMOUNT`](#err_invalid_amount)
- [`ERR_INVALID_PRINCIPAL`](#err_invalid_principal)


## Functions

### get-name

[View in file](..\contracts\mocks\mock-pool.clar#L47)

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

[View in file](..\contracts\mocks\mock-pool.clar#L52)

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

[View in file](..\contracts\mocks\mock-pool.clar#L57)

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

[View in file](..\contracts\mocks\mock-pool.clar#L62)

`(define-read-only (get-token-uri ((token-id uint)) (response (optional (string-ascii 256)) none))`

Get token uri

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

[View in file](..\contracts\mocks\mock-pool.clar#L67)

`(define-read-only (get-total-supply ((token-id uint)) (response uint none))`

Get total token supply by ID

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

[View in file](..\contracts\mocks\mock-pool.clar#L72)

`(define-read-only (get-overall-supply () (response uint none))`

Get overall token supply

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-overall-supply)
  (ok u0)
)
```
</details>




### get-balance

[View in file](..\contracts\mocks\mock-pool.clar#L77)

`(define-read-only (get-balance ((token-id uint) (user principal)) (response uint none))`

Get token balance for a user by ID

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-balance (token-id uint) (user principal))
  (ok (default-to u0 (map-get? user-balance-at-bin {id: token-id, user: user})))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| token-id | uint |
| user | principal |

### get-overall-balance

[View in file](..\contracts\mocks\mock-pool.clar#L82)

`(define-read-only (get-overall-balance ((user principal)) (response uint none))`

Get overall token balance for a user

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-overall-balance (user principal))
  (ok u0)
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| user | principal |

### set-revert

[View in file](..\contracts\mocks\mock-pool.clar#L87)

`(define-public (set-revert ((flag bool)) (response bool none))`

Public setter for testing - allows anyone to trigger revert behavior

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

[View in file](..\contracts\mocks\mock-pool.clar#L92)

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
      core-address: tx-sender,
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




### get-active-bin-id

[View in file](..\contracts\mocks\mock-pool.clar#L126)

`(define-read-only (get-active-bin-id () (response int uint))`

Get active bin ID

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-active-bin-id)
  (begin
    (asserts! (not (var-get revert)) (err u42))
    (ok (var-get active-bin-id))
  )
)
```
</details>




### get-bin-balances

[View in file](..\contracts\mocks\mock-pool.clar#L134)

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

[View in file](..\contracts\mocks\mock-pool.clar#L139)

`(define-read-only (get-user-bins ((user principal)) (response (list 1001 uint) none))`

Get a list of bins a user has a position in

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-user-bins (user principal))
  (ok (default-to (list) (map-get? user-bins user)))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| user | principal |

### set-pool-uri

[View in file](..\contracts\mocks\mock-pool.clar#L144)

`(define-public (set-pool-uri ((uri (string-ascii 256))) (response bool none))`

Public setter functions - anyone can call for testing

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-pool-uri (uri (string-ascii 256)))
  (ok (var-set pool-uri uri))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| uri | (string-ascii 256) |

### set-variable-fees-manager

[View in file](..\contracts\mocks\mock-pool.clar#L148)

`(define-public (set-variable-fees-manager ((manager principal)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees-manager (manager principal))
  (ok (var-set variable-fees-manager manager))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| manager | principal |

### set-fee-address

[View in file](..\contracts\mocks\mock-pool.clar#L152)

`(define-public (set-fee-address ((address principal)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-fee-address (address principal))
  (ok (var-set fee-address address))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| address | principal |

### set-active-bin-id

[View in file](..\contracts\mocks\mock-pool.clar#L156)

`(define-public (set-active-bin-id ((id int)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-active-bin-id (id int))
  (begin
    (var-set active-bin-id id)
    (var-set bin-change-count (+ (var-get bin-change-count) u1))
    (ok true)
  )
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| id | int |

### set-x-fees

[View in file](..\contracts\mocks\mock-pool.clar#L164)

`(define-public (set-x-fees ((protocol-fee uint) (provider-fee uint)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-x-fees (protocol-fee uint) (provider-fee uint))
  (begin
    (var-set x-protocol-fee protocol-fee)
    (var-set x-provider-fee provider-fee)
    (ok true)
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

[View in file](..\contracts\mocks\mock-pool.clar#L172)

`(define-public (set-y-fees ((protocol-fee uint) (provider-fee uint)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-y-fees (protocol-fee uint) (provider-fee uint))
  (begin
    (var-set y-protocol-fee protocol-fee)
    (var-set y-provider-fee provider-fee)
    (ok true)
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

[View in file](..\contracts\mocks\mock-pool.clar#L180)

`(define-public (set-variable-fees ((x-fee uint) (y-fee uint)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees (x-fee uint) (y-fee uint))
  (begin
    (var-set x-variable-fee x-fee)
    (var-set y-variable-fee y-fee)
    (var-set bin-change-count u0)
    (var-set last-variable-fees-update stacks-block-height)
    (ok true)
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

[View in file](..\contracts\mocks\mock-pool.clar#L190)

`(define-public (set-variable-fees-cooldown ((cooldown uint)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-variable-fees-cooldown (cooldown uint))
  (ok (var-set variable-fees-cooldown cooldown))
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| cooldown | uint |

### set-freeze-variable-fees-manager

[View in file](..\contracts\mocks\mock-pool.clar#L194)

`(define-public (set-freeze-variable-fees-manager () (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-freeze-variable-fees-manager)
  (ok (var-set freeze-variable-fees-manager true))
)
```
</details>




### update-bin-balances

[View in file](..\contracts\mocks\mock-pool.clar#L198)

`(define-public (update-bin-balances ((bin-id uint) (x-balance uint) (y-balance uint)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (update-bin-balances (bin-id uint) (x-balance uint) (y-balance uint))
  (begin
    (map-set balances-at-bin bin-id {x-balance: x-balance, y-balance: y-balance, bin-shares: u0})
    (ok true)
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

[View in file](..\contracts\mocks\mock-pool.clar#L206)

`(define-public (transfer ((token-id uint) (amount uint) (sender principal) (recipient principal)) (response bool none))`

Minimal transfer function

<details>
  <summary>Source code:</summary>

```clarity
(define-public (transfer (token-id uint) (amount uint) (sender principal) (recipient principal))
  (ok true)
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

[View in file](..\contracts\mocks\mock-pool.clar#L210)

`(define-public (transfer-memo ((token-id uint) (amount uint) (sender principal) (recipient principal) (memo (buff 34))) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (transfer-memo (token-id uint) (amount uint) (sender principal) (recipient principal) (memo (buff 34)))
  (ok true)
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

[View in file](..\contracts\mocks\mock-pool.clar#L214)

`(define-public (transfer-many ((transfers (list 200 (tuple (amount uint) (recipient principal) (sender principal) (token-id uint))))) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (transfer-many (transfers (list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal})))
  (ok true)
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| transfers | (list 200 (tuple (amount uint) (recipient principal) (sender principal) (token-id uint))) |

### transfer-many-memo

[View in file](..\contracts\mocks\mock-pool.clar#L218)

`(define-public (transfer-many-memo ((transfers (list 200 (tuple (amount uint) (memo (buff 34)) (recipient principal) (sender principal) (token-id uint))))) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (transfer-many-memo (transfers (list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal, memo: (buff 34)})))
  (ok true)
)
```
</details>


**Parameters:**

| Name | Type | 
| --- | --- | 
| transfers | (list 200 (tuple (amount uint) (memo (buff 34)) (recipient principal) (sender principal) (token-id uint))) |

### pool-transfer

[View in file](..\contracts\mocks\mock-pool.clar#L222)

`(define-public (pool-transfer ((token-trait trait_reference) (amount uint) (recipient principal)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (pool-transfer (token-trait <sip-010-trait>) (amount uint) (recipient principal))
  (ok true)
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

[View in file](..\contracts\mocks\mock-pool.clar#L226)

`(define-public (pool-mint ((id uint) (amount uint) (user principal)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (pool-mint (id uint) (amount uint) (user principal))
  (ok true)
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

[View in file](..\contracts\mocks\mock-pool.clar#L230)

`(define-public (pool-burn ((id uint) (amount uint) (user principal)) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (pool-burn (id uint) (amount uint) (user principal))
  (ok true)
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

[View in file](..\contracts\mocks\mock-pool.clar#L234)

`(define-public (create-pool ((x-token-contract principal) (y-token-contract principal) (variable-fees-mgr principal) (fee-addr principal) (core-caller principal) (active-bin int) (step uint) (price uint) (id uint) (name (string-ascii 32)) (symbol (string-ascii 32)) (uri (string-ascii 256))) (response bool none))`



<details>
  <summary>Source code:</summary>

```clarity
(define-public (create-pool
    (x-token-contract principal) (y-token-contract principal)
    (variable-fees-mgr principal) (fee-addr principal) (core-caller principal)
    (active-bin int) (step uint) (price uint)
    (id uint) (name (string-ascii 32)) (symbol (string-ascii 32)) (uri (string-ascii 256))
  )
  (begin
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

## Maps

### balances-at-bin

Minimal storage for testing

```clarity
(define-map balances-at-bin uint {x-balance: uint, y-balance: uint, bin-shares: uint})
```

[View in file](..\contracts\mocks\mock-pool.clar#L40)

### user-balance-at-bin



```clarity
(define-map user-balance-at-bin {id: uint, user: principal} uint)
```

[View in file](..\contracts\mocks\mock-pool.clar#L41)

### user-bins



```clarity
(define-map user-bins principal (list 1001 uint))
```

[View in file](..\contracts\mocks\mock-pool.clar#L42)

## Variables

### pool-id

uint

Minimal data storage for mock pool

```clarity
(define-data-var pool-id uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L14)

### pool-name

(string-ascii 32)



```clarity
(define-data-var pool-name (string-ascii 32) "Mock Pool")
```

[View in file](..\contracts\mocks\mock-pool.clar#L15)

### pool-symbol

(string-ascii 32)



```clarity
(define-data-var pool-symbol (string-ascii 32) "MOCK")
```

[View in file](..\contracts\mocks\mock-pool.clar#L16)

### pool-uri

(string-ascii 256)



```clarity
(define-data-var pool-uri (string-ascii 256) "")
```

[View in file](..\contracts\mocks\mock-pool.clar#L17)

### pool-created

bool



```clarity
(define-data-var pool-created bool false)
```

[View in file](..\contracts\mocks\mock-pool.clar#L18)

### creation-height

uint



```clarity
(define-data-var creation-height uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L19)

### variable-fees-manager

principal



```clarity
(define-data-var variable-fees-manager principal tx-sender)
```

[View in file](..\contracts\mocks\mock-pool.clar#L20)

### fee-address

principal



```clarity
(define-data-var fee-address principal tx-sender)
```

[View in file](..\contracts\mocks\mock-pool.clar#L21)

### x-token

principal



```clarity
(define-data-var x-token principal tx-sender)
```

[View in file](..\contracts\mocks\mock-pool.clar#L22)

### y-token

principal



```clarity
(define-data-var y-token principal tx-sender)
```

[View in file](..\contracts\mocks\mock-pool.clar#L23)

### bin-step

uint



```clarity
(define-data-var bin-step uint u25)
```

[View in file](..\contracts\mocks\mock-pool.clar#L24)

### initial-price

uint



```clarity
(define-data-var initial-price uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L25)

### active-bin-id

int



```clarity
(define-data-var active-bin-id int 0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L26)

### x-protocol-fee

uint



```clarity
(define-data-var x-protocol-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L27)

### x-provider-fee

uint



```clarity
(define-data-var x-provider-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L28)

### x-variable-fee

uint



```clarity
(define-data-var x-variable-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L29)

### y-protocol-fee

uint



```clarity
(define-data-var y-protocol-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L30)

### y-provider-fee

uint



```clarity
(define-data-var y-provider-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L31)

### y-variable-fee

uint



```clarity
(define-data-var y-variable-fee uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L32)

### bin-change-count

uint



```clarity
(define-data-var bin-change-count uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L33)

### last-variable-fees-update

uint



```clarity
(define-data-var last-variable-fees-update uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L34)

### variable-fees-cooldown

uint



```clarity
(define-data-var variable-fees-cooldown uint u0)
```

[View in file](..\contracts\mocks\mock-pool.clar#L35)

### freeze-variable-fees-manager

bool



```clarity
(define-data-var freeze-variable-fees-manager bool false)
```

[View in file](..\contracts\mocks\mock-pool.clar#L36)

### revert

bool



```clarity
(define-data-var revert bool false)
```

[View in file](..\contracts\mocks\mock-pool.clar#L37)

## Constants

### ERR_NOT_AUTHORIZED



Error constants

```clarity
(define-constant ERR_NOT_AUTHORIZED (err u3001))
```

[View in file](..\contracts\mocks\mock-pool.clar#L9)

### ERR_INVALID_AMOUNT





```clarity
(define-constant ERR_INVALID_AMOUNT (err u3002))
```

[View in file](..\contracts\mocks\mock-pool.clar#L10)

### ERR_INVALID_PRINCIPAL





```clarity
(define-constant ERR_INVALID_PRINCIPAL (err u3003))
```

[View in file](..\contracts\mocks\mock-pool.clar#L11)
  