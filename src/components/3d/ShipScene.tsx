import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneProgress, ScenePoster } from './SceneShell'
import { Ship } from 'lucide-react'

function Ocean() {
  const ref = useRef<THREE.Mesh>(null!)
  const matRef = useRef<THREE.MeshStandardMaterial>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const geo = ref.current?.geometry as THREE.PlaneGeometry | undefined
    if (geo && geo.attributes.position) {
      const pos = geo.attributes.position
      const arr = pos.array as Float32Array
      for (let i = 0; i < arr.length; i += 3) {
        const x = arr[i]
        const z = arr[i + 2]
        arr[i + 1] = Math.sin(x * 0.7 + t * 0.9) * 0.22 + Math.sin(z * 0.55 - t * 0.7) * 0.16
      }
      pos.needsUpdate = true
      geo.computeVertexNormals()
    }
    if (matRef.current) matRef.current.opacity = 0.45 + Math.sin(t * 0.6) * 0.06
  })

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[60, 60, 90, 90]} />
      <meshStandardMaterial
        ref={matRef}
        color="#0a1a26"
        metalness={0.8}
        roughness={0.25}
        transparent
        opacity={0.5}
        envMapIntensity={0}
      />
    </mesh>
  )
}

function Container({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.55, 0.18, 0.78]} />
      <meshStandardMaterial color={color} metalness={0.35} roughness={0.45} />
    </mesh>
  )
}

const CONTAINER_COLORS = ['#f5a524', '#2dd4bf', '#dfe6ee', '#c9a227', '#1f8fff', '#a0a8b4']

function Containership() {
  const group = useRef<THREE.Group>(null!)
  const progress = useSceneProgress()

  useFrame(({ clock, camera }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    const p = progress.value
    group.current.rotation.z = Math.sin(t * 0.5) * 0.012
    group.current.rotation.x = Math.sin(t * 0.4 + 1) * 0.02
    group.current.position.y = Math.sin(t * 0.6) * 0.08
    const camZ = THREE.MathUtils.lerp(10.5, 7.5, p)
    const camX = THREE.MathUtils.lerp(2.5, -2.5, p)
    camera.position.set(camX, 2.2 + Math.sin(t * 0.3) * 0.3, camZ)
    camera.lookAt(0, 0.6, 0)
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Hull */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 1.1, 1.7]} />
        <meshStandardMaterial color="#141b26" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Hull sides glow */}
      <mesh position={[0, -0.42, 0]}>
        <boxGeometry args={[6, 0.08, 1.72]} />
        <meshStandardMaterial color="#f5a524" emissive="#f5a524" emissiveIntensity={0.35} />
      </mesh>
      {/* Bow */}
      <mesh position={[3.15, 0.15, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.6, 1.4, 4]} />
        <meshStandardMaterial color="#141b26" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Bridge */}
      <mesh position={[-2.1, 1.05, 0]}>
        <boxGeometry args={[1.1, 1.0, 0.9]} />
        <meshStandardMaterial color="#d7dde6" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-2.1, 1.6, 0]}>
        <boxGeometry args={[0.8, 0.25, 0.55]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.8} />
      </mesh>
      {/* Containers */}
      {Array.from({ length: 2 }).map((_, i) =>
        Array.from({ length: 2 }).map((_, j) =>
          Array.from({ length: 2 }).map((_, k) => (
            <Container
              key={`${i}-${j}-${k}`}
              position={[0.1 + i * 0.35, 0.68 + j * 0.2, -0.75 + k * 1.0]}
              color={CONTAINER_COLORS[(i * 2 + j + k) % CONTAINER_COLORS.length]}
            />
          )),
        ),
      )}
    </group>
  )
}

export function ShipContent() {
  return (
    <>
      <ambientLight intensity={0.4} color="#345" />
      <directionalLight position={[4, 8, 4]} intensity={0.9} color="#cfe7ff" />
      <pointLight position={[0, 5, 0]} intensity={30} distance={20} decay={2} color="#2dd4bf" />
      <Ocean />
      <Containership />
      <Sparkles count={130} scale={[28, 2, 28]} size={2.4} speed={0.5} opacity={0.4} color="#2dd4bf" />
      <fog attach="fog" args={['#060a13', 12, 30]} />
    </>
  )
}

export function ShipPoster() {
  return (
    <ScenePoster
      icon={<Ship size={72} strokeWidth={1} />}
      label="Ocean Freight & Maritime"
      title="Scroll to move with the cargo"
    />
  )
}