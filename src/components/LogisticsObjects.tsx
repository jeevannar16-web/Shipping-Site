import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

/** Stylized low-poly cargo plane built from primitives. */
export function CargoPlane({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const group = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.08
      group.current.position.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.4
    }
  })

  return (
    <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={group} position={position} scale={scale}>
        {/* Fuselage */}
        <mesh>
          <cylinderGeometry args={[0.28, 0.28, 2.4, 20]} />
          <meshStandardMaterial color="#dfe6ee" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 0, 1.25]}>
          <coneGeometry args={[0.28, 0.6, 20]} />
          <meshStandardMaterial color="#cfd8e2" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Tail fin */}
        <mesh position={[0, 0.45, -1.0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.08, 0.8, 0.7]} />
          <meshStandardMaterial color="#f5a524" metalness={0.3} roughness={0.5} />
        </mesh>
        {/* Wings */}
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[3.2, 0.08, 0.7]} />
          <meshStandardMaterial color="#dfe6ee" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Engines */}
        {[-0.7, 0.7].map((x) => (
          <group key={x} position={[x, -0.25, 0.1]}>
            <mesh>
              <cylinderGeometry args={[0.18, 0.18, 0.7, 16]} />
              <meshStandardMaterial color="#3a3f46" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        ))}
        {/* Accent line */}
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.285, 0.285, 2.2, 20, 1, false, 0, Math.PI / 3]} />
          <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </Float>
  )
}

/** Stylized low-poly container ship. */
export function ContainerShip({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const group = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.04
      group.current.position.z = Math.sin(clock.getElapsedTime() * 0.15) * 0.3
    }
  })

  const containerColors = ['#f5a524', '#2dd4bf', '#dfe6ee', '#ff7700', '#1f8fff', '#a0a8b4']

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
      <group ref={group} position={position} scale={scale}>
        {/* Hull */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.6, 0.7, 0.7]} />
          <meshStandardMaterial color="#15151a" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Hull waterline */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[2.62, 0.18, 0.72]} />
          <meshStandardMaterial color="#f5a524" emissive="#f5a524" emissiveIntensity={0.3} />
        </mesh>
        {/* Bow */}
        <mesh position={[1.35, 0.1, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.42, 0.8, 4]} />
          <meshStandardMaterial color="#15151a" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Bridge */}
        <mesh position={[-0.8, 0.75, 0]}>
          <boxGeometry args={[0.55, 0.8, 0.6]} />
          <meshStandardMaterial color="#dfe6ee" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[-0.8, 1.25, 0]}>
          <boxGeometry args={[0.4, 0.25, 0.45]} />
          <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.6} />
        </mesh>
        {/* Containers stack */}
        {Array.from({ length: 3 }).map((_, row) =>
          Array.from({ length: 2 }).map((_, col) => (
            <mesh
              key={`${row}-${col}`}
              position={[0.15 + col * 0.28, 0.5 + row * 0.22, 0]}
            >
              <boxGeometry args={[0.24, 0.18, 0.42]} />
              <meshStandardMaterial
                color={containerColors[(row * 2 + col) % containerColors.length]}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
          )),
        )}
      </group>
    </Float>
  )
}
