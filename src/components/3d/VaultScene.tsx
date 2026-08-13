import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneProgress, ScenePoster } from './SceneShell'
import { Package } from 'lucide-react'

type HotspotId = 'rfid' | 'temp' | 'seismic'

function CorrugatedWall({
  width,
  height,
  position,
  rotation,
  color = '#1c2434',
}: {
  width: number
  height: number
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[width, height, 0.06]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.35} />
      </mesh>
      {Array.from({ length: Math.floor(width / 0.14) }).map((_, i) => (
        <mesh key={i} position={[-width / 2 + 0.07 + i * 0.14, 0, 0.032]}>
          <boxGeometry args={[0.05, height, 0.02]} />
          <meshStandardMaterial color={i % 3 === 0 ? '#f5a524' : '#10151f'} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

const HOTSPOTS: { id: HotspotId; pos: [number, number, number]; label: string; desc: string; metric: string; value: string }[] = [
  {
    id: 'rfid',
    pos: [0, 0.4, 1.06],
    label: 'RFID Tracking',
    desc: 'Every container tagged and tracked from pickup to final delivery.',
    metric: 'Signal strength',
    value: '-62 dBm',
  },
  {
    id: 'temp',
    pos: [1.06, 0.2, 0],
    label: 'Temperature Control',
    desc: 'Reefer-ready monitoring for cold-chain sensitive cargo.',
    metric: 'Interior temp',
    value: '-4°C',
  },
  {
    id: 'seismic',
    pos: [-1.06, -0.4, 0],
    label: 'Seismic Bracing',
    desc: 'Engineered restraints keep cargo secure in every condition.',
    metric: 'G-force rating',
    value: '0.8G',
  },
]

function Vault() {
  const group = useRef<THREE.Group>(null!)
  const doorRef = useRef<THREE.Group>(null!)
  const progress = useSceneProgress()
  const [active, setActive] = useState<HotspotId | null>(null)

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    const p = progress.value
    group.current.rotation.y = t * 0.15 + p * Math.PI * 1.2
    group.current.position.y = Math.sin(t * 0.6) * 0.04
    if (doorRef.current) {
      const open = 0.12 + Math.sin(t * 0.4) * 0.05
      doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, open, 0.05)
    }
  })

  const setActiveSafely = (id: HotspotId | null) => {
    setActive(id)
    document.body.style.cursor = id ? 'pointer' : 'auto'
  }

  return (
    <group ref={group} position={[0, -0.1, 0]}>
      {/* Floor plate */}
      <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.4, 48]} />
        <meshBasicMaterial color="#0d0d10" transparent opacity={0.85} />
      </mesh>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[2.4, 2.4, 2.4]} />
        <meshStandardMaterial color="#0e0e12" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.9}
          side={THREE.BackSide}
          emissive="#0b1220"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Walls (front face left open as the "door") */}
      <CorrugatedWall width={2.4} height={2.4} position={[-1.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <CorrugatedWall width={2.4} height={2.4} position={[1.2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <CorrugatedWall width={2.4} height={2.4} position={[0, 0, -1.2]} rotation={[0, Math.PI, 0]} />
      <CorrugatedWall width={2.4} height={2.4} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <CorrugatedWall width={2.4} height={2.4} position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      {/* Door */}
      <group ref={doorRef} position={[0, 0, 1.2]}>
        <CorrugatedWall width={1.2} height={2.4} position={[-0.6, 0, 0.06]} rotation={[0, 0.35, 0]} color="#222c40" />
        <CorrugatedWall width={1.2} height={2.4} position={[0.6, 0, 0.06]} rotation={[0, -0.35, 0]} color="#222c40" />
      </group>
      {/* Cargo glow */}
      <pointLight position={[0, 0, 0.5]} intensity={30} distance={4} decay={2} color="#f5a524" />
      <mesh position={[0, 0, 0.5]}>
        <boxGeometry args={[1.6, 1.6, 0.3]} />
        <meshStandardMaterial color="#1a1206" emissive="#f5a524" emissiveIntensity={0.25} />
      </mesh>
      {/* Edge highlight */}
      <mesh>
        <boxGeometry args={[2.43, 2.43, 2.43]} />
        <meshBasicMaterial wireframe color="#2dd4bf" transparent opacity={0.12} />
      </mesh>
      {/* Hotspots */}
      {HOTSPOTS.map((h) => (
        <group key={h.id} position={h.pos}>
          <mesh
            onPointerOver={(e) => {
              e.stopPropagation()
              setActiveSafely(h.id)
            }}
            onPointerOut={() => setActiveSafely(null)}
            onClick={() => setActiveSafely(active === h.id ? null : h.id)}
          >
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color={active === h.id ? '#f5a524' : '#2dd4bf'} />
          </mesh>
          <Html
            position={[0, 0.35, 0]}
            center
            distanceFactor={6}
            style={{ pointerEvents: 'none' }}
            zIndexRange={[40, 0]}
          >
            <div
              className={`w-44 rounded-xl border px-4 py-3 backdrop-blur-md transition-all duration-300 ${
                active === h.id
                  ? 'border-gold/60 bg-void/85 opacity-100'
                  : 'border-white/10 bg-void/60 opacity-0'
              }`}
              style={{ pointerEvents: 'none' }}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold">{h.label}</p>
              <p className="mt-1 text-[11px] leading-snug text-white/70">{h.desc}</p>
              <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                <span className="text-[9px] uppercase tracking-wider text-white/40">{h.metric}</span>
                <span className="font-mono text-[11px] text-teal">{h.value}</span>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}

export function VaultContent() {
  return (
    <>
      <ambientLight intensity={0.4} color="#334" />
      <directionalLight position={[4, 6, 6]} intensity={1.1} color="#dff" />
      <pointLight position={[0, 3, 0]} intensity={20} distance={10} decay={2} color="#2dd4bf" />
      <Vault />
      <fog attach="fog" args={['#09090b', 8, 20]} />
    </>
  )
}

export function VaultPoster() {
  return (
    <ScenePoster
      icon={<Package size={72} strokeWidth={1} />}
      label="Container & Cargo Vault"
      title="Scroll to inspect the cargo vault"
    />
  )
}