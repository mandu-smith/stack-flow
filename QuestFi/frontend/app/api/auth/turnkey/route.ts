import { NextRequest, NextResponse } from 'next/server'
import { Turnkey as TurnkeyServerSDK } from '@turnkey/sdk-server'

// Initialize Turnkey server client
const getTurnkeyClient = () => {
  return new TurnkeyServerSDK({
    apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
    apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
    apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
    defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, type, targetPublicKey, suborgID } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    if (!targetPublicKey) {
      return NextResponse.json(
        { success: false, message: 'Target public key is required' },
        { status: 400 }
      )
    }

    const turnkeyClient = getTurnkeyClient()