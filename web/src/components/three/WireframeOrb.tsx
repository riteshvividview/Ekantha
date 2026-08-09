'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

/**
 * A small rotating wireframe icosahedron — the one tasteful 3D accent
 * reserved for the Home hero (per stack.md: not forced onto every page).
 * React Three Fiber is the React equivalent of the Vue-only TresJS used
 * in the sibling VividView project.
 */
function OrbMesh() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += delta * 0.12
    meshRef.current.rotation.y += delta * 0.18
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#121214" wireframe />
    </mesh>
  )
}

export function WireframeOrb({ className }: { className?: string }) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 3.2], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={1} />
      <OrbMesh />
    </Canvas>
  )
}
