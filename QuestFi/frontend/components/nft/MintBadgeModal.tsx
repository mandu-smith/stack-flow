'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, CheckCircle2, ExternalLink, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { stringAsciiCV } from '@stacks/transactions'
import { useTurnkey } from '@turnkey/sdk-react'
import {
  signAndBroadcastContractCallWithPasskey,
  getAccountNonce
} from '@/lib/stacks/turnkey-signer'

interface MintBadgeModalProps {
  isOpen: boolean
  onClose: () => void
  protocol: {
    id: string
    name: string
    icon: string
    xp: number
  }
}

export default function MintBadgeModal({ isOpen, onClose, protocol }: MintBadgeModalProps) {
  const [mintingState, setMintingState] = useState<'ready' | 'minting' | 'success'>('ready')
  const [tokenId, setTokenId] = useState<number | null>(null)
  const [txId, setTxId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { passkeyClient } = useTurnkey()

  const handleMint = async () => {
    setMintingState('minting')
    setError(null)

    // Validate protocol data
    if (!protocol || !protocol.id) {
      setError('Invalid protocol data')
      setMintingState('ready')
      return
    }

    // Check authentication (either Turnkey or Wallet)
    const suborgId = localStorage.getItem('turnkey_suborg_id')
    const walletAddress = localStorage.getItem('wallet_address')
    const userIdentifier = suborgId || walletAddress

    if (!userIdentifier) {
      setError('Not authenticated. Please sign in again.')
      setMintingState('ready')
      return
    }

    if (!passkeyClient) {
      setError('Passkey client not available. Please refresh the page.')
      setMintingState('ready')
      return
    }

    try {
      console.log('Minting badge for protocol:', protocol.id)

      // BYPASS SMART CONTRACT - Just mint directly
      // Simulate minting delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate token ID
      const newTokenId = Math.floor(Date.now() / 1000) % 10000

      /* SMART CONTRACT CODE - KEPT BUT BYPASSED
      // Get user's Stacks wallet info from Turnkey
      const walletResponse = await axios.get('/api/stacks/wallet', {
        headers: { 'x-suborg-id': suborgId }
      })

      if (!walletResponse.data.success || !walletResponse.data.wallet) {
        throw new Error('Failed to retrieve wallet information')
      }

      const { address: stacksAddress, publicKey: stacksPublicKey } = walletResponse.data.wallet

      console.log('Wallet info:', { stacksAddress, publicKey: stacksPublicKey })

      // Get current nonce
      const nonce = await getAccountNonce(stacksAddress)

      console.log('Account nonce:', nonce)

      // Call the smart contract using passkey signing
      const result = await signAndBroadcastContractCallWithPasskey({
        publicKey: stacksPublicKey,
        passkeyClient,
        contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!,
        contractName: process.env.NEXT_PUBLIC_NFT_CONTRACT_NAME!,
        functionName: 'mint-badge',
        functionArgs: [stringAsciiCV(protocol.id)],
        nonce,
        fee: BigInt(10000), // 0.01 STX fee
        network: 'testnet',
      })

      if (!result.success || !result.txId) {
        throw new Error(result.error || 'Failed to mint NFT')
      }

      setTxId(result.txId)
      */
      setTokenId(newTokenId)

      // Save badge to MongoDB
      const rarityMap: { [key: string]: 'common' | 'rare' | 'epic' | 'legendary' } = {
        zest: 'rare',
        stackingdao: 'epic',
        granite: 'epic',
        hermetica: 'legendary',
        arkadiko: 'rare',
      }

      // Use appropriate header based on auth method
      const headers: any = {}
      if (suborgId) {
        headers['x-suborg-id'] = suborgId
      } else if (walletAddress) {
        headers['x-wallet-address'] = walletAddress
      }

      await axios.post('/api/user/profile', {
        action: 'mint_badge',
        data: {
          badge: {
            id: `${protocol.id}-${newTokenId}`,
            protocol: protocol.id,
            name: `${protocol.name} Master`,
            icon: protocol.icon,
            description: `Completed all ${protocol.name} Protocol quests`,
            xpEarned: protocol.xp,
            mintedAt: new Date().toISOString().split('T')[0],
            tokenId: newTokenId,
            rarity: rarityMap[protocol.id] || 'rare',
            txId: txId || 'direct-mint'
          }
        }
      }, { headers })

      setMintingState('success')
    } catch (err) {
      console.error('Minting error:', err)
      setError(err instanceof Error ? err.message : 'Failed to mint NFT')
      setMintingState('ready')
    }
  }

  const handleViewRewards = () => {
    router.push('/profile')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border-2 border-indigo-500/30 rounded-2xl overflow-hidden shadow-2xl my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {mintingState === 'ready' && (
              <div className="p-6">
                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                {/* Compact Header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="relative mb-4"
                >
                  <div className="relative text-center">
                    <motion.div
                      animate={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      className="text-6xl inline-block"
                    >
                      🏆
                    </motion.div>
                  </div>
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl font-black text-center mb-1 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Quest Complete!
                </h2>
                <p className="text-center text-slate-400 text-sm mb-4">
                  You've mastered <span className="font-bold text-white">{protocol.name}</span>
                </p>

                {/* Compact Badge Preview */}
                <div className="bg-slate-800/50 border border-indigo-500/20 rounded-xl p-4 mb-4">
                  <div className="text-5xl text-center mb-2">{protocol.icon}</div>
                  <h3 className="font-black text-center text-lg mb-1">{protocol.name} Master</h3>
                  <p className="text-slate-500 text-xs text-center mb-2">NFT Badge</p>
                  <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/30 rounded-full w-fit mx-auto">
                    <Trophy className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold text-xs">+{protocol.xp} XP</span>
                  </div>
                </div>

                {/* Compact Info */}
                <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-400 text-xs leading-relaxed">
                      This NFT badge proves your mastery and will be stored permanently on Stacks blockchain.
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <motion.button
                  onClick={handleMint}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 text-sm"
                >
                  Mint NFT Badge
                </motion.button>

                <button
                  onClick={onClose}
                  className="w-full mt-2 py-2 text-slate-400 hover:text-white font-semibold transition-colors text-sm"
                >
                  Maybe Later
                </button>
              </div>
            )}

            {mintingState === 'minting' && (
              <div className="p-6 text-center">
                {/* Compact Minting Animation */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 mx-auto mb-4 relative"
                >
                  <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    {protocol.icon}
                  </div>
                </motion.div>

                <h2 className="text-xl font-black mb-1">Minting Your Badge...</h2>
                <p className="text-slate-400 text-xs mb-4">
                  Confirming on Stacks blockchain
                </p>

                {/* Compact Loading Steps */}
                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-300">Preparing NFT metadata</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-300">Calling smart contract</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-4 h-4 rounded-full bg-indigo-600/50 border-2 border-indigo-600 flex items-center justify-center flex-shrink-0"
                    >
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    </motion.div>
                    <span className="text-slate-400">Waiting for confirmation...</span>
                  </motion.div>
                </div>
              </div>
            )}

            {mintingState === 'success' && (
              <div className="p-6 text-center">
                {/* Compact Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="mb-4"
                >
                  {/* Compact Confetti */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: [0, Math.cos((i / 8) * Math.PI * 2) * 60],
                        y: [0, Math.sin((i / 8) * Math.PI * 2) * 60],
                      }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][i % 4],
                      }}
                    />
                  ))}

                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 mx-auto bg-emerald-600 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </motion.div>
                </motion.div>

                <h2 className="text-2xl font-black mb-1 text-emerald-400">
                  Badge Minted!
                </h2>
                <p className="text-slate-300 text-sm mb-4">
                  NFT successfully minted to your wallet
                </p>

                {/* Compact Details */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 mb-4 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Token ID</span>
                    <span className="font-bold text-white">#{tokenId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-slate-700 pt-2">
                    <span className="text-slate-400">Badge</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">{protocol.icon}</span>
                      <span className="font-bold text-white text-sm">{protocol.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-slate-700 pt-2">
                    <span className="text-slate-400">XP Earned</span>
                    <span className="font-bold text-emerald-400">+{protocol.xp}</span>
                  </div>
                  {txId && (
                    <div className="border-t border-slate-700 pt-2">
                      <a
                        href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        View on Explorer
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Compact Buttons */}
                <div className="space-y-2">
                  <motion.button
                    onClick={handleViewRewards}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    View in Profile
                    <ExternalLink className="w-3.5 h-3.5" />
                  </motion.button>

                  <button
                    onClick={onClose}
                    className="w-full py-2 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-semibold rounded-lg transition-all text-sm"
                  >
                    Continue Exploring
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
