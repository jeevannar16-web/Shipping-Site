import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneProgress, ScenePoster } from './SceneShell'
import { Warehouse } from 'lucide-react'

function RackRow({ side }: { side: 1 | -1 }) {
  return (
    <group>
      {Array.from({ length: 5 }).map((_, i) => {
        const y = 0.6 + i * 0.55
        return (
          <mesh key={i} position={[0, y, side * 4.2]}>
            <boxGeometry args={[12, 0.5, 1.2]} />
            <meshStandardMaterial color="#151b28" metalness={0.5} roughness={0.4} />
          </mesh>
        )
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = -5.5 + i * 1.0
        return (
          <mesh key={i} position={[x, 2.4, side * 4.2]}>
            <boxGeometry args={[0.12, 3.2, 1.2]} />
            <meshStandardMaterial color="#0e1119" metalness={0.4} roughness={0.5} />
          </mesh>
        )
      })}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[5.2 - i * 3.4, 0.75, side * 4.25]}>
          <boxGeometry args={[0.9, 0.9, 0.5]} />
          <meshStandardMaterial color={i % 2 ? '#f5a524' : '#2dd4bf'} metalness={0.3} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#0d111a" metalness={0.6} roughness={0.5} />
      </mesh>
      <gridHelper args={[28, 28, '#1c2538', '#131a28']} position={[0, 0.002, 0]} />
    </group>
  )
}

function Forklift() {
  const group = useRef<THREE.Group>(null!)
  const mastRef = useRef<THREE.Group>(null!)
  const forksRef = useRef<THREE.Group>(null!)
  const palletRef = useRef<THREE.Mesh>(null!)
  const progress = useSceneProgress()

  useFrame(({ clock }) => {
    if (!group.current || !mastRef.current || !forksRef.current || !palletRef.current) return
    const t = clock.getElapsedTime()
    const p = progress.value
    const x = THREE.MathUtils.lerp(-4, 4, p)
    const lift = Math.sin(Math.min(1, Math.max(0, (p - 0.35) / 0.3)) * Math.PI)
    group.current.position.x = x
    group.current.position.y = Math.sin(t * 3 + x) * 0.008
    const mastY = 0.35 + lift * 1.5
    mastRef.current.position.y = mastY
    forksRef.current.position.y = mastY - 0.28
    palletRef.current.position.y = mastY - 0.18
    palletRef.current.position.z = THREE.MathUtils.lerp(0.9, 0.42, lift)
  })

  return (
    <group ref={group} position={[0, 0.55, -0.6]}>
      {/* Body */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.7, 0.55, 1.3]} />
        <meshStandardMaterial color="#dfe6ee" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.74, 0.58, 1.34]} />
        <meshStandardMaterial color="#f5a524" emissive="#f5a524" emissiveIntensity={0.15} />
      </mesh>
      {/* Cabin roof */}
      <mesh position={[0.2, 0.62, -0.15]}>
        <boxGeometry args={[0.6, 0.1, 0.9]} />
        <meshStandardMaterial color="#15171d" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0.2, 0.62, -0.15]}>
        <boxGeometry args={[0.62, 0.12, 0.92]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.25} />
      </mesh>
      {/* Mast */}
      <group ref={mastRef} position={[0, 0.35, 0.62]}>
        {[-0.22, 0.22].map((x) => (
          <mesh key={x} position={[x, 0.5, 0]}>
            <boxGeometry args={[0.08, 1.6, 0.08]} />
            <meshStandardMaterial color="#0d1016" metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.5, 0.08, 0.1]} />
          <meshStandardMaterial color="#f5a524" emissive="#f5a524" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {/* Forks */}
      <group ref={forksRef} position={[0, 0, 0.62]}>
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0.05, 0.45]}>
            <boxGeometry args={[0.07, 0.05, 1.0]} />
            <meshStandardMaterial color="#c9d3dd" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}
      </group>
      {/* Pallet */}
      <mesh ref={palletRef} position={[0, 0.25, 0.62]}>
        <boxGeometry args={[0.5, 0.12, 0.7]} />
        <meshStandardMaterial color="#8a5a22" roughness={0.7} />
      </mesh>
      {/* Wheels */}
      {[
        [-0.32, 0.05, -0.5],
        [-0.32, 0.05, 0.5],
        [0.32, 0.05, -0.5],
        [0.32, 0.05, 0.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#0b0c10" roughness={0.8} />
        </mesh>
      ))}
      <pointLight position={[0.4, 0.4, 1.2]} intensity={4} distance={6} decay={2} color="#fff3d6" />
    </group>
  )
}

export function ForkliftContent() {
  return (
    <>
      <ambientLight intensity={0.5} color="#334" />
      <directionalLight position={[5, 8, 4]} intensity={0.8} color="#dff" />
      <pointLight position={[0, 4, 0]} intensity={12} distance={14} decay={2} color="#f5a524" />
      <Floor />
      <RackRow side={-1} />
      <RackRow side={1} />
      <Forklift />
      <Sparkles count={60} scale={[16, 6, 14]} size={2} speed={0.25} opacity={0.4} color="#f5a524" />
      <fog attach="fog" args={['#09090b', 10, 22]} />
    </>
  )
}

export function ForkliftPoster() {
  return (
    <ScenePoster
      icon={<Warehouse size={72} strokeWidth={1} />}
      label="Warehousing & 3PL"
      title="Scroll to lift and sort pallets"
    />
  )
}