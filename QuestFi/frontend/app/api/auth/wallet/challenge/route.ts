import { NextRequest, NextResponse } from 'next/server'
import { generateChallenge } from '@/lib/wallet/challenge-store'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get('address')
    const type = (searchParams.get('type') as 'connection' | 'payment') || 'connection'

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      )
    }

    // Generate challenge using MongoDB-based store
    const { challenge, expiresAt } = await generateChallenge(address, type)

    return NextResponse.json({
      success: true,
      challenge,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Challenge generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate challenge' },
      { status: 500 }
    )
  }
}
