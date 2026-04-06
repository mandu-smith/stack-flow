import { NextRequest, NextResponse } from 'next/server'
import getClientPromise from '@/lib/mongodb'

// Admin endpoint to reset a user's profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { suborgId } = body

    if (!suborgId) {
      return NextResponse.json(
        { success: false, message: 'suborgId required' },
        { status: 400 }
      )
    }

    const client = await getClientPromise()
    const db = client.db('QuestFi')
    const collection = db.collection('userProfiles')