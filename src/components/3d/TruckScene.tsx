import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneProgress, ScenePoster } from './SceneShell'
import { Truck as TruckIcon } from 'lucide-react'

const ROAD_LEN = 26

function Highway() {
  const dashRef = useRef<THREE.Mesh>(null!)
  const edgeRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (dashRef.current) {
      const offset = (t * 1.4) % (ROAD_LEN / 2)
      dashRef.current.position.x = -ROAD_LEN / 4 + offset
    }
    const mat = edgeRef.current?.children[0] as THREE.Mesh | undefined
    if (mat) (mat.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(t * 1.5) * 0.15
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROAD_LEN, 9]} />
        <meshBasicMaterial color="#0e0f14" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[ROAD_LEN, 3.2]} />
        <meshBasicMaterial color="#111319" />
      </mesh>
      <group ref={edgeRef}>
        {[-1.6, 1.6].map((z) => (
          <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, z]}>
            <planeGeometry args={[ROAD_LEN, 0.06]} />
            <meshBasicMaterial color="#f5a524" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
      <mesh ref={dashRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[ROAD_LEN / 2, 0.09]} />
        <meshBasicMaterial color="#2dd4bf" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

function Wheel({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (ref.current) ref.current.rotation.x += 0.9
  })
  return (
    <mesh ref={ref} position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.36, 0.36, 0.3, 18]} />
      <meshStandardMaterial color="#0b0c10" roughness={0.85} metalness={0.2} />
    </mesh>
  )
}

function Truck() {
  const group = useRef<THREE.Group>(null!)
  const progress = useSceneProgress()
  const headRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (!group.current) return
    const p = progress.value
    const t = clock.getElapsedTime()
    const x = THREE.MathUtils.lerp(-ROAD_LEN / 2 + 4, ROAD_LEN / 2 - 6, p)
    const bob = Math.sin(t * 6) * 0.012
    group.current.position.x = x
    group.current.position.y = bob
    group.current.rotation.x = Math.sin(t * 6 + 1) * 0.01
  })

  return (
    <Float speed={1.2} rotationIntensity={0.02} floatIntensity={0.4}>
      <group ref={group}>
        <group ref={headRef}>
          {/* Cab */}
          <mesh position={[0.95, 0.62, 0]}>
            <boxGeometry args={[0.85, 0.75, 1.5]} />
            <meshStandardMaterial color="#dfe6ee" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Windshield */}
          <mesh position={[0.9, 0.78, 0]}>
            <boxGeometry args={[0.12, 0.34, 1.2]} />
            <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.6} />
          </mesh>
          {/* Chassis */}
          <mesh position={[0.1, 0.28, 0]}>
            <boxGeometry args={[2, 0.28, 1.2]} />
            <meshStandardMaterial color="#15171d" metalness={0.4} roughness={0.5} />
          </mesh>
          {/* Trailer */}
          <mesh position={[-1.15, 0.62, 0]}>
            <boxGeometry args={[2.3, 1.1, 1.5]} />
            <meshStandardMaterial color="#1e2230" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[-1.15, 0.17, 0]}>
            <boxGeometry args={[2.3, 0.06, 1.5]} />
            <meshStandardMaterial color="#f5a524" emissive="#f5a524" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-1.15, 1.1, 0]}>
            <boxGeometry args={[2.3, 0.04, 1.5]} />
            <meshStandardMaterial color="#f5a524" emissive="#f5a524" emissiveIntensity={0.4} />
          </mesh>
          {/* Headlights */}
          {[-0.5, 0.5].map((z) => (
            <pointLight key={z} position={[1.4, 0.55, z]} intensity={6} distance={7} decay={2} color="#fff3d6" />
          ))}
          <mesh position={[1.36, 0.55, -0.5]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#fff3d6" />
          </mesh>
          <mesh position={[1.36, 0.55, 0.5]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#fff3d6" />
          </mesh>
          {/* Wheels */}
          <Wheel position={[1.0, 0.26, -0.72]} />
          <Wheel position={[1.0, 0.26, 0.72]} />
          <Wheel position={[-0.55, 0.26, -0.72]} />
          <Wheel position={[-0.55, 0.26, 0.72]} />
          <Wheel position={[-1.65, 0.26, -0.72]} />
          <Wheel position={[-1.65, 0.26, 0.72]} />
        </group>
      </group>
    </Float>
  )
}

export function TruckContent() {
  return (
    <>
      <ambientLight intensity={0.35} color="#445" />
      <directionalLight position={[6, 8, 4]} intensity={0.7} color="#dff" />
      <spotLight position={[0, 10, 0]} angle={0.7} penumbra={0.8} intensity={1.1} color="#ffffff" />
      <pointLight position={[0, -4, -6]} intensity={2} color="#2dd4bf" />
      <group position={[0, -1.3, 0]}>
        <Highway />
        <Truck />
      </group>
      <Sparkles count={70} scale={[14, 4, 10]} size={2} speed={0.3} opacity={0.5} color="#f5a524" />
      <fog attach="fog" args={['#060a13', 10, 24]} />
    </>
  )
}

export function TruckPoster() {
  return (
    <ScenePoster
      icon={<TruckIcon size={72} strokeWidth={1} />}
      label="Land & Linehaul Transport"
      title="Scroll to preview the route"
    />
  )
}