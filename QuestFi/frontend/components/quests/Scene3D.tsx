'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

export default function Scene3D() {
  const sphere1 = useRef<THREE.Mesh>(null!)
  const torus1 = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (sphere1.current) {
      sphere1.current.rotation.y = time * 0.15
    }
    if (torus1.current) {
      torus1.current.rotation.x = time * 0.2
      torus1.current.rotation.y = time * 0.3
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />

      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <Sphere ref={sphere1} args={[1.2, 32, 32]} position={[-2, 0, -1]}>
          <MeshDistortMaterial
            color="#10b981"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.5}
          />
        </Sphere>
      </Float>

      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh ref={torus1} position={[2, 0, -2]}>
          <torusGeometry args={[1, 0.3, 16, 100]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.6}
          />
        </mesh>
      </Float>
    </>
  )
}
