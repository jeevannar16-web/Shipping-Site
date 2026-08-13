import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { Truck } from './builders'

/** Side-view driving truck on paper-white with scrolling ground dashes. */
export default function TruckPaperScene() {
  const dashRef = useRef<THREE.Group>(null)

  const dashes = useMemo(() => {
    const arr: number[] = []
    for (let z = -20; z < 20; z += 3) arr.push(z)
    return arr
  }, [])

  useFrame((state) => {
    if (dashRef.current) {
      const t = (state.clock.elapsedTime * 3) % 3
      dashRef.current.children.forEach((c, i) => {
        c.position.z = -20 + ((i * 3 + t + 23) % 40) - 20
      })
    }
  })

  return (
    <SceneCanvas fallbackLabel="Linehaul" tone="blue" camera={{ position: [-10.5, 2.6, 0], fov: 40 }}>
      <color attach="background" args={['#efeae3']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 12, 6]} intensity={1.5} color="#fff6e8" />
      <directionalLight position={[-6, 3, -4]} intensity={0.35} color="#ffffff" />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[30, 60]} />
        <meshStandardMaterial color="#efeae3" roughness={1} />
      </mesh>

      {/* scrolling ground dashes */}
      <group ref={dashRef}>
        {dashes.map((z, i) => (
          <mesh key={i} position={[0, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.06, 1.4]} />
            <meshBasicMaterial color="#d8d2c8" />
          </mesh>
        ))}
      </group>

      {/* truck, side view, facing +z */}
      <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <Truck cabColor="#d0d0d0" containerColor="#f0f0f0" ribCount={12} driving bob shadow />
      </group>
    </SceneCanvas>
  )
}