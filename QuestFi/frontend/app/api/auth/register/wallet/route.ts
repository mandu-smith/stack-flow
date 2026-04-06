import { NextRequest, NextResponse } from 'next/server'
import getClientPromise from '@/lib/mongodb'
import { validateChallenge, consumeChallenge } from '@/lib/wallet/challenge-store'
import { verifyWalletSignature } from '@/lib/wallet/wallet-auth'

export async function POST(req: NextRequest) {
  try {
    const { address, signature, message, publicKey } = await req.json()