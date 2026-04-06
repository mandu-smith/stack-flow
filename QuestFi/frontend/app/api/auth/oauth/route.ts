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