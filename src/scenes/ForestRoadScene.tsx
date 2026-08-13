import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { CurvedRoad, InstancedTrees } from './builders'

/** V7 — industries truck: trailer (2.4,1.2,9) white + cab (2.4,1.4,2.2) #C43A2B + black windshield stripe. */
function TruckV7() {
  const wheelRefs = useRef<(THREE.Mesh | null)[]>([])
  const ref = useRef<THREE.Group>(null)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (ref.current) {
      ref.current.position.z = ((t * 6) % 60) - 30
    }
    wheelRefs.current.forEach((w) => {
      if (w) w.rotation.y += dt * 8
    })
  })

  const wheels: [number, number, number][] = [
    [-0.95, 0.42, -3.2], [0.95, 0.42, -3.2],
    [-0.95, 0.42, 1.4], [0.95, 0.42, 1.4],
  ]

  return (
    <group ref={ref} position={[2, 0, 0]}>
      {/* chassis */}
      <mesh position={[0, 0.35, -0.9]}>
        <boxGeometry args={[1.7, 0.12, 5.8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* trailer (2.4,1.2,9) — centred at y 0.6, sits on chassis */}
      <mesh position={[0, 0.66, -1.9]}>
        <boxGeometry args={[2.4, 1.2, 9]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* cab (2.4,1.4,2.2) #C43A2B */}
      <mesh position={[0, 0.95, 1.7]}>
        <boxGeometry args={[2.4, 1.4, 2.2]} />
        <meshStandardMaterial color="#c43a2b" roughness={0.6} />
      </mesh>
      {/* black windshield stripe on cab front (+z face) */}
      <mesh position={[0, 1.15, 2.82]}>
        <boxGeometry args={[2.1, 0.55, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* wheels — R3: tire #141414 + hub #9a9a9a, 24 segs, axis on X, bottom y=0 */}
      {wheels.map((p, i) => (
        <group key={i} position={p} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.42, 0.42, 0.25, 24]} />
            <meshStandardMaterial color="#141414" roughness={0.9} />
          </mesh>
          {[0.16, -0.16].map((off, j) => (
            <mesh
              key={j}
              position={[0, off, 0]}
              ref={(el) => {
                wheelRefs.current[i * 2 + j] = el
              }}
            >
              <cylinderGeometry args={[0.16, 0.16, 0.05, 16]} />
              <meshStandardMaterial color="#9a9a9a" roughness={0.5} metalness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      {/* V7 — soft shadow blob under the full truck length */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -0.9]}>
        <planeGeometry args={[2.6, 8]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} depthWrite={false} />
      </mesh>
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

      {/* V7 — industries truck driving downward in the right lane */}
      <TruckV7 />
    </SceneCanvas>
  )
}