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
      <Truck cabColor="#8a8a8a" containerColor="#ffffff" ribCount={10} stripe shadow />
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
      <ambientLight intensity={0.7} />
      <directionalLight position={[0, 60, 0]} intensity={1.4} color="#ffffff" />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#16260f" roughness={1} />
      </mesh>

      {/* dense forest both sides — spaced, 3 greens */}
      <InstancedTrees
        count={1200}
        min={1.5}
        max={2.5}
        area={55}
        center={[0, 0]}
        height={0}
        colors={['#2e5b26', '#3e6b32', '#4e7b3a']}
        spacing={2.5}
        avoid={(x) => Math.abs(x) < 6}
      />

      {/* road: vertical, width 8, #3A3A3A + bright edges + #E8E8E8 dashes */}
      <CurvedRoad
        curve={curve}
        width={8}
        color="#3a3a3a"
        y={0.02}
        dashColor="#e8e8e8"
        edgeColor="#ffffff"
        dashSize={[0.28, 3]}
      />

      {/* truck driving downward */}
      <TruckDrive />
    </SceneCanvas>
  )
}