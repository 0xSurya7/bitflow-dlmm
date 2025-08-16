;; mock-pool
;; Minimal mock pool implementation for testing

;; Implement DLMM pool trait only
(impl-trait .dlmm-pool-trait-v-1-1.dlmm-pool-trait)
(use-trait sip-010-trait .sip-010-trait-ft-standard-v-1-1.sip-010-trait)

;; Error constants
(define-constant ERR_NOT_AUTHORIZED (err u3001))
(define-constant ERR_INVALID_AMOUNT (err u3002))
(define-constant ERR_INVALID_PRINCIPAL (err u3003))

;; Minimal data storage for mock pool
(define-data-var pool-id uint u0)
(define-data-var pool-name (string-ascii 32) "Mock Pool")
(define-data-var pool-symbol (string-ascii 32) "MOCK")
(define-data-var pool-uri (string-ascii 256) "")
(define-data-var pool-created bool false)
(define-data-var creation-height uint u0)
(define-data-var variable-fees-manager principal tx-sender)
(define-data-var fee-address principal tx-sender)
(define-data-var x-token principal tx-sender)
(define-data-var y-token principal tx-sender)
(define-data-var bin-step uint u25)
(define-data-var initial-price uint u0)
(define-data-var active-bin-id int 0)
(define-data-var x-protocol-fee uint u0)
(define-data-var x-provider-fee uint u0)
(define-data-var x-variable-fee uint u0)
(define-data-var y-protocol-fee uint u0)
(define-data-var y-provider-fee uint u0)
(define-data-var y-variable-fee uint u0)
(define-data-var bin-change-count uint u0)
(define-data-var last-variable-fees-update uint u0)
(define-data-var variable-fees-cooldown uint u0)
(define-data-var freeze-variable-fees-manager bool false)
(define-data-var revert bool false)

;; Minimal storage for testing
(define-map balances-at-bin uint {x-balance: uint, y-balance: uint, bin-shares: uint})
(define-map user-balance-at-bin {id: uint, user: principal} uint)
(define-map user-bins principal (list 1001 uint))

;; Required trait functions - minimal implementations

;; Get token name
(define-read-only (get-name)
  (ok (var-get pool-name))
)

;; Get token symbol
(define-read-only (get-symbol)
  (ok (var-get pool-symbol))
)

;; Get token decimals
(define-read-only (get-decimals (token-id uint))
  (ok u6)
)

;; Get token uri
(define-read-only (get-token-uri (token-id uint))
  (ok (some (var-get pool-uri)))
)

;; Get total token supply by ID
(define-read-only (get-total-supply (token-id uint))
  (ok (default-to u0 (get bin-shares (map-get? balances-at-bin token-id))))
)

;; Get overall token supply
(define-read-only (get-overall-supply)
  (ok u0)
)

;; Get token balance for a user by ID
(define-read-only (get-balance (token-id uint) (user principal))
  (ok (default-to u0 (map-get? user-balance-at-bin {id: token-id, user: user})))
)

;; Get overall token balance for a user
(define-read-only (get-overall-balance (user principal))
  (ok u0)
)

;; Public setter for testing - allows anyone to trigger revert behavior
(define-public (set-revert (flag bool))
  (ok (var-set revert flag))
)

;; Get all pool data
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

;; Get active bin ID
(define-read-only (get-active-bin-id)
  (begin
    (asserts! (not (var-get revert)) (err u42))
    (ok (var-get active-bin-id))
  )
)

;; Get balance data at a bin
(define-read-only (get-bin-balances (id uint))
  (ok (default-to {x-balance: u0, y-balance: u0, bin-shares: u0} (map-get? balances-at-bin id)))
)

;; Get a list of bins a user has a position in
(define-read-only (get-user-bins (user principal))
  (ok (default-to (list) (map-get? user-bins user)))
)

;; Public setter functions - anyone can call for testing
(define-public (set-pool-uri (uri (string-ascii 256)))
  (ok (var-set pool-uri uri))
)

(define-public (set-variable-fees-manager (manager principal))
  (ok (var-set variable-fees-manager manager))
)

(define-public (set-fee-address (address principal))
  (ok (var-set fee-address address))
)

(define-public (set-active-bin-id (id int))
  (begin
    (var-set active-bin-id id)
    (var-set bin-change-count (+ (var-get bin-change-count) u1))
    (ok true)
  )
)

(define-public (set-x-fees (protocol-fee uint) (provider-fee uint))
  (begin
    (var-set x-protocol-fee protocol-fee)
    (var-set x-provider-fee provider-fee)
    (ok true)
  )
)

(define-public (set-y-fees (protocol-fee uint) (provider-fee uint))
  (begin
    (var-set y-protocol-fee protocol-fee)
    (var-set y-provider-fee provider-fee)
    (ok true)
  )
)

(define-public (set-variable-fees (x-fee uint) (y-fee uint))
  (begin
    (var-set x-variable-fee x-fee)
    (var-set y-variable-fee y-fee)
    (var-set bin-change-count u0)
    (var-set last-variable-fees-update stacks-block-height)
    (ok true)
  )
)

(define-public (set-variable-fees-cooldown (cooldown uint))
  (ok (var-set variable-fees-cooldown cooldown))
)

(define-public (set-freeze-variable-fees-manager)
  (ok (var-set freeze-variable-fees-manager true))
)

(define-public (update-bin-balances (bin-id uint) (x-balance uint) (y-balance uint))
  (begin
    (map-set balances-at-bin bin-id {x-balance: x-balance, y-balance: y-balance, bin-shares: u0})
    (ok true)
  )
)

;; Minimal transfer function
(define-public (transfer (token-id uint) (amount uint) (sender principal) (recipient principal))
  (ok true)
)

(define-public (transfer-memo (token-id uint) (amount uint) (sender principal) (recipient principal) (memo (buff 34)))
  (ok true)
)

(define-public (transfer-many (transfers (list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal})))
  (ok true)
)

(define-public (transfer-many-memo (transfers (list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal, memo: (buff 34)})))
  (ok true)
)

(define-public (pool-transfer (token-trait <sip-010-trait>) (amount uint) (recipient principal))
  (ok true)
)

(define-public (pool-mint (id uint) (amount uint) (user principal))
  (ok true)
)

(define-public (pool-burn (id uint) (amount uint) (user principal))
  (ok true)
)

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