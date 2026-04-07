import { NextRequest, NextResponse } from 'next/server'
import getClientPromise from '@/lib/mongodb'

const defaultProfile = {
  totalXP: 0,
  level: 1,
  rank: 0,
  badgesEarned: 0,
  streak: 0,
  nextLevelXP: 100,
  badges: [],
  completedQuests: [],
  achievements: [],
}

export async function GET(request: NextRequest) {
  try {
    // Support both Turnkey suborg ID and wallet address as identifiers
    const suborgId = request.headers.get('x-suborg-id') || request.headers.get('x-wallet-address')

    if (!suborgId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const client = await getClientPromise()
    const db = client.db('QuestFi')
    const collection = db.collection('userProfiles')

    // Get user profile from MongoDB
    let profile = await collection.findOne({ suborgId })

    if (!profile) {
      // Create new profile if doesn't exist
      const newProfile = { ...defaultProfile, suborgId, createdAt: new Date() }
      await collection.insertOne(newProfile)
      profile = await collection.findOne({ suborgId })
    }

    // Calculate current level progress (XP within current level)
    let currentLevelXP = profile!.totalXP || 0
    let tempLevel = 1
    while (tempLevel < (profile!.level || 1)) {
      const xpForLevel = 100 + (tempLevel - 1) * 50
      currentLevelXP -= xpForLevel
      tempLevel++
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        currentLevelXP // XP progress within current level
      },
    })
  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Support both Turnkey suborg ID and wallet address as identifiers
    const suborgId = request.headers.get('x-suborg-id') || request.headers.get('x-wallet-address')

    if (!suborgId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const client = await getClientPromise()
    const db = client.db('QuestFi')
    const collection = db.collection('userProfiles')

    const body = await request.json()
    const { action, data } = body

    // Get current profile
    let currentProfile = await collection.findOne({ suborgId })

    if (!currentProfile) {
      const newProfile = { ...defaultProfile, suborgId, createdAt: new Date() }
      await collection.insertOne(newProfile)
      currentProfile = await collection.findOne({ suborgId })
    }

    if (!currentProfile) {
      return NextResponse.json(
        { success: false, message: 'Failed to create profile' },
        { status: 500 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'complete_quest':
        const { questId, xpReward } = data
        if (!currentProfile.completedQuests.includes(questId)) {
          currentProfile.completedQuests.push(questId)
          currentProfile.totalXP += xpReward

          // Recalculate level from scratch based on total XP
          // Progressive scaling: Each level needs 100 + (level-1) * 50 XP
          currentProfile.level = 1
          let accumulatedXP = 0

          while (true) {
            const xpForCurrentLevel = 100 + (currentProfile.level - 1) * 50
            if (accumulatedXP + xpForCurrentLevel <= currentProfile.totalXP) {
              accumulatedXP += xpForCurrentLevel
              currentProfile.level++
            } else {
              currentProfile.nextLevelXP = xpForCurrentLevel
              break
            }
          }
        }
        break

      case 'mint_badge':
        const { badge } = data
        currentProfile.badges.push(badge)
        currentProfile.badgesEarned++
        currentProfile.totalXP += badge.xpEarned

        // Recalculate level from scratch based on total XP
        // Progressive scaling: Each level needs 100 + (level-1) * 50 XP
        currentProfile.level = 1
        let badgeAccumulatedXP = 0

        while (true) {
          const badgeXpForCurrentLevel = 100 + (currentProfile.level - 1) * 50
          if (badgeAccumulatedXP + badgeXpForCurrentLevel <= currentProfile.totalXP) {
            badgeAccumulatedXP += badgeXpForCurrentLevel
            currentProfile.level++
          } else {
            currentProfile.nextLevelXP = badgeXpForCurrentLevel
            break
          }
        }
        break

      case 'update_streak':
        currentProfile.streak = data.streak
        break

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        )
    }

    // Save updated profile to MongoDB
    await collection.updateOne(
      { suborgId },
      { $set: { ...currentProfile, updatedAt: new Date() } }
    )

    return NextResponse.json({
      success: true,
      profile: currentProfile,
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Support both Turnkey suborg ID and wallet address as identifiers
    const suborgId = request.headers.get('x-suborg-id') || request.headers.get('x-wallet-address')
    console.log('[DELETE] Request received for suborgId:', suborgId)

    if (!suborgId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const client = await getClientPromise()
    const db = client.db('QuestFi')
    const collection = db.collection('userProfiles')

    const body = await request.json()
    const { badgeId } = body
    console.log('[DELETE] Deleting badge:', badgeId)

    // Get current profile
    let currentProfile = await collection.findOne({ suborgId })

    if (!currentProfile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      )
    }

    // Find the badge to delete
    const badgeToDelete = currentProfile.badges.find((b: any) => b.id === badgeId)

    if (!badgeToDelete) {
      return NextResponse.json(
        { success: false, message: 'Badge not found' },
        { status: 404 }
      )
    }

    // Remove the badge
    currentProfile.badges = currentProfile.badges.filter((b: any) => b.id !== badgeId)
    currentProfile.badgesEarned = Math.max(0, currentProfile.badgesEarned - 1)
    console.log('[DELETE] Remaining badges:', currentProfile.badges.length)

    // Remove all completed quests for this protocol so user can redo them
    const protocolId = badgeToDelete.protocol
    const questsBeforeFilter = currentProfile.completedQuests.length
    currentProfile.completedQuests = currentProfile.completedQuests.filter(
      (qId: string) => !qId.startsWith(`${protocolId}-`)
    )
    console.log('[DELETE] Removed quests:', questsBeforeFilter - currentProfile.completedQuests.length)

    // Recalculate TOTAL XP from ALL remaining badges (fresh start)
    currentProfile.totalXP = currentProfile.badges.reduce((total: number, badge: any) => {
      return total + (badge.xpEarned || 0)
    }, 0)
    console.log('[DELETE] Recalculated totalXP:', currentProfile.totalXP)

    // Recalculate level from scratch based on total XP
    // Progressive scaling: Each level needs 100 + (level-1) * 50 XP
    currentProfile.level = 1
    currentProfile.nextLevelXP = 100
    let accumulatedXP = 0

    // If user has 0 XP, reset to defaults
    if (currentProfile.totalXP === 0) {
      currentProfile.level = 1
      currentProfile.nextLevelXP = 100
    } else {
      // Calculate level based on total XP
      while (true) {
        const xpForCurrentLevel = 100 + (currentProfile.level - 1) * 50
        if (accumulatedXP + xpForCurrentLevel <= currentProfile.totalXP) {
          accumulatedXP += xpForCurrentLevel
          currentProfile.level++
        } else {
          currentProfile.nextLevelXP = xpForCurrentLevel
          break
        }
      }
    }

    // Save updated profile
    console.log('[DELETE] Saving profile with:', {
      level: currentProfile.level,
      totalXP: currentProfile.totalXP,
      nextLevelXP: currentProfile.nextLevelXP,
      badgesEarned: currentProfile.badgesEarned,
      completedQuestsCount: currentProfile.completedQuests.length
    })

    const updateResult = await collection.updateOne(
      { suborgId },
      { $set: { ...currentProfile, updatedAt: new Date() } }
    )

    console.log('[DELETE] Update result:', updateResult.modifiedCount, 'documents modified')

    // Calculate current level progress (XP within current level)
    let currentLevelXP = currentProfile.totalXP
    let tempLevel = 1
    while (tempLevel < currentProfile.level) {
      const xpForLevel = 100 + (tempLevel - 1) * 50
      currentLevelXP -= xpForLevel
      tempLevel++
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...currentProfile,
        currentLevelXP
      },
    })
  } catch (error: any) {
    console.error('Delete badge error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
