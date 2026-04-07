'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award } from 'lucide-react'
import Link from 'next/link'

interface LeaderboardEntry {
  rank: number
  address: string
  displayName: string
  totalXP: number
  badgesEarned: number
  level: number
  avatar: string
  streak: number
  protocolsCompleted: string[]
}

// Mock leaderboard data
const mockLeaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    displayName: 'StacksMaster',
    totalXP: 2450,
    badgesEarned: 5,
    level: 12,
    avatar: '🦁',
    streak: 15,
    protocolsCompleted: ['zest', 'stackingdao', 'granite', 'hermetica', 'arkadiko']
  },
  {
    rank: 2,
    address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
    displayName: 'DeFiNinja',
    totalXP: 2180,
    badgesEarned: 5,
    level: 11,
    avatar: '🥷',
    streak: 12,
    protocolsCompleted: ['zest', 'stackingdao', 'granite', 'hermetica', 'arkadiko']
  },
  {
    rank: 3,
    address: 'SP1C2K603TGWJGKPT2Z3WWHA0ARM66D352385TTWH',
    displayName: 'BTCBuilder',
    totalXP: 1890,
    badgesEarned: 4,
    level: 10,
    avatar: '⚡',
    streak: 8,
    protocolsCompleted: ['zest', 'stackingdao', 'granite', 'hermetica']
  },
  {
    rank: 4,
    address: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
    displayName: 'CryptoQuest',
    totalXP: 1650,
    badgesEarned: 4,
    level: 9,
    avatar: '🎯',
    streak: 6,
    protocolsCompleted: ['zest', 'granite', 'hermetica', 'arkadiko']
  },
  {
    rank: 5,
    address: 'SP3A4DRQKTY0Y7WZWV0F9WTJYK4TN2RZ8KWQZH9E0',
    displayName: 'YieldFarmer',
    totalXP: 1420,
    badgesEarned: 3,
    level: 8,
    avatar: '🌾',
    streak: 5,
    protocolsCompleted: ['zest', 'stackingdao', 'granite']
  },
  {
    rank: 6,
    address: 'SP1HDQZ9JZW0KFBQC7K4VN6K8F3YRM5VRD8BQHZM5',
    displayName: 'StacksAce',
    totalXP: 1180,
    badgesEarned: 3,
    level: 7,
    avatar: '🎲',
    streak: 4,
    protocolsCompleted: ['stackingdao', 'hermetica', 'arkadiko']
  },
  {
    rank: 7,
    address: 'SP2F2A3V0K0QDHJY7X3P4C2TYN8XWW4GP8HSDF98G',
    displayName: 'QuestSeeker',
    totalXP: 950,
    badgesEarned: 2,
    level: 6,
    avatar: '🔍',
    streak: 3,
    protocolsCompleted: ['zest', 'granite']
  },
  {
    rank: 8,
    address: 'SP3BGVZ9GZA9JZRZ2DN7H3VV0P4P0EF8GXW5SK8Z3',
    displayName: 'Web3Warrior',
    totalXP: 720,
    badgesEarned: 2,
    level: 5,
    avatar: '⚔️',
    streak: 2,
    protocolsCompleted: ['zest', 'arkadiko']
  },
  {
    rank: 9,
    address: 'SP1K1PZED3DDN4P2F8Q5R6H7J8K9L0P1Q2R3S4T5',
    displayName: 'LearningBuilder',
    totalXP: 580,
    badgesEarned: 1,
    level: 4,
    avatar: '📚',
    streak: 1,
    protocolsCompleted: ['stackingdao']
  },
  {
    rank: 10,
    address: 'SP2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0',
    displayName: 'NewExplorer',
    totalXP: 310,
    badgesEarned: 1,
    level: 3,
    avatar: '🚀',
    streak: 1,
    protocolsCompleted: ['zest']
  },
]

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all')

  const getRankIcon = (rank: number) => {
    if (rank === 1) return { icon: <Trophy className="w-5 h-5" />, color: 'text-yellow-500' }
    if (rank === 2) return { icon: <Medal className="w-5 h-5" />, color: 'text-slate-400' }
    if (rank === 3) return { icon: <Award className="w-5 h-5" />, color: 'text-amber-600' }
    return { icon: <span className="text-sm font-bold">#{rank}</span>, color: 'text-slate-500' }
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-950/20 border-yellow-500/30'
    if (rank === 2) return 'bg-slate-800/30 border-slate-400/30'
    if (rank === 3) return 'bg-amber-950/20 border-amber-600/30'
    return 'bg-slate-900/30 border-slate-700/30'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Compact Header */}
      <div className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 via-transparent to-black" />

        <div className="max-w-5xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏆</div>
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-slate-400 text-sm">
              Top builders mastering DeFi on Stacks
            </p>
          </div>

          {/* Compact Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">Builders</div>
              <div className="text-xl font-black text-white">25.4K</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">Total XP</div>
              <div className="text-xl font-black text-white">4.2M</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">NFTs</div>
              <div className="text-xl font-black text-white">18.9K</div>
            </div>
          </div>

          {/* Compact Filters */}
          <div className="flex justify-center gap-2">
            {(['all', 'month', 'week'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-slate-300'
                }`}
              >
                {f === 'all' ? 'All Time' : f === 'month' ? 'Month' : 'Week'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Leaderboard */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="space-y-2">
          {mockLeaderboardData.map((entry, index) => {
            const { icon, color } = getRankIcon(entry.rank)

            return (
              <motion.div
                key={entry.address}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`${getRankBg(entry.rank)} border backdrop-blur-sm rounded-lg p-3 hover:scale-[1.01] transition-all`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Icon */}
                  <div className={`flex items-center justify-center w-8 h-8 flex-shrink-0 ${color}`}>
                    {icon}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="text-2xl">{entry.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm">{entry.displayName}</div>
                      <div className="text-slate-500 text-xs font-mono truncate">
                        {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                      </div>
                    </div>
                  </div>

                  {/* Compact Stats */}
                  <div className="hidden sm:flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <div className="text-slate-500 text-[10px] mb-0.5">LVL</div>
                      <div className="px-2 py-0.5 bg-indigo-600/80 rounded font-bold text-white">
                        {entry.level}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-500 text-[10px] mb-0.5">BADGES</div>
                      <div className="font-bold text-white">{entry.badgesEarned}/5</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-500 text-[10px] mb-0.5">STREAK</div>
                      <div className="font-bold text-white">{entry.streak} 🔥</div>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="text-slate-500 text-[10px] mb-0.5">XP</div>
                    <div className="font-black text-emerald-400 text-base">
                      {entry.totalXP.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Compact CTA */}
        <div className="mt-8 bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-6 text-center">
          <h3 className="text-lg font-black text-white mb-2">Climb the Ranks</h3>
          <p className="text-slate-400 text-sm mb-4">
            Complete quests to earn XP and unlock badges
          </p>
          <Link
            href="/quests"
            className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all"
          >
            Start Quest →
          </Link>
        </div>
      </div>
    </div>
  )
}
