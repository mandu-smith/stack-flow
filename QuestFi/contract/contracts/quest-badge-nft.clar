;; quest-badge-nft
;; Automated commit #1
;; Quest Badge NFT - Minted upon quest completion following SIP-009 NFT standard
;; Each badge represents mastery of a specific DeFi protocol

;; Implement SIP-009 NFT trait
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Define the NFT
(define-non-fungible-token quest-badge uint)

;; Data vars
(define-data-var last-token-id uint u0)
(define-data-var base-token-uri (string-ascii 256) "https://stxfinance.xyz/api/metadata/")

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_UNAUTHORIZED (err u103))
(define-constant ERR_ALREADY_CLAIMED (err u104))
(define-constant ERR_INVALID_QUEST (err u105))

;; Map token ID to quest info
(define-map token-info
  uint
  {
    protocol: (string-ascii 50),
    owner: principal,
    completion-date: uint,
    xp-earned: uint,
  }
)

;; Map user + protocol to token ID (prevent duplicate claims)
(define-map user-protocol-badge
  {
    user: principal,
    protocol: (string-ascii 50),
  }
  uint
)

;; Track total badges minted per protocol
(define-map protocol-badge-count
  (string-ascii 50)
  uint
)

;; Valid protocol names
(define-map valid-protocols
  (string-ascii 50)
  {
    active: bool,
    xp-reward: uint,
    }
)

;; SIP-009 required functions

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (if (> (len (var-get base-token-uri)) u0)
  (ok (some (var-get base-token-uri)))
  (ok none)
  )
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? quest-badge token-id))
)

;; Transfer function - Soul-bound badges cannot be transferred
;; They represent personal achievement and cannot be traded
(define-public (transfer
    (token-id uint)
    (sender principal)
    (recipient principal)
  )
  ERR_UNAUTHORIZED
)

;; Core minting function

;; Mint NFT badge for quest completion
;; Anyone can call this to mint their own badge after completing a quest
(define-public (mint-badge (protocol (string-ascii 50)))
  (let (
      (token-id (+ (var-get last-token-id) u1))
      (token-id (+ (var-get last-token-id) u1))
      (protocol-info (unwrap! (map-get? valid-protocols protocol) ERR_INVALID_QUEST))
      (current-count (default-to u0 (map-get? protocol-badge-count protocol)))
    )
    ;; Check if protocol is active
    (asserts! (get active protocol-info) ERR_INVALID_QUEST)

    ;; Check if user already has badge for this protocol
    (asserts!
      (is-none (map-get? user-protocol-badge {
        user: tx-sender,
        protocol: protocol,
        owner: tx-sender,
        completion-date: stacks-block-height,
        xp-earned: (get xp-reward protocol-info),
    })
    (map-set user-protocol-badge {