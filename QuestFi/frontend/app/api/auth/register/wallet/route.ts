mport { NextRequest, NextResponse } from 'next/server'
import getClientPromise from '@/lib/mongodb'
import { validateChallenge, consumeChallenge } from '@/lib/wallet/challenge-store'
import { verifyWalletSignature } from '@/lib/wallet/wallet-auth'