import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'

const std = { roughness: 0.9, metalness: 0 }

export default function TruckScene() {
  const wheels = useRef<THREE.Group>(null)
  const grp = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    wheels.current!.children.forEach((w) => {
      w.rotation.y = clock.elapsedTime * 3
    })
  })

  return (
    <group>
      {/* studio cove floor + soft shadow — siblings of the measured group (pixel harness) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#E6E1D8" {...std} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 4]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.14} />
      </mesh>
      <group ref={grp}>
      <VisualTest label="TRUCK" target={() => grp.current} y={[220, 500]} x={[180, 1100]} />
      <group ref={wheels}>
        {[-4.8, -3.6, -2.4, 3.8, 5.0].map((x, i) => (
          <mesh key={i} position={[x, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.35, 24]} />
            <meshStandardMaterial color="#141414" {...std} />
          </mesh>
        ))}
      </group>
      <mesh position={[-1.75, 2.0, 0]}>
        <boxGeometry args={[9.5, 2.6, 2.4]} />
        <meshStandardMaterial color="#F0F0F0" {...std} />
      </mesh>
      <mesh position={[4.4, 1.6, 0]}>
        <boxGeometry args={[2.4, 2.0, 2.2]} />
        <meshStandardMaterial color="#D6D6D6" {...std} />
      </mesh>
      <mesh position={[5.0, 2.1, 0]}>
        <boxGeometry args={[1.1, 0.7, 2.1]} />
        <meshStandardMaterial color="#101418" {...std} />
      </mesh>
      <mesh position={[3.3, 2.9, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 12]} />
        <meshStandardMaterial color="#111" {...std} />
      </mesh>
      </group>
    </group>
  )
}