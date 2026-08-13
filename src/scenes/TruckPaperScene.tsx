import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'

/** F5 — side-view truck, total length 13. Cab (2.4,2.0,2.2) + trailer (9.5,2.6,2.4), wheels r .55. */
function TruckRig() {
  const dashRef = useRef<THREE.Group>(null)
  const groupRef = useRef<THREE.Group>(null)
  const wheelRefs = useRef<Array<THREE.Mesh | null>>([])

  const dashes = useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i < 12; i++) arr.push(i * 3)
    return arr
  }, [])

  const wheelSpins = useRef(new Float32Array(10).fill(0))

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    // ground dashes scroll left
    if (dashRef.current) {
      const off = (t * 4) % 3
      dashRef.current.children.forEach((c, i) => {
        c.position.x = -18 + ((i * 3 + off) % 36)
      })
    }
    // wheel spin + bob
    wheelRefs.current.forEach((w, i) => {
      if (!w) return
      wheelSpins.current[i] += dt * 7
      w.rotation.z = -wheelSpins.current[i]
    })
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 2.2) * 0.02
    }
  })

  return (
    <>
      {/* scrolling ground dash line */}
      <group ref={dashRef} position={[0, 0.02, 0]}>
        {dashes.map((x, i) => (
          <mesh key={i} position={[x - 18, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, 1.2]} />
            <meshBasicMaterial color="#d8d2c8" />
          </mesh>
        ))}
      </group>

      <group ref={groupRef}>
        {/* trailer (9.5 long along x) */}
        <mesh position={[-1.9, 1.3, 0]}>
          <boxGeometry args={[9.5, 2.6, 2.4]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.7} metalness={0.2} flatShading />
        </mesh>
        {/* trailer ribs */}
        {Array.from({ length: 12 }).map((_, i) => {
          const x = -6.6 + ((i + 0.5) / 12) * 9.5
          return (
            <mesh key={i} position={[x, 1.3, 1.21]}>
              <boxGeometry args={[0.04, 2.62, 0.02]} />
              <meshStandardMaterial color="#d9d9d9" roughness={0.9} />
            </mesh>
          )
        })}
        {/* cab (2.4,2.0,2.2) */}
        <mesh position={[4.6, 1.1, 0]}>
          <boxGeometry args={[2.4, 2.0, 2.2]} />
          <meshStandardMaterial color="#d6d6d6" roughness={0.6} />
        </mesh>
        {/* windshield (front, +x) */}
        <mesh position={[5.62, 1.25, 0]}>
          <boxGeometry args={[0.08, 0.8, 1.7]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* door line on camera-facing side (+z) */}
        <mesh position={[4.6, 1.1, 1.11]}>
          <boxGeometry args={[0.05, 1.7, 0.03]} />
          <meshStandardMaterial color="#bdbdbd" roughness={0.9} />
        </mesh>
        {/* cab side window line */}
        <mesh position={[3.5, 1.5, 1.11]}>
          <boxGeometry args={[0.02, 0.6, 0.03]} />
          <meshStandardMaterial color="#8f8f8f" roughness={0.9} />
        </mesh>
        {/* chassis */}
        <mesh position={[1.2, 0.45, 0]}>
          <boxGeometry args={[11, 0.22, 2.0]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        {/* shadow plane */}
        <mesh position={[1, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[15, 4.5]} />
          <meshBasicMaterial color="#000" transparent opacity={0.18} />
        </mesh>
        {/* wheels: r .55, cab 2 + trailer 3 axles */}
        {[
          [4.1, 0.55], [3.1, 0.55],
          [0.4, 0.55], [-1.3, 0.55], [-3.0, 0.55],
        ].map(([x, r], axle) => (
          <group key={axle}>
            {[1, -1].map((side) => (
              <mesh key={side} position={[x, r, (2.05 / 2) * side]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[r, r, 0.32, 14]} />
                <meshStandardMaterial color="#0c0c0c" roughness={0.9} />
              </mesh>
            ))}
          </group>
        ))}
        {/* hub spokes so spin is visible */}
        {[
          [4.1, 0], [3.1, 1], [0.4, 2], [-1.3, 3], [-3.0, 4],
        ].map(([x, axle]) =>
          [1, -1].map((side, si) => (
            <group key={`s${axle}-${side}`} position={[x, 0.55, (2.05 / 2) * side]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh ref={(el) => (wheelRefs.current[axle * 2 + si] = el)}>
                <boxGeometry args={[0.72, 0.06, 0.02]} />
                <meshStandardMaterial color="#3a3a3a" roughness={0.6} />
              </mesh>
            </group>
          )),
        )}
      </group>
    </>
  )
}

export default function TruckPaperScene() {
  return (
    <SceneCanvas fallbackLabel="Linehaul" tone="blue" camera={{ position: [0, 2.4, 19], fov: 30 }}>
      <color attach="background" args={['#efeae3']} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 14, 10]} intensity={1.6} color="#fff6e8" />
      <directionalLight position={[-6, 3, -4]} intensity={0.35} color="#ffffff" />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[30, 60]} />
        <meshStandardMaterial color="#efeae3" roughness={1} />
      </mesh>

      <TruckRig />
      <CameraLook />
    </SceneCanvas>
  )
}

function CameraLook() {
  useFrame((state) => {
    state.camera.lookAt(0, 2, 0)
  })
  return null
}