'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Zap, Star, Award, TrendingUp, CheckCircle2, Lock, ExternalLink, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Badge {
  id: string
  protocol: string
  name: string
  icon: string
  description: string
  xpEarned: number
  mintedAt: string
  tokenId: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
  reward: number
}

// Mock user data
const mockUserData = {
  totalXP: 235,
  currentLevelXP: 0,
  level: 4,
  rank: 1247,
  badgesEarned: 2,
  streak: 3,
  nextLevelXP: 300,
}

// Mock badges
const mockBadges: Badge[] = [
  {
    id: '1',
    protocol: 'zest',
    name: 'Zest Master',
    icon: '🏦',
    description: 'Completed all Zest Protocol quests',
    xpEarned: 50,
    mintedAt: '2025-10-12',
    tokenId: 42,
    rarity: 'rare'
  },
  {
    id: '2',
    protocol: 'stackingdao',
    name: 'Liquid Staking Pro',
    icon: '💧',
    description: 'Mastered StackingDAO liquid staking',
    xpEarned: 60,
    mintedAt: '2025-10-10',
    tokenId: 38,
    rarity: 'epic'
  },
]

// Mock locked protocols
const lockedProtocols = [
  { id: 'granite', name: 'Granite', icon: '⛰️', xp: 70 },
  { id: 'hermetica', name: 'Hermetica', icon: '💎', xp: 65 },
  { id: 'arkadiko', name: 'Arkadiko', icon: '🏛️', xp: 55 },
]

// Mock achievements
const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first quest',
    icon: '🎯',
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    reward: 10
  },
  {
    id: '2',
    title: 'Quest Hunter',
    description: 'Complete 5 quests',
    icon: '🏹',
    unlocked: false,
    progress: 2,
    maxProgress: 5,
    reward: 50
  },
  {
    id: '3',
    title: 'Badge Collector',
    description: 'Earn all 5 protocol badges',
    icon: '🎖️',
    unlocked: false,
    progress: 2,
    maxProgress: 5,
    reward: 100
  },
  {
    id: '4',
    title: 'Streak Master',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    unlocked: false,
    progress: 3,
    maxProgress: 7,
    reward: 75
  },
]

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'from-yellow-600 via-yellow-400 to-yellow-600'
    case 'epic': return 'from-purple-600 via-purple-400 to-purple-600'
    case 'rare': return 'from-blue-600 via-blue-400 to-blue-600'
    default: return 'from-slate-600 via-slate-400 to-slate-600'
  }
}

const getRarityBorder = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'border-yellow-500/50 shadow-yellow-500/30'
    case 'epic': return 'border-purple-500/50 shadow-purple-500/30'
    case 'rare': return 'border-blue-500/50 shadow-blue-500/30'
    default: return 'border-slate-500/50 shadow-slate-500/30'
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [activeTab, setActiveTab] = useState<'badges' | 'achievements'>('badges')
  const [userData, setUserData] = useState(mockUserData)
  const [userBadges, setUserBadges] = useState(mockBadges)
  const [loading, setLoading] = useState(true)
  const [deletingBadgeId, setDeletingBadgeId] = useState<string | null>(null)
  const [badgeToDelete, setBadgeToDelete] = useState<Badge | null>(null)

  // Check authentication
  useEffect(() => {
    const session = localStorage.getItem('turnkey_session')
    const suborgId = localStorage.getItem('turnkey_suborg_id')
    const walletConnected = localStorage.getItem('wallet_connected')

    // Check if authenticated via Turnkey OR Wallet
    if ((!session || !suborgId) && walletConnected !== 'true') {
      // Not authenticated - redirect to home
      router.push('/')
    }
  }, [router])

  // Fetch real user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const suborgId = localStorage.getItem('turnkey_suborg_id')
        const walletAddress = localStorage.getItem('wallet_address')
        const userIdentifier = suborgId || walletAddress

        if (userIdentifier) {
          // Use appropriate header based on auth method
          const headers: any = {}
          if (suborgId) {
            headers['x-suborg-id'] = suborgId
          } else if (walletAddress) {
            headers['x-wallet-address'] = walletAddress
          }

          const response = await axios.get('/api/user/profile', { headers })

          if (response.data.success) {
            const profile = response.data.profile

            // Merge real badges with mock badges for demo
            const realBadges = profile.badges || []
            const earnedProtocols = realBadges.map((b: Badge) => b.protocol)

            // Keep mock badges that user hasn't earned yet
            const remainingMockBadges = mockBadges.filter(
              (mb: Badge) => !earnedProtocols.includes(mb.protocol)
            )

            // Combine real earned badges with remaining mock badges
            const combinedBadges = [...realBadges, ...remainingMockBadges]

            // Use ONLY real values for stats - no mock data fallback
            setUserData({
              totalXP: profile.totalXP || 0,
              currentLevelXP: profile.currentLevelXP || 0,
              level: profile.level || 1,
              rank: profile.rank || 0,
              badgesEarned: realBadges.length,
              streak: profile.streak || 0,
              nextLevelXP: profile.nextLevelXP || 100,
            })
            setUserBadges(combinedBadges)
          }
        } else {
          // Not logged in - show empty/default data
          setUserData({
            totalXP: 0,
            currentLevelXP: 0,
            level: 1,
            rank: 0,
            badgesEarned: 0,
            streak: 0,
            nextLevelXP: 100,
          })
          setUserBadges(mockBadges)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        // Show real data (empty) on error, keep mock badges for demo
        setUserData({
          totalXP: 0,
          currentLevelXP: 0,
          level: 1,
          rank: 0,
          badgesEarned: 0,
          streak: 0,
          nextLevelXP: 100,
        })
        setUserBadges(mockBadges)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleDeleteBadge = (badge: Badge, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening detail modal
    setBadgeToDelete(badge)
  }

  const confirmDeleteBadge = async () => {
    if (!badgeToDelete) return

    setDeletingBadgeId(badgeToDelete.id)

    try {
      const suborgId = localStorage.getItem('turnkey_suborg_id')
      const walletAddress = localStorage.getItem('wallet_address')
      const userIdentifier = suborgId || walletAddress

      if (!userIdentifier) return

      // Use appropriate header based on auth method
      const headers: any = {}
      if (suborgId) {
        headers['x-suborg-id'] = suborgId
      } else if (walletAddress) {
        headers['x-wallet-address'] = walletAddress
      }

      const response = await axios.delete('/api/user/profile', {
        headers,
        data: { badgeId: badgeToDelete.id }
      })

      if (response.data.success) {
        // Refetch profile to get updated XP, level, and all quest progress
        const refreshResponse = await axios.get('/api/user/profile', { headers })

        if (refreshResponse.data.success) {
          const profile = refreshResponse.data.profile

          // Merge real badges with mock badges
          const realBadges = profile.badges || []
          const earnedProtocols = realBadges.map((b: Badge) => b.protocol)
          const remainingMockBadges = mockBadges.filter(
            (mb: Badge) => !earnedProtocols.includes(mb.protocol)
          )
          const combinedBadges = [...realBadges, ...remainingMockBadges]

          // Update with fresh data from server
          setUserData({
            totalXP: profile.totalXP || 0,
            currentLevelXP: profile.currentLevelXP || 0,
            level: profile.level || 1,
            rank: profile.rank || 0,
            badgesEarned: realBadges.length,
            streak: profile.streak || 0,
            nextLevelXP: profile.nextLevelXP || 100,
          })
          setUserBadges(combinedBadges)
        }
      }
    } catch (error) {
      console.error('Failed to delete badge:', error)
    } finally {
      setDeletingBadgeId(null)
      setBadgeToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative pt-28 pb-12 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-slate-950 to-black" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 relative">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-8"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-5xl border-2 border-slate-800">
                🥋
              </div>
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-indigo-600 rounded-full font-black text-white text-xs border-2 border-slate-900">
                Lvl {userData.level}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black mb-1">Your Dashboard</h1>
              <p className="text-slate-400 text-sm mb-4">Track your progress, badges, and achievements</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-2">
                  <div className="text-slate-400 text-[10px] mb-0.5">Total XP</div>
                  <div className="text-xl font-black text-emerald-400">{userData.totalXP}</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-2">
                  <div className="text-slate-400 text-[10px] mb-0.5">Global Rank</div>
                  <div className="text-xl font-black text-indigo-400">#{userData.rank}</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-2">
                  <div className="text-slate-400 text-[10px] mb-0.5">Badges</div>
                  <div className="text-xl font-black text-purple-400">{userData.badgesEarned}/5</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-2">
                  <div className="text-slate-400 text-[10px] mb-0.5">Streak</div>
                  <div className="text-xl font-black text-yellow-400">{userData.streak} 🔥</div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-slate-400">Level {userData.level} Progress</span>
                  <span className="text-slate-300 font-bold">{userData.currentLevelXP || 0} / {userData.nextLevelXP} XP</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((userData.currentLevelXP || 0) / userData.nextLevelXP) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-slate-700/50">
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-2 font-bold text-sm transition-all relative ${
                activeTab === 'badges'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              NFT Badges
              {activeTab === 'badges' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 font-bold text-sm transition-all relative ${
                activeTab === 'achievements'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Achievements
              {activeTab === 'achievements' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'badges' ? (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Earned Badges */}
              <div>
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Your NFT Badges ({userBadges.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userBadges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedBadge(badge)}
                      className={`group relative bg-gradient-to-br from-slate-900 to-slate-950 border ${getRarityBorder(badge.rarity)} rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-all shadow-2xl overflow-hidden`}
                    >
                      {/* Animated gradient background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(badge.rarity)} opacity-5 group-hover:opacity-10 transition-opacity`} />

                      {/* Holographic shine effect */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${getRarityColor(badge.rarity)} opacity-0 group-hover:opacity-20`}
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        style={{
                          clipPath: 'polygon(0 0, 30% 0, 50% 100%, 20% 100%)',
                        }}
                      />

                      {/* NFT Art Container */}
                      <div className="relative mb-4">
                        <div className={`w-full aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br ${getRarityColor(badge.rarity)} p-[2px]`}>
                          {/* Inner card with artistic background */}
                          <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden relative">
                            {/* Decorative geometric patterns */}
                            <div className="absolute inset-0 opacity-20">
                              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getRarityColor(badge.rarity)} rounded-full blur-2xl`} />
                              <div className={`absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr ${getRarityColor(badge.rarity)} rounded-full blur-2xl`} />
                              {/* Hexagon pattern */}
                              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                  <pattern id={`hexagons-${badge.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <polygon points="20,5 30,12 30,28 20,35 10,28 10,12" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                                  </pattern>
                                </defs>
                                <rect x="0" y="0" width="100%" height="100%" fill={`url(#hexagons-${badge.id})`} />
                              </svg>
                            </div>

                            {/* Main icon with glow */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <motion.div
                                className="relative"
                                animate={{
                                  y: [0, -6, 0],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                              >
                                <div className={`absolute inset-0 blur-xl bg-gradient-to-br ${getRarityColor(badge.rarity)} opacity-60`} />
                                <div className="text-6xl relative z-10 drop-shadow-2xl">
                                  {badge.icon}
                                </div>
                              </motion.div>
                            </div>

                            {/* Sparkle effects */}
                            <motion.div
                              className="absolute top-3 right-3 text-yellow-300 text-base"
                              animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            >
                              ✨
                            </motion.div>
                            <motion.div
                              className="absolute bottom-4 left-3 text-cyan-300 text-xs"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.4, 0.8, 0.4],
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 0.5,
                              }}
                            >
                              ✦
                            </motion.div>
                          </div>
                        </div>

                        {/* Token ID badge */}
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/90 backdrop-blur-sm rounded-full text-[10px] font-black border border-slate-600 shadow-lg">
                          #{badge.tokenId}
                        </div>

                        {/* Delete button - only show for real earned badges (not mock) */}
                        {!mockBadges.find(mb => mb.id === badge.id) && (
                          <motion.button
                            onClick={(e) => handleDeleteBadge(badge, e)}
                            disabled={deletingBadgeId === badge.id}
                            className="absolute bottom-2 right-2 w-7 h-7 bg-red-600/90 hover:bg-red-500 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Destroy badge and retake quest"
                          >
                            {deletingBadgeId === badge.id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : (
                              <Trash2 className="w-3 h-3 text-white" />
                            )}
                          </motion.button>
                        )}
                      </div>

                      {/* Badge Info */}
                      <div className="relative">
                        <h3 className="font-black text-base mb-0.5">{badge.name}</h3>
                        <p className="text-slate-400 text-xs mb-2 line-clamp-1">{badge.description}</p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold text-xs">+{badge.xpEarned} XP</span>
                          </div>
                          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gradient-to-r ${getRarityColor(badge.rarity)} bg-clip-text text-transparent`}>
                            {badge.rarity}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Locked Badges */}
              <div>
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-slate-400" />
                  Locked Badges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {lockedProtocols.map((protocol, index) => (
                    <motion.div
                      key={protocol.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="group relative bg-gradient-to-br from-slate-900/50 to-slate-950/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all overflow-hidden"
                    >
                      {/* Subtle animated gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/0 to-slate-700/0 group-hover:from-slate-800/10 group-hover:to-slate-700/10 transition-all rounded-xl" />

                      <div className="relative">
                        {/* NFT Art Container - Similar to unlocked but locked */}
                        <div className="relative mb-4">
                          <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br from-slate-700 to-slate-800 p-[2px]">
                            <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden relative">
                              {/* Locked pattern overlay */}
                              <div className="absolute inset-0 opacity-10">
                                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                  <defs>
                                    <pattern id={`locked-${protocol.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                      <circle cx="10" cy="10" r="1" fill="currentColor"/>
                                    </pattern>
                                  </defs>
                                  <rect x="0" y="0" width="100%" height="100%" fill={`url(#locked-${protocol.id})`} />
                                </svg>
                              </div>

                              {/* Icon with lock overlay */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                  <div className="text-6xl grayscale opacity-30 blur-[1px]">
                                    {protocol.icon}
                                  </div>
                                </div>
                              </div>

                              {/* Lock icon centered */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                  <div className="absolute inset-0 blur-lg bg-slate-500 opacity-30 rounded-full" />
                                  <Lock className="relative w-12 h-12 text-slate-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <h3 className="font-black text-base mb-0.5 text-slate-300">{protocol.name}</h3>
                        <p className="text-slate-500 text-xs mb-3">Complete quest to unlock • +{protocol.xp} XP</p>
                        <Link
                          href={`/quest/${protocol.id}`}
                          className="flex items-center justify-center gap-1.5 w-full py-2 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-lg transition-all text-xs shadow-lg shadow-indigo-900/20 group-hover:shadow-indigo-900/40"
                        >
                          Start Quest
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-gradient-to-br from-slate-900 to-slate-950 border rounded-lg p-4 ${
                      achievement.unlocked
                        ? 'border-emerald-700/50'
                        : 'border-slate-700/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-black text-base">{achievement.title}</h3>
                          {achievement.unlocked && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mb-2">{achievement.description}</p>

                        {/* Progress Bar */}
                        {!achievement.unlocked && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-slate-400">Progress</span>
                              <span className="text-slate-300 font-bold">
                                {achievement.progress}/{achievement.maxProgress}
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className="text-yellow-400 font-bold text-xs">+{achievement.reward} XP</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-lg w-full bg-gradient-to-br from-slate-900 to-slate-950 border-2 ${getRarityBorder(selectedBadge.rarity)} rounded-2xl p-8 shadow-2xl`}
            >
              <div className="text-8xl text-center mb-6">{selectedBadge.icon}</div>
              <h2 className="text-3xl font-black text-center mb-2">{selectedBadge.name}</h2>
              <p className="text-slate-400 text-center mb-4">{selectedBadge.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs mb-1">Token ID</div>
                  <div className="text-white font-black">#{selectedBadge.tokenId}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs mb-1">XP Earned</div>
                  <div className="text-emerald-400 font-black">+{selectedBadge.xpEarned}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs mb-1">Minted</div>
                  <div className="text-white font-black text-sm">{selectedBadge.mintedAt}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs mb-1">Rarity</div>
                  <div className={`font-black uppercase text-sm ${getRarityColor(selectedBadge.rarity)} bg-clip-text text-transparent`}>
                    {selectedBadge.rarity}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {badgeToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBadgeToDelete(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-sm w-full bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-red-500/30 rounded-xl p-5 shadow-2xl"
            >
              {/* Warning Icon & Title */}
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </motion.div>
                <h3 className="text-lg font-black text-white">Destroy NFT Badge?</h3>
              </div>

              {/* Badge Preview */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="text-3xl">{badgeToDelete.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{badgeToDelete.name}</h4>
                    <p className="text-slate-400 text-xs">Token #{badgeToDelete.tokenId}</p>
                  </div>
                  <div className="text-red-400 font-bold text-xs whitespace-nowrap">-{badgeToDelete.xpEarned} XP</div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-2.5 mb-4">
                <p className="text-slate-300 text-xs text-center leading-relaxed">
                  This will permanently destroy your NFT badge and reset all quest progress. You can re-earn it by retaking the quest.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setBadgeToDelete(null)}
                  disabled={deletingBadgeId === badgeToDelete.id}
                  className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm rounded-lg transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteBadge}
                  disabled={deletingBadgeId === badgeToDelete.id}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {deletingBadgeId === badgeToDelete.id ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span className="text-xs">Destroying...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Destroy
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
