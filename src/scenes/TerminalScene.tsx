import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'

const COLORS = ['#d6451e', '#e06f27', '#3a7d44', '#2b4bff', '#8a8a8a', '#c7a03c', '#b03a2e', '#3f6f8f']

function Container({ color }: { color: string }) {
  return (
    <mesh>
      <boxGeometry args={[2, 0.95, 0.9]} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.2} flatShading />
    </mesh>
  )
}

function ContainerYard() {
  const rowsRef = useRef<THREE.Group>(null)

  const containers = useMemo(() => {
    const out: { pos: [number, number, number]; color: string }[] = []
    const ROW_HEIGHTS = [0.95, 1.5, 1.1, 1.7, 1.2, 1.05, 1.65, 1.0, 1.8, 1.2]
    const cols = 14
    const totalRows = 10
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < cols; col++) {
        const z = row * 2.15 - 12
        const x = col * 1.95 - 13
        const stack = ROW_HEIGHTS[row]
        for (let s = 0; s < Math.ceil(stack); s++) {
          out.push({
            pos: [x, 0.475 + s * 0.98 + (s === 0 ? 0 : 0.02 * row), z],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          })
        }
      }
    }
    return out
  }, [])

  useFrame((state) => {
    if (rowsRef.current) {
      rowsRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.03) * 0.3
    }
  })

  return (
    <group ref={rowsRef}>
      {containers.map((c, i) => (
        <group key={i} position={c.pos}>
          <Container color={c.color} />
        </group>
      ))}
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color="#101012" roughness={1} />
      </mesh>
    </group>
  )
}

function GantryCrane() {
  const trolleyRef = useRef<THREE.Group>(null)
  const spreaderRef = useRef<THREE.Group>(null)

  const labelTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#ff4a00'
    ctx.font = 'bold 40px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('41T', 128, 44)
    const tex = new THREE.CanvasTexture(c)
    tex.minFilter = THREE.LinearFilter
    return tex
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const cycle = t * 0.28
    // move trolley across the beam, then back
    const xPos = Math.sin(cycle) * 9
    if (trolleyRef.current) {
      trolleyRef.current.position.x = xPos
    }
    // spreader lowers when trolley is in the middle, rises at edges
    if (spreaderRef.current) {
      const inMiddle = Math.abs(Math.sin(cycle)) < 0.55
      const target = inMiddle ? -3.4 : -1.2
      spreaderRef.current.position.y += (target - spreaderRef.current.position.y) * 0.02
      spreaderRef.current.position.x = xPos
    }
  })

  return (
    <group position={[0, 0, -4]}>
      {/* portico columns */}
      {[-12, 12].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.28, 14, 0.6]} />
          <meshStandardMaterial color="#1b1b1e" roughness={0.6} metalness={0.6} />
        </mesh>
      ))}
      {/* main beam */}
      <group position={[0, 14.2, 0]}>
        <mesh>
          <boxGeometry args={[26.5, 0.35, 1.1]} />
          <meshStandardMaterial color="#202024" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* trolley */}
        <group ref={trolleyRef}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.9, 0.8, 0.9]} />
            <meshStandardMaterial color="#ff4a00" roughness={0.4} />
          </mesh>
          {/* spreader */}
          <group ref={spreaderRef}>
            <mesh position={[0, -1.2, 0]}>
              <boxGeometry args={[0.7, 0.9, 0.7]} />
              <meshStandardMaterial color="#2b4bff" roughness={0.5} />
            </mesh>
          </group>
        </group>
        {/* "41T" label */}
        <group position={[0, -0.4, 0.8]}>
          <sprite scale={[1.4, 0.5, 1]}>
            <spriteMaterial color="#ff4a00" transparent opacity={0.9} map={labelTexture} />
          </sprite>
        </group>
      </group>
      {/* hook lifted container */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[1.9, 0.9, 0.85]} />
        <meshStandardMaterial color="#d6451e" roughness={0.8} />
      </mesh>
    </group>
  )
}

export default function TerminalScene() {
  return (
    <SceneCanvas fallbackLabel="Terminal" tone="orange" camera={{ position: [0, 7, 22], fov: 50 }}>
      <color attach="background" args={['#0b0b0c']} />
      <fog attach="fog" args={['#0b0b0c', 16, 42]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[12, 20, 8]} intensity={1.1} color="#ffd9c0" />
      <pointLight position={[0, 6, -8]} intensity={40} color="#ff4a00" distance={22} />
      <ContainerYard />
      <GantryCrane />
      {/* slow camera push-in */}
      <CameraPush />
    </SceneCanvas>
  )
}

function CameraPush() {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    state.camera.position.z = 22 - Math.sin(t * 0.06) * 4
    state.camera.position.y = 7 + Math.sin(t * 0.1) * 0.6
    state.camera.lookAt(0, 4, -2)
  })
  return null
}