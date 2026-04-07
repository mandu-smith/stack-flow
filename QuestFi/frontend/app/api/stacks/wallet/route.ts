import { NextRequest, NextResponse } from 'next/server'
import { Turnkey as TurnkeyServerSDK } from '@turnkey/sdk-server'
import { publicKeyToAddress } from '@stacks/transactions'

// Initialize Turnkey server client
const getTurnkeyClient = () => {
  return new TurnkeyServerSDK({
    apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
    apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
    apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
    defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  })
}

export async function GET(req: NextRequest) {
  try {
    const suborgId = req.headers.get('x-suborg-id')

    if (!suborgId) {
      return NextResponse.json(
        { success: false, message: 'Sub-organization ID required' },
        { status: 400 }
      )
    }

    const turnkeyClient = getTurnkeyClient()

    // Get wallets for the sub-organization
    const walletsResponse = await turnkeyClient.apiClient().getWallets({
      organizationId: suborgId,
    })

    if (!walletsResponse || !walletsResponse.wallets || walletsResponse.wallets.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No wallets found' },
        { status: 404 }
      )
    }

    // Find Stacks wallet (or first wallet if none specified)
    const stacksWallet = walletsResponse.wallets[0]

    // Get accounts for this wallet
    const accountsResponse = await turnkeyClient.apiClient().getWalletAccounts({
      organizationId: suborgId,
      walletId: stacksWallet.walletId,
    })

    if (!accountsResponse || !accountsResponse.accounts || accountsResponse.accounts.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No accounts found in wallet' },
        { status: 404 }
      )
    }

    // Get the first account (Stacks uses m/44'/5757'/0'/0/0 derivation path)
    const stacksAccount = accountsResponse.accounts[0]
    const compressedPublicKey = stacksAccount.publicKey

    if (!compressedPublicKey) {
      return NextResponse.json(
        { success: false, message: 'No public key found in account' },
        { status: 404 }
      )
    }

    // Convert compressed public key to Stacks address
    const isTestnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'testnet'
    const network = isTestnet ? 'testnet' : 'mainnet'

    const stacksAddress = publicKeyToAddress(compressedPublicKey, network)

    return NextResponse.json({
      success: true,
      wallet: {
        address: stacksAddress,
        publicKey: compressedPublicKey,
        walletId: stacksWallet.walletId,
        accountId: stacksAccount.walletAccountId,
      },
    })
  } catch (error) {
    console.error('Failed to get Stacks wallet:', error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve wallet',
      },
      { status: 500 }
    )
  }
}
