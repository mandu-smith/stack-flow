'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import axios from 'axios'
import {
  CheckCircle2, Circle, Lock, Trophy,
  X,
  Zap
} from 'lucide-react'
import MintBadgeModal from '@/components/nft/MintBadgeModal'
import Scene3D from '@/components/quests/Scene3D'
import StepModal from '@/components/quests/StepModal'
import { zestData } from '@/data/zest/zest'
import { hermeticaData } from '@/data/hermetica/hermetica'

// Protocol Data
const protocolData: any = {
  zest: zestData,
  hermetica: hermeticaData
}

export default function ProtocolQuestPage() {
  const params = useParams()
  const router = useRouter()
  const protocol = protocolData[params.protocol as string]

  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<any>(null)
  const [quizAnswers, setQuizAnswers] = useState<any>({})
  const [simulatorState, setSimulatorState] = useState({
    deposited: 0,
    earned: 0,
    borrowed: 0,
    healthFactor: 0
  })
  const [practiceStep, setPracticeStep] = useState(0)
  const [walletConnected, setWalletConnected] = useState(false)
  const [totalXP, setTotalXP] = useState(0)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showMintModal, setShowMintModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [suborgId, setSuborgId] = useState<string | null>(null)
  const [hasBadge, setHasBadge] = useState(false)

  // Authentication check on mount
  useEffect(() => {
    const checkAuth = () => {
      const session = localStorage.getItem('turnkey_session')
      const suborg = localStorage.getItem('turnkey_suborg_id')
      const walletConnected = localStorage.getItem('wallet_connected')
      const walletAddress = localStorage.getItem('wallet_address')

      // Check if authenticated via Turnkey OR Wallet
      if ((!session || !suborg) && walletConnected !== 'true') {
        // Not authenticated - show auth required message
        setIsAuthenticated(false)
      } else {
        setIsAuthenticated(true)
        // Use suborg if available, otherwise use wallet address as identifier
        setSuborgId(suborg || walletAddress)
      }
    }

    checkAuth()
  }, [router])

  // Load user's quest progress from MongoDB
  useEffect(() => {
    const loadProgress = async () => {
      if (!suborgId || !protocol) return

      try {
        // Determine if using wallet or Turnkey auth
        const turnkeySuborg = localStorage.getItem('turnkey_suborg_id')
        const headers: any = {}
        if (turnkeySuborg && turnkeySuborg === suborgId) {
          headers['x-suborg-id'] = suborgId
        } else {
          headers['x-wallet-address'] = suborgId
        }

        const response = await axios.get('/api/user/profile', { headers })

        if (response.data.success) {
          const profile = response.data.profile

          // Check if user already has badge for this protocol
          const earnedBadge = profile.badges.find((b: any) => b.protocol === params.protocol)
          setHasBadge(!!earnedBadge)

          // Filter completed quests for this protocol
          const protocolQuests = profile.completedQuests.filter((qId: string) =>
            qId.startsWith(`${params.protocol}-`)
          )

          // Extract step IDs
          const stepIds = protocolQuests.map((qId: string) => {
            const match = qId.match(/step-(\d+)/)
            return match ? parseInt(match[1]) : null
          }).filter((id: number | null) => id !== null)

          setCompletedSteps(stepIds)

          // Calculate total XP for this protocol
          const protocolXP = stepIds.reduce((sum: number, stepId: number) => {
            const step = protocol.steps.find((s: any) => s.id === stepId)
            return sum + (step?.xp || 0)
          }, 0)
          setTotalXP(protocolXP)

          // Set current step to first incomplete
          const nextStep = protocol.steps.find((s: any) => !stepIds.includes(s.id))
          if (nextStep) {
            setCurrentStep(nextStep.id)
          } else if (stepIds.length === protocol.steps.length) {
            setCurrentStep(protocol.steps.length)
          }
        }
      } catch (error) {
        console.error('Failed to load progress:', error)
      }
    }

    loadProgress()
  }, [suborgId, params.protocol, protocol])

  // Show loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show authentication required message
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full"
        >
          <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-6 shadow-2xl shadow-emerald-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sign In Required</h2>
                <p className="text-xs text-slate-400">Access quests & earn rewards</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/20"
              >
                Sign In
              </button>
              <button
                onClick={() => router.back()}
                className="px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-sm font-semibold rounded-lg transition-all border border-slate-700/50"
              >
                Back
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show Coming Soon page for protocols without quests
  if (!protocol) {
    const protocolName = params.protocol as string
    const protocolInfo: any = {
      granite: { name: 'Granite', icon: '⛰️', description: 'Bitcoin-backed stablecoin protocol' },
      arkadiko: { name: 'Arkadiko', icon: '🏛️', description: 'Decentralized borrowing protocol' },
      stackingdao: { name: 'StackingDAO', icon: '💧', description: 'Liquid staking protocol' },
    }
    const info = protocolInfo[protocolName] || { name: protocolName, icon: '🎯', description: 'DeFi protocol' }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
                className="text-8xl mb-6 inline-block"
              >
                {info.icon}
              </motion.div>

              {/* Title */}
              <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                {info.name}
              </h1>

              {/* Description */}
              <p className="text-xl text-slate-400 mb-8">
                {info.description}
              </p>

              {/* Coming Soon Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-block mb-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-xl opacity-50" />
                  <div className="relative px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full border border-purple-400/30">
                    <span className="text-white font-bold text-lg tracking-wide">🚀 Coming Soon</span>
                  </div>
                </div>
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8"
              >
                <p className="text-slate-300 text-lg leading-relaxed mb-4">
                  We're currently building an exciting quest experience for <span className="text-white font-bold">{info.name}</span>.
                </p>
                <p className="text-slate-400">
                  Check back soon to start earning XP and badges!
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={() => router.push('/quests')}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/30"
                >
                  Browse Available Quests
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-8 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-bold rounded-xl transition-all border border-slate-700/50"
                >
                  Back to Home
                </button>
              </motion.div>

              {/* Progress indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 flex items-center justify-center gap-2"
              >
                <div className="flex gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                  />
                </div>
                <span className="text-slate-500 text-sm ml-2">In Development</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  const openStep = (step: any) => {
    if (step.type === 'video') {
      setVideoUrl(step.content.videoUrl)
      setShowVideoModal(true)
      setModalContent(step)
    } else {
      setModalContent(step)
      setShowModal(true)
    }
  }

  const completeStep = async (stepId: number, xp: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
      setTotalXP(totalXP + xp)

      // Save progress to MongoDB
      if (suborgId) {
        try {
          // Determine if using wallet or Turnkey auth
          const turnkeySuborg = localStorage.getItem('turnkey_suborg_id')
          const headers: any = {}
          if (turnkeySuborg && turnkeySuborg === suborgId) {
            headers['x-suborg-id'] = suborgId
          } else {
            headers['x-wallet-address'] = suborgId
          }

          await axios.post('/api/user/profile', {
            action: 'complete_quest',
            data: {
              questId: `${params.protocol}-step-${stepId}`,
              xpReward: xp
            }
          }, { headers })
        } catch (error) {
          console.error('Failed to save progress:', error)
        }
      }
    }
    setShowModal(false)
    setShowVideoModal(false)
    if (stepId < protocol.steps.length) {
      setCurrentStep(stepId + 1)
    }
  }

  const getColorClasses = (color: string) => {
    const colors: any = {
      purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-400', glow: 'shadow-purple-500' },
      cyan: { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-400', glow: 'shadow-cyan-500' },
      emerald: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500' },
      yellow: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400', glow: 'shadow-yellow-500' },
      orange: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400', glow: 'shadow-orange-500' },
      pink: { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-400', glow: 'shadow-pink-500' },
    }
    return colors[color] || colors.emerald
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </Canvas>
      </div>

      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-[1]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/50">
                  {protocol.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">{protocol.name}</h1>
                  <p className="text-slate-400 text-sm">{protocol.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Progress</div>
                  <div className="text-2xl font-black text-white">{completedSteps.length}/{protocol.steps.length}</div>
                </div>
                <div className="h-12 w-px bg-slate-800" />
                <div>
                  <div className="text-xs text-slate-500 mb-1">Total XP</div>
                  <div className="text-2xl font-black text-emerald-400">{totalXP}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps.length / protocol.steps.length) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Unique Hexagonal Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {protocol.steps.map((step: any, index: number) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = step.id === currentStep
            const isLocked = step.id > currentStep
            const colors = getColorClasses(step.color)
            const StepIcon = step.icon

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                whileHover={!isLocked ? { scale: 1.05, y: -8, rotateY: 5 } : {}}
                onClick={() => !isLocked && openStep(step)}
                className={`relative group cursor-pointer ${isLocked ? 'opacity-50' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Animated Particles */}
                {isCurrent && !isCompleted && (
                  <>
                    <motion.div
                      className={`absolute inset-0 ${colors.bg} opacity-20 blur-3xl rounded-3xl`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-2 h-2 ${colors.bg} rounded-full`}
                        style={{
                          left: `${20 + i * 30}%`,
                          top: '-10px',
                        }}
                        animate={{
                          y: [0, 300],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.6,
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Completion Sparkles */}
                {isCompleted && (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-yellow-400 text-xl"
                        style={{
                          left: `${10 + i * 25}%`,
                          top: `${10 + (i % 2) * 70}%`,
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          rotate: [0, 180, 360],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      >
                        ✨
                      </motion.div>
                    ))}
                  </>
                )}

                {/* Card */}
                <div className={`relative backdrop-blur-2xl border-2 rounded-3xl overflow-hidden transition-all min-h-[420px] flex flex-col ${
                  isCompleted
                    ? `bg-gradient-to-br from-emerald-950/90 via-slate-950/90 to-cyan-950/90 ${colors.border}/50 shadow-2xl shadow-emerald-500/30`
                    : isCurrent
                    ? `bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 ${colors.border}/60 shadow-2xl ${colors.glow}/40`
                    : 'bg-slate-950/80 border-slate-800/50'
                }`}>

                  {/* Animated Badge */}
                  <motion.div
                    className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 ${
                      isCompleted
                        ? 'bg-emerald-600/90 text-white'
                        : isCurrent
                        ? `${colors.bg} text-white shadow-lg ${colors.glow}/50`
                        : 'bg-slate-800 text-slate-500'
                    }`}
                    animate={isCurrent && !isCompleted ? {
                      scale: [1, 1.1, 1],
                      boxShadow: ['0 0 20px rgba(16, 185, 129, 0.3)', '0 0 30px rgba(16, 185, 129, 0.6)', '0 0 20px rgba(16, 185, 129, 0.3)']
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isCompleted && <span>🏆</span>}
                    {isCompleted ? 'Completed' : isLocked ? '🔒 Locked' : '▶ Start'}
                  </motion.div>

                  {/* Level Indicator */}
                  <div className="absolute top-4 left-4">
                    <motion.div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm ${
                        isCompleted
                          ? 'bg-emerald-600/90 border-emerald-600/90 text-white'
                          : isCurrent
                          ? `${colors.bg} ${colors.border} text-white`
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {step.id}
                    </motion.div>
                  </div>

                  {/* Icon Circle */}
                  <div className="p-6 pt-16">
                    <motion.div
                      className={`relative w-24 h-24 mx-auto rounded-3xl ${
                        isCompleted
                          ? 'bg-emerald-600/80'
                          : isCurrent
                          ? `bg-gradient-to-br ${colors.bg.replace('bg-', 'from-')}-400 ${colors.bg.replace('bg-', 'via-')}-500 ${colors.bg.replace('bg-', 'to-')}-600`
                          : 'bg-gradient-to-br from-slate-700 to-slate-800'
                      } flex items-center justify-center mb-5 shadow-2xl ${
                        isCompleted ? 'shadow-emerald-600/30' : isCurrent ? `${colors.glow}/60` : ''
                      }`}
                      animate={isCurrent && !isCompleted ? {
                        boxShadow: [
                          '0 10px 40px rgba(16, 185, 129, 0.4)',
                          '0 15px 60px rgba(16, 185, 129, 0.8)',
                          '0 10px 40px rgba(16, 185, 129, 0.4)'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        animate={!isLocked ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-12 h-12 text-white" />
                        ) : isLocked ? (
                          <Lock className="w-10 h-10 text-slate-400" />
                        ) : (
                          <StepIcon className="w-12 h-12 text-white" />
                        )}
                      </motion.div>

                      {/* Orbiting Particles */}
                      {isCurrent && !isCompleted && (
                        <>
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className={`absolute w-3 h-3 ${colors.bg} rounded-full`}
                              style={{
                                left: '50%',
                                top: '50%',
                              }}
                              animate={{
                                x: [0, 50, 0, -50, 0],
                                y: [0, -50, 0, 50, 0],
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                delay: i * 1.3,
                              }}
                            />
                          ))}
                        </>
                      )}

                      {/* Pulsing Ring */}
                      {isCurrent && !isCompleted && (
                        <motion.div
                          className={`absolute inset-0 rounded-3xl border-4 ${colors.border}`}
                          animate={{
                            scale: [1, 1.3],
                            opacity: [0.8, 0],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    {/* Content */}
                    <div className="text-center">
                      <motion.div
                        className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-slate-800/50 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-slate-400 text-xs font-black">QUEST {step.id}</span>
                        <span className={`w-2 h-2 rounded-full ${isCurrent ? colors.bg : 'bg-slate-600'}`} />
                      </motion.div>
                      <h3 className="text-xl font-black text-white mb-3 leading-tight">{step.title}</h3>
                      <p className="text-slate-400 text-sm mb-5 line-clamp-2 px-2">{step.content.description}</p>

                      {/* Stats */}
                      <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-700/50">
                        <motion.div
                          className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-xl"
                          whileHover={{ scale: 1.05, backgroundColor: 'rgba(30, 41, 59, 0.8)' }}
                        >
                          <span className="text-lg">⏱</span>
                          <span className="text-xs font-bold text-slate-400">{step.duration}</span>
                        </motion.div>
                        <motion.div
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                            isCompleted
                              ? 'bg-emerald-600/10 border border-emerald-600/30'
                              : `${colors.bg}/20 border ${colors.border}/30`
                          }`}
                          whileHover={{ scale: 1.05 }}
                          animate={isCurrent && !isCompleted ? {
                            borderColor: ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.3)']
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Zap className={`w-5 h-5 ${isCompleted ? 'text-emerald-400' : colors.text}`} />
                          <span className={`text-sm font-black ${isCompleted ? 'text-emerald-400' : colors.text}`}>+{step.xp} XP</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* NFT Badge */}
        {completedSteps.length === protocol.steps.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-yellow-600/10 border border-yellow-500/30 rounded-2xl p-6 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-yellow-600/5 animate-pulse" />
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-3 inline-block"
              >
                {hasBadge ? '✅' : '🏆'}
              </motion.div>
              <h3 className="text-2xl font-black text-white mb-1">
                {hasBadge ? 'Badge Already Earned!' : 'Quest Complete!'}
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                {hasBadge
                  ? `You've already earned the ${protocol.name} NFT badge! To retake this quest, please destroy your badge from the Profile page first.`
                  : `You've mastered ${protocol.name}. Claim your exclusive NFT badge!`
                }
              </p>
              {hasBadge ? (
                <button
                  onClick={() => router.push('/profile')}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl hover:scale-105 transition-all shadow-lg shadow-indigo-600/30"
                >
                  View My Profile
                </button>
              ) : (
                <button
                  onClick={() => setShowMintModal(true)}
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-sm rounded-xl hover:scale-105 transition-all shadow-lg shadow-yellow-600/30"
                >
                  Mint NFT Badge
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowVideoModal(false)
              if (modalContent) completeStep(modalContent.id, modalContent.xp)
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full max-h-[85vh] overflow-hidden"
            >
              <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                  <div className="flex-1 mr-4">
                    <h3 className="text-xl font-black text-white">{modalContent?.title}</h3>
                    <p className="text-slate-400 text-xs mt-1">{modalContent?.content.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowVideoModal(false)
                      if (modalContent) completeStep(modalContent.id, modalContent.xp)
                    }}
                    className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="aspect-video bg-black flex-shrink-0">
                  <iframe
                    width="100%"
                    height="100%"
                    src={videoUrl}
                    title="Protocol Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                <div className="p-4 bg-slate-900/50 overflow-y-auto">
                  <h4 className="text-sm font-black text-white mb-3">Key Takeaways</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {modalContent?.content.keyPoints.map((point: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 bg-slate-800/50 rounded-lg p-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-xs">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Other Modals */}
      <AnimatePresence>
        {showModal && modalContent && (
          <StepModal
            step={modalContent}
            onClose={() => setShowModal(false)}
            onComplete={(xp: number) => completeStep(modalContent.id, xp)}
            quizAnswers={quizAnswers}
            setQuizAnswers={setQuizAnswers}
            simulatorState={simulatorState}
            setSimulatorState={setSimulatorState}
            practiceStep={practiceStep}
            setPracticeStep={setPracticeStep}
            walletConnected={walletConnected}
            setWalletConnected={setWalletConnected}
          />
        )}
      </AnimatePresence>

      {/* NFT Minting Modal */}
      <MintBadgeModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        protocol={{
          id: protocol.id,
          name: protocol.name,
          icon: protocol.icon,
          xp: protocol.steps.reduce((sum: number, step: any) => sum + step.xp, 0)
        }}
      />
    </div>
  )
}

