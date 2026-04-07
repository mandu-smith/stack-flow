'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Code, Trophy, CheckCircle2, Lock, ArrowRight, Sparkles, Target, Star, TrendingUp, Wallet, ArrowDownUp, Coins } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense } from 'react'
import { Sphere, MeshDistortMaterial, Float, Torus } from '@react-three/drei'
import * as THREE from 'three'

// Unique 3D Scene with Floating Torus and Spheres
function Scene3D() {
  const torusRef = useRef<THREE.Mesh>(null!)
  const sphere1Ref = useRef<THREE.Mesh>(null!)
  const sphere2Ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.3
      torusRef.current.rotation.y = time * 0.4
      torusRef.current.position.y = Math.sin(time * 0.5) * 0.5
    }

    if (sphere1Ref.current) {
      sphere1Ref.current.rotation.y = time * 0.2
      sphere1Ref.current.position.x = Math.sin(time * 0.3) * 1.5
    }

    if (sphere2Ref.current) {
      sphere2Ref.current.rotation.y = -time * 0.25
      sphere2Ref.current.position.x = Math.cos(time * 0.4) * 1.5
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      <pointLight position={[0, 5, 5]} intensity={0.8} color="#8b5cf6" />

      {/* Floating Torus */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh ref={torusRef}>
          <torusGeometry args={[2, 0.5, 16, 100]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>
      </Float>

      {/* Small Sphere 1 */}
      <Float speed={3} rotationIntensity={0.4} floatIntensity={0.6}>
        <Sphere ref={sphere1Ref} args={[0.5, 32, 32]} position={[-2, 1, -1]}>
          <MeshDistortMaterial
            color="#06b6d4"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      {/* Small Sphere 2 */}
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={0.7}>
        <Sphere ref={sphere2Ref} args={[0.4, 32, 32]} position={[2, -1, -1]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            attach="material"
            distort={0.4}
            speed={1.5}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>
    </>
  )
}

// Animated Protocol Demo - Video-like demonstration
function ProtocolDemo() {
  const [stage, setStage] = useState(0)
  const [balance, setBalance] = useState(1.5)
  const [deposited, setDeposited] = useState(0)
  const [earnings, setEarnings] = useState(0)
  const [borrowed, setBorrowed] = useState(0)

  const stages = [
    {
      title: 'Connect Wallet',
      action: 'Connecting to Leather Wallet...',
      icon: Wallet,
      color: 'emerald'
    },
    {
      title: 'View Balance',
      action: 'Checking your sBTC balance: 1.5 sBTC',
      icon: Coins,
      color: 'cyan'
    },
    {
      title: 'Deposit & Lend',
      action: 'Depositing 1.0 sBTC to earn 8.5% APY',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Earn Yield',
      action: 'Accruing interest: +0.0023 sBTC',
      icon: Sparkles,
      color: 'yellow'
    },
    {
      title: 'Borrow USDA',
      action: 'Borrowing $500 USDA against collateral',
      icon: ArrowDownUp,
      color: 'pink'
    },
    {
      title: 'Success!',
      action: 'You\'ve mastered DeFi lending & borrowing',
      icon: Trophy,
      color: 'emerald'
    }
  ]

  // Auto-cycle through stages
  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => {
        const next = (prev + 1) % stages.length

        // Animate values based on stage
        if (next === 2) {
          // Depositing
          setDeposited(1.0)
          setBalance(0.5)
        } else if (next === 3) {
          // Earning
          setEarnings(0.0023)
        } else if (next === 4) {
          // Borrowing
          setBorrowed(500)
        } else if (next === 0) {
          // Reset
          setBalance(1.5)
          setDeposited(0)
          setEarnings(0)
          setBorrowed(0)
        }

        return next
      })
    }, 2500)

    return () => clearInterval(timer)
  }, [stages.length])

  const currentStage = stages[stage]
  const StageIcon = currentStage.icon

  return (
    <div className="relative h-full">
      <div className="relative bg-slate-950/90 backdrop-blur-2xl border border-slate-800/50 rounded-2xl overflow-hidden h-full shadow-2xl">
        {/* Animated Background Glow */}
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 0.6 }}
          className={`absolute top-0 right-0 w-64 h-64 bg-${currentStage.color}-500/30 blur-3xl`}
        />

        {/* Header with Protocol Info */}
        <div className="relative px-6 py-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white text-xl font-black">Zest Protocol</h3>
              <p className="text-slate-500 text-xs mt-0.5">Live Demo - Bitcoin Lending</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-emerald-400 text-xs font-bold">LIVE</span>
            </div>
          </div>

          {/* Stage Indicator */}
          <div className="flex items-center gap-2">
            {stages.map((s, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i === stage ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : i < stage ? 'bg-emerald-500/50' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Demo Area - Video-like Animation */}
        <div className="p-6 space-y-4">
          {/* Current Action Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <div className={`bg-${currentStage.color}-500/10 border border-${currentStage.color}-500/30 rounded-xl p-5`}>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-${currentStage.color}-500 border-2 border-${currentStage.color}-400 flex items-center justify-center shadow-lg shadow-${currentStage.color}-500/50`}>
                    <StageIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-${currentStage.color}-400 text-sm font-black mb-1`}>{currentStage.title}</h4>
                    <p className="text-white text-base font-semibold">{currentStage.action}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Protocol Interface Mockup */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 space-y-4">
            {/* Wallet Balance */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Wallet Balance</span>
              <motion.div
                key={balance}
                initial={{ scale: 1.2, color: '#10b981' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-white text-lg font-black"
              >
                {balance.toFixed(4)} sBTC
              </motion.div>
            </div>

            {/* Deposited */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Deposited (Lending)</span>
              <motion.div
                key={deposited}
                initial={{ scale: 1.2, color: '#06b6d4' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-white text-lg font-black"
              >
                {deposited.toFixed(4)} sBTC
              </motion.div>
            </div>

            {/* Earnings */}
            {earnings > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center justify-between border-t border-slate-800/50 pt-4"
              >
                <span className="text-slate-400 text-sm">Earnings (8.5% APY)</span>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-emerald-400 text-lg font-black">+{earnings.toFixed(4)} sBTC</span>
                </div>
              </motion.div>
            )}

            {/* Borrowed */}
            {borrowed > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center justify-between border-t border-slate-800/50 pt-4"
              >
                <span className="text-slate-400 text-sm">Borrowed</span>
                <div className="text-purple-400 text-lg font-black">${borrowed} USDA</div>
              </motion.div>
            )}

            {/* Health Factor (when borrowing) */}
            {borrowed > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 text-xs font-bold">Health Factor</span>
                  <span className="text-emerald-400 text-sm font-black">2.5 (Safe)</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Progress Message */}
          <div className="text-center">
            <motion.div
              key={stage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700/50"
            >
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-slate-400 text-xs">Step {stage + 1} of {stages.length}</span>
            </motion.div>
          </div>
        </div>

        {/* Bottom Badge */}
        <div className="px-6 pb-5">
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10 border border-emerald-500/20 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-xl shadow-lg shadow-emerald-500/50">
                🎯
              </div>
              <div className="flex-1">
                <div className="text-xs text-emerald-400 font-black">COMPLETE THIS QUEST</div>
                <p className="text-white text-sm font-bold">Master real DeFi protocols</p>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LearnByDoingSection() {
  return (
    <section className="relative py-16 bg-black overflow-hidden">
      {/* Unique 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-[1]" />
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black to-transparent z-[1]" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent z-[1]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            Learn by Doing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto"
          >
            Watch live demonstrations of DeFi protocols in action. See exactly how lending, borrowing, and staking works—step by step.
          </motion.p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">

          {/* Left - Video-like Protocol Demo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="h-[560px]"
          >
            <ProtocolDemo />
          </motion.div>

          {/* Right - Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:pt-8"
          >
            {/* Feature 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-slate-950/70 backdrop-blur-2xl border border-slate-800/50 rounded-xl p-5 hover:border-emerald-500/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-black mb-2">Gamified Quests</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Complete step-by-step missions, earn XP, level up your profile, and unlock advanced protocols as you progress through your DeFi journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-slate-950/70 backdrop-blur-2xl border border-slate-800/50 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-black mb-2">Live Simulations</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Practice with test tokens in real protocol interfaces. Learn lending, borrowing, and staking mechanics without risking actual funds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-slate-950/70 backdrop-blur-2xl border border-slate-800/50 rounded-xl p-5 hover:border-purple-500/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-black mb-2">NFT Credentials</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Earn verifiable on-chain NFT badges for each protocol you master. Build your Web3 resume and showcase your DeFi expertise.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="relative bg-slate-950/70 backdrop-blur-2xl border border-slate-800/50 rounded-xl p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-1">50+</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Quests</div>
                </div>
                <div className="border-x border-slate-800/50">
                  <div className="text-3xl font-black bg-gradient-to-br from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-1">5</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Protocols</div>
                </div>
                <div>
                  <div className="text-3xl font-black bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">∞</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">XP to Earn</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
