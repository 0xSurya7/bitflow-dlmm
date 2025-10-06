;; dlmm-core-v-1-1

;; Use DLMM pool trait and SIP 010 trait
(use-trait dlmm-pool-trait .dlmm-pool-trait-v-1-1.dlmm-pool-trait)
(use-trait sip-010-trait .sip-010-trait-ft-standard-v-1-1.sip-010-trait)

;; Error constants
(define-constant ERR_NOT_AUTHORIZED (err u1001))
(define-constant ERR_INVALID_AMOUNT (err u1002))
(define-constant ERR_INVALID_PRINCIPAL (err u1003))
(define-constant ERR_ALREADY_ADMIN (err u1004))
(define-constant ERR_ADMIN_LIMIT_REACHED (err u1005))
(define-constant ERR_ADMIN_NOT_IN_LIST (err u1006))
(define-constant ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER (err u1007))
(define-constant ERR_NO_POOL_DATA (err u1008))
(define-constant ERR_POOL_NOT_CREATED (err u1009))
(define-constant ERR_POOL_DISABLED (err u1010))
(define-constant ERR_POOL_ALREADY_CREATED (err u1011))
(define-constant ERR_INVALID_POOL (err u1012))
(define-constant ERR_INVALID_POOL_URI (err u1013))
(define-constant ERR_INVALID_POOL_SYMBOL (err u1014))
(define-constant ERR_INVALID_POOL_NAME (err u1015))
(define-constant ERR_INVALID_TOKEN_DIRECTION (err u1016))
(define-constant ERR_MATCHING_TOKEN_CONTRACTS (err u1017))
(define-constant ERR_INVALID_X_TOKEN (err u1018))
(define-constant ERR_INVALID_Y_TOKEN (err u1019))
(define-constant ERR_INVALID_X_AMOUNT (err u1020))
(define-constant ERR_INVALID_Y_AMOUNT (err u1021))
(define-constant ERR_MINIMUM_X_AMOUNT (err u1022))
(define-constant ERR_MINIMUM_Y_AMOUNT (err u1023))
(define-constant ERR_MINIMUM_LP_AMOUNT (err u1024))
(define-constant ERR_MAXIMUM_X_AMOUNT (err u1025))
(define-constant ERR_MAXIMUM_Y_AMOUNT (err u1026))
(define-constant ERR_INVALID_MIN_DLP_AMOUNT (err u1027))
(define-constant ERR_INVALID_LIQUIDITY_VALUE (err u1028))
(define-constant ERR_INVALID_FEE (err u1029))
(define-constant ERR_MAXIMUM_X_LIQUIDITY_FEE (err u1030))
(define-constant ERR_MAXIMUM_Y_LIQUIDITY_FEE (err u1031))
(define-constant ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA (err u1032))
(define-constant ERR_MINIMUM_BURN_AMOUNT (err u1033))
(define-constant ERR_INVALID_MIN_BURNT_SHARES (err u1034))
(define-constant ERR_INVALID_BIN_STEP (err u1035))
(define-constant ERR_ALREADY_BIN_STEP (err u1036))
(define-constant ERR_BIN_STEP_LIMIT_REACHED (err u1037))
(define-constant ERR_NO_BIN_FACTORS (err u1038))
(define-constant ERR_INVALID_BIN_FACTOR (err u1039))
(define-constant ERR_INVALID_FIRST_BIN_FACTOR (err u1040))
(define-constant ERR_INVALID_CENTER_BIN_FACTOR (err u1041))
(define-constant ERR_UNSORTED_BIN_FACTORS_LIST (err u1042))
(define-constant ERR_INVALID_BIN_FACTORS_LENGTH (err u1043))
(define-constant ERR_INVALID_INITIAL_PRICE (err u1044))
(define-constant ERR_INVALID_BIN_PRICE (err u1045))
(define-constant ERR_MATCHING_BIN_ID (err u1046))
(define-constant ERR_NOT_ACTIVE_BIN (err u1047))
(define-constant ERR_NO_BIN_SHARES (err u1048))
(define-constant ERR_INVALID_VERIFIED_POOL_CODE_HASH (err u1049))
(define-constant ERR_ALREADY_VERIFIED_POOL_CODE_HASH (err u1050))
(define-constant ERR_VERIFIED_POOL_CODE_HASH_LIMIT_REACHED (err u1051))
(define-constant ERR_VERIFIED_POOL_CODE_HASH_NOT_IN_LIST (err u1052))
(define-constant ERR_VARIABLE_FEES_COOLDOWN (err u1053))
(define-constant ERR_VARIABLE_FEES_MANAGER_FROZEN (err u1054))
(define-constant ERR_INVALID_DYNAMIC_CONFIG (err u1055))

;; Contract deployer address
(define-constant CONTRACT_DEPLOYER tx-sender)

;; Address used when burning LP tokens
(define-constant BURN_ADDRESS (unwrap-panic (principal-construct? (if is-in-mainnet 0x16 0x1a) 0x0000000000000000000000000000000000000000)))

;; Number of bins per pool and center bin ID as unsigned ints
(define-constant NUM_OF_BINS u1001)
(define-constant CENTER_BIN_ID (/ NUM_OF_BINS u2))

;; Minimum and maximum bin IDs as signed ints
(define-constant MIN_BIN_ID -500)
(define-constant MAX_BIN_ID 500)

;; Maximum BPS
(define-constant FEE_SCALE_BPS u10000)
(define-constant PRICE_SCALE_BPS u100000000)

;; Admins list and helper var used to remove admins
(define-data-var admins (list 5 principal) (list tx-sender))
(define-data-var admin-helper principal tx-sender)

;; ID of last created pool
(define-data-var last-pool-id uint u0)

;; Allowed bin steps and factors
(define-data-var bin-steps (list 1000 uint) (list u1 u5 u10 u20 u25))
(define-map bin-factors uint (list 1001 uint))

;; Minimum shares required to mint into the active bin when creating a pool
(define-data-var minimum-bin-shares uint u10000)

;; Minimum shares required to burn from the active bin when creating a pool
(define-data-var minimum-burnt-shares uint u1000)

;; Data var used to enable or disable pool creation by anyone
(define-data-var public-pool-creation bool false)

;; List of verified pool code hashes and helper var used to remove hashes
(define-data-var verified-pool-code-hashes (list 10000 (buff 32)) (list 0x))
(define-data-var verified-pool-code-hashes-helper (buff 32) 0x)

;; Define pools map
(define-map pools uint {
  id: uint,
  name: (string-ascii 32),
  symbol: (string-ascii 32),
  pool-contract: principal,
  status: bool
})

;; Define allowed-token-direction map
(define-map allowed-token-direction {x-token: principal, y-token: principal} bool)

;; Define unclaimed-protocol-fees map
(define-map unclaimed-protocol-fees uint {x-fee: uint, y-fee: uint})

;; Define swap-fee-exemptions map
(define-map swap-fee-exemptions {address: principal, id: uint} bool)

;; Get admins list
(define-read-only (get-admins)
  (ok (var-get admins))
)

;; Get admin helper var
(define-read-only (get-admin-helper)
  (ok (var-get admin-helper))
)

;; Get ID of last created pool
(define-read-only (get-last-pool-id)
  (ok (var-get last-pool-id))
)

;; Get a pool by pool ID
(define-read-only (get-pool-by-id (id uint))
  (ok (map-get? pools id))
)

;; Get allowed-token-direction for pool creation
(define-read-only (get-allowed-token-direction (x-token principal) (y-token principal))
  (ok (map-get? allowed-token-direction {x-token: x-token, y-token: y-token}))
)

;; Get unclaimed-protocol-fees for a pool
(define-read-only (get-unclaimed-protocol-fees-by-id (id uint))
  (ok (map-get? unclaimed-protocol-fees id))
)

;; Get swap-fee-exemptions for an address for a pool
(define-read-only (get-swap-fee-exemption-by-id (address principal) (id uint))
  (ok (default-to false (map-get? swap-fee-exemptions {address: address, id: id})))
)

;; Get allowed bin steps
(define-read-only (get-bin-steps)
  (ok (var-get bin-steps))
)

;; Get bin factors by bin step
(define-read-only (get-bin-factors-by-step (step uint))
  (ok (map-get? bin-factors step))
)

;; Get minimum shares required to mint for the active bin when creating a pool
(define-read-only (get-minimum-bin-shares)
  (ok (var-get minimum-bin-shares))
)

;; Get minimum shares required to burn for the active bin when creating a pool
(define-read-only (get-minimum-burnt-shares)
  (ok (var-get minimum-burnt-shares))
)

;; Get public pool creation status
(define-read-only (get-public-pool-creation)
  (ok (var-get public-pool-creation))
)

;; Get verified pool code hashes list
(define-read-only (get-verified-pool-code-hashes)
  (ok (var-get verified-pool-code-hashes))
)

;; Get verified pool code hashes helper var
(define-read-only (get-verified-pool-code-hashes-helper)
  (ok (var-get verified-pool-code-hashes-helper))
)

;; Get bin ID as unsigned int
(define-read-only (get-unsigned-bin-id (bin-id int))
  (ok (to-uint (+ bin-id (to-int CENTER_BIN_ID))))
)

;; Get bin ID as signed int
(define-read-only (get-signed-bin-id (bin-id uint))
  (ok (- (to-int bin-id) (to-int CENTER_BIN_ID)))
)

;; Get price for a specific bin
(define-read-only (get-bin-price (initial-price uint) (bin-step uint) (bin-id int))
  (let (
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))
    (bin-factors-list (unwrap! (map-get? bin-factors bin-step) ERR_NO_BIN_FACTORS))
    (bin-factor (unwrap! (element-at? bin-factors-list unsigned-bin-id) ERR_INVALID_BIN_FACTOR))
    (bin-price (/ (* initial-price bin-factor) PRICE_SCALE_BPS))
  )
    (asserts! (> bin-price u0) ERR_INVALID_BIN_PRICE)
    (ok bin-price)
  )
)

;; Get liquidity value when adding liquidity to a bin by rebasing x-amount to y-units
(define-read-only (get-liquidity-value (x-amount uint) (y-amount uint) (bin-price uint))
  (ok (+ (* bin-price x-amount) y-amount))
)

;; Get pool verification status @NOTE use contract-hash?
(define-read-only (get-is-pool-verified (pool-trait <dlmm-pool-trait>))
  (ok (is-some (index-of (var-get verified-pool-code-hashes) 0x)))
)

;; Add a new bin step and its factors
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

    ;; Assert first factor is greater than 0
    (asserts! (> (unwrap! (element-at? factors u0) ERR_INVALID_BIN_FACTORS_LENGTH) u0) ERR_INVALID_FIRST_BIN_FACTOR)

    ;; Assert center factor is equal to PRICE_SCALE_BPS
    (asserts! (is-eq (unwrap! (element-at? factors CENTER_BIN_ID) ERR_INVALID_BIN_FACTORS_LENGTH) PRICE_SCALE_BPS) ERR_INVALID_CENTER_BIN_FACTOR)

    ;; Assert factors list is in ascending order
    (try! (fold fold-are-bin-factors-ascending factors (ok u0)))

    ;; Add bin step to list with max length of 1000
    (var-set bin-steps (unwrap! (as-max-len? (append bin-steps-list step) u1000) ERR_BIN_STEP_LIMIT_REACHED))

    ;; Add bin factors to bin-factors mapping
    (map-set bin-factors step factors)

    ;; Print function data and return true
    (print {action: "add-bin-step", caller: caller, data: {step: step, factors: factors}})
    (ok true)
  )
)

;; Set minimum shares required to mint and burn for the active bin when creating a pool
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

;; Enable or disable public pool creation
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

;; Add a new verified pool code hash
(define-public (add-verified-pool-code-hash (hash (buff 32)))
  (let (
    (verified-pool-code-hashes-list (var-get verified-pool-code-hashes))
    (caller tx-sender)
  )
    ;; Assert caller is an admin and new code hash is not already in the list
    (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
    (asserts! (is-none (index-of verified-pool-code-hashes-list hash)) ERR_ALREADY_VERIFIED_POOL_CODE_HASH)

    ;; Assert that hash length is 32
    (asserts! (is-eq (len hash) u32) ERR_INVALID_VERIFIED_POOL_CODE_HASH)

    ;; Add code hash to verified pool code hashes list with max length of 10000
    (var-set verified-pool-code-hashes (unwrap! (as-max-len? (append verified-pool-code-hashes-list hash) u10000) ERR_VERIFIED_POOL_CODE_HASH_LIMIT_REACHED))

    ;; Print function data and return true
    (print {action: "add-verified-pool-code-hash", caller: caller, data: {hash: hash}})
    (ok true)
  )
)

;; Remove a verified pool code hash
(define-public (remove-verified-pool-code-hash (hash (buff 32)))
  (let (
    (verified-pool-code-hashes-list (var-get verified-pool-code-hashes))
    (caller tx-sender)
  )
    ;; Assert caller is an admin and code hash to remove is in the list
    (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
    (asserts! (is-some (index-of verified-pool-code-hashes-list hash)) ERR_VERIFIED_POOL_CODE_HASH_NOT_IN_LIST)

    ;; Set verified-pool-code-hashes-helper to hash to remove and filter verified-pool-code-hashes to remove hash
    (var-set verified-pool-code-hashes-helper hash)
    (var-set verified-pool-code-hashes (filter verified-pool-code-hashes-not-removable verified-pool-code-hashes-list))

    ;; Print function data and return true
    (print {action: "remove-verified-pool-code-hash", caller: caller, data: {hash: hash}})
    (ok true)
  )
)

;; Set swap fee exemption for an address for a pool
(define-public (set-swap-fee-exemption (pool-trait <dlmm-pool-trait>) (address principal) (exempt bool))
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (pool-id (get pool-id pool-data))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and pool is created and valid
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-valid-pool pool-id (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

      ;; Assert that address is standard principal
      (asserts! (is-standard address) ERR_INVALID_PRINCIPAL) 

      ;; Update swap-fee-exemptions mapping
      (map-set swap-fee-exemptions {address: address, id: pool-id} exempt)

      ;; Print function data and return true
      (print {
        action: "set-swap-fee-exemption",
        caller: caller,
        data: {
          pool-id: pool-id,
          pool-name: (get pool-name pool-data),
          pool-contract: (contract-of pool-trait),
          address: address,
          exempt: exempt
        }
      })
      (ok true)
    )
  )
)

;; Claim protocol fees for a pool
(define-public (claim-protocol-fees
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
  )
  (let (
    ;; Gather all pool data
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (pool-id (get pool-id pool-data))
    (pool-contract (contract-of pool-trait))
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
      ;; Assert that pool is created and valid
      (asserts! (is-valid-pool pool-id (contract-of pool-trait)) ERR_INVALID_POOL)
      (asserts! (get pool-created pool-data) ERR_POOL_NOT_CREATED)

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

      ;; Update unclaimed-protocol-fees for pool
      (map-set unclaimed-protocol-fees pool-id {x-fee: u0, y-fee: u0})

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

;; Set pool uri for a pool
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

;; Set pool status for a pool
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

;; Set variable fees manager for a pool
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

;; Set fee address for a pool
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

;; Set variable fees for a pool
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

;; Set x fees for a pool
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

;; Set y fees for a pool
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

;; Set variable fees cooldown for a pool
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

;; Make variable fees manager immutable for a pool
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

;; Set dynamic config for a pool
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

      ;; Assert that config is greater than 0
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

;; Reset variable fees for a pool
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

;; Create a new pool
(define-public (create-pool 
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (x-amount-active-bin uint) (y-amount-active-bin uint) (burn-amount-active-bin uint)
    (x-protocol-fee uint) (x-provider-fee uint)
    (y-protocol-fee uint) (y-provider-fee uint)
    (bin-step uint) (variable-fees-cooldown uint) (freeze-variable-fees-manager bool)
    (dynamic-config (optional (buff 4096))) (fee-address principal)
    (uri (string-ascii 256)) (status bool)
  )
  (let (
    ;; Gather all pool data and pool contract
    (pool-data (unwrap! (contract-call? pool-trait get-pool) ERR_NO_POOL_DATA))
    (pool-contract (contract-of pool-trait))
    (x-variable-fee (get x-variable-fee pool-data))
    (y-variable-fee (get y-variable-fee pool-data))

    ;; Get pool ID and create pool symbol and name
    (new-pool-id (+ (var-get last-pool-id) u1))
    (symbol (unwrap! (create-symbol x-token-trait y-token-trait) ERR_INVALID_POOL_SYMBOL))
    (name (concat symbol "-LP"))

    ;; Check if pool code hash is verified @NOTE use contract-hash?
    (pool-verified-check (is-some (index-of (var-get verified-pool-code-hashes) 0x)))

    ;; Get token contracts
    (x-token-contract (contract-of x-token-trait))
    (y-token-contract (contract-of y-token-trait))

    ;; Get dynamic config if provided
    (unwrapped-dynamic-config (if (is-some dynamic-config) (unwrap-panic dynamic-config) 0x))

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

      ;; Assert that dlp minted meets minimum bin shares required
      (asserts! (>= dlp (var-get minimum-bin-shares)) ERR_MINIMUM_LP_AMOUNT)

      ;; Assert that burn-amount-active-bin meets minimum shares required to burn
      (asserts! (>= burn-amount-active-bin (var-get minimum-burnt-shares)) ERR_MINIMUM_BURN_AMOUNT)

      ;; Assert that dlp is greater than or equal to 0 after subtracting burn amount
      (asserts! (>= (- dlp burn-amount-active-bin) u0) ERR_MINIMUM_LP_AMOUNT)

      ;; Assert that initial price is greater than 0
      (asserts! (> initial-price u0) ERR_INVALID_INITIAL_PRICE)

      ;; Assert that length of pool uri, symbol, and name is greater than 0
      (asserts! (> (len uri) u0) ERR_INVALID_POOL_URI)
      (asserts! (> (len symbol) u0) ERR_INVALID_POOL_SYMBOL)
      (asserts! (> (len name) u0) ERR_INVALID_POOL_NAME)

      ;; Assert that fees are less than maximum BPS
      (asserts! (< (+ x-protocol-fee x-provider-fee x-variable-fee) FEE_SCALE_BPS) ERR_INVALID_FEE)
      (asserts! (< (+ y-protocol-fee y-provider-fee y-variable-fee) FEE_SCALE_BPS) ERR_INVALID_FEE)

      ;; Assert that bin step is valid
      (asserts! (is-some (index-of (var-get bin-steps) bin-step)) ERR_INVALID_BIN_STEP)

      ;; Assert that bin price is valid at extremes
      (try! (get-bin-price initial-price bin-step MIN_BIN_ID))

      ;; Create pool, set fees, and set variable fees cooldown
      (try! (contract-call? pool-trait create-pool x-token-contract y-token-contract CONTRACT_DEPLOYER fee-address caller 0 bin-step initial-price new-pool-id name symbol uri))
      (try! (contract-call? pool-trait set-x-fees x-protocol-fee x-provider-fee))
      (try! (contract-call? pool-trait set-y-fees y-protocol-fee y-provider-fee))
      (try! (contract-call? pool-trait set-variable-fees-cooldown variable-fees-cooldown))

      ;; Freeze variable fees manager if freeze-variable-fees-manager is true
      (if freeze-variable-fees-manager (try! (contract-call? pool-trait set-freeze-variable-fees-manager)) false)

      ;; Set dynamic config if unwrapped-dynamic-config is greater than 0
      (if (> (len unwrapped-dynamic-config) u0) (try! (contract-call? pool-trait set-dynamic-config unwrapped-dynamic-config)) false)

      ;; Update ID of last created pool, add pool to pools map, and add pool to unclaimed-protocol-fees map
      (var-set last-pool-id new-pool-id)
      (map-set pools new-pool-id {id: new-pool-id, name: name, symbol: symbol, pool-contract: pool-contract, status: status})
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

      ;; Mint burn amount LP tokens to BURN_ADDRESS
      (try! (contract-call? pool-trait pool-mint CENTER_BIN_ID burn-amount-active-bin BURN_ADDRESS))

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
          x-variable-fee: x-variable-fee,
          y-protocol-fee: y-protocol-fee,
          y-provider-fee: y-provider-fee,
          y-variable-fee: y-variable-fee,
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
          freeze-variable-fees-manager: freeze-variable-fees-manager,
          dynamic-config: dynamic-config
        }
      })
      (ok true)
    )
  )
)

;; Swap x token for y token via a bin in a pool
(define-public (swap-x-for-y
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (bin-id int) (x-amount uint)
  )
  (let (
    ;; Gather all pool data and check if pool is valid
    (caller tx-sender)
    (pool-data (unwrap! (contract-call? pool-trait get-pool-for-swap true) ERR_NO_POOL_DATA))
    (pool-id (get pool-id pool-data))
    (pool-contract (contract-of pool-trait))
    (pool-validity-check (asserts! (is-valid-pool pool-id pool-contract) ERR_INVALID_POOL))
    (x-token (get x-token pool-data))
    (y-token (get y-token pool-data))
    (bin-step (get bin-step pool-data))
    (initial-price (get initial-price pool-data))
    (active-bin-id (get active-bin-id pool-data))

    ;; Check if caller is fee exempt and calculate swap fees
    (swap-fee-exemption (default-to false (map-get? swap-fee-exemptions {address: caller, id: pool-id})))
    (protocol-fee (if swap-fee-exemption u0 (get protocol-fee pool-data)))
    (provider-fee (if swap-fee-exemption u0 (get provider-fee pool-data)))
    (variable-fee (if swap-fee-exemption u0 (get variable-fee pool-data)))

    ;; Convert bin-id to an unsigned bin-id
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))

    ;; Get balances at bin
    (bin-balances (try! (contract-call? pool-trait get-bin-balances unsigned-bin-id)))
    (x-balance (get x-balance bin-balances))
    (y-balance (get y-balance bin-balances))

    ;; Check if both initial bin balances are equal to 0
    (initial-bin-balances-empty (and (is-eq x-balance u0) (is-eq y-balance u0)))

    ;; Get price at bin
    (bin-price (unwrap! (get-bin-price initial-price bin-step bin-id) ERR_INVALID_BIN_PRICE))

    ;; Calculate maximum x-amount with fees
    (swap-fee-total (+ protocol-fee provider-fee variable-fee))
    (max-x-amount (/ (+ (* y-balance PRICE_SCALE_BPS) (- bin-price u1)) bin-price))
    (updated-max-x-amount (if (> swap-fee-total u0) (/ (* max-x-amount FEE_SCALE_BPS) (- FEE_SCALE_BPS swap-fee-total)) max-x-amount))

    ;; Calculate x-amount to use for the swap
    (updated-x-amount (if (>= x-amount updated-max-x-amount) updated-max-x-amount x-amount))

    ;; Calculate fees and dx
    (x-amount-fees-total (/ (* updated-x-amount swap-fee-total) FEE_SCALE_BPS))
    (x-amount-fees-protocol (/ (* updated-x-amount protocol-fee) FEE_SCALE_BPS))
    (x-amount-fees-variable (/ (* updated-x-amount variable-fee) FEE_SCALE_BPS))
    (x-amount-fees-provider (- x-amount-fees-total x-amount-fees-protocol x-amount-fees-variable))
    (dx (- updated-x-amount x-amount-fees-total))

    ;; Calculate dy
    (dy-before-cap (/ (* dx bin-price) PRICE_SCALE_BPS))
    (dy (if (> dy-before-cap y-balance) y-balance dy-before-cap))

    ;; Calculate updated bin balances
    (updated-x-balance (+ x-balance dx x-amount-fees-provider x-amount-fees-variable))
    (updated-y-balance (- y-balance dy))

    ;; Calculate new active bin ID (default to bin-id if at the edge of the bin range)
    (updated-active-bin-id (if (and (or (is-eq updated-y-balance u0) initial-bin-balances-empty) (> bin-id MIN_BIN_ID))
                               (- bin-id 1)
                               bin-id))

    ;; Get current unclaimed protocol fees for pool
    (current-unclaimed-protocol-fees (unwrap! (map-get? unclaimed-protocol-fees pool-id) ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA))
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

      ;; Transfer updated-x-amount x tokens from caller to pool-contract
      (if (not initial-bin-balances-empty)
          (try! (contract-call? x-token-trait transfer updated-x-amount caller pool-contract none))
          false)

      ;; Transfer dy y tokens from pool-contract to caller
      (if (not initial-bin-balances-empty)
          (try! (contract-call? pool-trait pool-transfer y-token-trait dy caller))
          false)

      ;; Update unclaimed-protocol-fees for pool
      (if (> x-amount-fees-protocol u0)
          (map-set unclaimed-protocol-fees pool-id (merge current-unclaimed-protocol-fees {
            x-fee: (+ (get x-fee current-unclaimed-protocol-fees) x-amount-fees-protocol)
          }))
          false)

      ;; Update bin balances
      (if (not initial-bin-balances-empty)
          (try! (contract-call? pool-trait update-bin-balances unsigned-bin-id updated-x-balance updated-y-balance))
          false)

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
          updated-x-amount: updated-x-amount,
          updated-max-x-amount: updated-max-x-amount,
          x-amount-fees-protocol: x-amount-fees-protocol,
          x-amount-fees-provider: x-amount-fees-provider,
          x-amount-fees-variable: x-amount-fees-variable,
          swap-fee-exemption: swap-fee-exemption,
          dx: dx,
          dy: dy,
          updated-x-balance: updated-x-balance,
          updated-y-balance: updated-y-balance,
          initial-bin-balances-empty: initial-bin-balances-empty
        }
      })
      (ok {in: updated-x-amount, out: dy})
    )
  )
)

;; Swap y token for x token via a bin in a pool
(define-public (swap-y-for-x
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (bin-id int) (y-amount uint)
  )
  (let (
    ;; Gather all pool data and check if pool is valid
    (caller tx-sender)
    (pool-data (unwrap! (contract-call? pool-trait get-pool-for-swap false) ERR_NO_POOL_DATA))
    (pool-id (get pool-id pool-data))
    (pool-contract (contract-of pool-trait))
    (pool-validity-check (asserts! (is-valid-pool pool-id pool-contract) ERR_INVALID_POOL))
    (x-token (get x-token pool-data))
    (y-token (get y-token pool-data))
    (bin-step (get bin-step pool-data))
    (initial-price (get initial-price pool-data))
    (active-bin-id (get active-bin-id pool-data))

    ;; Check if caller is fee exempt and calculate swap fees
    (swap-fee-exemption (default-to false (map-get? swap-fee-exemptions {address: caller, id: pool-id})))
    (protocol-fee (if swap-fee-exemption u0 (get protocol-fee pool-data)))
    (provider-fee (if swap-fee-exemption u0 (get provider-fee pool-data)))
    (variable-fee (if swap-fee-exemption u0 (get variable-fee pool-data)))

    ;; Convert bin-id to an unsigned bin-id
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))

    ;; Get balances at bin
    (bin-balances (try! (contract-call? pool-trait get-bin-balances unsigned-bin-id)))
    (x-balance (get x-balance bin-balances))
    (y-balance (get y-balance bin-balances))

    ;; Check if both initial bin balances are equal to 0
    (initial-bin-balances-empty (and (is-eq x-balance u0) (is-eq y-balance u0)))

    ;; Get price at bin
    (bin-price (unwrap! (get-bin-price initial-price bin-step bin-id) ERR_INVALID_BIN_PRICE))

    ;; Calculate maximum y-amount with fees
    (swap-fee-total (+ protocol-fee provider-fee variable-fee))
    (max-y-amount (/ (+ (* x-balance bin-price) (- PRICE_SCALE_BPS u1)) PRICE_SCALE_BPS))
    (updated-max-y-amount (if (> swap-fee-total u0) (/ (* max-y-amount FEE_SCALE_BPS) (- FEE_SCALE_BPS swap-fee-total)) max-y-amount))

    ;; Calculate y-amount to use for the swap
    (updated-y-amount (if (>= y-amount updated-max-y-amount) updated-max-y-amount y-amount))

    ;; Calculate fees and dy
    (y-amount-fees-total (/ (* updated-y-amount swap-fee-total) FEE_SCALE_BPS))
    (y-amount-fees-protocol (/ (* updated-y-amount protocol-fee) FEE_SCALE_BPS))
    (y-amount-fees-variable (/ (* updated-y-amount variable-fee) FEE_SCALE_BPS))
    (y-amount-fees-provider (- y-amount-fees-total y-amount-fees-protocol y-amount-fees-variable))
    (dy (- updated-y-amount y-amount-fees-total))

    ;; Calculate dx
    (dx-before-cap (/ (* dy PRICE_SCALE_BPS) bin-price))
    (dx (if (> dx-before-cap x-balance) x-balance dx-before-cap))

    ;; Calculate updated bin balances
    (updated-x-balance (- x-balance dx))
    (updated-y-balance (+ y-balance dy y-amount-fees-provider y-amount-fees-variable))

    ;; Calculate new active bin ID (default to bin-id if at the edge of the bin range)
    (updated-active-bin-id (if (and (or (is-eq updated-x-balance u0) initial-bin-balances-empty) (< bin-id MAX_BIN_ID))
                               (+ bin-id 1)
                               bin-id))

    ;; Get current unclaimed protocol fees for pool
    (current-unclaimed-protocol-fees (unwrap! (map-get? unclaimed-protocol-fees pool-id) ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA))
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

      ;; Transfer updated-y-amount y tokens from caller to pool-contract
      (if (not initial-bin-balances-empty)
          (try! (contract-call? y-token-trait transfer updated-y-amount caller pool-contract none))
          false)

      ;; Transfer dx x tokens from pool-contract to caller
      (if (not initial-bin-balances-empty)
          (try! (contract-call? pool-trait pool-transfer x-token-trait dx caller))
          false)

      ;; Update unclaimed-protocol-fees for pool
      (if (> y-amount-fees-protocol u0)
          (map-set unclaimed-protocol-fees pool-id (merge current-unclaimed-protocol-fees {
            y-fee: (+ (get y-fee current-unclaimed-protocol-fees) y-amount-fees-protocol)
          }))
          false)

      ;; Update bin balances
      (if (not initial-bin-balances-empty)
          (try! (contract-call? pool-trait update-bin-balances unsigned-bin-id updated-x-balance updated-y-balance))
          false)

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
          updated-y-amount: updated-y-amount,
          updated-max-y-amount: updated-max-y-amount,
          y-amount-fees-protocol: y-amount-fees-protocol,
          y-amount-fees-provider: y-amount-fees-provider,
          y-amount-fees-variable: y-amount-fees-variable,
          swap-fee-exemption: swap-fee-exemption,
          dy: dy,
          dx: dx,
          updated-x-balance: updated-x-balance,
          updated-y-balance: updated-y-balance,
          initial-bin-balances-empty: initial-bin-balances-empty
        }
      })
      (ok {in: updated-y-amount, out: dx})
    )
  )
)

;; Add liquidity to a bin in a pool
(define-public (add-liquidity
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (bin-id int) (x-amount uint) (y-amount uint) (min-dlp uint)
    (max-x-liquidity-fee uint) (max-y-liquidity-fee uint)
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
    (dlp-post-fees (if (is-eq bin-shares u0)
      (let (
        (intended-dlp (sqrti add-liquidity-value-post-fees))
        (burn-amount (var-get minimum-burnt-shares))
      )
        (asserts! (>= intended-dlp (var-get minimum-bin-shares)) ERR_MINIMUM_LP_AMOUNT)
        (try! (contract-call? pool-trait pool-mint unsigned-bin-id burn-amount BURN_ADDRESS))
        (- intended-dlp burn-amount)
      )
      (if (is-eq bin-liquidity-value u0)
          (sqrti add-liquidity-value-post-fees)
          (/ (* add-liquidity-value-post-fees bin-shares) bin-liquidity-value))))

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

      ;; Assert that x-amount-fees-liquidity is less than or equal to max-x-liquidity-fee
      (asserts! (<= x-amount-fees-liquidity max-x-liquidity-fee) ERR_MAXIMUM_X_LIQUIDITY_FEE)

      ;; Assert that y-amount-fees-liquidity is less than or equal to max-y-liquidity-fee
      (asserts! (<= y-amount-fees-liquidity max-y-liquidity-fee) ERR_MAXIMUM_Y_LIQUIDITY_FEE)

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
          max-x-liquidity-fee: max-x-liquidity-fee,
          max-y-liquidity-fee: max-y-liquidity-fee,
          add-liquidity-value-post-fees: add-liquidity-value-post-fees,
          bin-liquidity-value: bin-liquidity-value,
          updated-x-balance: updated-x-balance,
          updated-y-balance: updated-y-balance,
          updated-bin-shares: (+ bin-shares dlp-post-fees)
        }
      })
      (ok dlp-post-fees)
    )
  )
)

;; Withdraw liquidity from a bin in a pool
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

    ;; Calculate updated bin balances
    (updated-x-balance (- x-balance x-amount))
    (updated-y-balance (- y-balance y-amount))
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
      (try! (contract-call? pool-trait update-bin-balances-on-withdraw unsigned-bin-id updated-x-balance updated-y-balance bin-shares))

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
          updated-bin-shares: (- bin-shares amount)
        }
      })
      (ok {x-amount: x-amount, y-amount: y-amount})
    )
  )
)

;; Move liquidity from one bin to another in a pool
(define-public (move-liquidity
    (pool-trait <dlmm-pool-trait>)
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (from-bin-id int) (to-bin-id int) (amount uint) (min-dlp uint)
    (max-x-liquidity-fee uint) (max-y-liquidity-fee uint)
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

    ;; Convert bin IDs to unsigned bin IDs
    (unsigned-from-bin-id (to-uint (+ from-bin-id (to-int CENTER_BIN_ID))))
    (unsigned-to-bin-id (to-uint (+ to-bin-id (to-int CENTER_BIN_ID))))

    ;; Get balances at from-bin-id
    (bin-balances-a (try! (contract-call? pool-trait get-bin-balances unsigned-from-bin-id)))
    (x-balance-a (get x-balance bin-balances-a))
    (y-balance-a (get y-balance bin-balances-a))
    (bin-shares-a (get bin-shares bin-balances-a))

    ;; Assert that bin shares for from-bin-id is greater than 0
    (bin-shares-check (asserts! (> bin-shares-a u0) ERR_NO_BIN_SHARES))

    ;; Calculate x-amount and y-amount to withdraw from from-bin-id
    (x-amount (/ (* amount x-balance-a) bin-shares-a))
    (y-amount (/ (* amount y-balance-a) bin-shares-a))

    ;; Calculate updated bin balances for from-bin-id
    (updated-x-balance-a (- x-balance-a x-amount))
    (updated-y-balance-a (- y-balance-a y-amount))

    ;; Get balances at to-bin-id
    (bin-balances-b (try! (contract-call? pool-trait get-bin-balances unsigned-to-bin-id)))
    (x-balance-b (get x-balance bin-balances-b))
    (y-balance-b (get y-balance bin-balances-b))
    (bin-shares-b (get bin-shares bin-balances-b))

    ;; Get price at to-bin-id
    (bin-price (unwrap! (get-bin-price initial-price bin-step to-bin-id) ERR_INVALID_BIN_PRICE))

    ;; Scale up y-amount and y-balance-b
    (y-amount-scaled (* y-amount PRICE_SCALE_BPS))
    (y-balance-b-scaled (* y-balance-b PRICE_SCALE_BPS))

    ;; Get current liquidity values for to-bin-id and calculate dlp without fees
    (add-liquidity-value (unwrap! (get-liquidity-value x-amount y-amount-scaled bin-price) ERR_INVALID_LIQUIDITY_VALUE))
    (bin-liquidity-value (unwrap! (get-liquidity-value x-balance-b y-balance-b-scaled bin-price) ERR_INVALID_LIQUIDITY_VALUE))
    (dlp (if (or (is-eq bin-shares-b u0) (is-eq bin-liquidity-value u0))
             (sqrti add-liquidity-value)
             (/ (* add-liquidity-value bin-shares-b) bin-liquidity-value)))

    ;; Calculate liquidity fees if adding liquidity to active bin based on ratio of bin balances
    (x-amount-fees-liquidity (if (is-eq to-bin-id active-bin-id)
      (let (
        (x-liquidity-fee (+ (get x-protocol-fee pool-data) (get x-provider-fee pool-data) (get x-variable-fee pool-data)))

        ;; Calculate withdrawable x-amount without fees
        (x-amount-withdrawable (/ (* dlp (+ x-balance-b x-amount)) (+ bin-shares-b dlp)))

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
    (y-amount-fees-liquidity (if (is-eq to-bin-id active-bin-id)
      (let (
        (y-liquidity-fee (+ (get y-protocol-fee pool-data) (get y-provider-fee pool-data) (get y-variable-fee pool-data)))

        ;; Calculate withdrawable y-amount without fees
        (y-amount-withdrawable (/ (* dlp (+ y-balance-b y-amount)) (+ bin-shares-b dlp)))

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

    ;; Calculate final x and y amounts post fees for to-bin-id
    (x-amount-post-fees (- x-amount x-amount-fees-liquidity))
    (y-amount-post-fees (- y-amount y-amount-fees-liquidity))
    (y-amount-post-fees-scaled (* y-amount-post-fees PRICE_SCALE_BPS))

    ;; Get final liquidity value for to-bin-id and calculate dlp post fees
    (add-liquidity-value-post-fees (unwrap! (get-liquidity-value x-amount-post-fees y-amount-post-fees-scaled bin-price) ERR_INVALID_LIQUIDITY_VALUE))
    (dlp-post-fees (if (is-eq bin-shares-b u0)
      (let (
        (intended-dlp (sqrti add-liquidity-value-post-fees))
        (burn-amount (var-get minimum-burnt-shares))
      )
        (asserts! (>= intended-dlp (var-get minimum-bin-shares)) ERR_MINIMUM_LP_AMOUNT)
        (try! (contract-call? pool-trait pool-mint unsigned-to-bin-id burn-amount BURN_ADDRESS))
        (- intended-dlp burn-amount)
      )
      (if (is-eq bin-liquidity-value u0)
          (sqrti add-liquidity-value-post-fees)
          (/ (* add-liquidity-value-post-fees bin-shares-b) bin-liquidity-value))))

    ;; Calculate updated bin balances for to-bin-id
    (updated-x-balance-b (+ x-balance-b x-amount))
    (updated-y-balance-b (+ y-balance-b y-amount))
    (caller tx-sender)
  )
    (begin
      ;; Assert that pool-status is true and correct token traits are used
      (asserts! (is-enabled-pool (get pool-id pool-data)) ERR_POOL_DISABLED)
      (asserts! (is-eq (contract-of x-token-trait) x-token) ERR_INVALID_X_TOKEN)
      (asserts! (is-eq (contract-of y-token-trait) y-token) ERR_INVALID_Y_TOKEN)

      ;; Assert that amount is greater than 0
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)

      ;; Assert that x-amount + y-amount is greater than 0
      (asserts! (> (+ x-amount y-amount) u0) ERR_INVALID_AMOUNT)

      ;; Assert that from-bin-id is not equal to to-bin-id
      (asserts! (not (is-eq from-bin-id to-bin-id)) ERR_MATCHING_BIN_ID)

      ;; Assert that correct token amounts are being added based on to-bin-id and active-bin-id
      (asserts! (or (>= to-bin-id active-bin-id) (is-eq x-amount u0)) ERR_INVALID_X_AMOUNT)
      (asserts! (or (<= to-bin-id active-bin-id) (is-eq y-amount u0)) ERR_INVALID_Y_AMOUNT)

      ;; Assert that min-dlp is greater than 0 and dlp-post-fees is greater than or equal to min-dlp
      (asserts! (> min-dlp u0) ERR_INVALID_MIN_DLP_AMOUNT)
      (asserts! (>= dlp-post-fees min-dlp) ERR_MINIMUM_LP_AMOUNT)

      ;; Assert that x-amount-fees-liquidity is less than or equal to max-x-liquidity-fee
      (asserts! (<= x-amount-fees-liquidity max-x-liquidity-fee) ERR_MAXIMUM_X_LIQUIDITY_FEE)

      ;; Assert that y-amount-fees-liquidity is less than or equal to max-y-liquidity-fee
      (asserts! (<= y-amount-fees-liquidity max-y-liquidity-fee) ERR_MAXIMUM_Y_LIQUIDITY_FEE)

      ;; Update bin balances for from-bin-id
      (try! (contract-call? pool-trait update-bin-balances-on-withdraw unsigned-from-bin-id updated-x-balance-a updated-y-balance-a bin-shares-a))

      ;; Burn LP tokens from caller for from-bin-id
      (try! (contract-call? pool-trait pool-burn unsigned-from-bin-id amount caller))

      ;; Update bin balances for to-bin-id
      (try! (contract-call? pool-trait update-bin-balances unsigned-to-bin-id updated-x-balance-b updated-y-balance-b))

      ;; Mint LP tokens to caller for to-bin-id
      (try! (contract-call? pool-trait pool-mint unsigned-to-bin-id dlp-post-fees caller))

      ;; Print move liquidity data and return number of LP tokens the caller received
      (print {
        action: "move-liquidity",
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
          from-bin-id: from-bin-id,
          to-bin-id: to-bin-id,
          unsigned-from-bin-id: unsigned-from-bin-id,
          unsigned-to-bin-id: unsigned-to-bin-id,
          amount: amount,
          x-amount: x-amount-post-fees,
          y-amount: y-amount-post-fees,
          x-amount-fees-liquidity: x-amount-fees-liquidity,
          y-amount-fees-liquidity: y-amount-fees-liquidity,
          dlp: dlp-post-fees,
          min-dlp: min-dlp,
          max-x-liquidity-fee: max-x-liquidity-fee,
          max-y-liquidity-fee: max-y-liquidity-fee,
          add-liquidity-value-post-fees: add-liquidity-value-post-fees,
          bin-liquidity-value: bin-liquidity-value,
          updated-x-balance-a: updated-x-balance-a,
          updated-y-balance-a: updated-y-balance-a,
          updated-bin-shares-a: (- bin-shares-a amount),
          updated-x-balance-b: updated-x-balance-b,
          updated-y-balance-b: updated-y-balance-b,
          updated-bin-shares-b: (+ bin-shares-b dlp-post-fees)
        }
      })
      (ok dlp-post-fees)
    )
  )
)

;; Add an admin to the admins list
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

;; Remove an admin from the admins list
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

;; Set swap fee exemption for multiple addresses across multiple pools
(define-public (set-swap-fee-exemption-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (addresses (list 120 principal))
    (exempts (list 120 bool))
  )
  (ok (map set-swap-fee-exemption pool-traits addresses exempts))
)

;; Claim protocol fees for multiple pools
(define-public (claim-protocol-fees-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (x-token-traits (list 120 <sip-010-trait>))
    (y-token-traits (list 120 <sip-010-trait>))
  )
  (ok (map claim-protocol-fees pool-traits x-token-traits y-token-traits))
)

;; Set pool uri for multiple pools
(define-public (set-pool-uri-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (uris (list 120 (string-ascii 256)))
  )
  (ok (map set-pool-uri pool-traits uris))
)

;; Set pool status for multiple pools
(define-public (set-pool-status-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (statuses (list 120 bool))
  )
  (ok (map set-pool-status pool-traits statuses))
)

;; Set variable fees manager for multiple pools
(define-public (set-variable-fees-manager-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (managers (list 120 principal))
  )
  (ok (map set-variable-fees-manager pool-traits managers))
)

;; Set fee address for multiple pools
(define-public (set-fee-address-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (addresses (list 120 principal))
  )
  (ok (map set-fee-address pool-traits addresses))
)

;; Set variable fees for multiple pools
(define-public (set-variable-fees-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (x-fees (list 120 uint))
    (y-fees (list 120 uint))
  )
  (ok (map set-variable-fees pool-traits x-fees y-fees))
)

;; Set x fees for multiple pools
(define-public (set-x-fees-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (protocol-fees (list 120 uint))
    (provider-fees (list 120 uint))
  )
  (ok (map set-x-fees pool-traits protocol-fees provider-fees))
)

;; Set y fees for multiple pools
(define-public (set-y-fees-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (protocol-fees (list 120 uint))
    (provider-fees (list 120 uint))
  )
  (ok (map set-y-fees pool-traits protocol-fees provider-fees))
)

;; Set variable fees cooldown for multiple pools
(define-public (set-variable-fees-cooldown-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (cooldowns (list 120 uint))
  )
  (ok (map set-variable-fees-cooldown pool-traits cooldowns))
)

;; Set freeze variable fees manager for multiple pools
(define-public (set-freeze-variable-fees-manager-multi (pool-traits (list 120 <dlmm-pool-trait>)))
  (ok (map set-freeze-variable-fees-manager pool-traits))
)

;; Reset variable fees for multiple pools
(define-public (reset-variable-fees-multi (pool-traits (list 120 <dlmm-pool-trait>)))
  (ok (map reset-variable-fees pool-traits))
)

;; Set dynamic config for multiple pools
(define-public (set-dynamic-config-multi
    (pool-traits (list 120 <dlmm-pool-trait>))
    (configs (list 120 (buff 4096)))
  )
  (ok (map set-dynamic-config pool-traits configs))
)

;; Helper function for removing an admin
(define-private (admin-not-removable (admin principal))
  (not (is-eq admin (var-get admin-helper)))
)

;; Helper function for removing a verified pool code hash
(define-private (verified-pool-code-hashes-not-removable (hash (buff 32)))
  (not (is-eq hash (var-get verified-pool-code-hashes-helper)))
)

;; Helper function to validate that bin-factors list is in ascending order
(define-private (fold-are-bin-factors-ascending (factor uint) (result (response uint uint)))
  (if (> factor (try! result))
      (ok factor)
      ERR_UNSORTED_BIN_FACTORS_LIST)
)

;; Create pool symbol using x token and y token symbols
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

;; Check if a pool is valid
(define-private (is-valid-pool (id uint) (contract principal))
  (let (
    (pool-data (unwrap! (map-get? pools id) false))
  )
    (is-eq contract (get pool-contract pool-data))
  )
)

;; Check if a pool is enabled
(define-private (is-enabled-pool (id uint))
  (let (
    (pool-data (unwrap! (map-get? pools id) false))
  )
    (is-eq (get status pool-data) true)
  )
)

;; Set initial bin factors at contract deployment
(map-set bin-factors u1 (list u95123180 u95132693 u95142206 u95151720 u95161235 u95170751 u95180268 u95189786 u95199305 u95208825 u95218346 u95227868 u95237391 u95246915 u95256439 u95265965 u95275492 u95285019 u95294548 u95304077 u95313607 u95323139 u95332671 u95342204 u95351739 u95361274 u95370810 u95380347 u95389885 u95399424 u95408964 u95418505 u95428047 u95437590 u95447133 u95456678 u95466224 u95475770 u95485318 u95494866 u95504416 u95513966 u95523518 u95533070 u95542623 u95552178 u95561733 u95571289 u95580846 u95590404 u95599963 u95609523 u95619084 u95628646 u95638209 u95647773 u95657338 u95666903 u95676470 u95686038 u95695606 u95705176 u95714746 u95724318 u95733890 u95743464 u95753038 u95762613 u95772190 u95781767 u95791345 u95800924 u95810504 u95820085 u95829667 u95839250 u95848834 u95858419 u95868005 u95877592 u95887179 u95896768 u95906358 u95915948 u95925540 u95935133 u95944726 u95954321 u95963916 u95973512 u95983110 u95992708 u96002307 u96011908 u96021509 u96031111 u96040714 u96050318 u96059923 u96069529 u96079136 u96088744 u96098353 u96107963 u96117573 u96127185 u96136798 u96146412 u96156026 u96165642 u96175258 u96184876 u96194494 u96204114 u96213734 u96223356 u96232978 u96242601 u96252226 u96261851 u96271477 u96281104 u96290732 u96300361 u96309991 u96319622 u96329254 u96338887 u96348521 u96358156 u96367792 u96377429 u96387066 u96396705 u96406345 u96415985 u96425627 u96435269 u96444913 u96454558 u96464203 u96473849 u96483497 u96493145 u96502794 u96512445 u96522096 u96531748 u96541401 u96551055 u96560711 u96570367 u96580024 u96589682 u96599341 u96609001 u96618662 u96628323 u96637986 u96647650 u96657315 u96666981 u96676647 u96686315 u96695983 u96705653 u96715324 u96724995 u96734668 u96744341 u96754016 u96763691 u96773367 u96783045 u96792723 u96802402 u96812083 u96821764 u96831446 u96841129 u96850813 u96860498 u96870184 u96879871 u96889559 u96899248 u96908938 u96918629 u96928321 u96938014 u96947708 u96957402 u96967098 u96976795 u96986492 u96996191 u97005891 u97015591 u97025293 u97034995 u97044699 u97054403 u97064109 u97073815 u97083523 u97093231 u97102940 u97112651 u97122362 u97132074 u97141787 u97151501 u97161217 u97170933 u97180650 u97190368 u97200087 u97209807 u97219528 u97229250 u97238973 u97248697 u97258422 u97268147 u97277874 u97287602 u97297331 u97307061 u97316791 u97326523 u97336256 u97345989 u97355724 u97365459 u97375196 u97384933 u97394672 u97404411 u97414152 u97423893 u97433636 u97443379 u97453123 u97462869 u97472615 u97482362 u97492110 u97501860 u97511610 u97521361 u97531113 u97540866 u97550620 u97560375 u97570131 u97579888 u97589646 u97599405 u97609165 u97618926 u97628688 u97638451 u97648215 u97657980 u97667745 u97677512 u97687280 u97697049 u97706818 u97716589 u97726361 u97736133 u97745907 u97755682 u97765457 u97775234 u97785011 u97794790 u97804569 u97814350 u97824131 u97833914 u97843697 u97853481 u97863267 u97873053 u97882840 u97892629 u97902418 u97912208 u97921999 u97931791 u97941585 u97951379 u97961174 u97970970 u97980767 u97990565 u98000364 u98010164 u98019965 u98029767 u98039570 u98049374 u98059179 u98068985 u98078792 u98088600 u98098409 u98108219 u98118029 u98127841 u98137654 u98147468 u98157283 u98167098 u98176915 u98186733 u98196551 u98206371 u98216192 u98226013 u98235836 u98245659 u98255484 u98265310 u98275136 u98284964 u98294792 u98304622 u98314452 u98324283 u98334116 u98343949 u98353784 u98363619 u98373455 u98383293 u98393131 u98402970 u98412811 u98422652 u98432494 u98442338 u98452182 u98462027 u98471873 u98481720 u98491569 u98501418 u98511268 u98521119 u98530971 u98540824 u98550678 u98560533 u98570389 u98580246 u98590104 u98599963 u98609823 u98619684 u98629546 u98639409 u98649273 u98659138 u98669004 u98678871 u98688739 u98698608 u98708478 u98718349 u98728220 u98738093 u98747967 u98757842 u98767718 u98777594 u98787472 u98797351 u98807231 u98817111 u98826993 u98836876 u98846759 u98856644 u98866530 u98876416 u98886304 u98896193 u98906082 u98915973 u98925864 u98935757 u98945651 u98955545 u98965441 u98975337 u98985235 u98995133 u99005033 u99014933 u99024835 u99034737 u99044641 u99054545 u99064451 u99074357 u99084265 u99094173 u99104082 u99113993 u99123904 u99133817 u99143730 u99153644 u99163560 u99173476 u99183393 u99193312 u99203231 u99213151 u99223073 u99232995 u99242918 u99252843 u99262768 u99272694 u99282622 u99292550 u99302479 u99312409 u99322341 u99332273 u99342206 u99352140 u99362075 u99372012 u99381949 u99391887 u99401826 u99411766 u99421708 u99431650 u99441593 u99451537 u99461482 u99471428 u99481376 u99491324 u99501273 u99511223 u99521174 u99531126 u99541079 u99551033 u99560988 u99570945 u99580902 u99590860 u99600819 u99610779 u99620740 u99630702 u99640665 u99650629 u99660594 u99670560 u99680527 u99690495 u99700465 u99710435 u99720406 u99730378 u99740351 u99750325 u99760300 u99770276 u99780253 u99790231 u99800210 u99810190 u99820171 u99830153 u99840136 u99850120 u99860105 u99870091 u99880078 u99890066 u99900055 u99910045 u99920036 u99930028 u99940021 u99950015 u99960010 u99970006 u99980003 u99990001 u100000000 u100010000 u100020001 u100030003 u100040006 u100050010 u100060015 u100070021 u100080028 u100090036 u100100045 u100110055 u100120066 u100130078 u100140091 u100150105 u100160120 u100170136 u100180153 u100190171 u100200190 u100210210 u100220231 u100230253 u100240276 u100250300 u100260325 u100270351 u100280378 u100290406 u100300435 u100310465 u100320496 u100330529 u100340562 u100350596 u100360631 u100370667 u100380704 u100390742 u100400781 u100410821 u100420862 u100430904 u100440947 u100450991 u100461037 u100471083 u100481130 u100491178 u100501227 u100511277 u100521328 u100531380 u100541433 u100551488 u100561543 u100571599 u100581656 u100591714 u100601773 u100611834 u100621895 u100631957 u100642020 u100652084 u100662150 u100672216 u100682283 u100692351 u100702420 u100712491 u100722562 u100732634 u100742707 u100752782 u100762857 u100772933 u100783011 u100793089 u100803168 u100813249 u100823330 u100833412 u100843496 u100853580 u100863665 u100873752 u100883839 u100893927 u100904017 u100914107 u100924199 u100934291 u100944384 u100954479 u100964574 u100974671 u100984768 u100994867 u101004966 u101015067 u101025168 u101035271 u101045374 u101055479 u101065584 u101075691 u101085798 u101095907 u101106017 u101116127 u101126239 u101136351 u101146465 u101156580 u101166695 u101176812 u101186930 u101197048 u101207168 u101217289 u101227411 u101237533 u101247657 u101257782 u101267908 u101278034 u101288162 u101298291 u101308421 u101318552 u101328684 u101338816 u101348950 u101359085 u101369221 u101379358 u101389496 u101399635 u101409775 u101419916 u101430058 u101440201 u101450345 u101460490 u101470636 u101480783 u101490931 u101501080 u101511230 u101521381 u101531534 u101541687 u101551841 u101561996 u101572152 u101582310 u101592468 u101602627 u101612787 u101622949 u101633111 u101643274 u101653438 u101663604 u101673770 u101683938 u101694106 u101704275 u101714446 u101724617 u101734790 u101744963 u101755138 u101765313 u101775490 u101785667 u101795846 u101806025 u101816206 u101826388 u101836570 u101846754 u101856939 u101867124 u101877311 u101887499 u101897687 u101907877 u101918068 u101928260 u101938453 u101948647 u101958841 u101969037 u101979234 u101989432 u101999631 u102009831 u102020032 u102030234 u102040437 u102050641 u102060846 u102071052 u102081259 u102091467 u102101677 u102111887 u102122098 u102132310 u102142523 u102152738 u102162953 u102173169 u102183387 u102193605 u102203824 u102214045 u102224266 u102234488 u102244712 u102254936 u102265162 u102275388 u102285616 u102295844 u102306074 u102316305 u102326536 u102336769 u102347003 u102357237 u102367473 u102377710 u102387948 u102398186 u102408426 u102418667 u102428909 u102439152 u102449396 u102459641 u102469887 u102480134 u102490382 u102500631 u102510881 u102521132 u102531384 u102541637 u102551891 u102562146 u102572403 u102582660 u102592918 u102603177 u102613438 u102623699 u102633961 u102644225 u102654489 u102664755 u102675021 u102685289 u102695557 u102705827 u102716097 u102726369 u102736642 u102746915 u102757190 u102767466 u102777742 u102788020 u102798299 u102808579 u102818860 u102829142 u102839424 u102849708 u102859993 u102870279 u102880566 u102890854 u102901144 u102911434 u102921725 u102932017 u102942310 u102952604 u102962900 u102973196 u102983493 u102993792 u103004091 u103014391 u103024693 u103034995 u103045299 u103055603 u103065909 u103076216 u103086523 u103096832 u103107141 u103117452 u103127764 u103138077 u103148391 u103158705 u103169021 u103179338 u103189656 u103199975 u103210295 u103220616 u103230938 u103241261 u103251585 u103261910 u103272237 u103282564 u103292892 u103303221 u103313552 u103323883 u103334216 u103344549 u103354883 u103365219 u103375555 u103385893 u103396232 u103406571 u103416912 u103427254 u103437596 u103447940 u103458285 u103468631 u103478977 u103489325 u103499674 u103510024 u103520375 u103530727 u103541080 u103551435 u103561790 u103572146 u103582503 u103592861 u103603221 u103613581 u103623942 u103634305 u103644668 u103655033 u103665398 u103675765 u103686132 u103696501 u103706870 u103717241 u103727613 u103737986 u103748359 u103758734 u103769110 u103779487 u103789865 u103800244 u103810624 u103821005 u103831387 u103841770 u103852154 u103862540 u103872926 u103883313 u103893702 u103904091 u103914481 u103924873 u103935265 u103945659 u103956053 u103966449 u103976846 u103987243 u103997642 u104008042 u104018443 u104028844 u104039247 u104049651 u104060056 u104070462 u104080869 u104091277 u104101686 u104112097 u104122508 u104132920 u104143333 u104153748 u104164163 u104174580 u104184997 u104195415 u104205835 u104216256 u104226677 u104237100 u104247524 u104257948 u104268374 u104278801 u104289229 u104299658 u104310088 u104320519 u104330951 u104341384 u104351818 u104362253 u104372689 u104383127 u104393565 u104404004 u104414445 u104424886 u104435329 u104445772 u104456217 u104466662 u104477109 u104487557 u104498006 u104508455 u104518906 u104529358 u104539811 u104550265 u104560720 u104571176 u104581633 u104592091 u104602551 u104613011 u104623472 u104633935 u104644398 u104654862 u104665328 u104675794 u104686262 u104696731 u104707200 u104717671 u104728143 u104738616 u104749089 u104759564 u104770040 u104780517 u104790995 u104801474 u104811955 u104822436 u104832918 u104843401 u104853886 u104864371 u104874858 u104885345 u104895834 u104906323 u104916814 u104927305 u104937798 u104948292 u104958787 u104969283 u104979780 u104990278 u105000777 u105011277 u105021778 u105032280 u105042783 u105053287 u105063793 u105074299 u105084807 u105095315 u105105825 u105116335 u105126847))
(map-set bin-factors u5 (list u77884944 u77923887 u77962849 u78001830 u78040831 u78079852 u78118891 u78157951 u78197030 u78236128 u78275246 u78314384 u78353541 u78392718 u78431914 u78471130 u78510366 u78549621 u78588896 u78628190 u78667504 u78706838 u78746192 u78785565 u78824957 u78864370 u78903802 u78943254 u78982726 u79022217 u79061728 u79101259 u79140810 u79180380 u79219970 u79259580 u79299210 u79338860 u79378529 u79418218 u79457927 u79497656 u79537405 u79577174 u79616963 u79656771 u79696599 u79736448 u79776316 u79816204 u79856112 u79896040 u79935988 u79975956 u80015944 u80055952 u80095980 u80136028 u80176096 u80216184 u80256292 u80296420 u80336569 u80376737 u80416925 u80457134 u80497362 u80537611 u80577880 u80618169 u80658478 u80698807 u80739156 u80779526 u80819916 u80860326 u80900756 u80941206 u80981677 u81022168 u81062679 u81103210 u81143762 u81184334 u81224926 u81265538 u81306171 u81346824 u81387498 u81428191 u81468905 u81509640 u81550395 u81591170 u81631965 u81672781 u81713618 u81754475 u81795352 u81836250 u81877168 u81918106 u81959065 u82000045 u82041045 u82082065 u82123106 u82164168 u82205250 u82246353 u82287476 u82328620 u82369784 u82410969 u82452174 u82493400 u82534647 u82575914 u82617202 u82658511 u82699840 u82741190 u82782561 u82823952 u82865364 u82906797 u82948250 u82989724 u83031219 u83072735 u83114271 u83155828 u83197406 u83239005 u83280624 u83322265 u83363926 u83405608 u83447311 u83489034 u83530779 u83572544 u83614330 u83656138 u83697966 u83739815 u83781684 u83823575 u83865487 u83907420 u83949374 u83991348 u84033344 u84075361 u84117398 u84159457 u84201537 u84243637 u84285759 u84327902 u84370066 u84412251 u84454457 u84496685 u84538933 u84581202 u84623493 u84665805 u84708138 u84750492 u84792867 u84835263 u84877681 u84920120 u84962580 u85005061 u85047564 u85090087 u85132632 u85175199 u85217786 u85260395 u85303025 u85345677 u85388350 u85431044 u85473760 u85516496 u85559255 u85602034 u85644835 u85687658 u85730502 u85773367 u85816253 u85859162 u85902091 u85945042 u85988015 u86031009 u86074024 u86117061 u86160120 u86203200 u86246301 u86289425 u86332569 u86375736 u86418924 u86462133 u86505364 u86548617 u86591891 u86635187 u86678505 u86721844 u86765205 u86808587 u86851992 u86895418 u86938865 u86982335 u87025826 u87069339 u87112874 u87156430 u87200008 u87243608 u87287230 u87330874 u87374539 u87418226 u87461935 u87505666 u87549419 u87593194 u87636991 u87680809 u87724649 u87768512 u87812396 u87856302 u87900230 u87944180 u87988153 u88032147 u88076163 u88120201 u88164261 u88208343 u88252447 u88296573 u88340722 u88384892 u88429085 u88473299 u88517536 u88561794 u88606075 u88650378 u88694704 u88739051 u88783420 u88827812 u88872226 u88916662 u88961121 u89005601 u89050104 u89094629 u89139176 u89183746 u89228338 u89272952 u89317588 u89362247 u89406928 u89451632 u89496358 u89541106 u89585876 u89630669 u89675485 u89720322 u89765182 u89810065 u89854970 u89899898 u89944848 u89989820 u90034815 u90079832 u90124872 u90169935 u90215020 u90260127 u90305257 u90350410 u90395585 u90440783 u90486003 u90531246 u90576512 u90621800 u90667111 u90712445 u90757801 u90803180 u90848581 u90894006 u90939453 u90984922 u91030415 u91075930 u91121468 u91167029 u91212612 u91258218 u91303848 u91349499 u91395174 u91440872 u91486592 u91532336 u91578102 u91623891 u91669703 u91715538 u91761395 u91807276 u91853180 u91899106 u91945056 u91991028 u92037024 u92083042 u92129084 u92175148 u92221236 u92267347 u92313480 u92359637 u92405817 u92452020 u92498246 u92544495 u92590767 u92637063 u92683381 u92729723 u92776088 u92822476 u92868887 u92915321 u92961779 u93008260 u93054764 u93101291 u93147842 u93194416 u93241013 u93287634 u93334277 u93380945 u93427635 u93474349 u93521086 u93567847 u93614631 u93661438 u93708269 u93755123 u93802000 u93848901 u93895826 u93942774 u93989745 u94036740 u94083758 u94130800 u94177866 u94224954 u94272067 u94319203 u94366363 u94413546 u94460753 u94507983 u94555237 u94602515 u94649816 u94697141 u94744489 u94791862 u94839257 u94886677 u94934120 u94981587 u95029078 u95076593 u95124131 u95171693 u95219279 u95266889 u95314522 u95362179 u95409860 u95457565 u95505294 u95553047 u95600823 u95648624 u95696448 u95744296 u95792168 u95840065 u95887985 u95935929 u95983896 u96031888 u96079904 u96127944 u96176008 u96224096 u96272208 u96320344 u96368505 u96416689 u96464897 u96513130 u96561386 u96609667 u96657972 u96706301 u96754654 u96803031 u96851433 u96899858 u96948308 u96996783 u97045281 u97093804 u97142350 u97190922 u97239517 u97288137 u97336781 u97385449 u97434142 u97482859 u97531601 u97580366 u97629157 u97677971 u97726810 u97775674 u97824561 u97873474 u97922410 u97971372 u98020357 u98069367 u98118402 u98167461 u98216545 u98265653 u98314786 u98363944 u98413126 u98462332 u98511563 u98560819 u98610099 u98659404 u98708734 u98758089 u98807468 u98856871 u98906300 u98955753 u99005231 u99054733 u99104261 u99153813 u99203390 u99252992 u99302618 u99352269 u99401945 u99451646 u99501372 u99551123 u99600899 u99650699 u99700524 u99750375 u99800250 u99850150 u99900075 u99950025 u100000000 u100050000 u100100025 u100150075 u100200150 u100250250 u100300375 u100350525 u100400701 u100450901 u100501127 u100551377 u100601653 u100651954 u100702280 u100752631 u100803007 u100853409 u100903835 u100954287 u101004764 u101055267 u101105794 u101156347 u101206925 u101257529 u101308158 u101358812 u101409491 u101460196 u101510926 u101561681 u101612462 u101663268 u101714100 u101764957 u101815840 u101866748 u101917681 u101968640 u102019624 u102070634 u102121669 u102172730 u102223816 u102274928 u102326066 u102377229 u102428417 u102479632 u102530871 u102582137 u102633428 u102684745 u102736087 u102787455 u102838849 u102890268 u102941713 u102993184 u103044681 u103096203 u103147751 u103199325 u103250925 u103302550 u103354202 u103405879 u103457582 u103509310 u103561065 u103612846 u103664652 u103716484 u103768343 u103820227 u103872137 u103924073 u103976035 u104028023 u104080037 u104132077 u104184143 u104236235 u104288353 u104340497 u104392668 u104444864 u104497086 u104549335 u104601610 u104653910 u104706237 u104758590 u104810970 u104863375 u104915807 u104968265 u105020749 u105073259 u105125796 u105178359 u105230948 u105283564 u105336205 u105388873 u105441568 u105494289 u105547036 u105599809 u105652609 u105705436 u105758288 u105811167 u105864073 u105917005 u105969964 u106022948 u106075960 u106128998 u106182062 u106235153 u106288271 u106341415 u106394586 u106447783 u106501007 u106554258 u106607535 u106660838 u106714169 u106767526 u106820910 u106874320 u106927757 u106981221 u107034712 u107088229 u107141773 u107195344 u107248942 u107302566 u107356218 u107409896 u107463601 u107517332 u107571091 u107624877 u107678689 u107732528 u107786395 u107840288 u107894208 u107948155 u108002129 u108056130 u108110158 u108164213 u108218296 u108272405 u108326541 u108380704 u108434895 u108489112 u108543357 u108597628 u108651927 u108706253 u108760606 u108814986 u108869394 u108923829 u108978291 u109032780 u109087296 u109141840 u109196411 u109251009 u109305634 u109360287 u109414967 u109469675 u109524410 u109579172 u109633961 u109688778 u109743623 u109798495 u109853394 u109908321 u109963275 u110018256 u110073265 u110128302 u110183366 u110238458 u110293577 u110348724 u110403898 u110459100 u110514330 u110569587 u110624872 u110680184 u110735524 u110790892 u110846288 u110901711 u110957162 u111012640 u111068146 u111123681 u111179242 u111234832 u111290449 u111346095 u111401768 u111457469 u111513197 u111568954 u111624738 u111680551 u111736391 u111792259 u111848155 u111904079 u111960031 u112016011 u112072019 u112128055 u112184119 u112240212 u112296332 u112352480 u112408656 u112464860 u112521093 u112577353 u112633642 u112689959 u112746304 u112802677 u112859078 u112915508 u112971966 u113028452 u113084966 u113141508 u113198079 u113254678 u113311305 u113367961 u113424645 u113481357 u113538098 u113594867 u113651665 u113708490 u113765345 u113822227 u113879138 u113936078 u113993046 u114050043 u114107068 u114164121 u114221203 u114278314 u114335453 u114392621 u114449817 u114507042 u114564295 u114621578 u114678888 u114736228 u114793596 u114850993 u114908418 u114965872 u115023355 u115080867 u115138407 u115195977 u115253575 u115311201 u115368857 u115426541 u115484255 u115541997 u115599768 u115657568 u115715397 u115773254 u115831141 u115889056 u115947001 u116004974 u116062977 u116121008 u116179069 u116237158 u116295277 u116353425 u116411601 u116469807 u116528042 u116586306 u116644599 u116702922 u116761273 u116819654 u116878063 u116936503 u116994971 u117053468 u117111995 u117170551 u117229136 u117287751 u117346395 u117405068 u117463770 u117522502 u117581264 u117640054 u117698874 u117757724 u117816603 u117875511 u117934449 u117993416 u118052413 u118111439 u118170494 u118229580 u118288694 u118347839 u118407013 u118466216 u118525449 u118584712 u118644004 u118703326 u118762678 u118822059 u118881470 u118940911 u119000382 u119059882 u119119412 u119178972 u119238561 u119298180 u119357829 u119417508 u119477217 u119536956 u119596724 u119656522 u119716351 u119776209 u119836097 u119896015 u119955963 u120015941 u120075949 u120135987 u120196055 u120256153 u120316281 u120376439 u120436627 u120496846 u120557094 u120617373 u120677681 u120738020 u120798389 u120858788 u120919218 u120979677 u121040167 u121100687 u121161238 u121221818 u121282429 u121343070 u121403742 u121464444 u121525176 u121585939 u121646732 u121707555 u121768409 u121829293 u121890208 u121951153 u122012128 u122073134 u122134171 u122195238 u122256336 u122317464 u122378623 u122439812 u122501032 u122562282 u122623563 u122684875 u122746218 u122807591 u122868995 u122930429 u122991894 u123053390 u123114917 u123176474 u123238063 u123299682 u123361332 u123423012 u123484724 u123546466 u123608239 u123670043 u123731878 u123793744 u123855641 u123917569 u123979528 u124041518 u124103538 u124165590 u124227673 u124289787 u124351932 u124414108 u124476315 u124538553 u124600822 u124663123 u124725454 u124787817 u124850211 u124912636 u124975092 u125037580 u125100098 u125162649 u125225230 u125287842 u125350486 u125413162 u125475868 u125538606 u125601375 u125664176 u125727008 u125789872 u125852767 u125915693 u125978651 u126041640 u126104661 u126167713 u126230797 u126293913 u126357060 u126420238 u126483448 u126546690 u126609963 u126673268 u126736605 u126799973 u126863373 u126926805 u126990268 u127053763 u127117290 u127180849 u127244439 u127308062 u127371716 u127435401 u127499119 u127562869 u127626650 u127690464 u127754309 u127818186 u127882095 u127946036 u128010009 u128074014 u128138051 u128202120 u128266221 u128330354 u128394519))
(map-set bin-factors u10 (list u60668221 u60728889 u60789618 u60850408 u60911258 u60972169 u61033142 u61094175 u61155269 u61216424 u61277641 u61338918 u61400257 u61461657 u61523119 u61584642 u61646227 u61707873 u61769581 u61831351 u61893182 u61955075 u62017030 u62079047 u62141126 u62203267 u62265471 u62327736 u62390064 u62452454 u62514906 u62577421 u62639999 u62702639 u62765341 u62828107 u62890935 u62953826 u63016779 u63079796 u63142876 u63206019 u63269225 u63332494 u63395827 u63459223 u63522682 u63586204 u63649791 u63713440 u63777154 u63840931 u63904772 u63968677 u64032645 u64096678 u64160775 u64224935 u64289160 u64353450 u64417803 u64482221 u64546703 u64611250 u64675861 u64740537 u64805277 u64870083 u64934953 u64999888 u65064888 u65129952 u65195082 u65260278 u65325538 u65390863 u65456254 u65521710 u65587232 u65652819 u65718472 u65784191 u65849975 u65915825 u65981741 u66047722 u66113770 u66179884 u66246064 u66312310 u66378622 u66445001 u66511446 u66577957 u66644535 u66711180 u66777891 u66844669 u66911513 u66978425 u67045403 u67112449 u67179561 u67246741 u67313988 u67381302 u67448683 u67516132 u67583648 u67651231 u67718883 u67786601 u67854388 u67922242 u67990165 u68058155 u68126213 u68194339 u68262534 u68330796 u68399127 u68467526 u68535994 u68604530 u68673134 u68741807 u68810549 u68879360 u68948239 u69017187 u69086204 u69155291 u69224446 u69293670 u69362964 u69432327 u69501759 u69571261 u69640832 u69710473 u69780184 u69849964 u69919814 u69989734 u70059723 u70129783 u70199913 u70270113 u70340383 u70410723 u70481134 u70551615 u70622167 u70692789 u70763482 u70834245 u70905079 u70975984 u71046960 u71118007 u71189125 u71260314 u71331575 u71402906 u71474309 u71545784 u71617329 u71688947 u71760636 u71832396 u71904229 u71976133 u72048109 u72120157 u72192277 u72264470 u72336734 u72409071 u72481480 u72553961 u72626515 u72699142 u72771841 u72844613 u72917457 u72990375 u73063365 u73136429 u73209565 u73282775 u73356057 u73429413 u73502843 u73576346 u73649922 u73723572 u73797296 u73871093 u73944964 u74018909 u74092928 u74167021 u74241188 u74315429 u74389744 u74464134 u74538598 u74613137 u74687750 u74762438 u74837200 u74912037 u74986949 u75061936 u75136998 u75212135 u75287347 u75362635 u75437997 u75513435 u75588949 u75664538 u75740202 u75815942 u75891758 u75967650 u76043618 u76119661 u76195781 u76271977 u76348249 u76424597 u76501022 u76577523 u76654100 u76730754 u76807485 u76884293 u76961177 u77038138 u77115176 u77192291 u77269484 u77346753 u77424100 u77501524 u77579026 u77656605 u77734261 u77811995 u77889807 u77967697 u78045665 u78123711 u78201834 u78280036 u78358316 u78436675 u78515111 u78593626 u78672220 u78750892 u78829643 u78908473 u78987381 u79066369 u79145435 u79224580 u79303805 u79383109 u79462492 u79541954 u79621496 u79701118 u79780819 u79860600 u79940460 u80020401 u80100421 u80180522 u80260702 u80340963 u80421304 u80501725 u80582227 u80662809 u80743472 u80824215 u80905040 u80985945 u81066931 u81147997 u81229145 u81310375 u81391685 u81473077 u81554550 u81636104 u81717740 u81799458 u81881258 u81963139 u82045102 u82127147 u82209274 u82291483 u82373775 u82456149 u82538605 u82621144 u82703765 u82786468 u82869255 u82952124 u83035076 u83118111 u83201229 u83284431 u83367715 u83451083 u83534534 u83618068 u83701687 u83785388 u83869174 u83953043 u84036996 u84121033 u84205154 u84289359 u84373648 u84458022 u84542480 u84627022 u84711650 u84796361 u84881158 u84966039 u85051005 u85136056 u85221192 u85306413 u85391719 u85477111 u85562588 u85648151 u85733799 u85819533 u85905352 u85991258 u86077249 u86163326 u86249489 u86335739 u86422075 u86508497 u86595005 u86681600 u86768282 u86855050 u86941905 u87028847 u87115876 u87202992 u87290195 u87377485 u87464863 u87552327 u87639880 u87727520 u87815247 u87903062 u87990965 u88078956 u88167035 u88255202 u88343458 u88431801 u88520233 u88608753 u88697362 u88786059 u88874845 u88963720 u89052684 u89141736 u89230878 u89320109 u89409429 u89498839 u89588337 u89677926 u89767604 u89857371 u89947229 u90037176 u90127213 u90217340 u90307558 u90397865 u90488263 u90578751 u90669330 u90759999 u90850759 u90941610 u91032552 u91123584 u91214708 u91305923 u91397229 u91488626 u91580114 u91671695 u91763366 u91855130 u91946985 u92038932 u92130971 u92223102 u92315325 u92407640 u92500048 u92592548 u92685140 u92777825 u92870603 u92963474 u93056437 u93149494 u93242643 u93335886 u93429222 u93522651 u93616174 u93709790 u93803500 u93897303 u93991200 u94085192 u94179277 u94273456 u94367730 u94462097 u94556559 u94651116 u94745767 u94840513 u94935353 u95030289 u95125319 u95220444 u95315665 u95410980 u95506391 u95601898 u95697500 u95793197 u95888990 u95984879 u96080864 u96176945 u96273122 u96369395 u96465765 u96562230 u96658793 u96755451 u96852207 u96949059 u97046008 u97143054 u97240197 u97337437 u97434775 u97532210 u97629742 u97727371 u97825099 u97922924 u98020847 u98118868 u98216987 u98315204 u98413519 u98511932 u98610444 u98709055 u98807764 u98906571 u99005478 u99104484 u99203588 u99302792 u99402094 u99501497 u99600998 u99700599 u99800300 u99900100 u100000000 u100100000 u100200100 u100300300 u100400600 u100501001 u100601502 u100702104 u100802806 u100903608 u101004512 u101105517 u101206622 u101307829 u101409137 u101510546 u101612056 u101713668 u101815382 u101917197 u102019114 u102121134 u102223255 u102325478 u102427803 u102530231 u102632762 u102735394 u102838130 u102940968 u103043909 u103146953 u103250100 u103353350 u103456703 u103560160 u103663720 u103767384 u103871151 u103975022 u104078997 u104183076 u104287259 u104391547 u104495938 u104600434 u104705034 u104809739 u104914549 u105019464 u105124483 u105229608 u105334837 u105440172 u105545612 u105651158 u105756809 u105862566 u105968428 u106074397 u106180471 u106286652 u106392938 u106499331 u106605831 u106712437 u106819149 u106925968 u107032894 u107139927 u107247067 u107354314 u107461668 u107569130 u107676699 u107784376 u107892160 u108000052 u108108052 u108216160 u108324377 u108432701 u108541134 u108649675 u108758324 u108867083 u108975950 u109084926 u109194011 u109303205 u109412508 u109521920 u109631442 u109741074 u109850815 u109960666 u110070626 u110180697 u110290878 u110401169 u110511570 u110622081 u110732703 u110843436 u110954280 u111065234 u111176299 u111287475 u111398763 u111510162 u111621672 u111733293 u111845027 u111956872 u112068829 u112180897 u112293078 u112405371 u112517777 u112630295 u112742925 u112855668 u112968523 u113081492 u113194573 u113307768 u113421076 u113534497 u113648031 u113761679 u113875441 u113989317 u114103306 u114217409 u114331627 u114445958 u114560404 u114674965 u114789640 u114904429 u115019334 u115134353 u115249487 u115364737 u115480102 u115595582 u115711177 u115826888 u115942715 u116058658 u116174717 u116290891 u116407182 u116523589 u116640113 u116756753 u116873510 u116990383 u117107374 u117224481 u117341706 u117459047 u117576506 u117694083 u117811777 u117929589 u118047518 u118165566 u118283731 u118402015 u118520417 u118638938 u118757577 u118876334 u118995210 u119114206 u119233320 u119352553 u119471906 u119591378 u119710969 u119830680 u119950511 u120070461 u120190532 u120310722 u120431033 u120551464 u120672015 u120792687 u120913480 u121034394 u121155428 u121276583 u121397860 u121519258 u121640777 u121762418 u121884180 u122006064 u122128071 u122250199 u122372449 u122494821 u122617316 u122739933 u122862673 u122985536 u123108522 u123231630 u123354862 u123478217 u123601695 u123725296 u123849022 u123972871 u124096844 u124220940 u124345161 u124469507 u124593976 u124718570 u124843289 u124968132 u125093100 u125218193 u125343411 u125468755 u125594224 u125719818 u125845538 u125971383 u126097354 u126223452 u126349675 u126476025 u126602501 u126729103 u126855833 u126982688 u127109671 u127236781 u127364018 u127491382 u127618873 u127746492 u127874238 u128002113 u128130115 u128258245 u128386503 u128514890 u128643404 u128772048 u128900820 u129029721 u129158750 u129287909 u129417197 u129546614 u129676161 u129805837 u129935643 u130065579 u130195644 u130325840 u130456166 u130586622 u130717208 u130847926 u130978774 u131109752 u131240862 u131372103 u131503475 u131634978 u131766613 u131898380 u132030278 u132162309 u132294471 u132426766 u132559192 u132691751 u132824443 u132957268 u133090225 u133223315 u133356538 u133489895 u133623385 u133757008 u133890765 u134024656 u134158681 u134292839 u134427132 u134561559 u134696121 u134830817 u134965648 u135100614 u135235714 u135370950 u135506321 u135641827 u135777469 u135913246 u136049160 u136185209 u136321394 u136457715 u136594173 u136730767 u136867498 u137004366 u137141370 u137278511 u137415790 u137553206 u137690759 u137828450 u137966278 u138104244 u138242349 u138380591 u138518971 u138657490 u138796148 u138934944 u139073879 u139212953 u139352166 u139491518 u139631010 u139770641 u139910411 u140050322 u140190372 u140330562 u140470893 u140611364 u140751975 u140892727 u141033620 u141174653 u141315828 u141457144 u141598601 u141740200 u141881940 u142023822 u142165846 u142308011 u142450320 u142592770 u142735363 u142878098 u143020976 u143163997 u143307161 u143450468 u143593919 u143737513 u143881250 u144025131 u144169156 u144313326 u144457639 u144602097 u144746699 u144891445 u145036337 u145181373 u145326555 u145471881 u145617353 u145762970 u145908733 u146054642 u146200697 u146346897 u146493244 u146639738 u146786377 u146933164 u147080097 u147227177 u147374404 u147521778 u147669300 u147816970 u147964787 u148112751 u148260864 u148409125 u148557534 u148706092 u148854798 u149003652 u149152656 u149301809 u149451111 u149600562 u149750162 u149899912 u150049812 u150199862 u150350062 u150500412 u150650912 u150801563 u150952365 u151103317 u151254421 u151405675 u151557081 u151708638 u151860346 u152012207 u152164219 u152316383 u152468700 u152621168 u152773789 u152926563 u153079490 u153232569 u153385802 u153539188 u153692727 u153846420 u154000266 u154154266 u154308421 u154462729 u154617192 u154771809 u154926581 u155081507 u155236589 u155391825 u155547217 u155702764 u155858467 u156014326 u156170340 u156326510 u156482837 u156639320 u156795959 u156952755 u157109708 u157266817 u157424084 u157581508 u157739090 u157896829 u158054726 u158212780 u158370993 u158529364 u158687894 u158846582 u159005428 u159164434 u159323598 u159482922 u159642404 u159802047 u159961849 u160121811 u160281933 u160442215 u160602657 u160763259 u160924023 u161084947 u161246032 u161407278 u161568685 u161730254 u161891984 u162053876 u162215930 u162378146 u162540524 u162703064 u162865767 u163028633 u163191662 u163354853 u163518208 u163681727 u163845408 u164009254 u164173263 u164337436 u164501774 u164666275 u164830942))
(map-set bin-factors u20 (list u36824701 u36898351 u36972148 u37046092 u37120184 u37194424 u37268813 u37343351 u37418038 u37492874 u37567859 u37642995 u37718281 u37793718 u37869305 u37945044 u38020934 u38096976 u38173170 u38249516 u38326015 u38402667 u38479472 u38556431 u38633544 u38710811 u38788233 u38865809 u38943541 u39021428 u39099471 u39177670 u39256025 u39334537 u39413206 u39492033 u39571017 u39650159 u39729459 u39808918 u39888536 u39968313 u40048250 u40128346 u40208603 u40289020 u40369598 u40450337 u40531238 u40612300 u40693525 u40774912 u40856462 u40938175 u41020051 u41102091 u41184295 u41266664 u41349197 u41431896 u41514759 u41597789 u41680985 u41764347 u41847875 u41931571 u42015434 u42099465 u42183664 u42268031 u42352567 u42437272 u42522147 u42607191 u42692406 u42777790 u42863346 u42949073 u43034971 u43121041 u43207283 u43293698 u43380285 u43467045 u43553980 u43641088 u43728370 u43815826 u43903458 u43991265 u44079248 u44167406 u44255741 u44344252 u44432941 u44521807 u44610850 u44700072 u44789472 u44879051 u44968809 u45058747 u45148864 u45239162 u45329640 u45420300 u45511140 u45602163 u45693367 u45784754 u45876323 u45968076 u46060012 u46152132 u46244436 u46336925 u46429599 u46522458 u46615503 u46708734 u46802152 u46895756 u46989547 u47083526 u47177693 u47272049 u47366593 u47461326 u47556249 u47651361 u47746664 u47842157 u47937842 u48033717 u48129785 u48226044 u48322496 u48419141 u48515980 u48613012 u48710238 u48807658 u48905273 u49003084 u49101090 u49199292 u49297691 u49396286 u49495079 u49594069 u49693257 u49792644 u49892229 u49992013 u50091997 u50192181 u50292566 u50393151 u50493937 u50594925 u50696115 u50797507 u50899102 u51000900 u51102902 u51205108 u51307518 u51410133 u51512954 u51615979 u51719211 u51822650 u51926295 u52030148 u52134208 u52238476 u52342953 u52447639 u52552535 u52657640 u52762955 u52868481 u52974218 u53080166 u53186327 u53292699 u53399285 u53506083 u53613095 u53720322 u53827762 u53935418 u54043289 u54151375 u54259678 u54368197 u54476934 u54585888 u54695059 u54804449 u54914058 u55023886 u55133934 u55244202 u55354690 u55465400 u55576331 u55687483 u55798858 u55910456 u56022277 u56134321 u56246590 u56359083 u56471801 u56584745 u56697915 u56811310 u56924933 u57038783 u57152860 u57267166 u57381700 u57496464 u57611457 u57726680 u57842133 u57957817 u58073733 u58189880 u58306260 u58422873 u58539718 u58656798 u58774112 u58891660 u59009443 u59127462 u59245717 u59364208 u59482937 u59601903 u59721106 u59840549 u59960230 u60080150 u60200310 u60320711 u60441353 u60562235 u60683360 u60804726 u60926336 u61048189 u61170285 u61292625 u61415211 u61538041 u61661117 u61784439 u61908008 u62031824 u62155888 u62280200 u62404760 u62529570 u62654629 u62779938 u62905498 u63031309 u63157372 u63283686 u63410254 u63537074 u63664148 u63791477 u63919060 u64046898 u64174992 u64303342 u64431948 u64560812 u64689934 u64819314 u64948952 u65078850 u65209008 u65339426 u65470105 u65601045 u65732247 u65863711 u65995439 u66127430 u66259685 u66392204 u66524988 u66658038 u66791354 u66924937 u67058787 u67192905 u67327290 u67461945 u67596869 u67732063 u67867527 u68003262 u68139268 u68275547 u68412098 u68548922 u68686020 u68823392 u68961039 u69098961 u69237159 u69375633 u69514384 u69653413 u69792720 u69932305 u70072170 u70212314 u70352739 u70493445 u70634431 u70775700 u70917252 u71059086 u71201204 u71343607 u71486294 u71629267 u71772525 u71916070 u72059902 u72204022 u72348430 u72493127 u72638113 u72783389 u72928956 u73074814 u73220964 u73367406 u73514141 u73661169 u73808491 u73956108 u74104020 u74252228 u74400733 u74549534 u74698633 u74848031 u74997727 u75147722 u75298018 u75448614 u75599511 u75750710 u75902211 u76054016 u76206124 u76358536 u76511253 u76664276 u76817604 u76971239 u77125182 u77279432 u77433991 u77588859 u77744037 u77899525 u78055324 u78211435 u78367857 u78524593 u78681642 u78839006 u78996684 u79154677 u79312986 u79471612 u79630556 u79789817 u79949396 u80109295 u80269514 u80430053 u80590913 u80752095 u80913599 u81075426 u81237577 u81400052 u81562852 u81725978 u81889430 u82053209 u82217315 u82381750 u82546513 u82711606 u82877029 u83042783 u83208869 u83375287 u83542037 u83709121 u83876540 u84044293 u84212381 u84380806 u84549568 u84718667 u84888104 u85057880 u85227996 u85398452 u85569249 u85740388 u85911868 u86083692 u86255859 u86428371 u86601228 u86774430 u86947979 u87121875 u87296119 u87470711 u87645653 u87820944 u87996586 u88172579 u88348924 u88525622 u88702673 u88880079 u89057839 u89235954 u89414426 u89593255 u89772442 u89951987 u90131890 u90312154 u90492779 u90673764 u90855112 u91036822 u91218896 u91401333 u91584136 u91767304 u91950839 u92134741 u92319010 u92503648 u92688655 u92874033 u93059781 u93245900 u93432392 u93619257 u93806495 u93994108 u94182097 u94370461 u94559202 u94748320 u94937817 u95127692 u95317948 u95508584 u95699601 u95891000 u96082782 u96274948 u96467497 u96660432 u96853753 u97047461 u97241556 u97436039 u97630911 u97826173 u98021825 u98217869 u98414305 u98611133 u98808355 u99005972 u99203984 u99402392 u99601197 u99800399 u100000000 u100200000 u100400400 u100601201 u100802403 u101004008 u101206016 u101408428 u101611245 u101814467 u102018096 u102222133 u102426577 u102631430 u102836693 u103042366 u103248451 u103454948 u103661858 u103869181 u104076920 u104285074 u104493644 u104702631 u104912036 u105121860 u105332104 u105542768 u105753854 u105965362 u106177292 u106389647 u106602426 u106815631 u107029262 u107243321 u107457807 u107672723 u107888069 u108103845 u108320052 u108536692 u108753766 u108971273 u109189216 u109407594 u109626410 u109845662 u110065354 u110285484 u110506055 u110727067 u110948522 u111170419 u111392759 u111615545 u111838776 u112062454 u112286579 u112511152 u112736174 u112961646 u113187570 u113413945 u113640773 u113868054 u114095790 u114323982 u114552630 u114781735 u115011299 u115241321 u115471804 u115702747 u115934153 u116166021 u116398353 u116631150 u116864412 u117098141 u117332337 u117567002 u117802136 u118037740 u118273816 u118510363 u118747384 u118984879 u119222849 u119461294 u119700217 u119939617 u120179497 u120419856 u120660695 u120902017 u121143821 u121386108 u121628881 u121872138 u122115883 u122360114 u122604835 u122850044 u123095744 u123341936 u123588620 u123835797 u124083469 u124331636 u124580299 u124829459 u125079118 u125329277 u125579935 u125831095 u126082757 u126334923 u126587593 u126840768 u127094449 u127348638 u127603335 u127858542 u128114259 u128370488 u128627229 u128884483 u129142252 u129400537 u129659338 u129918656 u130178494 u130438851 u130699728 u130961128 u131223050 u131485496 u131748467 u132011964 u132275988 u132540540 u132805621 u133071232 u133337375 u133604050 u133871258 u134139000 u134407278 u134676093 u134945445 u135215336 u135485767 u135756738 u136028252 u136300308 u136572909 u136846054 u137119747 u137393986 u137668774 u137944112 u138220000 u138496440 u138773433 u139050980 u139329082 u139607740 u139886955 u140166729 u140447063 u140727957 u141009413 u141291431 u141574014 u141857162 u142140877 u142425158 u142710009 u142995429 u143281420 u143567982 u143855118 u144142829 u144431114 u144719976 u145009416 u145299435 u145590034 u145881214 u146172977 u146465323 u146758253 u147051770 u147345873 u147640565 u147935846 u148231718 u148528181 u148825238 u149122888 u149421134 u149719976 u150019416 u150319455 u150620094 u150921334 u151223177 u151525623 u151828674 u152132332 u152436596 u152741470 u153046952 u153353046 u153659752 u153967072 u154275006 u154583556 u154892723 u155202509 u155512914 u155823940 u156135587 u156447859 u156760754 u157074276 u157388424 u157703201 u158018608 u158334645 u158651314 u158968617 u159286554 u159605127 u159924337 u160244186 u160564674 u160885804 u161207575 u161529990 u161853050 u162176757 u162501110 u162826112 u163151765 u163478068 u163805024 u164132634 u164460900 u164789821 u165119401 u165449640 u165780539 u166112100 u166444324 u166777213 u167110767 u167444989 u167779879 u168115439 u168451670 u168788573 u169126150 u169464402 u169803331 u170142938 u170483224 u170824190 u171165838 u171508170 u171851187 u172194889 u172539279 u172884357 u173230126 u173576586 u173923739 u174271587 u174620130 u174969370 u175319309 u175669948 u176021288 u176373330 u176726077 u177079529 u177433688 u177788555 u178144132 u178500421 u178857422 u179215136 u179573567 u179932714 u180292579 u180653164 u181014471 u181376500 u181739253 u182102731 u182466937 u182831871 u183197534 u183563929 u183931057 u184298919 u184667517 u185036852 u185406926 u185777740 u186149295 u186521594 u186894637 u187268426 u187642963 u188018249 u188394286 u188771074 u189148616 u189526913 u189905967 u190285779 u190666351 u191047683 u191429779 u191812638 u192196264 u192580656 u192965818 u193351749 u193738453 u194125930 u194514181 u194903210 u195293016 u195683602 u196074969 u196467119 u196860054 u197253774 u197648281 u198043578 u198439665 u198836544 u199234217 u199632686 u200031951 u200432015 u200832879 u201234545 u201637014 u202040288 u202444369 u202849257 u203254956 u203661466 u204068789 u204476926 u204885880 u205295652 u205706243 u206117656 u206529891 u206942951 u207356837 u207771550 u208187093 u208603468 u209020675 u209438716 u209857593 u210277309 u210697863 u211119259 u211541497 u211964580 u212388510 u212813287 u213238913 u213665391 u214092722 u214520907 u214949949 u215379849 u215810609 u216242230 u216674714 u217108064 u217542280 u217977364 u218413319 u218850146 u219287846 u219726422 u220165875 u220606206 u221047419 u221489514 u221932493 u222376358 u222821110 u223266753 u223713286 u224160713 u224609034 u225058252 u225508369 u225959385 u226411304 u226864127 u227317855 u227772491 u228228036 u228684492 u229141861 u229600144 u230059345 u230519463 u230980502 u231442463 u231905348 u232369159 u232833897 u233299565 u233766164 u234233697 u234702164 u235171568 u235641911 u236113195 u236585422 u237058592 u237532710 u238007775 u238483791 u238960758 u239438680 u239917557 u240397392 u240878187 u241359943 u241842663 u242326349 u242811001 u243296623 u243783217 u244270783 u244759325 u245248843 u245739341 u246230820 u246723281 u247216728 u247711161 u248206584 u248702997 u249200403 u249698803 u250198201 u250698598 u251199995 u251702395 u252205799 u252710211 u253215631 u253722063 u254229507 u254737966 u255247442 u255757937 u256269453 u256781991 u257295555 u257810147 u258325767 u258842418 u259360103 u259878823 u260398581 u260919378 u261441217 u261964099 u262488028 u263013004 u263539030 u264066108 u264594240 u265123428 u265653675 u266184983 u266717353 u267250787 u267785289 u268320860 u268857501 u269395216 u269934007 u270473875 u271014822 u271556852))
(map-set bin-factors u25 (list u28695206 u28766944 u28838862 u28910959 u28983236 u29055694 u29128334 u29201155 u29274157 u29347343 u29420711 u29494263 u29567999 u29641919 u29716023 u29790313 u29864789 u29939451 u30014300 u30089336 u30164559 u30239970 u30315570 u30391359 u30467338 u30543506 u30619865 u30696414 u30773155 u30850088 u30927214 u31004532 u31082043 u31159748 u31237647 u31315741 u31394031 u31472516 u31551197 u31630075 u31709150 u31788423 u31867894 u31947564 u32027433 u32107502 u32187770 u32268240 u32348910 u32429783 u32510857 u32592134 u32673615 u32755299 u32837187 u32919280 u33001578 u33084082 u33166792 u33249709 u33332833 u33416165 u33499706 u33583455 u33667414 u33751582 u33835961 u33920551 u34005353 u34090366 u34175592 u34261031 u34346683 u34432550 u34518631 u34604928 u34691440 u34778169 u34865114 u34952277 u35039658 u35127257 u35215075 u35303113 u35391371 u35479849 u35568549 u35657470 u35746614 u35835980 u35925570 u36015384 u36105423 u36195686 u36286175 u36376891 u36467833 u36559003 u36650400 u36742026 u36833881 u36925966 u37018281 u37110827 u37203604 u37296613 u37389854 u37483329 u37577037 u37670980 u37765157 u37859570 u37954219 u38049104 u38144227 u38239588 u38335187 u38431025 u38527102 u38623420 u38719979 u38816779 u38913821 u39011105 u39108633 u39206404 u39304420 u39402681 u39501188 u39599941 u39698941 u39798188 u39897684 u39997428 u40097422 u40197665 u40298159 u40398905 u40499902 u40601152 u40702655 u40804411 u40906422 u41008688 u41111210 u41213988 u41317023 u41420316 u41523866 u41627676 u41731745 u41836075 u41940665 u42045516 u42150630 u42256007 u42361647 u42467551 u42573720 u42680154 u42786855 u42893822 u43001056 u43108559 u43216330 u43324371 u43432682 u43541264 u43650117 u43759242 u43868640 u43978312 u44088258 u44198478 u44308975 u44419747 u44530796 u44642123 u44753729 u44865613 u44977777 u45090221 u45202947 u45315954 u45429244 u45542817 u45656674 u45770816 u45885243 u45999956 u46114956 u46230243 u46345819 u46461684 u46577838 u46694282 u46811018 u46928046 u47045366 u47162979 u47280887 u47399089 u47517587 u47636381 u47755472 u47874860 u47994547 u48114534 u48234820 u48355407 u48476296 u48597486 u48718980 u48840778 u48962879 u49085287 u49208000 u49331020 u49454347 u49577983 u49701928 u49826183 u49950749 u50075625 u50200814 u50326317 u50452132 u50578263 u50704708 u50831470 u50958549 u51085945 u51213660 u51341694 u51470048 u51598723 u51727720 u51857040 u51986682 u52116649 u52246941 u52377558 u52508502 u52639773 u52771372 u52903301 u53035559 u53168148 u53301068 u53434321 u53567907 u53701827 u53836081 u53970671 u54105598 u54240862 u54376464 u54512405 u54648686 u54785308 u54922271 u55059577 u55197226 u55335219 u55473557 u55612241 u55751272 u55890650 u56030376 u56170452 u56310879 u56451656 u56592785 u56734267 u56876102 u57018293 u57160838 u57303741 u57447000 u57590617 u57734594 u57878930 u58023628 u58168687 u58314109 u58459894 u58606044 u58752559 u58899440 u59046689 u59194305 u59342291 u59490647 u59639373 u59788472 u59937943 u60087788 u60238007 u60388602 u60539574 u60690923 u60842650 u60994757 u61147244 u61300112 u61453362 u61606996 u61761013 u61915416 u62070204 u62225380 u62380943 u62536895 u62693238 u62849971 u63007096 u63164613 u63322525 u63480831 u63639533 u63798632 u63958129 u64118024 u64278319 u64439015 u64600112 u64761613 u64923517 u65085826 u65248540 u65411661 u65575191 u65739129 u65903476 u66068235 u66233406 u66398989 u66564987 u66731399 u66898228 u67065473 u67233137 u67401220 u67569723 u67738647 u67907994 u68077764 u68247958 u68418578 u68589624 u68761098 u68933001 u69105334 u69278097 u69451292 u69624921 u69798983 u69973480 u70148414 u70323785 u70499595 u70675843 u70852533 u71029664 u71207239 u71385257 u71563720 u71742629 u71921986 u72101791 u72282045 u72462750 u72643907 u72825517 u73007581 u73190100 u73373075 u73556508 u73740399 u73924750 u74109562 u74294836 u74480573 u74666774 u74853441 u75040575 u75228176 u75416247 u75604787 u75793799 u75983284 u76173242 u76363675 u76554584 u76745971 u76937836 u77130180 u77323006 u77516313 u77710104 u77904379 u78099140 u78294388 u78490124 u78686349 u78883065 u79080273 u79277973 u79476168 u79674859 u79874046 u80073731 u80273915 u80474600 u80675787 u80877476 u81079670 u81282369 u81485575 u81689289 u81893512 u82098246 u82303491 u82509250 u82715523 u82922312 u83129618 u83337442 u83545786 u83754650 u83964037 u84173947 u84384382 u84595343 u84806831 u85018848 u85231395 u85444474 u85658085 u85872230 u86086911 u86302128 u86517883 u86734178 u86951013 u87168391 u87386312 u87604778 u87823790 u88043349 u88263457 u88484116 u88705326 u88927090 u89149407 u89372281 u89595712 u89819701 u90044250 u90269361 u90495034 u90721272 u90948075 u91175445 u91403384 u91631892 u91860972 u92090624 u92320851 u92551653 u92783032 u93014990 u93247527 u93480646 u93714348 u93948634 u94183505 u94418964 u94655011 u94891649 u95128878 u95366700 u95605117 u95844130 u96083740 u96323949 u96564759 u96806171 u97048187 u97290807 u97534034 u97777869 u98022314 u98267370 u98513038 u98759321 u99006219 u99253734 u99501869 u99750623 u100000000 u100250000 u100500625 u100751877 u101003756 u101256266 u101509406 u101763180 u102017588 u102272632 u102528313 u102784634 u103041596 u103299200 u103557448 u103816341 u104075882 u104336072 u104596912 u104858404 u105120550 u105383352 u105646810 u105910927 u106175704 u106441144 u106707247 u106974015 u107241450 u107509553 u107778327 u108047773 u108317892 u108588687 u108860159 u109132309 u109405140 u109678653 u109952850 u110227732 u110503301 u110779559 u111056508 u111334149 u111612485 u111891516 u112171245 u112451673 u112732802 u113014634 u113297171 u113580414 u113864365 u114149026 u114434398 u114720484 u115007285 u115294804 u115583041 u115871998 u116161678 u116452082 u116743213 u117035071 u117327658 u117620977 u117915030 u118209817 u118505342 u118801605 u119098609 u119396356 u119694847 u119994084 u120294069 u120594804 u120896291 u121198532 u121501528 u121805282 u122109795 u122415070 u122721108 u123027910 u123335480 u123643819 u123952928 u124262811 u124573468 u124884901 u125197114 u125510106 u125823882 u126138441 u126453787 u126769922 u127086847 u127404564 u127723075 u128042383 u128362489 u128683395 u129005104 u129327616 u129650935 u129975063 u130300000 u130625750 u130952315 u131279696 u131607895 u131936915 u132266757 u132597424 u132928917 u133261240 u133594393 u133928379 u134263200 u134598858 u134935355 u135272693 u135610875 u135949902 u136289777 u136630501 u136972077 u137314508 u137657794 u138001938 u138346943 u138692811 u139039543 u139387142 u139735609 u140084948 u140435161 u140786249 u141138214 u141491060 u141844787 u142199399 u142554898 u142911285 u143268563 u143626735 u143985802 u144345766 u144706631 u145068397 u145431068 u145794646 u146159132 u146524530 u146890842 u147258069 u147626214 u147995279 u148365268 u148736181 u149108021 u149480791 u149854493 u150229129 u150604702 u150981214 u151358667 u151737064 u152116406 u152496697 u152877939 u153260134 u153643284 u154027393 u154412461 u154798492 u155185488 u155573452 u155962386 u156352292 u156743172 u157135030 u157527868 u157921688 u158316492 u158712283 u159109064 u159506836 u159905604 u160305368 u160706131 u161107896 u161510666 u161914443 u162319229 u162725027 u163131839 u163539669 u163948518 u164358390 u164769285 u165181209 u165594162 u166008147 u166423168 u166839225 u167256323 u167674464 u168093650 u168513885 u168935169 u169357507 u169780901 u170205353 u170630867 u171057444 u171485087 u171913800 u172343585 u172774444 u173206380 u173639396 u174073494 u174508678 u174944950 u175382312 u175820768 u176260320 u176700970 u177142723 u177585580 u178029544 u178474617 u178920804 u179368106 u179816526 u180266068 u180716733 u181168525 u181621446 u182075500 u182530688 u182987015 u183444483 u183903094 u184362851 u184823759 u185285818 u185749033 u186213405 u186678939 u187145636 u187613500 u188082534 u188552740 u189024122 u189496682 u189970424 u190445350 u190921463 u191398767 u191877264 u192356957 u192837850 u193319944 u193803244 u194287752 u194773472 u195260405 u195748556 u196237928 u196728522 u197220344 u197713395 u198207678 u198703197 u199199955 u199697955 u200197200 u200697693 u201199437 u201702436 u202206692 u202712209 u203218989 u203727037 u204236354 u204746945 u205258813 u205771960 u206286389 u206802105 u207319111 u207837409 u208357002 u208877895 u209400089 u209923589 u210448398 u210974519 u211501956 u212030711 u212560787 u213092189 u213624920 u214158982 u214694380 u215231116 u215769193 u216308616 u216849388 u217391511 u217934990 u218479828 u219026027 u219573592 u220122526 u220672833 u221224515 u221777576 u222332020 u222887850 u223445070 u224003682 u224563691 u225125101 u225687913 u226252133 u226817764 u227384808 u227953270 u228523153 u229094461 u229667197 u230241365 u230816969 u231394011 u231972496 u232552427 u233133808 u233716643 u234300934 u234886687 u235473903 u236062588 u236652745 u237244377 u237837488 u238432081 u239028161 u239625732 u240224796 u240825358 u241427422 u242030990 u242636068 u243242658 u243850764 u244460391 u245071542 u245684221 u246298432 u246914178 u247531463 u248150292 u248770668 u249392594 u250016076 u250641116 u251267719 u251895888 u252525628 u253156942 u253789834 u254424309 u255060370 u255698020 u256337266 u256978109 u257620554 u258264605 u258910267 u259557543 u260206436 u260856952 u261509095 u262162868 u262818275 u263475320 u264134009 u264794344 u265456330 u266119970 u266785270 u267452234 u268120864 u268791166 u269463144 u270136802 u270812144 u271489174 u272167897 u272848317 u273530438 u274214264 u274899800 u275587049 u276276017 u276966707 u277659124 u278353271 u279049155 u279746777 u280446144 u281147260 u281850128 u282554753 u283261140 u283969293 u284679216 u285390914 u286104392 u286819653 u287536702 u288255543 u288976182 u289698623 u290422869 u291148926 u291876799 u292606491 u293338007 u294071352 u294806530 u295543547 u296282406 u297023112 u297765669 u298510084 u299256359 u300004500 u300754511 u301506397 u302260163 u303015814 u303773353 u304532786 u305294118 u306057354 u306822497 u307589553 u308358527 u309129424 u309902247 u310677003 u311453695 u312232330 u313012910 u313795443 u314579931 u315366381 u316154797 u316945184 u317737547 u318531891 u319328221 u320126541 u320926857 u321729175 u322533498 u323339831 u324148181 u324958551 u325770948 u326585375 u327401838 u328220343 u329040894 u329863496 u330688155 u331514875 u332343662 u333174522 u334007458 u334842477 u335679583 u336518782 u337360079 u338203479 u339048988 u339896610 u340746352 u341598217 u342452213 u343308344 u344166614 u345027031 u345889599 u346754323 u347621208 u348490261))