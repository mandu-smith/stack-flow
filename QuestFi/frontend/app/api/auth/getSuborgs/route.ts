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
    const { filterType, filterValue } = body

    if (!filterType || !filterValue) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get sub-organizations based on filter
    const response = await turnkeyClient.apiClient().getSubOrgIds({
      filterType,
      filterValue,
    })

    return NextResponse.json({
      success: true,
      organizationIds: response.organizationIds,
    })
  } catch (error: any) {
    console.error('Get suborgs error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get sub-organizations' },
      { status: 500 }
    )
  }
}
