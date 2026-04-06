import { NextRequest, NextResponse } from 'next/server'
import { Turnkey } from '@turnkey/sdk-server'

const turnkeyClient = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle error from Google
    if (error) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/?auth_error=${encodeURIComponent(error)}`
      )
    }

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Authorization code not provided' },
        { status: 400 }
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${request.nextUrl.origin}/api/auth/google-callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange error:', errorData)
      throw new Error(`Failed to exchange code: ${errorData.error_description || errorData.error}`)
    }

    const tokens = await tokenResponse.json()
    console.log('Token exchange successful, nonce present:', !!tokens.id_token)
    const idToken = tokens.id_token

    if (!idToken) {
      throw new Error('No ID token received from Google')
    }

    // Decode JWT to get user email and nonce
    const payload = JSON.parse(
      Buffer.from(idToken.split('.')[1], 'base64').toString()
    )
    const userEmail = payload.email
    const nonceInToken = payload.nonce

    console.log('Token payload:', {
      email: userEmail,
      nonce: nonceInToken,
      hasNonce: !!nonceInToken
    })

    // Store tokens in URL to pass to frontend
    const returnUrl = new URL(request.nextUrl.origin)
    returnUrl.searchParams.set('google_auth', 'success')
    returnUrl.searchParams.set('id_token', idToken)
    returnUrl.searchParams.set('email', userEmail)

    if (state) {
      try {
        const stateObj = JSON.parse(state)
        if (stateObj.returnTo) {
          returnUrl.pathname = stateObj.returnTo
        }
      } catch (e) {
        // Invalid state, ignore
      }
    }

    return NextResponse.redirect(returnUrl.toString())
  } catch (error: any) {
    console.error('Google callback error:', error)
    return NextResponse.redirect(
      `${request.nextUrl.origin}/?auth_error=${encodeURIComponent(error.message)}`
    )
  }
}
