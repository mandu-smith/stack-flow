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
    const { oidcToken, publicKey, providerName = 'Google' } = body

    console.log('OAuth request - publicKey:', publicKey)
    console.log('OAuth request - oidcToken length:', oidcToken?.length)

    if (!oidcToken || !publicKey) {
      return NextResponse.json(
        { success: false, message: 'OIDC token and public key are required' },
        { status: 400 }
      )
    }

    // Check if user already has a sub-organization
    const getSuborgsResponse = await turnkeyClient.apiClient().getSubOrgIds({
      filterType: 'OIDC_TOKEN',
      filterValue: oidcToken,
    })

    let subOrganizationId: string
    let wallet: any

    if (getSuborgsResponse.organizationIds.length > 0) {
      // User already exists
      subOrganizationId = getSuborgsResponse.organizationIds[0]
    } else {
      // Create new sub-organization for first-time user
      const subOrgName = `OAuth-User-${Date.now()}`

      const createSubOrgParams: any = {
        subOrganizationName: subOrgName,
        rootQuorumThreshold: 1,
        rootUsers: [
          {
            userName: subOrgName,
            apiKeys: [],
            authenticators: [],
            oauthProviders: [
              {
                providerName,
                oidcToken,
              },
            ],
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

      const createResponse = await turnkeyClient.apiClient().createSubOrganization(createSubOrgParams)
      subOrganizationId = createResponse.subOrganizationId
      wallet = createResponse.wallet
    }

    // Now authenticate with OAuth to get session
    // Note: Turnkey will verify that nonce in token matches sha256(publicKey)

    // Decode the nonce from the token to verify
    const tokenPayload = JSON.parse(Buffer.from(oidcToken.split('.')[1], 'base64').toString())
    const nonceInToken = tokenPayload.nonce

    // Calculate what Turnkey expects
    const crypto = require('crypto')
    const expectedNonce = crypto.createHash('sha256').update(Buffer.from(publicKey, 'hex')).digest('hex')

    console.log('OAuth Login Debug:')
    console.log('- Public Key:', publicKey)
    console.log('- Nonce in Token:', nonceInToken)
    console.log('- Expected Nonce (sha256 of pubkey):', expectedNonce)
    console.log('- Match:', nonceInToken === expectedNonce)

    const oauthLoginResponse = await turnkeyClient.apiClient().oauthLogin({
      oidcToken,
      publicKey,
      organizationId: subOrganizationId,
    })

    const { session } = oauthLoginResponse

    if (!session) {
      throw new Error('Session not available')
    }

    return NextResponse.json({
      success: true,
      session,
      subOrganizationId,
      wallet,
      isNewUser: getSuborgsResponse.organizationIds.length === 0,
    })
  } catch (error: any) {
    console.error('OAuth error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'OAuth authentication failed' },
      { status: 500 }
    )
  }
}
