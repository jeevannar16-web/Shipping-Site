import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'

/** Hazard-stripe canvas texture for the spreader. */
function useHazardTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = '#f2c53d'
    for (let i = -128; i < 256; i += 32) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + 32, 128)
      ctx.lineTo(i + 64, 128)
      ctx.lineTo(i + 32, 0)
      ctx.fill()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [])
}

const STACK_COLORS = ['#24457a', '#b45a1e', '#d0d0d0']
const CONTAINER_SIZE: [number, number, number] = [2.4, 2.6, 6]
const STACK_X = 3.4

/**
 * Blue reach stacker lifting a white container onto a 3-high stack.
 * 10s loop: 0-3 lift boom, 3-5 telescope forward, 5-6 lower onto stack,
 * 6-7 release + retract, 7-10 hold.
 */
export default function ReachStackerScene() {
  const hazard = useHazardTexture()

  const boomRef = useRef<THREE.Group>(null)      // pivots at front of stacker
  const telescopRef = useRef<THREE.Mesh>(null)    // extends boom (scale)
  const tipRef = useRef<THREE.Group>(null)        // point at boom tip where container hangs
  const containerRef = useRef<THREE.Group>(null)  // held container
  const stackerRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = (state.clock.elapsedTime % 10) / 10
    const boom = boomRef.current
    const telescop = telescopRef.current
    const tip = tipRef.current
    const container = containerRef.current
    if (!boom || !telescop || !tip || !container) return

    // boom angle
    let angle: number
    if (t < 0.3) angle = 25 + (t / 0.3) * 12 // 25° -> 37°
    else if (t < 0.5) angle = 37
    else if (t < 0.6) angle = 37 - ((t - 0.5) / 0.1) * 8 // lower to 29°
    else if (t < 0.7) angle = 29
    else angle = 25
    boom.rotation.z = THREE.MathUtils.degToRad(angle)

    // telescope
    let scaleZ: number
    if (t < 0.3) scaleZ = 1
    else if (t < 0.5) scaleZ = 1 + ((t - 0.3) / 0.2) * 0.3
    else if (t < 0.6) scaleZ = 1.3
    else if (t < 0.7) scaleZ = 1.3 - ((t - 0.6) / 0.1) * 0.3
    else scaleZ = 1
    telescop.scale.z = scaleZ

    // compute tip world position: boom is 6 long, tip at end
    const tipLocal = new THREE.Vector3(2.9, 0.1, 0).multiplyScalar(scaleZ)
    const tipWorld = tipLocal.clone().applyMatrix4(boom.matrixWorld)

    // container follows tip until release (t<0.6), then animates onto stack (0.6-0.65)
    if (t < 0.6) {
      container.position.set(tipWorld.x, tipWorld.y - 1.4, tipWorld.z)
    } else if (t < 0.65) {
      const k = (t - 0.6) / 0.05
      const target = new THREE.Vector3(STACK_X, 2.6 + 2.6 + 2.6 / 2 + 0.02, 0)
      container.position.lerpVectors(tipWorld.clone().setY(tipWorld.y - 1.4), target, k)
    }
  })

  return (
    <SceneCanvas fallbackLabel="Freight" tone="orange" camera={{ position: [0, 5.5, 12], fov: 42 }}>
      <color attach="background" args={['#efeae3']} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 12, 6]} intensity={1.4} color="#fff6e8" />
      <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#ffffff" />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#efeae3" roughness={1} />
      </mesh>

      {/* soft shadow blobs */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.5, 0.01, 0]}>
        <planeGeometry args={[5, 8]} />
        <meshBasicMaterial color="#000" transparent opacity={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[STACK_X, 0.01, 0]}>
        <planeGeometry args={[4, 7]} />
        <meshBasicMaterial color="#000" transparent opacity={0.1} />
      </mesh>

      {/* container stack (right) */}
      <group position={[STACK_X, 0, 0]}>
        {STACK_COLORS.map((color, i) => (
          <group key={i} position={[0, 1.3 + i * 2.6, 0]}>
            <mesh>
              <boxGeometry args={CONTAINER_SIZE} />
              <meshStandardMaterial color={color} roughness={0.7} metalness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* reach stacker (left) */}
      <group ref={stackerRef} position={[-4.2, 0, 0]}>
        {/* body */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[2.2, 1.6, 4]} />
          <meshStandardMaterial color="#1e6bb0" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* cab window */}
        <mesh position={[0, 1.5, -1.95]}>
          <boxGeometry args={[1.9, 0.7, 0.1]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* wheels */}
        {[[-1.05, 0.6, 1.1], [1.05, 0.6, 1.1], [-1.05, 0.6, -1.1], [1.05, 0.6, -1.1]].map((p, i) => (
          <group key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.6, 0.6, 0.4, 12]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
          </group>
        ))}
        {/* boom pivot at front top */}
        <group ref={boomRef} position={[0.9, 1.7, 0]} rotation={[0, 0, THREE.MathUtils.degToRad(25)]}>
          {/* fixed boom */}
          <mesh position={[1.5, 0, 0]}>
            <boxGeometry args={[3.0, 0.5, 0.5]} />
            <meshStandardMaterial color="#8a8a8a" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* telescope section */}
          <mesh ref={telescopRef} position={[3.0, 0, 0]}>
            <boxGeometry args={[3.0, 0.42, 0.42]} />
            <meshStandardMaterial color="#9a9a9a" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* tip / spreader */}
          <group ref={tipRef} position={[4.5, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.2, 0.25, 1.4]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
            </mesh>
            <mesh position={[0.02, -0.02, 0.7]}>
              <boxGeometry args={[1.25, 0.3, 0.05]} />
              <meshStandardMaterial map={hazard} color="#ffffff" />
            </mesh>
            {/* cables */}
            <mesh position={[0, -0.5, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 1.0, 4]} />
              <meshStandardMaterial color="#333" metalness={0.8} />
            </mesh>
          </group>
        </group>
      </group>

      {/* held container */}
      <group ref={containerRef} position={[0, 3.4, 0]}>
        <mesh>
          <boxGeometry args={CONTAINER_SIZE} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.6} metalness={0.2} />
        </mesh>
      </group>
    </SceneCanvas>
  )
}