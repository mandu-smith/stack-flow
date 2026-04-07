'use client'

import { Twitter, Github, MessageCircle, Zap, Award, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

// Floating 3D Elements
function Scene3D() {
  const sphere1 = useRef<THREE.Mesh>(null!)
  const sphere2 = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (sphere1.current) {
      sphere1.current.rotation.y = time * 0.15
      sphere1.current.position.y = Math.sin(time * 0.5) * 0.3
    }

    if (sphere2.current) {
      sphere2.current.rotation.y = -time * 0.2
      sphere2.current.position.x = Math.cos(time * 0.4) * 0.5
    }
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#10b981" />

      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <Sphere ref={sphere1} args={[0.8, 32, 32]} position={[-3, 0, -2]}>
          <MeshDistortMaterial
            color="#10b981"
            attach="material"
            distort={0.3}
            speed={1.5}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.6}
          />
        </Sphere>
      </Float>

      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <Sphere ref={sphere2} args={[0.6, 32, 32]} position={[3, 0.5, -2]}>
          <MeshDistortMaterial
            color="#06b6d4"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.6}
          />
        </Sphere>
      </Float>
    </>
  )
}

export default function Footer() {
  const protocols = ['Zest', 'StackingDAO', 'Granite', 'Hermetica', 'Arkadiko']
  const resources = ['Documentation', 'Tutorials', 'Community', 'FAQ']

  return (
    <footer className="relative bg-black overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-[1]" />

      {/* Border Top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent z-[2]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">

          {/* Brand Section - Takes more space */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div>
                <a href="/" className="inline-flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity">
                  <span className="text-2xl">🥋</span>
                  <h3 className="text-2xl font-black text-white bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    QuestFi
                  </h3>
                </a>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                  Master Bitcoin DeFi through gamified quests. Learn by doing, earn NFT badges, and compete for rewards.
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white font-black text-sm">50+</div>
                    <div className="text-slate-500 text-xs">Quests</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white font-black text-sm">5</div>
                    <div className="text-slate-500 text-xs">Protocols</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-white font-black text-sm">3.2k</div>
                    <div className="text-slate-500 text-xs">Learners</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Sections - Compact */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            {/* Protocols */}
            <div>
              <h4 className="text-white font-black mb-3 text-xs uppercase tracking-wider">Protocols</h4>
              <ul className="space-y-2">
                {protocols.map((protocol) => (
                  <li key={protocol}>
                    <a
                      href="#"
                      className="text-slate-500 hover:text-emerald-400 transition-colors text-sm inline-block hover:translate-x-1 duration-200"
                    >
                      {protocol}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-black mb-3 text-xs uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2">
                {resources.map((resource) => (
                  <li key={resource}>
                    <a
                      href="#"
                      className="text-slate-500 hover:text-emerald-400 transition-colors text-sm inline-block hover:translate-x-1 duration-200"
                    >
                      {resource}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div className="lg:col-span-3 flex lg:justify-end">
            <div>
              <h4 className="text-white font-black mb-3 text-xs uppercase tracking-wider">Connect</h4>
              <div className="flex gap-3">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 hover:border-emerald-500/50 rounded-lg flex items-center justify-center transition-all group"
                >
                  <Twitter className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 hover:border-emerald-500/50 rounded-lg flex items-center justify-center transition-all group"
                >
                  <Github className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 hover:border-emerald-500/50 rounded-lg flex items-center justify-center transition-all group"
                >
                  <MessageCircle className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </motion.a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Ultra Compact */}
        <div className="pt-6 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-slate-600 text-xs">
              © {new Date().getFullYear()} QuestFi. Built on Stacks.
            </p>
            <div className="flex gap-4 text-xs">
              <a href="#" className="text-slate-600 hover:text-emerald-400 transition-colors">Privacy</a>
              <span className="text-slate-800">•</span>
              <a href="#" className="text-slate-600 hover:text-emerald-400 transition-colors">Terms</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
