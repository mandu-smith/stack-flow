'use client'

import { TrendingUp, Zap, Award } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useRef, useState } from 'react'
import { Torus, Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

const leaderboardData = [
  { rank: 1, name: 'CryptoNinja', xp: 2845, badges: 5, avatar: 'CN', progress: 95 },
  { rank: 2, name: 'BitcoinWizard', xp: 2720, badges: 5, avatar: 'BW', progress: 88 },
  { rank: 3, name: 'DeFiMaster', xp: 2580, badges: 4, avatar: 'DM', progress: 82 },
  { rank: 4, name: 'StacksQueen', xp: 2340, badges: 4, avatar: 'SQ', progress: 75 },
  { rank: 5, name: 'YieldHunter', xp: 2210, badges: 4, avatar: 'YH', progress: 68 },
  { rank: 6, name: 'BlockBuilder', xp: 2150, badges: 3, avatar: 'BB', progress: 65 },
  { rank: 7, name: 'Web3Warrior', xp: 2080, badges: 3, avatar: 'WW', progress: 60 },
]

// 3D Scene with Rotating Trophy
function Scene3D() {
  const torusRef = useRef<THREE.Mesh>(null!)
  const sphere1Ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.2
      torusRef.current.rotation.y = time * 0.3
    }

    if (sphere1Ref.current) {
      sphere1Ref.current.rotation.y = time * 0.15
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh ref={torusRef}>
          <torusGeometry args={[2.5, 0.6, 16, 100]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.6}
          />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <Sphere ref={sphere1Ref} args={[0.8, 32, 32]} position={[3, 1, -2]}>
          <MeshDistortMaterial
            color="#10b981"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.1}
            metalness={0.9}
          />
        </Sphere>
      </Float>
    </>
  )
}

export default function LeaderboardSection() {
  return (
    <section className="relative py-16 bg-black overflow-hidden">
      {/* 3D Background */}
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
            className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]"
          >
            Top Performers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto"
          >
            Compete with learners worldwide. Top performers each season win STX rewards and exclusive NFT badges.
          </motion.p>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header Bar */}
            <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-lg font-black">Season 3 Leaderboard</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Resets in 4 days • 3,247 competitors</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <span className="text-purple-400 text-xs font-black">LIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="p-6">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 pb-3 border-b border-slate-800/30">
                <div className="col-span-1 text-slate-500 text-xs font-bold uppercase">Rank</div>
                <div className="col-span-5 text-slate-500 text-xs font-bold uppercase">Player</div>
                <div className="col-span-3 text-slate-500 text-xs font-bold uppercase">Progress</div>
                <div className="col-span-2 text-slate-500 text-xs font-bold uppercase">XP</div>
                <div className="col-span-1 text-slate-500 text-xs font-bold uppercase text-right">Trend</div>
              </div>

              {/* Table Rows */}
              <div className="space-y-2 mt-3">
                {leaderboardData.map((user, index) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="group"
                  >
                    <div className={`grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl transition-all hover:bg-slate-800/30 ${
                      user.rank <= 3 ? 'bg-slate-800/20' : ''
                    }`}>
                      {/* Rank */}
                      <div className="col-span-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                          user.rank === 1
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                            : user.rank === 2
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                            : user.rank === 3
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {user.rank}
                        </div>
                      </div>

                      {/* Player */}
                      <div className="col-span-5 flex items-center gap-3">
                        <Avatar className="w-9 h-9 border-2 border-slate-700/50">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white font-black text-xs">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-bold text-sm">{user.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-purple-400" />
                              <span className="text-purple-400 text-xs font-bold">{user.badges}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="col-span-3">
                        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${user.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full rounded-full ${
                              user.rank === 1
                                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                                : user.rank === 2
                                ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50'
                                : user.rank === 3
                                ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                                : 'bg-slate-600'
                            }`}
                          />
                        </div>
                        <span className="text-slate-500 text-xs mt-1 inline-block">{user.progress}%</span>
                      </div>

                      {/* XP */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-black text-sm">{user.xp.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Trend */}
                      <div className="col-span-1 flex justify-end">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Your Position */}
              <div className="mt-6 pt-6 border-t border-slate-800/50">
                <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <div className="col-span-1">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-cyan-500/50">
                      847
                    </div>
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <Avatar className="w-9 h-9 border-2 border-cyan-500/50">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white font-black text-xs">
                        YOU
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white font-bold text-sm">Your Position</div>
                      <div className="text-cyan-400 text-xs font-bold">Keep grinding!</div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[15%] bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50" />
                    </div>
                    <span className="text-slate-500 text-xs mt-1 inline-block">15%</span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-black text-sm">150</span>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Rewards */}
            <div className="px-6 pb-6">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-black text-sm">Season Rewards</h4>
                  <span className="text-slate-500 text-xs">Top 10 winners</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                    <div className="text-emerald-400 text-xs font-bold mb-1">1st Place</div>
                    <div className="text-white text-lg font-black">500 STX</div>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-center">
                    <div className="text-cyan-400 text-xs font-bold mb-1">2nd Place</div>
                    <div className="text-white text-lg font-black">300 STX</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                    <div className="text-purple-400 text-xs font-bold mb-1">3rd Place</div>
                    <div className="text-white text-lg font-black">200 STX</div>
                  </div>
                </div>
                <p className="text-center text-slate-500 text-xs mt-4">+ Exclusive NFT badges for all top 10 finishers</p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
