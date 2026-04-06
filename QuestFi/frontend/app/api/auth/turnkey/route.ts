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

    if (type === 'email') {
      // Initialize email authentication
      const emailAuthResponse = await turnkeyClient.apiClient().emailAuth({
        email,
        targetPublicKey,
        organizationId: suborgID || process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
        invalidateExisting: true,
      })

      const { userId, apiKeyId } = emailAuthResponse

      if (!userId || !apiKeyId) {
        throw new Error('Email auth initialization failed')
      }

      return NextResponse.json({
        success: true,
        userId,
        apiKeyId,
        organizationId: suborgID || process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
        message: 'Email sent successfully. Check your inbox.',
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid authentication type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Turnkey auth error:', error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed',
      },
      { status: 500 }
    )
  }
}

// Create sub-organization for new users
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, username } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const turnkeyClient = getTurnkeyClient()

    // Create a sub-organization for the user
    const suborgResponse = await turnkeyClient.apiClient().createSubOrganization({
      subOrganizationName: username || email,
      rootUsers: [
        {
          userName: username || email,
          userEmail: email,
          apiKeys: [],
          authenticators: [],
          oauthProviders: [],
        },
      ],
      rootQuorumThreshold: 1,
    })

    return NextResponse.json({
      success: true,
      subOrganizationId: suborgResponse.subOrganizationId,
      message: 'Sub-organization created successfully',
    })
  } catch (error) {
    console.error('Sub-organization creation error:', error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create sub-organization',
      },
      { status: 500 }
    )
  }
}
