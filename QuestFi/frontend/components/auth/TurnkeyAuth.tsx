'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTurnkey } from '@turnkey/sdk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Sparkles, X, Wallet, Shield } from 'lucide-react'
import axios from 'axios'
import { sha256 } from '@noble/hashes/sha2.js'
import walletService from '@/lib/wallet/wallet-service'

// Helper function to convert bytes to hex
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

// Helper function to convert hex string to Uint8Array
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

interface TurnkeyAuthProps {
  onClose?: () => void
  onSuccess?: () => void
}

export function TurnkeyAuth({ onClose, onSuccess }: TurnkeyAuthProps) {
  const { indexedDbClient, passkeyClient } = useTurnkey()
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpId, setOtpId] = useState<string | null>(null)
  const [suborgID, setSuborgID] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [authStep, setAuthStep] = useState<'method' | 'email-input' | 'otp-input' | 'passkey-email' | 'complete'>('method')
  const [error, setError] = useState<string | null>(null)
  const [pubKey, setPubKey] = useState<string | null>(null)
  const [nonce, setNonce] = useState<string | null>(null)
  const [passkeyEmail, setPasskeyEmail] = useState('')
  const [mounted, setMounted] = useState(false)

  // Check if component is mounted (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Initialize public key and nonce
  useEffect(() => {
    const refreshKey = async () => {
      if (!indexedDbClient) return

      await indexedDbClient.resetKeyPair()
      const newKey = await indexedDbClient.getPublicKey()
      if (newKey) {
        setPubKey(newKey)
        // Compute nonce as sha256(publicKey) for OAuth
        const publicKeyBytes = hexToBytes(newKey)
        const nonceHash = bytesToHex(sha256(publicKeyBytes))
        setNonce(nonceHash)
      }
    }

    refreshKey()
  }, [indexedDbClient])

  // Google OAuth - Initiate redirect flow
  const handleGoogleAuth = () => {
    if (!pubKey || !nonce) {
      setError('Authentication not ready. Please refresh the page.')
      return
    }

    // Store public key and nonce in localStorage for callback
    localStorage.setItem('turnkey_oauth_pubkey', pubKey)
    localStorage.setItem('turnkey_oauth_nonce', nonce)

    console.log('Initiating Google OAuth with:')
    console.log('Public Key:', pubKey)
    console.log('Nonce (sha256 of pubkey):', nonce)

    // Build Google OAuth URL with nonce
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!)
    googleAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/api/auth/google-callback`)
    googleAuthUrl.searchParams.set('response_type', 'code')
    googleAuthUrl.searchParams.set('scope', 'openid email profile')
    googleAuthUrl.searchParams.set('nonce', nonce)
    googleAuthUrl.searchParams.set('state', JSON.stringify({ returnTo: window.location.pathname }))

    console.log('Redirecting to Google OAuth URL:', googleAuthUrl.toString())

    // Redirect to Google
    window.location.href = googleAuthUrl.toString()
  }

  // Email OTP - Step 1: Initialize
  const handleInitEmailOTP = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (!pubKey) {
      setError('Authentication not ready. Please refresh the page.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Initialize OTP with public key as userIdentifier
      // No need to check/create sub-org yet - we'll do that after OTP verification
      const initOtpResponse = await axios.post('/api/auth/init-otp', {
        contact: email,
        userIdentifier: pubKey,
        otpType: 'OTP_TYPE_EMAIL',
      })

      setOtpId(initOtpResponse.data.otpId)
      setAuthStep('otp-input')
    } catch (err) {
      console.error('Init Email OTP error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Email OTP - Step 2: Verify
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter a valid code (at least 6 characters)')
      return
    }

    if (!pubKey || !otpId) {
      setError('Authentication session expired')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check if user already has a sub-org
      const getSuborgsResponse = await axios.post('/api/auth/getSuborgs', {
        filterType: 'EMAIL',
        filterValue: email,
      })

      let userSuborgID: string

      if (getSuborgsResponse.data.organizationIds.length === 0) {
        // Create new user with Stacks wallet
        const createResponse = await axios.post('/api/auth/createSuborg', {
          email,
          authenticators: [],
          oauthProviders: [],
        })
        userSuborgID = createResponse.data.subOrganizationId
      } else {
        userSuborgID = getSuborgsResponse.data.organizationIds[0]
      }

      // Verify OTP and login
      const authResponse = await axios.post('/api/auth/verify-otp', {
        suborgID: userSuborgID,
        otpId,
        otpCode,
        targetPublicKey: pubKey,
      })

      const session = authResponse.data.credentialBundle

      if (session) {
        // Session JWT received successfully
        localStorage.setItem('turnkey_session', session)
        localStorage.setItem('turnkey_suborg_id', userSuborgID)
        localStorage.setItem('user_email', email)

        // Dispatch custom event to notify navbar
        window.dispatchEvent(new Event('auth-changed'))

        setAuthStep('complete')
        setTimeout(() => {
          onSuccess?.()
        }, 1500)
      } else {
        throw new Error('No session received')
      }
    } catch (err) {
      console.error('Verify OTP error:', err)
      setError(err instanceof Error ? err.message : 'Invalid OTP code')
    } finally {
      setLoading(false)
    }
  }

  // Passkey Registration/Login (after email input)
  const handlePasskeyRegister = async () => {
    if (!passkeyEmail || !passkeyEmail.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (!pubKey) {
      setError('Authentication not ready')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('[Passkey Auth] Starting for:', passkeyEmail)

      // Check if user already has a sub-org
      const getSuborgsResponse = await axios.post('/api/auth/getSuborgs', {
        filterType: 'EMAIL',
        filterValue: passkeyEmail,
      })

      const isNewUser = getSuborgsResponse.data.organizationIds.length === 0

      if (isNewUser) {
        // NEW USER - Generate registration link and send via email
        console.log('[Passkey Auth] New user - generating registration link...')

        const registrationUrl = `${window.location.origin}/auth/register-passkey?email=${encodeURIComponent(passkeyEmail)}&publicKey=${encodeURIComponent(pubKey)}`

        // Send email with registration link
        await axios.post('/api/auth/send-registration-email', {
          email: passkeyEmail,
          registrationUrl,
        })

        // Show success message
        setError(null)
        alert('✅ Check your email!\n\nWe sent you a registration link. Open it on the device where you want to use your passkey (e.g., your phone).\n\nThe passkey will be created on that device.')

        // Reset to initial state
        setAuthStep('method')
        setPasskeyEmail('')

      } else {
        // EXISTING USER - Try to login with passkey on THIS device
        const userSuborgID = getSuborgsResponse.data.organizationIds[0]

        console.log('[Passkey Auth] Existing user - authenticating...')

        if (!passkeyClient) {
          setError('Passkey client not ready')
          return
        }

        // Authenticate with existing passkey
        await passkeyClient.loginWithPasskey({
          publicKey: pubKey,
        })

        // Store session
        localStorage.setItem('turnkey_suborg_id', userSuborgID)
        localStorage.setItem('turnkey_session', 'passkey_authenticated')
        localStorage.setItem('user_email', passkeyEmail)

        // Dispatch custom event to notify navbar
        window.dispatchEvent(new Event('auth-changed'))

        setAuthStep('complete')
        setTimeout(() => {
          onSuccess?.()
        }, 1500)
      }
    } catch (err) {
      console.error('[Passkey Auth] Error:', err)

      let errorMessage = 'Passkey authentication failed.'

      if (err instanceof Error) {
        if (err.message.includes('cancel') || err.message.includes('abort')) {
          errorMessage = 'Passkey prompt was cancelled.'
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Wallet Connect
  const handleWalletConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('[Wallet Auth] Starting wallet connection...')

      // Close the auth modal before opening wallet modal
      onClose?.()

      // Connect wallet ONCE
      const walletData = await walletService.connectWallet()
      console.log('[Wallet Auth] Wallet connected:', walletData.address)

      // Get challenge from backend
      const challengeResponse = await fetch(`/api/auth/wallet/challenge?address=${walletData.address}&type=connection`)
      const challengeData = await challengeResponse.json()

      if (!challengeData.success) {
        throw new Error('Failed to get challenge')
      }

      const challenge = challengeData.challenge

      // Sign the challenge
      const signatureData = await walletService.signMessage(challenge)
      console.log('[Wallet Auth] Message signed')

      // Try to login first
      try {
        const loginResponse = await fetch('/api/auth/login/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: walletData.address,
            signature: signatureData.signature,
            message: challenge,
            publicKey: signatureData.publicKey,
          }),
        })

        const loginResult = await loginResponse.json()

        if (loginResult.success) {
          console.log('[Wallet Auth] Login successful')

          // Store session data
          localStorage.setItem('wallet_address', walletData.address)
          localStorage.setItem('wallet_connected', 'true')

          // Dispatch custom event to notify navbar
          window.dispatchEvent(new Event('auth-changed'))

          setAuthStep('complete')
          setTimeout(() => {
            onSuccess?.()
          }, 1500)
        } else if (loginResult.error?.includes('not found')) {
          // User doesn't exist, register them
          console.log('[Wallet Auth] User not found, registering...')

          const registerResponse = await fetch('/api/auth/register/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: walletData.address,
              signature: signatureData.signature,
              message: challenge,
              publicKey: signatureData.publicKey,
            }),
          })

          const registerResult = await registerResponse.json()

          if (!registerResult.success) {
            throw new Error(registerResult.error || 'Registration failed')
          }

          console.log('[Wallet Auth] Registration successful')

          // Store session data
          localStorage.setItem('wallet_address', walletData.address)
          localStorage.setItem('wallet_connected', 'true')

          // Dispatch custom event to notify navbar
          window.dispatchEvent(new Event('auth-changed'))

          setAuthStep('complete')
          setTimeout(() => {
            onSuccess?.()
          }, 1500)
        } else {
          throw new Error(loginResult.error || 'Login failed')
        }
      } catch (err) {
        throw err
      }
    } catch (err) {
      console.error('[Wallet Auth] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  const modalContent = (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl shadow-emerald-500/20 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="p-8">
            <AnimatePresence mode="wait">
              {authStep === 'method' && (
                <motion.div
                  key="method"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-emerald-500/20 rounded-xl mb-2">
                      <Shield className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Connect to QuestFi
                    </h2>
                    <p className="text-sm text-slate-400">
                      Sign in to start your DeFi learning journey
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={() => setAuthStep('email-input')}
                      disabled={loading}
                      className="w-full px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Continue with Email
                    </button>

                    <button
                      onClick={handleWalletConnect}
                      disabled={loading}
                      className="w-full px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    By connecting, you agree to our Terms of Service and Privacy Policy.
                    Your wallet is non-custodial and secured by Turnkey.
                  </p>
                </motion.div>
              )}

              {authStep === 'email-input' && (
                <motion.div
                  key="email-input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <button
                      onClick={() => {
                        setAuthStep('method')
                        setError(null)
                      }}
                      className="text-sm text-slate-400 hover:text-white transition-colors mb-4"
                    >
                      ← Back
                    </button>
                    <div className="inline-flex p-3 bg-emerald-500/20 rounded-xl mb-2">
                      <Mail className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Email Authentication
                    </h2>
                    <p className="text-sm text-slate-400">
                      Enter your email to receive a one-time code
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !loading) {
                            handleInitEmailOTP()
                          }
                        }}
                        placeholder="Enter your email"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <button
                      onClick={handleInitEmailOTP}
                      disabled={loading || !email}
                      className="group relative w-full inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-black overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div
                        className="absolute inset-0 bg-emerald-400 transition-all duration-300 group-hover:bg-emerald-500 group-disabled:bg-emerald-400"
                        style={{
                          clipPath:
                            'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
                        }}
                      />
                      <span className="relative flex items-center gap-2 font-bold tracking-wide">
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Send Code
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {authStep === 'passkey-email' && (
                <motion.div
                  key="passkey-email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <button
                      onClick={() => {
                        setAuthStep('method')
                        setError(null)
                        setPasskeyEmail('')
                      }}
                      className="text-sm text-slate-400 hover:text-white transition-colors mb-4"
                    >
                      ← Back
                    </button>
                    <div className="inline-flex p-3 bg-emerald-500/20 rounded-xl mb-2">
                      <Shield className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Passkey Authentication
                    </h2>
                    <p className="text-sm text-slate-400">
                      Enter your email to continue with passkey
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="email"
                        value={passkeyEmail}
                        onChange={(e) => {
                          setPasskeyEmail(e.target.value)
                          setError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !loading) {
                            handlePasskeyRegister()
                          }
                        }}
                        placeholder="Enter your email"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <button
                      onClick={handlePasskeyRegister}
                      disabled={loading || !passkeyEmail}
                      className="group relative w-full inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-black overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div
                        className="absolute inset-0 bg-emerald-400 transition-all duration-300 group-hover:bg-emerald-500 group-disabled:bg-emerald-400"
                        style={{
                          clipPath:
                            'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
                        }}
                      />
                      <span className="relative flex items-center gap-2 font-bold tracking-wide">
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Continue with Passkey
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {authStep === 'otp-input' && (
                <motion.div
                  key="otp-input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-emerald-500/20 rounded-xl mb-2">
                      <Mail className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Check your email
                    </h2>
                    <p className="text-sm text-slate-400">
                      We sent a verification code to
                    </p>
                    <p className="text-white font-semibold">{email}</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 9)
                        setOtpCode(value)
                        setError(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading && otpCode.length >= 6) {
                          handleVerifyOTP()
                        }
                      }}
                      placeholder="XXXXXX"
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl font-mono tracking-widest placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                      maxLength={9}
                    />

                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otpCode.length < 6}
                      className="group relative w-full inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-black overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div
                        className="absolute inset-0 bg-emerald-400 transition-all duration-300 group-hover:bg-emerald-500 group-disabled:bg-emerald-400"
                        style={{
                          clipPath:
                            'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
                        }}
                      />
                      <span className="relative flex items-center gap-2 font-bold tracking-wide">
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Verify Code
                          </>
                        )}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setAuthStep('email-input')
                        setOtpCode('')
                        setError(null)
                      }}
                      className="w-full text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      Use a different email
                    </button>
                  </div>
                </motion.div>
              )}

              {authStep === 'complete' && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="inline-flex p-4 bg-emerald-500/20 rounded-full mb-6"
                  >
                    <Sparkles className="w-12 h-12 text-emerald-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Welcome to QuestFi!</h3>
                  <p className="text-slate-400 mb-4">Your wallet is connected</p>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        </motion.div>
    </motion.div>
  )

  return createPortal(modalContent, document.body)
}
