import { NextRequest, NextResponse } from 'next/server'
import { Turnkey } from '@turnkey/sdk-server'

const turnkeyClient = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { suborgID, otpId, otpCode, targetPublicKey } = body

    if (!suborgID || !otpId || !otpCode || !targetPublicKey) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Step 1: Verify OTP to get verification token
    const otpAuthResponse = await turnkeyClient.apiClient().verifyOtp({
      otpId,
      otpCode,
    })

    const verificationToken = otpAuthResponse.verificationToken

    if (!verificationToken) {
      throw new Error('Verification token not available')
    }

    // Step 2: Login with verification token to get session
    const otpLoginResponse = await turnkeyClient.apiClient().otpLogin({
      organizationId: suborgID,
      verificationToken,
      publicKey: targetPublicKey,
    })

    const { session } = otpLoginResponse

    if (!session) {
      throw new Error('Session not available')
    }

    return NextResponse.json({
      success: true,
      credentialBundle: session,
    })
  } catch (error: any) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
