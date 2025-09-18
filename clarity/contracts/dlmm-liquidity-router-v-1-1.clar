;; dlmm-liquidity-router-v-1-1

;; Use DLMM pool trait and SIP 010 trait
(use-trait dlmm-pool-trait .dlmm-pool-trait-v-1-1.dlmm-pool-trait)
(use-trait sip-010-trait .sip-010-trait-ft-standard-v-1-1.sip-010-trait)

(define-constant ERR_NO_RESULT_DATA (err u2001))
(define-constant ERR_MINIMUM_X_AMOUNT (err u2002))
(define-constant ERR_MINIMUM_Y_AMOUNT (err u2003))
(define-constant ERR_NO_ACTIVE_BIN_DATA (err u2004))
(define-constant ERR_EMPTY_POSITIONS_LIST (err u2005))
(define-constant ERR_RESULTS_LIST_OVERFLOW (err u2006))

;; Add liquidity to multiple bins in multiple pools
(define-public (add-liquidity-multi
    (positions (list 350 {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, bin-id: int, x-amount: uint, y-amount: uint, min-dlp: uint}))
  )
  (let (
    (add-liquidity-result (try! (fold fold-add-liquidity-multi positions (ok (list )))))
  )
    (asserts! (> (len positions) u0) ERR_EMPTY_POSITIONS_LIST)
    (ok add-liquidity-result)
  )
)

;; Add liquidity to multiple bins in multiple pools relative to the active bin
(define-public (add-relative-liquidity-multi
    (positions (list 350 {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, active-bin-id-offset: int, x-amount: uint, y-amount: uint, min-dlp: uint}))
  )
  (let (
    (add-liquidity-result (try! (fold fold-add-relative-liquidity-multi positions (ok (list )))))
  )
    (asserts! (> (len positions) u0) ERR_EMPTY_POSITIONS_LIST)
    (ok add-liquidity-result)
  )
)

;; Withdraw liquidity from multiple bins in multiple pools
(define-public (withdraw-liquidity-multi
    (positions (list 350 {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, bin-id: int, amount: uint, min-x-amount: uint, min-y-amount: uint}))
  )
  (let (
    (withdraw-liquidity-result (try! (fold fold-withdraw-liquidity-multi positions (ok (list )))))
  )
    (asserts! (> (len positions) u0) ERR_EMPTY_POSITIONS_LIST)
    (ok withdraw-liquidity-result)
  )
)

;; Withdraw liquidity from multiple bins in multiple pools relative to the active bin
(define-public (withdraw-relative-liquidity-multi
    (positions (list 350 {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, active-bin-id-offset: int, amount: uint, min-x-amount: uint, min-y-amount: uint}))
  )
  (let (
    (withdraw-liquidity-result (try! (fold fold-withdraw-relative-liquidity-multi positions (ok (list )))))
  )
    (asserts! (> (len positions) u0) ERR_EMPTY_POSITIONS_LIST)
    (ok withdraw-liquidity-result)
  )
)

;; Withdraw liquidity from multiple bins in multiple pools using the same token pair
(define-public (withdraw-same-liquidity-multi
    (positions (list 350 {pool-trait: <dlmm-pool-trait>, bin-id: int, amount: uint, min-x-amount: uint, min-y-amount: uint}))
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (min-x-amount-total uint) (min-y-amount-total uint)
  )
  (let (
    (withdraw-liquidity-result (try! (fold fold-withdraw-same-liquidity-multi positions (ok {x-token-trait: x-token-trait, y-token-trait: y-token-trait, results: (list ), x-amount: u0, y-amount: u0}))))
    (x-amount-total (get x-amount withdraw-liquidity-result))
    (y-amount-total (get y-amount withdraw-liquidity-result))
  )
    (asserts! (> (len positions) u0) ERR_EMPTY_POSITIONS_LIST)
    (asserts! (>= x-amount-total min-x-amount-total) ERR_MINIMUM_X_AMOUNT)
    (asserts! (>= y-amount-total min-y-amount-total) ERR_MINIMUM_Y_AMOUNT)
    (ok {results: (get results withdraw-liquidity-result), x-amount: x-amount-total, y-amount: y-amount-total})
  )
)

;; Withdraw liquidity from multiple bins in multiple pools relative to the active bin using the same token pair
(define-public (withdraw-same-relative-liquidity-multi
    (positions (list 350 {pool-trait: <dlmm-pool-trait>, active-bin-id-offset: int, amount: uint, min-x-amount: uint, min-y-amount: uint}))
    (x-token-trait <sip-010-trait>) (y-token-trait <sip-010-trait>)
    (min-x-amount-total uint) (min-y-amount-total uint)
  )
  (let (
    (withdraw-liquidity-result (try! (fold fold-withdraw-same-relative-liquidity-multi positions (ok {x-token-trait: x-token-trait, y-token-trait: y-token-trait, results: (list ), x-amount: u0, y-amount: u0}))))
    (x-amount-total (get x-amount withdraw-liquidity-result))
    (y-amount-total (get y-amount withdraw-liquidity-result))
  )
    (asserts! (> (len positions) u0) ERR_EMPTY_POSITIONS_LIST)
    (asserts! (>= x-amount-total min-x-amount-total) ERR_MINIMUM_X_AMOUNT)
    (asserts! (>= y-amount-total min-y-amount-total) ERR_MINIMUM_Y_AMOUNT)
    (ok {results: (get results withdraw-liquidity-result), x-amount: x-amount-total, y-amount: y-amount-total})
  )
)

;; Move liquidity for multiple bins in multiple pools
(define-public (move-liquidity-multi
    (positions (list 350 {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, from-bin-id: int, to-bin-id: int, amount: uint, min-dlp: uint}))
  )
  (let (
    (move-liquidity-result (try! (fold fold-move-liquidity-multi positions (ok (list )))))
  )
    (asserts! (> (len positions) u0) ERR_EMPTY_POSITIONS_LIST)
    (ok move-liquidity-result)
  )
)

;; Move liquidity for multiple bins in multiple pools relative to the active bin
(define-public (move-relative-liquidity-multi
    (positions (list 350 {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, from-bin-id: int, active-bin-id-offset: int, amount: uint, min-dlp: uint}))
  )
  (let (
    (move-liquidity-result (try! (fold fold-move-relative-liquidity-multi positions (ok (list )))))
  )
    (asserts! (> (len positions) u0) ERR_EMPTY_POSITIONS_LIST)
    (ok move-liquidity-result)
  )
)

;; Fold function to add liquidity to multiple bins in multiple pools
(define-private (fold-add-liquidity-multi
    (position {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, bin-id: int, x-amount: uint, y-amount: uint, min-dlp: uint})
    (result (response (list 350 uint) uint))
  )
  (let (
    (result-data (unwrap! result ERR_NO_RESULT_DATA))
    (add-liquidity-result (try! (contract-call? .dlmm-core-v-1-1 add-liquidity (get pool-trait position) (get x-token-trait position) (get y-token-trait position) (get bin-id position) (get x-amount position) (get y-amount position) (get min-dlp position))))
    (updated-result (unwrap! (as-max-len? (concat result-data (list add-liquidity-result)) u350) ERR_RESULTS_LIST_OVERFLOW))
  )
    (ok updated-result)
  )
)

;; Fold function to add liquidity to multiple bins in multiple pools relative to the active bin
(define-private (fold-add-relative-liquidity-multi
    (position {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, active-bin-id-offset: int, x-amount: uint, y-amount: uint, min-dlp: uint})
    (result (response (list 350 uint) uint))
  )
  (let (
    (result-data (unwrap! result ERR_NO_RESULT_DATA))
    (pool-trait (get pool-trait position))
    (active-bin-id (unwrap! (contract-call? pool-trait get-active-bin-id) ERR_NO_ACTIVE_BIN_DATA))
    (bin-id (+ active-bin-id (get active-bin-id-offset position)))
    (add-liquidity-result (try! (contract-call? .dlmm-core-v-1-1 add-liquidity pool-trait (get x-token-trait position) (get y-token-trait position) bin-id (get x-amount position) (get y-amount position) (get min-dlp position))))
    (updated-result (unwrap! (as-max-len? (concat result-data (list add-liquidity-result)) u350) ERR_RESULTS_LIST_OVERFLOW))
  )
    (ok updated-result)
  )
)

;; Fold function to withdraw liquidity from multiple bins in multiple pools
(define-private (fold-withdraw-liquidity-multi
    (position {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, bin-id: int, amount: uint, min-x-amount: uint, min-y-amount: uint})
    (result (response (list 350 {x-amount: uint, y-amount: uint}) uint))
  )
  (let (
    (result-data (unwrap! result ERR_NO_RESULT_DATA))
    (withdraw-liquidity-result (try! (contract-call? .dlmm-core-v-1-1 withdraw-liquidity (get pool-trait position) (get x-token-trait position) (get y-token-trait position) (get bin-id position) (get amount position) (get min-x-amount position) (get min-y-amount position))))
    (updated-result (unwrap! (as-max-len? (concat result-data (list withdraw-liquidity-result)) u350) ERR_RESULTS_LIST_OVERFLOW))
  )
    (ok updated-result)
  )
)

;; Fold function to withdraw liquidity from multiple bins in multiple pools relative to the active bin
(define-private (fold-withdraw-relative-liquidity-multi
    (position {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, active-bin-id-offset: int, amount: uint, min-x-amount: uint, min-y-amount: uint})
    (result (response (list 350 {x-amount: uint, y-amount: uint}) uint))
  )
  (let (
    (result-data (unwrap! result ERR_NO_RESULT_DATA))
    (pool-trait (get pool-trait position))
    (active-bin-id (unwrap! (contract-call? pool-trait get-active-bin-id) ERR_NO_ACTIVE_BIN_DATA))
    (bin-id (+ active-bin-id (get active-bin-id-offset position)))
    (withdraw-liquidity-result (try! (contract-call? .dlmm-core-v-1-1 withdraw-liquidity pool-trait (get x-token-trait position) (get y-token-trait position) bin-id (get amount position) (get min-x-amount position) (get min-y-amount position))))
    (updated-result (unwrap! (as-max-len? (concat result-data (list withdraw-liquidity-result)) u350) ERR_RESULTS_LIST_OVERFLOW))
  )
    (ok updated-result)
  )
)

;; Fold function to withdraw liquidity from multiple bins in multiple pools using the same token pair
(define-private (fold-withdraw-same-liquidity-multi
    (position {pool-trait: <dlmm-pool-trait>, bin-id: int, amount: uint, min-x-amount: uint, min-y-amount: uint})
    (result (response {x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, results: (list 350 {x-amount: uint, y-amount: uint}), x-amount: uint, y-amount: uint} uint))
  )
  (let (
    (result-data (unwrap! result ERR_NO_RESULT_DATA))
    (x-token-trait (get x-token-trait result-data))
    (y-token-trait (get y-token-trait result-data))
    (withdraw-liquidity-result (try! (contract-call? .dlmm-core-v-1-1 withdraw-liquidity (get pool-trait position) x-token-trait y-token-trait (get bin-id position) (get amount position) (get min-x-amount position) (get min-y-amount position))))
    (updated-results (unwrap! (as-max-len? (concat (get results result-data) (list withdraw-liquidity-result)) u350) ERR_RESULTS_LIST_OVERFLOW))
    (updated-x-amount (+ (get x-amount result-data) (get x-amount withdraw-liquidity-result)))
    (updated-y-amount (+ (get y-amount result-data) (get y-amount withdraw-liquidity-result)))
  )
    (ok {x-token-trait: x-token-trait, y-token-trait: y-token-trait, results: updated-results, x-amount: updated-x-amount, y-amount: updated-y-amount})
  )
)

;; Fold function to withdraw liquidity from multiple bins in multiple pools relative to the active bin using the same token pair
(define-private (fold-withdraw-same-relative-liquidity-multi
    (position {pool-trait: <dlmm-pool-trait>, active-bin-id-offset: int, amount: uint, min-x-amount: uint, min-y-amount: uint})
    (result (response {x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, results: (list 350 {x-amount: uint, y-amount: uint}), x-amount: uint, y-amount: uint} uint))
  )
  (let (
    (result-data (unwrap! result ERR_NO_RESULT_DATA))
    (x-token-trait (get x-token-trait result-data))
    (y-token-trait (get y-token-trait result-data))
    (pool-trait (get pool-trait position))
    (active-bin-id (unwrap! (contract-call? pool-trait get-active-bin-id) ERR_NO_ACTIVE_BIN_DATA))
    (bin-id (+ active-bin-id (get active-bin-id-offset position)))
    (withdraw-liquidity-result (try! (contract-call? .dlmm-core-v-1-1 withdraw-liquidity pool-trait x-token-trait y-token-trait bin-id (get amount position) (get min-x-amount position) (get min-y-amount position))))
    (updated-results (unwrap! (as-max-len? (concat (get results result-data) (list withdraw-liquidity-result)) u350) ERR_RESULTS_LIST_OVERFLOW))
    (updated-x-amount (+ (get x-amount result-data) (get x-amount withdraw-liquidity-result)))
    (updated-y-amount (+ (get y-amount result-data) (get y-amount withdraw-liquidity-result)))
  )
    (ok {x-token-trait: x-token-trait, y-token-trait: y-token-trait, results: updated-results, x-amount: updated-x-amount, y-amount: updated-y-amount})
  )
)

;; Fold function to move liquidity for multiple bins in multiple pools
(define-private (fold-move-liquidity-multi
    (position {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, from-bin-id: int, to-bin-id: int, amount: uint, min-dlp: uint})
    (result (response (list 350 uint) uint))
  )
  (let (
    (result-data (unwrap! result ERR_NO_RESULT_DATA))
    (move-liquidity-result (try! (contract-call? .dlmm-core-v-1-1 move-liquidity (get pool-trait position) (get x-token-trait position) (get y-token-trait position) (get from-bin-id position) (get to-bin-id position) (get amount position) (get min-dlp position))))
    (updated-result (unwrap! (as-max-len? (concat result-data (list move-liquidity-result)) u350) ERR_RESULTS_LIST_OVERFLOW))
  )
    (ok updated-result)
  )
)

;; Fold function to move liquidity for multiple bins in multiple pools relative to the active bin
(define-private (fold-move-relative-liquidity-multi
    (position {pool-trait: <dlmm-pool-trait>, x-token-trait: <sip-010-trait>, y-token-trait: <sip-010-trait>, from-bin-id: int, active-bin-id-offset: int, amount: uint, min-dlp: uint})
    (result (response (list 350 uint) uint))
  )
  (let (
    (result-data (unwrap! result ERR_NO_RESULT_DATA))
    (pool-trait (get pool-trait position))
    (active-bin-id (unwrap! (contract-call? pool-trait get-active-bin-id) ERR_NO_ACTIVE_BIN_DATA))
    (to-bin-id (+ active-bin-id (get active-bin-id-offset position)))
    (move-liquidity-result (try! (contract-call? .dlmm-core-v-1-1 move-liquidity pool-trait (get x-token-trait position) (get y-token-trait position) (get from-bin-id position) to-bin-id (get amount position) (get min-dlp position))))
    (updated-result (unwrap! (as-max-len? (concat result-data (list move-liquidity-result)) u350) ERR_RESULTS_LIST_OVERFLOW))
  )
    (ok updated-result)
  )
)