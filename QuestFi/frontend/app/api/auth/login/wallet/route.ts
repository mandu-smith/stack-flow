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

    // Validate challenge (but don't consume it yet - might need it for registration)
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

    // Find user by wallet address
    const user = await usersCollection.findOne({ walletAddress: address })

    if (!user) {
      console.log('❌ User not found - challenge preserved for registration')
      return NextResponse.json(
        { success: false, error: 'User not found. Please register first.' },
        { status: 404 }
      )
    }

    // User found - consume the challenge
    await consumeChallenge(address)

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Wallet login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
