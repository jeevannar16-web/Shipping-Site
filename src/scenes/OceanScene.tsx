import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'

function Streak({ color = '#ffffff', opacity = 0.15, dir = 1 }: { color?: string; opacity?: number; dir?: 1 | -1 }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * 4 * dir
    ref.current.position.z = (((t % 30) + 30) % 30) - 15 + (dir === -1 ? 0 : 0)
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -20]}>
      <planeGeometry args={[14, 60]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

/** Top-down container ship at sea — camera slightly tilted, gentle roll loop. */
function Ship() {
  const shipRef = useRef<THREE.Group>(null)

  const hullShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-3, -12)
    s.lineTo(3, -12)
    s.lineTo(3, 9)
    s.lineTo(0, 13)
    s.lineTo(-3, 9)
    s.closePath()
    return s
  }, [])

  const containers = useMemo(() => {
    const geo = new THREE.BoxGeometry(1.0, 1.15, 1.9)
    const mats = ['#b4362b', '#24457a', '#2e5b40', '#c46a2b', '#d0d0d0', '#6b2b8a'].map(
      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }),
    )
    const meshes = mats.map((mat) => new THREE.InstancedMesh(geo, mat, 150))
    const m = new THREE.Matrix4()
    let idx = 0
    for (let r = 0; r < 12; r++) {
      const height = r % 2 === 0 ? 3 : 2
      for (let c = 0; c < 6; c++) {
        const x = (c - 2.5) * 1.05
        for (let h = 0; h < height; h++) {
          const z = 3.2 + (r / 12) * 11
          m.makeTranslation(x, 0.55 + h * 1.2, z)
          meshes[Math.floor(Math.random() * mats.length)].setMatrixAt(idx++, m)
        }
      }
    }
    meshes.forEach((mm) => {
      mm.count = idx
      mm.instanceMatrix.needsUpdate = true
    })
    return meshes
  }, [])

  useFrame((state) => {
    if (shipRef.current) {
      shipRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.008
    }
  })

  return (
    <group ref={shipRef}>
      {/* hull */}
      <mesh>
        <shapeGeometry args={[hullShape]} />
        <meshStandardMaterial color="#101820" roughness={0.7} flatShading />
      </mesh>
        {/* bow tip */}
        <mesh position={[0, 0.4, 13]}>
          <boxGeometry args={[0.4, 0.4, 1]} />
          <meshStandardMaterial color="#101820" />
        </mesh>
        {/* deck */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[6, 0.5, 21]} />
          <meshStandardMaterial color="#1a2a3a" roughness={0.8} />
        </mesh>
        {/* instanced containers */}
        <group position={[0, 0.85, -0.5]}>
          {containers.map((mm, i) => (
            <primitive key={i} object={mm} />
          ))}
        </group>
        {/* stern bridge */}
        <mesh position={[0, 2.8, 10.5]}>
          <boxGeometry args={[6, 3, 2]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.6} />
        </mesh>
        <mesh position={[0, 3.6, 9.6]}>
          <boxGeometry args={[4, 1.6, 0.4]} />
          <meshStandardMaterial color="#0a2a4a" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* bow foam */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 12.5]}>
          <planeGeometry args={[7, 1.5]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
        {/* side wake streaks */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.4, 0.05, 2]}>
          <planeGeometry args={[1.2, 26]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.4, 0.05, 2]}>
          <planeGeometry args={[1.2, 26]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
        </mesh>
      </group>
  )
}

export default function OceanScene() {
  return (
    <SceneCanvas fallbackLabel="Ocean" tone="blue" camera={{ position: [0, 34, 10], fov: 42 }}>
      <color attach="background" args={['#1c4e9c']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 40, 10]} intensity={1.6} color="#ffffff" />

      {/* sea */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[60, 70]} />
        <meshStandardMaterial color="#1c4e9c" roughness={0.35} metalness={0.1} />
      </mesh>

      {/* scrolling wave streaks */}
      <Streak opacity={0.15} dir={1} />
      <Streak opacity={0.1} dir={-1} />

      {/* ship — bow up = -z */}
      <Ship />
    </SceneCanvas>
  )
}