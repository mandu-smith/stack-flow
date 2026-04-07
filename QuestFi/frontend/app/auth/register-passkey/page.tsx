'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTurnkey } from '@turnkey/sdk-react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react'
import axios from 'axios'

function RegisterPasskeyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { passkeyClient } = useTurnkey()
  const [status, setStatus] = useState<'loading' | 'creating' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const registerPasskey = async () => {
      try {
        const email = searchParams.get('email')
        const publicKey = searchParams.get('publicKey')

        if (!email || !publicKey) {
          setError('Invalid registration link. Missing email or public key.')
          setStatus('error')
          return
        }

        if (!passkeyClient) {
          setError('Passkey client not initialized.')
          setStatus('error')
          return
        }

        setStatus('creating')

        // Create passkey on this device
        const attestation = await passkeyClient.createUserPasskey({
          user: {
            name: email,
            displayName: `QuestFi - ${email}`,
          },
          rp: {
            id: process.env.NEXT_PUBLIC_TURNKEY_RPID!,
            name: 'QuestFi - Stacks DeFi Learning Platform',
          },
        })

        // Register with backend
        const createResponse = await axios.post('/api/auth/createSuborg', {
          email,
          authenticators: [
            {
              authenticatorName: 'Passkey',
              challenge: attestation.encodedChallenge,
              attestation: attestation.attestation,
            },
          ],
          oauthProviders: [],
        })

        const userSuborgID = createResponse.data.subOrganizationId

        // Store session
        localStorage.setItem('turnkey_suborg_id', userSuborgID)
        localStorage.setItem('turnkey_session', 'passkey_registered')
        localStorage.setItem('user_email', email)

        setStatus('success')

        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } catch (err) {
        console.error('Passkey registration error:', err)
        setError(err instanceof Error ? err.message : 'Failed to register passkey')
        setStatus('error')
      }
    }

    if (passkeyClient) {
      registerPasskey()
    }
  }, [passkeyClient, searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl"
      >
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Initializing...</h2>
            <p className="text-slate-400 text-sm">Preparing passkey registration</p>
          </div>
        )}

        {status === 'creating' && (
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-2">Creating Your Passkey</h2>
            <p className="text-slate-400 text-sm">Please complete the prompt on your device</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-2">Passkey Created!</h2>
            <p className="text-slate-400 text-sm mb-4">Your passkey has been registered successfully</p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Registration Failed</h2>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
            >
              Back to Home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function RegisterPasskeyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <RegisterPasskeyContent />
    </Suspense>
  )
}
