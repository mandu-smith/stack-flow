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
    const { contact, userIdentifier, otpType = 'OTP_TYPE_EMAIL' } = body

    if (!contact || !userIdentifier) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize OTP - sends OTP to user's email/phone
    const response = await turnkeyClient.apiClient().initOtp({
      contact,
      otpType,
      userIdentifier,
    })

    return NextResponse.json({
      success: true,
      otpId: response.otpId,
    })
  } catch (error: any) {
    console.error('Init OTP error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initialize OTP' },
      { status: 500 }
    )
  }
}
