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