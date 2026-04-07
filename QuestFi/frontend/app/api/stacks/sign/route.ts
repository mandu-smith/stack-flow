import { NextRequest, NextResponse } from 'next/server'
import { Turnkey as TurnkeyServerSDK } from '@turnkey/sdk-server'

// Initialize Turnkey server client with parent org credentials
const getTurnkeyClient = () => {
  return new TurnkeyServerSDK({
    apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
    apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
    apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
    defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!, // Parent org
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { payload, publicKey, organizationId } = body

    if (!payload || !publicKey) {
      return NextResponse.json(
        { success: false, message: 'Payload and publicKey are required' },
        { status: 400 }
      )
    }

    if (!organizationId) {
      return NextResponse.json(
        { success: false, message: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const turnkeyClient = getTurnkeyClient()

    // Sign the transaction payload with Turnkey
    const signature = await turnkeyClient.apiClient().signRawPayload({
      organizationId,
      payload,
      signWith: publicKey,
      encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
      hashFunction: 'HASH_FUNCTION_NO_OP', // Payload is already hashed (Stacks-specific)
    })

    if (!signature || !signature.r || !signature.s || !signature.v) {
      throw new Error('Invalid signature response from Turnkey')
    }

    return NextResponse.json({
      success: true,
      signature: {
        r: signature.r,
        s: signature.s,
        v: signature.v,
      },
    })
  } catch (error) {
    console.error('Transaction signing error:', error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sign transaction',
      },
      { status: 500 }
    )
  }
}
