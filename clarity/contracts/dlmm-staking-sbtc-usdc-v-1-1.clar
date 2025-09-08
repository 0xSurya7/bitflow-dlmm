;; dlmm-staking-sbtc-usdc-v-1-1

;; Implement DLMM staking trait
(impl-trait .dlmm-staking-trait-v-1-1.dlmm-staking-trait)

;; Error constants
(define-constant ERR_NOT_AUTHORIZED (err u4001))
(define-constant ERR_INVALID_AMOUNT (err u4002))
(define-constant ERR_INVALID_PRINCIPAL (err u4003))
(define-constant ERR_ALREADY_ADMIN (err u4004))
(define-constant ERR_ADMIN_LIMIT_REACHED (err u4005))
(define-constant ERR_ADMIN_NOT_IN_LIST (err u4006))
(define-constant ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER (err u4007))
(define-constant ERR_STAKING_DISABLED (err u4008))
(define-constant ERR_EARLY_UNSTAKE_DISABLED (err u4009))
(define-constant ERR_TOKEN_TRANSFER_FAILED (err u4010))
(define-constant ERR_CANNOT_GET_TOKEN_BALANCE (err u4011))
(define-constant ERR_INSUFFICIENT_TOKEN_BALANCE (err u4012))
(define-constant ERR_INVALID_MIN_STAKING_DURATION (err u4013))
(define-constant ERR_MINIMUM_STAKING_DURATION_HAS_NOT_PASSED (err u4014))
(define-constant ERR_MINIMUM_STAKING_DURATION_PASSED (err u4015))
(define-constant ERR_BINS_STAKED_OVERFLOW (err u4016))
(define-constant ERR_NO_BIN_DATA (err u4017))
(define-constant ERR_NO_USER_DATA (err u4018))
(define-constant ERR_NO_USER_DATA_AT_BIN (err u4019))
(define-constant ERR_NO_LP_TO_UNSTAKE (err u4020))
(define-constant ERR_NO_EARLY_LP_TO_UNSTAKE (err u4021))
(define-constant ERR_INVALID_FEE (err u4022))
(define-constant ERR_MIN_REWARD_BUFFER_BLOCKS_PASSED (err u4023))

;; Contract deployer address
(define-constant CONTRACT_DEPLOYER tx-sender)

;; Number of bins per pool and center bin ID as unsigned ints
(define-constant NUM_OF_BINS u1001)
(define-constant CENTER_BIN_ID (/ NUM_OF_BINS u2))

;; Minimum runway when setting reward-per-block for a bin
(define-constant MIN_REWARD_BUFFER_BLOCKS u10000)

;; Maximum BPS
(define-constant FEE_SCALE_BPS u10000)
(define-constant REWARD_SCALE_BPS u1000000)

;; Admins list and helper var used to remove admins
(define-data-var admins (list 5 principal) (list tx-sender))
(define-data-var admin-helper principal tx-sender)

;; Helper value used for removing a bin-id from the bins-staked list
(define-data-var helper-value uint u0)

;; Staking and early unstake statuses
(define-data-var staking-status bool true)
(define-data-var early-unstake-status bool true)

;; Fee address and fee for early unstake
(define-data-var early-unstake-fee-address principal tx-sender)
(define-data-var early-unstake-fee uint u50)

;; Minimum staking duration in blocks
(define-data-var minimum-staking-duration uint u1)

;; Total amount of LP tokens staked
(define-data-var total-lp-staked uint u0)

;; Total rewards per block and claimed across all bins
(define-data-var total-rewards-per-block uint u0)
(define-data-var total-rewards-claimed uint u0)

;; Total rewards accrued accross all bins and last update to the data var
(define-data-var total-rewards-accrued uint u0)
(define-data-var last-total-rewards-accrued-update uint u0)

;; Define bin-data map
(define-map bin-data uint {
  lp-staked: uint,
  reward-per-block: uint,
  reward-index: uint,
  last-reward-index-update: uint
})

;; Define user-data map
(define-map user-data principal {
  bins-staked: (list 1001 uint),
  lp-staked: uint
})

;; Define user-data-at-bin map
(define-map user-data-at-bin {user: principal, bin-id: uint} {
  lp-staked: uint,
  reward-index: uint,
  last-stake-height: uint
})

;; Get admins list
(define-read-only (get-admins)
  (ok (var-get admins))
)

;; Get admin helper var
(define-read-only (get-admin-helper)
  (ok (var-get admin-helper))
)

;; Get helper value var
(define-read-only (get-helper-value)
  (ok (var-get helper-value))
)

;; Get staking status
(define-read-only (get-staking-status)
  (ok (var-get staking-status))
)

;; Get early unstake status
(define-read-only (get-early-unstake-status)
  (ok (var-get early-unstake-status))
)

;; Get early unstake fee address
(define-read-only (get-early-unstake-fee-address)
  (ok (var-get early-unstake-fee-address))
)

;; Get early unstake fee
(define-read-only (get-early-unstake-fee)
  (ok (var-get early-unstake-fee))
)

;; Get minimum staking duration
(define-read-only (get-minimum-staking-duration)
  (ok (var-get minimum-staking-duration))
)

;; Get total LP staked
(define-read-only (get-total-lp-staked)
  (ok (var-get total-lp-staked))
)

;; Get total rewards per block
(define-read-only (get-total-rewards-per-block)
  (ok (var-get total-rewards-per-block))
)

;; Get total rewards claimed
(define-read-only (get-total-rewards-claimed)
  (ok (var-get total-rewards-claimed))
)

;; Get total rewards accrued
(define-read-only (get-total-rewards-accrued)
  (ok (var-get total-rewards-accrued))
)

;; Get last total rewards accrued update
(define-read-only (get-last-total-rewards-accrued-update)
  (ok (var-get last-total-rewards-accrued-update))
)

;; Get bin data
(define-read-only (get-bin (bin-id uint))
  (ok (map-get? bin-data bin-id))
)

;; Get user data
(define-read-only (get-user (user principal))
  (ok (map-get? user-data user))
)

;; Get user data at a bin
(define-read-only (get-user-data-at-bin (user principal) (bin-id uint))
  (ok (map-get? user-data-at-bin {user: user, bin-id: bin-id}))
)

;; Get the updated reward index at a bin
(define-read-only (get-updated-reward-index (bin-id uint))
  (let (
    (current-bin-data (unwrap! (map-get? bin-data bin-id) ERR_NO_BIN_DATA))
    (lp-staked (get lp-staked current-bin-data))
    (reward-index (get reward-index current-bin-data))
    (last-reward-index-update (get last-reward-index-update current-bin-data))
  )
    ;; Get updated reward-index if current-total-lp-staked is greater than 0 and stacks-block-height is greater than last-reward-index-update
    (if (and (> lp-staked u0) (> stacks-block-height last-reward-index-update))
      (let (
        (blocks-since-last-update (- stacks-block-height last-reward-index-update))
        (rewards-to-distribute (* (get reward-per-block current-bin-data) blocks-since-last-update))
        (reward-index-delta (/ (* rewards-to-distribute REWARD_SCALE_BPS) lp-staked))
      )
        (ok {reward-index: (+ reward-index reward-index-delta), rewards-to-distribute: rewards-to-distribute})
      )
      ;; Return reward-index and rewards-to-distribute
      (ok {reward-index: reward-index, rewards-to-distribute: u0})
    )
  )
)

;; Get unclaimed rewards for a user at a bin
(define-read-only (get-unclaimed-rewards (user principal) (bin-id int))
  (let (
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))
    (current-user-data-at-bin (unwrap! (map-get? user-data-at-bin {user: user, bin-id: unsigned-bin-id}) ERR_NO_USER_DATA_AT_BIN))
    (reward-index-delta (- (get reward-index (unwrap-panic (get-updated-reward-index unsigned-bin-id))) (get reward-index current-user-data-at-bin)))
    (unclaimed-rewards (/ (* (get lp-staked current-user-data-at-bin) reward-index-delta) REWARD_SCALE_BPS))
  )
    ;; Return unclaimed-rewards
    (ok unclaimed-rewards)
  )
)

;; Get available contract reward token balance 
(define-read-only (get-available-contract-balance)
  (let (
    (current-contract-balance (unwrap-panic (get-reward-token-balance)))
    (current-total-rewards-accrued (var-get total-rewards-accrued))
    (current-total-rewards-claimed (var-get total-rewards-claimed))
    (reserved-contract-balance (if (>= current-total-rewards-accrued current-total-rewards-claimed)
                                    (- current-total-rewards-accrued current-total-rewards-claimed)
                                    u0))
  )
    ;; Return available contract balance
    (ok (if (>= current-contract-balance reserved-contract-balance)
            (- current-contract-balance reserved-contract-balance)
            u0))
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

;; Enable or disable staking
(define-public (set-staking-status (status bool))
  (let (
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)

      ;; Set staking-status to status
      (var-set staking-status status)

      ;; Print function data and return true
      (print {action: "set-staking-status", caller: caller, data: {status: status}})
      (ok true)
    )
  )
)

;; Enable or disable early unstaking
(define-public (set-early-unstake-status (status bool))
  (let (
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)

      ;; Set early-unstake-status to status
      (var-set early-unstake-status status)

      ;; Print function data and return true
      (print {action: "set-early-unstake-status", caller: caller, data: {status: status}})
      (ok true)
    )
  )
)

;; Set early unstake fee address
(define-public (set-early-unstake-fee-address (address principal))
  (let (
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and address is standard principal
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-standard address) ERR_INVALID_PRINCIPAL)

      ;; Set early-unstake-fee-address to address
      (var-set early-unstake-fee-address address)

      ;; Print function data and return true
      (print {action: "set-early-unstake-fee-address", caller: caller, data: {address: address}})
      (ok true)
    )
  )
)

;; Set early unstake fee
(define-public (set-early-unstake-fee (fee uint))
  (let (
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and fee is less than maximum FEE_SCALE_BPS
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (< fee FEE_SCALE_BPS) ERR_INVALID_FEE)

      ;; Set early-unstake-fee to fee
      (var-set early-unstake-fee fee)

      ;; Print function data and return true
      (print {action: "set-early-unstake-fee", caller: caller, data: {fee: fee}})
      (ok true)
    )
  )
)

;; Set the minimum staking duration in blocks
(define-public (set-minimum-staking-duration (duration uint))
  (let (
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and duration is greater than 0
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (> duration u0) ERR_INVALID_MIN_STAKING_DURATION)

      ;; Set minimum-staking-duration to duration
      (var-set minimum-staking-duration duration)

      ;; Print function data and return true
      (print {action: "set-minimum-staking-duration", caller: caller, data: {duration: duration}})
      (ok true)
    )
  )
)

;; Set reward emitted per block for a bin
(define-public (set-reward-per-block (bin-id uint) (reward uint))
  (let (
    (current-bin-data (map-get? bin-data bin-id))
    (current-reward-per-block (default-to u0 (get reward-per-block current-bin-data)))
    (updated-total-rewards-per-block (+ (- (var-get total-rewards-per-block) current-reward-per-block) reward))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)

      ;; Update reward-index for bin
      (if (is-some current-bin-data)
          (unwrap-panic (update-reward-index bin-id))
          false)

      ;; Assert contract has sufficient reward balance for new reward rate
      (asserts! (>= (unwrap-panic (get-available-contract-balance)) (* updated-total-rewards-per-block MIN_REWARD_BUFFER_BLOCKS)) ERR_INSUFFICIENT_TOKEN_BALANCE)
      
      ;; Update total-rewards-per-block
      (var-set total-rewards-per-block updated-total-rewards-per-block)

      ;; Update bin-data mapping
      (map-set bin-data bin-id (merge (default-to {lp-staked: u0, reward-per-block: u0, reward-index: u0, last-reward-index-update: stacks-block-height} current-bin-data) {
        reward-per-block: reward
      }))
      
      ;; Print function data and return true
      (print {action: "set-reward-per-block", caller: caller, data: {bin-id: bin-id, reward: reward}})
      (ok true)
    )
  )
)

;; Stake LP tokens for a bin
(define-public (stake-lp-tokens (bin-id int) (amount uint))
  (let (
    (caller tx-sender)
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))
    (current-bin-data (unwrap! (map-get? bin-data unsigned-bin-id) ERR_NO_BIN_DATA))
    (current-user-data (map-get? user-data caller))
    (current-user-data-at-bin (map-get? user-data-at-bin {user: caller, bin-id: unsigned-bin-id}))
    (current-user-bins-staked (default-to (list ) (get bins-staked current-user-data)))
    (updated-user-bins-staked (if (is-none (index-of current-user-bins-staked unsigned-bin-id))
                                  (unwrap! (as-max-len? (concat current-user-bins-staked (list unsigned-bin-id)) u1001) ERR_BINS_STAKED_OVERFLOW)
                                  current-user-bins-staked))
    (updated-user-lp-staked (+ (default-to u0 (get lp-staked current-user-data)) amount))
    (updated-bin-lp-staked (+ (get lp-staked current-bin-data) amount))
    (updated-total-lp-staked (+ (var-get total-lp-staked) amount))
  )
    (begin
      ;; Assert staking-status is true and amount is greater than 0
      (asserts! (var-get staking-status) ERR_STAKING_DISABLED)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)

      ;; Update reward-index for bin
      (unwrap-panic (update-reward-index unsigned-bin-id))

      ;; Claim any rewards at bin
      (if (is-some current-user-data-at-bin)
          (try! (claim-rewards bin-id))
          u0)

      ;; Update total LP staked
      (var-set total-lp-staked updated-total-lp-staked)

      ;; Update bin-data mapping
      (map-set bin-data unsigned-bin-id (merge current-bin-data {
        lp-staked: updated-bin-lp-staked
      }))

      ;; Update user-data mapping
      (map-set user-data caller {
        bins-staked: updated-user-bins-staked,
        lp-staked: updated-user-lp-staked
      })

      ;; Update user-data-at-bin mapping
      (map-set user-data-at-bin {user: caller, bin-id: unsigned-bin-id} {
        lp-staked: (+ (default-to u0 (get lp-staked current-user-data-at-bin)) amount),
        reward-index: (get reward-index (unwrap-panic (get-updated-reward-index unsigned-bin-id))),
        last-stake-height: stacks-block-height
      })

      ;; Transfer amount LP tokens from caller to contract
      (try! (transfer-lp-token unsigned-bin-id amount caller (as-contract tx-sender)))

      ;; Print function data and return true
      (print {
        action: "stake-lp-tokens",
        caller: caller,
        data: {
          bin-id: bin-id,
          amount: amount,
          user-bins-staked: updated-user-bins-staked,
          user-lp-staked: updated-user-lp-staked,
          total-lp-staked: updated-total-lp-staked
        }
      })
      (ok true)
    )
  )
)

;; Unstake LP tokens for a bin
(define-public (unstake-lp-tokens (bin-id int))
  (let (
    (caller tx-sender)
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))
    (current-bin-data (unwrap! (map-get? bin-data unsigned-bin-id) ERR_NO_BIN_DATA))
    (current-user-data (unwrap! (map-get? user-data caller) ERR_NO_USER_DATA))
    (current-user-data-at-bin (unwrap! (map-get? user-data-at-bin {user: caller, bin-id: unsigned-bin-id}) ERR_NO_USER_DATA_AT_BIN))
    (lp-to-unstake (get lp-staked current-user-data-at-bin))
    (helper-value-unsigned-bin-id (var-set helper-value unsigned-bin-id))
    (updated-total-lp-staked (- (var-get total-lp-staked) lp-to-unstake))
    (updated-bin-lp-staked (- (get lp-staked current-bin-data) lp-to-unstake))
    (updated-user-bins-staked (filter filter-values-eq-helper-value (get bins-staked current-user-data)))
    (updated-user-lp-staked (- (get lp-staked current-user-data) lp-to-unstake))
  )
    (begin
      ;; Assert lp-to-unstake is greater than 0 and minimum staking duration has passed
      (asserts! (> lp-to-unstake u0) ERR_NO_LP_TO_UNSTAKE)
      (asserts! (>= (- stacks-block-height (get last-stake-height current-user-data-at-bin)) (var-get minimum-staking-duration)) ERR_MINIMUM_STAKING_DURATION_HAS_NOT_PASSED)

      ;; Update reward-index for bin
      (unwrap-panic (update-reward-index unsigned-bin-id))
      
      ;; Claim any rewards at bin
      (try! (claim-rewards bin-id))

      ;; Update total LP staked
      (var-set total-lp-staked updated-total-lp-staked)

      ;; Update bin-data mapping
      (map-set bin-data unsigned-bin-id (merge current-bin-data {
        lp-staked: updated-bin-lp-staked
      }))

      ;; Update user-data mapping
      (map-set user-data caller (merge current-user-data {
        bins-staked: updated-user-bins-staked,
        lp-staked: updated-user-lp-staked
      }))

      ;; Delete entry in user-data-at-bin mapping
      (map-delete user-data-at-bin {user: caller, bin-id: unsigned-bin-id})

      ;; Transfer lp-to-unstake LP tokens from contract to caller
      (try! (as-contract (transfer-lp-token unsigned-bin-id lp-to-unstake tx-sender caller)))

      ;; Print function data and return true
      (print {
        action: "unstake-lp-tokens",
        caller: caller,
        data: {
          bin-id: bin-id,
          lp-to-unstake: lp-to-unstake,
          user-bins-staked: updated-user-bins-staked,
          user-lp-staked: updated-user-lp-staked,
          total-lp-staked: updated-total-lp-staked
        }
      })
      (ok true)
    )
  )
)

;; Early unstake LP tokens at a bin
(define-public (early-unstake-lp-tokens (bin-id int))
  (let (
    (caller tx-sender)
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))
    (current-bin-data (unwrap! (map-get? bin-data unsigned-bin-id) ERR_NO_BIN_DATA))
    (current-user-data (unwrap! (map-get? user-data caller) ERR_NO_USER_DATA))
    (current-user-data-at-bin (unwrap! (map-get? user-data-at-bin {user: caller, bin-id: unsigned-bin-id}) ERR_NO_USER_DATA_AT_BIN))
    (lp-to-unstake (get lp-staked current-user-data-at-bin))
    (lp-to-unstake-fees (/ (* lp-to-unstake (var-get early-unstake-fee)) FEE_SCALE_BPS))
    (lp-to-unstake-user (- lp-to-unstake lp-to-unstake-fees))
    (helper-value-unsigned-bin-id (var-set helper-value unsigned-bin-id))
    (updated-total-lp-staked (- (var-get total-lp-staked) lp-to-unstake))
    (updated-bin-lp-staked (- (get lp-staked current-bin-data) lp-to-unstake))
    (updated-user-bins-staked (filter filter-values-eq-helper-value (get bins-staked current-user-data)))
    (updated-user-lp-staked (- (get lp-staked current-user-data) lp-to-unstake))
  )
    (begin
      ;; Assert early-unstake-status is true
      (asserts! (var-get early-unstake-status) ERR_EARLY_UNSTAKE_DISABLED)

      ;; Assert lp-to-unstake is greater than 0 and minimum staking duration hasn't passed
      (asserts! (> lp-to-unstake u0) ERR_NO_EARLY_LP_TO_UNSTAKE)
      (asserts! (< (- stacks-block-height (get last-stake-height current-user-data-at-bin)) (var-get minimum-staking-duration)) ERR_MINIMUM_STAKING_DURATION_PASSED)

      ;; Update reward-index for bin
      (unwrap-panic (update-reward-index unsigned-bin-id))
      
      ;; Claim any rewards at bin
      (try! (claim-rewards bin-id))

      ;; Update total LP staked
      (var-set total-lp-staked updated-total-lp-staked)

      ;; Update bin-data mapping
      (map-set bin-data unsigned-bin-id (merge current-bin-data {
        lp-staked: updated-bin-lp-staked
      }))

      ;; Update user-data mapping
      (map-set user-data caller (merge current-user-data {
        bins-staked: updated-user-bins-staked,
        lp-staked: updated-user-lp-staked
      }))

      ;; Delete entry in user-data-at-bin mapping
      (map-delete user-data-at-bin {user: caller, bin-id: unsigned-bin-id})

      ;; Transfer lp-to-unstake-user LP tokens from contract to caller
      (try! (as-contract (transfer-lp-token unsigned-bin-id lp-to-unstake-user tx-sender caller)))

      ;; Transfer lp-to-unstake-fees LP tokens from contract to early-unstake-fee-address
      (if (> lp-to-unstake-fees u0)
        (try! (as-contract (transfer-lp-token unsigned-bin-id lp-to-unstake-fees tx-sender (var-get early-unstake-fee-address))))
        false)

      ;; Print function data and return true
      (print {
        action: "early-unstake-lp-tokens",
        caller: caller,
        data: {
          bin-id: bin-id,
          lp-to-unstake: lp-to-unstake,
          user-bins-staked: updated-user-bins-staked,
          user-lp-staked: updated-user-lp-staked,
          total-lp-staked: updated-total-lp-staked
        }
      })
      (ok true)
    )
  )
)

;; Claim any unclaimed rewards at a bin
(define-public (claim-rewards (bin-id int))
  (let (
    (caller tx-sender)
    (unsigned-bin-id (to-uint (+ bin-id (to-int CENTER_BIN_ID))))
    (current-bin-data (unwrap! (map-get? bin-data unsigned-bin-id) ERR_NO_BIN_DATA))
    (current-user-data-at-bin (unwrap! (map-get? user-data-at-bin {user: caller, bin-id: unsigned-bin-id}) ERR_NO_USER_DATA_AT_BIN))
    (unclaimed-rewards (try! (get-unclaimed-rewards caller bin-id)))
  )
    ;; Claim rewards if unclaimed-rewards is greater than 0
    (if (> unclaimed-rewards u0)
      (begin
        ;; Update reward-index for bin
        (unwrap-panic (update-reward-index unsigned-bin-id))

        ;; Transfer unclaimed-rewards rewards token from contract to caller
        (try! (as-contract (transfer-reward-token unclaimed-rewards tx-sender caller)))
        
        ;; Update user-data-at-bin mapping
        (map-set user-data-at-bin {user: caller, bin-id: unsigned-bin-id} (merge current-user-data-at-bin {
          reward-index: (get reward-index (unwrap-panic (get-updated-reward-index unsigned-bin-id)))
        }))

        ;; Update total-rewards-claimed
        (var-set total-rewards-claimed (+ (var-get total-rewards-claimed) unclaimed-rewards))

        ;; Print function data and return true
        (print {action: "claim-rewards", caller: caller, data: {bin-id: bin-id, unclaimed-rewards: unclaimed-rewards}})
        (ok unclaimed-rewards)
      )
      (ok u0))
  )
)

;; Withdraw reward token from contract
(define-public (withdraw-rewards (amount uint) (recipient principal))
  (let (
    (current-available-contract-balance (unwrap-panic (get-available-contract-balance)))
    (caller tx-sender)
  )
    (begin
      ;; Assert caller is an admin and recipient is standard principal
      (asserts! (is-some (index-of (var-get admins) caller)) ERR_NOT_AUTHORIZED)
      (asserts! (is-standard recipient) ERR_INVALID_PRINCIPAL)

      ;; Assert amount is greater than 0
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)

      ;; Assert blocks since last-total-rewards-accrued-update is less than or equal to MIN_REWARD_BUFFER_BLOCKS
      (asserts! (<= (- stacks-block-height (var-get last-total-rewards-accrued-update)) MIN_REWARD_BUFFER_BLOCKS) ERR_MIN_REWARD_BUFFER_BLOCKS_PASSED)

      ;; Assert amount is less than or equal to available contract reward balance
      (asserts! (<= amount current-available-contract-balance) ERR_INSUFFICIENT_TOKEN_BALANCE)
      
      ;; Assert contract has sufficient reward balance for reward rate
      (asserts! (>= (- current-available-contract-balance amount) (* (var-get total-rewards-per-block) MIN_REWARD_BUFFER_BLOCKS)) ERR_INSUFFICIENT_TOKEN_BALANCE)

      ;; Transfer amount rewards token from contract to recipient
      (try! (as-contract (transfer-reward-token amount tx-sender recipient)))

      ;; Print function data and return true
      (print {action: "withdraw-rewards", caller: caller, data: {amount: amount, recipient: recipient}})
      (ok true)
    )
  )
)

;; Update reward index for a bin
(define-public (update-reward-index (bin-id uint))
  (let (
    (current-bin-data (unwrap! (map-get? bin-data bin-id) ERR_NO_BIN_DATA))
    (updated-reward-index (unwrap-panic (get-updated-reward-index bin-id)))
    (caller tx-sender)
  )
    ;; Update last-total-rewards-accrued-update
    (var-set last-total-rewards-accrued-update stacks-block-height)

    ;; Update reward index if stacks-block-height is greater than last-reward-index-update
    (if (> stacks-block-height (get last-reward-index-update current-bin-data))
        (begin
          ;; Update bin-data mapping
          (map-set bin-data bin-id (merge current-bin-data {
            reward-index: (get reward-index updated-reward-index),
            last-reward-index-update: stacks-block-height
          }))

          ;; Update total-rewards-accrued
          (var-set total-rewards-accrued (+ (var-get total-rewards-accrued) (get rewards-to-distribute updated-reward-index)))
          
          ;; Print function data and return true
          (print {action: "update-reward-index", caller: caller, data: {updated-reward-index: updated-reward-index}})
          (ok true)
        )
        (ok true))
  )
)

;; Get unclaimed rewards for multiple bins
(define-public (get-unclaimed-rewards-multi
    (users (list 350 principal))
    (bin-ids (list 350 int))
  )
  (ok (map get-unclaimed-rewards users bin-ids))
)

;; Set reward emitted per block for multiple bins
(define-public (set-reward-per-block-multi
    (bin-ids (list 350 uint))
    (amounts (list 350 uint))
  )
  (ok (map set-reward-per-block bin-ids amounts))
)

;; Stake LP tokens for multiple bins
(define-public (stake-lp-tokens-multi
    (bin-ids (list 350 int))
    (amounts (list 350 uint))
  )
  (ok (map stake-lp-tokens bin-ids amounts))
)

;; Unstake LP tokens for multiple bins
(define-public (unstake-lp-tokens-multi
    (bin-ids (list 350 int))
  )
  (ok (map unstake-lp-tokens bin-ids))
)

;; Early unstake LP tokens for multiple bins
(define-public (early-unstake-lp-tokens-multi
    (bin-ids (list 350 int))
  )
  (ok (map early-unstake-lp-tokens bin-ids))
)

;; Claim any unclaimed rewards for multiple bins
(define-public (claim-rewards-multi
    (bin-ids (list 350 int))
  )
  (ok (map claim-rewards bin-ids))
)

;; Update reward index for multiple bins
(define-public (update-reward-index-multi
    (bin-ids (list 350 uint))
  )
  (ok (map update-reward-index bin-ids))
)

;; Helper function for removing an admin
(define-private (admin-not-removable (admin principal))
  (not (is-eq admin (var-get admin-helper)))
)

;; Filter function for removing a bin-id from the bins-staked list
(define-private (filter-values-eq-helper-value (value uint))
  (not (is-eq value (var-get helper-value)))
)

;; Get reward token balance for contract
(define-private (get-reward-token-balance)
  (ok (unwrap! (contract-call? .token-stx-v-1-1 get-balance (as-contract tx-sender))
    ERR_CANNOT_GET_TOKEN_BALANCE
  ))
)

;; Transfer LP token
(define-private (transfer-lp-token (bin-id uint) (amount uint) (sender principal) (recipient principal))
  (ok (unwrap! (contract-call? .dlmm-pool-sbtc-usdc-v-1-1 transfer
               bin-id amount sender recipient) ERR_TOKEN_TRANSFER_FAILED))
)

;; Transfer reward token
(define-private (transfer-reward-token (amount uint) (sender principal) (recipient principal))
  (ok (unwrap! (contract-call? .token-stx-v-1-1 transfer
               amount sender recipient none) ERR_TOKEN_TRANSFER_FAILED))
)