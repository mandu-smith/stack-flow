import { NextRequest, NextResponse } from 'next/server'
import getClientPromise from '@/lib/mongodb'
import { validateChallenge, consumeChallenge } from '@/lib/wallet/challenge-store'
import { verifyWalletSignature } from '@/lib/wallet/wallet-auth'

export async function POST(req: NextRequest) {
  try {
    const { address, signature, message, publicKey } = await req.json()

    console.log('🔐 [Wallet Login] Verifying signature...')
    console.log('📍 Address:', address)
    console.log('📝 Message:', message)
    console.log('🔏 Signature:', signature)
    console.log('🔑 Public Key:', publicKey)

    if (!address || !signature || !message || !publicKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }