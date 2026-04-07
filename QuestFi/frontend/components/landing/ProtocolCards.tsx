'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Link from 'next/link'

interface Protocol {
  id: string
  name: string
  icon: string
  description: string
  duration: string
  xp: number
  difficulty: string
  builders: number
}

const protocols: Protocol[] = [
  {
    id: 'zest',
    name: 'Zest',
    icon: '🏦',
    description: 'Learn to lend STX or sBTC to earn passive yield and borrow stablecoins using your Bitcoin as collateral—without selling.',
    duration: '5-8 min',
    xp: 50,
    difficulty: 'Beginner',
    builders: 25412
  },
  {
    id: 'stackingdao',
    name: 'StackingDAO',
    icon: '💧',
    description: 'Master liquid staking: lock your STX to earn Bitcoin rewards while keeping your assets liquid with sSTX tokens.',
    duration: '6-10 min',
    xp: 60,
    difficulty: 'Beginner',
    builders: 18903
  },
  {
    id: 'granite',
    name: 'Granite',
    icon: '⛰️',
    description: 'Unlock Bitcoin liquidity by using sBTC as collateral to borrow stablecoins in a safe, over-collateralized system.',
    duration: '8-12 min',
    xp: 70,
    difficulty: 'Intermediate',
    builders: 31567
  },
  {
    id: 'hermetica',
    name: 'Hermetica',
    icon: '🔷',
    description: 'Learn about the first Bitcoin-backed, yield-bearing synthetic dollar. Earn up to 15% APY on your stablecoin holdings.',
    duration: '10-15 min',
    xp: 2000,
    difficulty: 'Intermediate',
    builders: 22845
  },
  {
    id: 'arkadiko',
    name: 'Arkadiko',
    icon: '🏛️',
    description: 'Use STX as collateral to mint USDA stablecoins and explore CDP (Collateralized Debt Position) mechanics.',
    duration: '6-9 min',
    xp: 55,
    difficulty: 'Beginner',
    builders: 19234
  }
]

function StarField() {
  const ref = useRef<THREE.Points>(null!)
  const [sphere] = useState(() => {
    const positions = new Float32Array(5000 * 3)
    for (let i = 0; i < 5000; i++) {
      const radius = 15 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    return positions
  })

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 15
    ref.current.rotation.y -= delta / 20
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#10b981"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  )
}

function FloatingRings() {
  const ring1 = useRef<THREE.Mesh>(null!)
  const ring2 = useRef<THREE.Mesh>(null!)
  const ring3 = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (ring1.current) {
      ring1.current.rotation.x = time * 0.3
      ring1.current.rotation.y = time * 0.2
    }
    if (ring2.current) {
      ring2.current.rotation.x = time * -0.2
      ring2.current.rotation.z = time * 0.4
    }
    if (ring3.current) {
      ring3.current.rotation.y = time * 0.5
      ring3.current.rotation.z = time * -0.3
    }
  })

  return (
    <>
      <mesh ref={ring1}>
        <torusGeometry args={[5, 0.1, 16, 100]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[7, 0.08, 16, 100]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} transparent opacity={0.25} />
      </mesh>
      <mesh ref={ring3}>
        <torusGeometry args={[9, 0.06, 16, 100]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} transparent opacity={0.2} />
      </mesh>
    </>
  )
}

function Icosahedron() {
  const mesh = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    mesh.current.rotation.x = time * 0.1
    mesh.current.rotation.y = time * 0.15
    mesh.current.position.y = Math.sin(time * 0.5) * 0.5
  })

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[2, 1]} />
      <meshStandardMaterial
        color="#10b981"
        emissive="#10b981"
        emissiveIntensity={0.4}
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  )
}

export default function ProtocolCards({ hideTitle = false }: { hideTitle?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % protocols.length)
  }

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + protocols.length) % protocols.length)
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setDragStart(clientX)
    setDragOffset(0)
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStart === null) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const offset = clientX - dragStart
    setDragOffset(offset)
  }

  const handleDragEnd = () => {
    if (dragStart === null) return

    // If dragged more than 50px, navigate
    if (dragOffset > 50) {
      prevCard()
    } else if (dragOffset < -50) {
      nextCard()
    }

    setDragStart(null)
    setDragOffset(0)
  }

  const getCardPosition = (index: number) => {
    const totalCards = protocols.length
    const angleStep = (Math.PI * 2) / totalCards
    const currentAngle = (index - currentIndex) * angleStep

    const radius = 450
    const x = Math.sin(currentAngle) * radius
    const z = Math.cos(currentAngle) * radius

    let scale = 1
    let opacity = 1

    if (index === currentIndex) {
      scale = 1
      opacity = 1
    } else {
      const distance = Math.abs(index - currentIndex)
      const minDistance = Math.min(distance, totalCards - distance)
      scale = Math.max(0.7, 1 - minDistance * 0.15)
      opacity = Math.max(0.3, 1 - minDistance * 0.35)
    }

    return { x, z, scale, opacity }
  }

  return (
    <section className="relative py-16 lg:py-20 bg-black overflow-hidden">
      {/* Three.js Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />

            <StarField />
            {/* <FloatingRings /> */}
            <Icosahedron />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlays for Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-[1]" />
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black to-transparent z-[1]" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent z-[1]" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        {!hideTitle && (
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              Choose Your Quest
            </h2>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
              Master 5 essential DeFi protocols on Stacks. Each quest teaches you practical skills through hands-on experience.
            </p>
          </div>
        )}

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={prevCard}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/30 hover:border-emerald-500/60 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-md shadow-lg shadow-emerald-500/20"
          >
            <ChevronLeft className="w-6 h-6 text-emerald-400" />
          </button>

          <button
            onClick={nextCard}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/30 hover:border-emerald-500/60 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-md shadow-lg shadow-emerald-500/20"
          >
            <ChevronRight className="w-6 h-6 text-emerald-400" />
          </button>

          {/* Cards in Circular Layout */}
          <div
            className="relative h-[600px] flex items-center justify-center perspective-1000 cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {mounted && protocols.map((protocol, index) => {
              const { x, z, scale, opacity } = getCardPosition(index)
              const isActive = index === currentIndex

              return (
                <div
                  key={protocol.id}
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    position: 'absolute',
                    transform: `translate3d(${x.toFixed(2)}px, 0, ${z.toFixed(2)}px) scale(${scale})`,
                    opacity: opacity,
                    zIndex: isActive ? 10 : Math.round((1 - Math.abs(z) / 450) * 5),
                    transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    filter: isActive ? 'none' : 'blur(1.5px)',
                    cursor: isActive ? 'default' : 'pointer'
                  }}
                  className="w-80"
                >
                  <div className={`bg-slate-950/70 backdrop-blur-2xl border rounded-2xl p-8 transition-all duration-300 ${
                    isActive ? 'border-emerald-500/70 shadow-2xl shadow-emerald-500/40' : 'border-slate-700/50 hover:border-emerald-500/40'
                  }`}>
                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/40 to-cyan-500/40 rounded-xl flex items-center justify-center text-4xl mb-6 border border-emerald-500/50 shadow-xl shadow-emerald-500/30">
                      {protocol.icon}
                    </div>

                    {/* Protocol Name */}
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {protocol.name}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                      {protocol.description}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-slate-400 text-sm">{protocol.duration}</span>
                      </div>
                      <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold text-xs">
                        +{protocol.xp} XP
                      </span>
                    </div>

                    {/* Difficulty and Builders Row */}
                    <div className="flex items-center justify-between mb-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        protocol.difficulty === 'Beginner'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {protocol.difficulty === 'Beginner' ? '🌱' : '⚡'} {protocol.difficulty}
                      </span>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-slate-950"></div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 border-2 border-slate-950"></div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 border-2 border-slate-950"></div>
                        </div>
                        <span className="text-slate-400 text-xs">
                          {protocol.builders.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* View Challenge Button - Only on active card */}
                    {isActive && (
                      <Link href={`/quest/${protocol.id}`} className="w-full">
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-xl shadow-emerald-500/40 transition-all hover:scale-[1.02]">
                          View Challenge
                        </Button>
                      </Link>
                    )}

                    {/* Outlined button for non-active cards */}
                    {!isActive && (
                      <Link href={`/quest/${protocol.id}`} className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-slate-600/50 text-slate-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
                        >
                          View Challenge
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {protocols.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-emerald-500 shadow-lg shadow-emerald-500/50'
                    : 'w-2 bg-slate-600/50 hover:bg-slate-500/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
