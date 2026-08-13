import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { CurvedRoad, InstancedTrees, Truck } from './builders'

function TruckDrive() {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ref.current) {
      ref.current.position.z = ((t * 6) % 60) - 30
    }
  })
  return (
    <group ref={ref} rotation={[0, 0, 0]}>
      <Truck cabColor="#1a1a1a" containerColor="#f2f2f2" ribCount={10} shadow />
    </group>
  )
}

export default function ForestRoadScene() {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, -40),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 40),
      ]),
    [],
  )

  return (
    <SceneCanvas fallbackLabel="Industries" tone="violet" camera={{ position: [0, 55, 0], fov: 30 }}>
      <color attach="background" args={['#0b0b0c']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 60, 0]} intensity={1.2} color="#ffffff" />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#16260f" roughness={1} />
      </mesh>

      {/* dense forest both sides */}
      <InstancedTrees
        count={900}
        min={1.2}
        max={2.2}
        area={45}
        center={[0, 0]}
        height={0}
        avoid={(x) => Math.abs(x) < 6}
      />

      {/* road: vertical, width 8 with dashes + edges */}
      <CurvedRoad curve={curve} width={8} color="#2b2b2b" y={0.02} />

      {/* truck driving downward */}
      <TruckDrive />
    </SceneCanvas>
  )
}