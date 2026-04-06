import { NextRequest, NextResponse } from 'next/server'
import getClientPromise from '@/lib/mongodb'
import { validateChallenge, consumeChallenge } from '@/lib/wallet/challenge-store'
import { verifyWalletSignature } from '@/lib/wallet/wallet-auth'

export async function POST(req: NextRequest) {
  try {
    const { address, signature, message, publicKey } = await req.json()

    console.log('📝 [Wallet Register] Verifying signature...')
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

    // Validate challenge (don't consume yet - wait until after successful registration)
    const isChallengeValid = await validateChallenge(address, message, false)
    if (!isChallengeValid) {
      console.log('❌ Challenge validation failed')
      return NextResponse.json(
        { success: false, error: 'Invalid or expired challenge' },
        { status: 401 }
      )
    }

    // Verify wallet signature (address-based verification)
    const isValid = verifyWalletSignature({
      address,
      signature,
      message,
      publicKey,
      walletType: 'stacks'
    })

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Connect to MongoDB
    const client = await getClientPromise()
    const db = client.db('QuestFi')
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ walletAddress: address })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists. Please login.' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = {
      walletAddress: address,
      publicKey,
      createdAt: new Date().toISOString(),
      level: 1,
      totalXP: 0,
      completedQuests: [],
      badges: [],
    }

    const result = await usersCollection.insertOne(newUser)

    // Registration successful - consume the challenge
    await consumeChallenge(address)
    console.log('✅ User registered successfully, challenge consumed')