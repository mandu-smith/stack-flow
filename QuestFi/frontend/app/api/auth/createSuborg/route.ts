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
    const { email, oauthProviders, authenticators } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Create sub-organization for new user
    const subOrgName = `User-${email}-${Date.now()}`

    const createSubOrgParams: any = {
      subOrganizationName: subOrgName,
      rootQuorumThreshold: 1,
      rootUsers: [
        {
          userName: email,
          userEmail: email,
          apiKeys: [],
          authenticators: authenticators || [],
          oauthProviders: oauthProviders || [],
        },
      ],
      wallet: {
        walletName: 'Default Wallet',
        accounts: [
          {
            curve: 'CURVE_SECP256K1',
            pathFormat: 'PATH_FORMAT_BIP32',
            path: "m/44'/5757'/0'/0/0",
            addressFormat: 'ADDRESS_FORMAT_COMPRESSED',
          },
        ],
      },
    }

    const response = await turnkeyClient.apiClient().createSubOrganization(createSubOrgParams)

    return NextResponse.json({
      success: true,
      subOrganizationId: response.subOrganizationId,
      wallet: response.wallet,
    })
  } catch (error: any) {
    console.error('Create suborg error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create sub-organization' },
      { status: 500 }
    )
  }
}
