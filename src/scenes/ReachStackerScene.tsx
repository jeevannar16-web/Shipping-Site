import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'

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
const CONTAINER: [number, number, number] = [5.5, 2.4, 2.4]
const HOLD_HALF = CONTAINER[1] / 2 // 1.2
const STACK_X = 4.5
const STACK_TOP = 3 * 2.4 // 7.2
const CARRY_Y = STACK_TOP + 1.7 // container centre while travelling over the stack
const BOOM_LEN = 3.2 // fixed section

function easeInOut(p: number) {
  return p * p * (3 - 2 * p)
}

/**
 * F4 — 10s loop: lift to y=stackTop+1.5 (arc OVER the stack, never intersects),
 * telescope, lower, release, retract. Pivot at world (-2.6, 1.7).
 */
function StackerScene() {
  const hazard = useHazardTexture()

  const boomRef = useRef<THREE.Group>(null)
  const telescopRef = useRef<THREE.Mesh>(null)
  const spreaderRef = useRef<THREE.Group>(null)
  const containerRef = useRef<THREE.Group>(null)
  const containerMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const cableRefs = useRef<Array<THREE.Mesh | null>>([])

  const tipWorld = useMemo(() => new THREE.Vector3(), [])
  const cBottom = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const quat = useMemo(() => new THREE.Quaternion(), [])

  useFrame((state) => {
    const t = (state.clock.elapsedTime % 10) / 10 // 0..1 over 10s
    const boom = boomRef.current
    const tel = telescopRef.current
    const spreader = spreaderRef.current
    const container = containerRef.current
    if (!boom || !tel || !spreader || !container) return

    // scripted boom angle + telescope
    let angle: number
    let k: number
    if (t < 0.35) {
      angle = 18 + (t / 0.35) * 24
      k = 1 + (t / 0.35) * 0.7
    } else if (t < 0.5) {
      angle = 42
      k = 1.7 + ((t - 0.35) / 0.15) * 0.7
    } else if (t < 0.6) {
      angle = 42 - ((t - 0.5) / 0.1) * 8
      k = 2.4
    } else if (t < 0.7) {
      angle = 34
      k = 2.4
    } else {
      angle = 34 - ((t - 0.7) / 0.3) * 16
      k = 2.4 - ((t - 0.7) / 0.3) * 1.4
    }
    boom.rotation.z = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(angle, 18, 42))
    tel.scale.x = THREE.MathUtils.clamp(k, 1, 3.2)
    tel.position.x = BOOM_LEN + 1.4 * tel.scale.x
    spreader.position.x = BOOM_LEN + 2.8 * tel.scale.x

    // container path — clears the stack, never intersects
    let cx: number
    let cy: number
    let opacity = 1
    if (t < 0.4) {
      const p = easeInOut(t / 0.4)
      cx = -4.6 + p * 11.1
      cy = 1.4 + Math.sin(p * Math.PI) * (CARRY_Y - 1.4)
    } else if (t < 0.55) {
      cx = STACK_X
      cy = CARRY_Y
    } else if (t < 0.65) {
      const p = (t - 0.55) / 0.1
      cx = STACK_X
      cy = THREE.MathUtils.lerp(CARRY_Y, STACK_TOP + HOLD_HALF, p * p)
    } else if (t < 0.7) {
      cx = STACK_X
      cy = STACK_TOP + HOLD_HALF
    } else if (t < 0.78) {
      cx = STACK_X
      cy = STACK_TOP + HOLD_HALF
      opacity = 1 - (t - 0.7) / 0.08
    } else if (t < 0.93) {
      cx = -4.6
      cy = 1.4
      opacity = 0
    } else {
      const p = (t - 0.93) / 0.07
      cx = -4.6
      cy = 1.4
      opacity = p
    }
    container.position.set(cx, cy, 0)
    if (containerMatRef.current) containerMatRef.current.opacity = opacity

    // cables between spreader tip and container top
    boom.updateWorldMatrix(true, false)
    tipWorld.set(spreader.position.x, 0, 0).applyMatrix4(boom.matrixWorld)
    cBottom.set(cx, cy + HOLD_HALF, 0)
    for (const c of cableRefs.current) {
      if (!c) continue
      dir.copy(tipWorld).sub(cBottom)
      const len = Math.max(dir.length(), 0.01)
      c.scale.set(1, len, 1)
      quat.setFromUnitVectors(up, dir.clone().normalize())
      c.position.copy(cBottom).addScaledVector(dir, 0.5)
      c.quaternion.copy(quat)
      c.visible = opacity > 0.05
    }
  })

  return (
    <>
      {/* static stack (right) */}
      <group position={[STACK_X, 0, 0]}>
        {STACK_COLORS.map((color, i) => (
          <mesh key={i} position={[0, HOLD_HALF + i * CONTAINER[1], 0]}>
            <boxGeometry args={CONTAINER} />
            <meshStandardMaterial color={color} roughness={0.7} metalness={0.15} flatShading />
          </mesh>
        ))}
      </group>

      {/* reach stacker vehicle */}
      <group position={[-4.5, 0, 0]}>
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[4.2, 1.5, 2.0]} />
          <meshStandardMaterial color="#1e6bb0" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.35, 0.98]}>
          <boxGeometry args={[1.0, 0.7, 1.9]} />
          <meshStandardMaterial color="#101418" roughness={0.2} metalness={0.8} />
        </mesh>
        {[[-1.4, 0.55, 0.7], [1.4, 0.55, 0.7], [-1.4, 0.55, -0.7], [1.4, 0.55, -0.7]].map((p, i) => (
          <group key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.55, 0.55, 0.45, 14]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
          </group>
        ))}
        {/* boom pivot at world (-2.6, 1.7) */}
        <group ref={boomRef} position={[1.9, 1.7, 0]} rotation={[0, 0, THREE.MathUtils.degToRad(18)]}>
          <mesh position={[BOOM_LEN / 2, 0, 0]}>
            <boxGeometry args={[3.2, 0.35, 0.5]} />
            <meshStandardMaterial color="#8a8a8a" roughness={0.6} metalness={0.4} />
          </mesh>
          <mesh ref={telescopRef} position={[BOOM_LEN + 1.4, 0, 0]}>
            <boxGeometry args={[2.8, 0.3, 0.45]} />
            <meshStandardMaterial color="#9a9a9a" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* spreader tip with hazard stripe */}
          <group ref={spreaderRef} position={[BOOM_LEN + 2.8, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.6, 0.25, 0.4]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.16, 0.21]}>
              <boxGeometry args={[1.65, 0.3, 0.02]} />
              <meshStandardMaterial map={hazard} color="#ffffff" />
            </mesh>
          </group>
        </group>
      </group>

      {/* cables */}
      {[0.45, -0.45].map((off, i) => (
        <mesh key={i} position={[0, 0, off]} ref={(el) => (cableRefs.current[i] = el)}>
          <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
      ))}

      {/* held container with rib lines */}
      <group ref={containerRef} position={[-4.6, 1.4, 0]}>
        <mesh>
          <boxGeometry args={CONTAINER} />
          <meshStandardMaterial ref={containerMatRef} color="#e8e8e8" roughness={0.6} metalness={0.2} flatShading transparent />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[(i / 3 - 0.5) * 4.2, 0, 1.21]}>
            <boxGeometry args={[0.06, 2.44, 0.02]} />
            <meshStandardMaterial color="#c9c9c9" roughness={0.9} />
          </mesh>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`b${i}`} position={[(i / 3 - 0.5) * 4.2, 0, -1.21]}>
            <boxGeometry args={[0.06, 2.44, 0.02]} />
            <meshStandardMaterial color="#c9c9c9" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </>
  )
}

export default function ReachStackerScene() {
  return (
    <SceneCanvas fallbackLabel="Freight" tone="orange" camera={{ position: [0, 5.5, 16.5], fov: 35 }}>
      <color attach="background" args={['#e9e4dc']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 12, 6]} intensity={1.5} color="#fff6e8" />
      <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#ffffff" />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[60, 30]} />
        <meshStandardMaterial color="#e9e4dc" roughness={1} />
      </mesh>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={36} blur={2.6} far={5} resolution={512} color="#000000" />

      <StackerScene />
      <CameraLook />
    </SceneCanvas>
  )
}

function CameraLook() {
  useFrame((state) => {
    state.camera.lookAt(0, 2.4, 0)
  })
  return null
}