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