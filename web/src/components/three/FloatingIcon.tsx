'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

export type IconShape = 'icosahedron' | 'torus' | 'octahedron' | 'cone'

/**
 * A small wireframe shape, one per "Why Vana Ekantha" card — spins slowly
 * at rest, speeds up and grows slightly on hover (driven by the `hovered`
 * prop from the card's own pointer handlers, not scroll). Real
 * React Three Fiber usage, not just the inert WireframeOrb scaffold — this
 * is the first place on the site actually rendering geometry per user
 * interaction.
 */
function Shape({ shape, color, hovered }: { shape: IconShape; color: string; hovered: boolean }) {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return
    const speed = hovered ? 1.5 : 0.35
    mesh.rotation.x += delta * speed * 0.6
    mesh.rotation.y += delta * speed
    const targetScale = hovered ? 1.18 : 1
    mesh.scale.x += (targetScale - mesh.scale.x) * 0.1
    mesh.scale.y += (targetScale - mesh.scale.y) * 0.1
    mesh.scale.z += (targetScale - mesh.scale.z) * 0.1
  })

  return (
    <mesh ref={ref}>
      {shape === 'icosahedron' && <icosahedronGeometry args={[1, 0]} />}
      {shape === 'torus' && <torusGeometry args={[0.75, 0.28, 12, 32]} />}
      {shape === 'octahedron' && <octahedronGeometry args={[1.05, 0]} />}
      {shape === 'cone' && <coneGeometry args={[0.9, 1.5, 5]} />}
      <meshBasicMaterial color={color} wireframe />
    </mesh>
  )
}

export function FloatingIcon({ shape, color, hovered }: { shape: IconShape; color: string; hovered: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 40 }} gl={{ alpha: true, antialias: true }} style={{ background: 'transparent' }}>
      <Shape shape={shape} color={color} hovered={hovered} />
    </Canvas>
  )
}
