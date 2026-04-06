import { NextRequest, NextResponse } from 'next/server'
import { Turnkey } from '@turnkey/sdk-server'

const turnkeyClient = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
})

export async function POST(req: NextRequest) {
  try {
    const { email, targetPublicKey } = await req.json()

    // Initialize Email Auth (sends magic link for passkey registration)
    const response = await turnkeyClient.apiClient().emailAuth({
      email,
      targetPublicKey,
      organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
    })

    const { userId, apiKeyId } = response

    return NextResponse.json({
      success: true,
      userId,
      apiKeyId,
    })
  } catch (error: any) {
    console.error('Init Email Auth error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send email auth link' },
      { status: 500 }
    )
  }
}
