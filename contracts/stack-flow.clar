;; StackFlow - Micro-tipping platform on Stacks
;; Version: 1.0.0
;;
;; StackFlow is a decentralized micro-tipping protocol built on the Stacks blockchain.
;; It enables users to send STX tips with optional messages to creators, developers,
;; and contributors. The contract records tipping activity, tracks user statistics,
;; and collects a small platform fee for sustainability.
;;
;; The protocol provides transparent on-chain metrics such as:
;; - Total tips sent
;; - Total transaction volume
;; - User tipping statistics
;; - Platform fee accumulation

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-amount (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-transfer-failed (err u103))
(define-constant err-not-found (err u104))

;; Fee configuration
;; 0.5% fee = 50 basis points
(define-constant fee-basis-points u50)
(define-constant basis-points-divisor u10000)


;; Data Variables
;; Global statistics tracked by the StackFlow protocol
(define-data-var total-tips-sent uint u0)
(define-data-var total-volume uint u0)
(define-data-var platform-fees uint u0)

;; Data Maps

;; Stores all tips sent through StackFlow
(define-map tips
    { tip-id: uint }
    {
        sender: principal,
        recipient: principal,
        amount: uint,
        message: (string-utf8 280),
        tip-height: uint
    }
)

;; User activity statistics
(define-map user-tip-count principal uint)
(define-map user-received-count principal uint)
(define-map user-total-sent principal uint)
(define-map user-total-received principal uint)

;; ---------------------------------------------------------
;; Private Functions
;; ---------------------------------------------------------

;; Calculates the platform fee based on the configured basis points
(define-private (calculate-fee (amount uint))
    (/ (* amount fee-basis-points) basis-points-divisor)
)

;; ---------------------------------------------------------
;; Public Functions
;; ---------------------------------------------------------

;; send-tip
;; Allows a user to send a micro-tip to another user with an optional message.
;; A small platform fee is deducted and sent to the contract owner.
(define-public (send-tip (recipient principal) (amount uint) (message (string-utf8 280)))
    (let
        (
            (tip-id (var-get total-tips-sent))
            (fee (calculate-fee amount))
            (is-owner (is-eq tx-sender contract-owner))
            (net-amount (if is-owner amount (- amount fee)))
            (sender-sent (default-to u0 (map-get? user-total-sent tx-sender)))
            (recipient-received (default-to u0 (map-get? user-total-received recipient)))
            (sender-count (default-to u0 (map-get? user-tip-count tx-sender)))
            (recipient-count (default-to u0 (map-get? user-received-count recipient)))
        )
        ;; Validation checks
        (asserts! (> amount u0) err-invalid-amount)
        (asserts! (not (is-eq tx-sender recipient)) err-invalid-amount)

        ;; Transfer STX to recipient
        (try! (stx-transfer? net-amount tx-sender recipient))

        ;; Transfer platform fee to contract owner (skip if sender is owner)
        (if is-owner true (try! (stx-transfer? fee tx-sender contract-owner)))

        ;; Record the tip
        (map-set tips
            { tip-id: tip-id }
            {
                sender: tx-sender,
                recipient: recipient,
                amount: amount,
                message: message,
                tip-height: stacks-block-height
            }
        )

        ;; Update user statistics
        (map-set user-total-sent tx-sender (+ sender-sent amount))