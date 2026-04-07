'use client'

import { TurnkeyProvider as TurnkeySDKProvider } from '@turnkey/sdk-react'

const turnkeyConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  rpId: process.env.NEXT_PUBLIC_TURNKEY_RPID!,
  iframeUrl: process.env.NEXT_PUBLIC_TURNKEY_IFRAME_URL!,
  serverSignUrl: '/api/auth/turnkey',
}

export function TurnkeyProvider({ children }: { children: React.ReactNode }) {
  return (
    <TurnkeySDKProvider config={turnkeyConfig}>
      {children}
    </TurnkeySDKProvider>
  )
}
