import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { AutoFitCamera } from './fitCamera'

const STACK_COLORS = ['#24457a', '#b45a1e', '#d0d0d0']
const CONTAINER: [number, number, number] = [5.5, 2.4, 2.4]
const HOLD_HALF = CONTAINER[1] / 2 // 1.2
const STACK_X = 4.5
const STACK_TOP = 3 * 2.4 + 2 * 0.05 // 7.3
const CARRY_Y = STACK_TOP + 1.5 // container centre mid-air over the stack
const CARRY_TOP = CARRY_Y + HOLD_HALF
const BOOM_LEN = 3.2

function easeInOut(p: number) {
  return p * p * (3 - 2 * p)
}

/** R2 — hazard-stripe canvas texture. */
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
    tex.needsUpdate = true
    return tex
  }, [])
}

/** R2 — ribbed container side texture (no thin rib meshes). */
function useRibTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#e8e8e8'
    ctx.fillRect(0, 0, 256, 128)
    ctx.fillStyle = 'rgba(120,120,120,0.55)'
    for (let x = 4; x < 256; x += 30) {
      ctx.fillRect(x, 2, 4, 124)
    }
    ctx.strokeStyle = 'rgba(90,90,90,0.6)'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, 254, 126)
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = THREE.RepeatWrapping
    tex.repeat.set(2, 1)
    tex.needsUpdate = true
    return tex
  }, [])
}

/** R2 — cab window painted on the body front face. */
function useCabTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#1e6bb0'
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = '#101418'
    ctx.fillRect(12, 12, 104, 52)
    ctx.strokeStyle = '#0d1418'
    ctx.lineWidth = 3
    ctx.strokeRect(12, 12, 104, 52)
    const tex = new THREE.CanvasTexture(c)
    tex.needsUpdate = true
    return tex
  }, [])
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.55, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 0.45, 24]} />
        <meshStandardMaterial color="#141414" roughness={0.9} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 0.28, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 16]} />
          <meshStandardMaterial color="#9a9a9a" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * G3 — 10s loop: lift, arc OVER the stack, lower, release, retract.
 * Container is a single opaque mesh (R1), ribs via texture (R2).
 */
function StackerScene() {
  const hazard = useHazardTexture()
  const ribs = useRibTexture()
  const cab = useCabTexture()

  const boomRef = useRef<THREE.Group>(null)
  const telescopRef = useRef<THREE.Mesh>(null)
  const spreaderRef = useRef<THREE.Group>(null)
  const containerRef = useRef<THREE.Group>(null)
  const cableRefs = useRef<Array<THREE.Mesh | null>>([])
  const hydraRef = useRef<THREE.Mesh>(null)
  const vehicleRef = useRef<THREE.Group>(null)

  const tipWorld = useMemo(() => new THREE.Vector3(), [])
  const cBottom = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const quat = useMemo(() => new THREE.Quaternion(), [])
  const anchor = useMemo(() => new THREE.Vector3(0, 1.0, 0), [])
  const boomLocal = useMemo(() => new THREE.Vector3(), [])
  const vehiclePos = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const t = (state.clock.elapsedTime % 10) / 10
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

    // hydraulic cylinder from body mid to boom mid
    boom.updateWorldMatrix(true, false)
    boomLocal.set(BOOM_LEN * 0.7, 0, 0).applyMatrix4(boom.matrixWorld)
    vehicleRef.current?.getWorldPosition(vehiclePos)
    dir.copy(boomLocal).sub(vehiclePos).sub(anchor)
    const len = Math.max(dir.length(), 0.01)
    dir.normalize()
    if (hydraRef.current) {
      const h = hydraRef.current
      h.position.copy(anchor).addScaledVector(dir, len / 2)
      h.scale.set(0.06, len, 0.06)
      quat.setFromUnitVectors(up, dir)
      h.quaternion.copy(quat)
    }

    // container path — clears the stack, never intersects
    let cx: number
    let cy: number
    let visible = true
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
    } else if (t < 0.72) {
      cx = STACK_X
      cy = STACK_TOP + HOLD_HALF
    } else {
      cx = -4.6
      cy = 1.4
      visible = false
    }
    container.position.set(cx, cy, 0)
    container.visible = visible

    // cables between spreader tip and container top
    tipWorld.set(spreader.position.x, 0, 0).applyMatrix4(boom.matrixWorld)
    cBottom.set(cx, cy + HOLD_HALF, 0)
    for (const c of cableRefs.current) {
      if (!c) continue
      dir.copy(tipWorld).sub(cBottom)
      const l = Math.max(dir.length(), 0.01)
      c.scale.set(1, l, 1)
      quat.setFromUnitVectors(up, dir.clone().normalize())
      c.position.copy(cBottom).addScaledVector(dir, 0.5)
      c.quaternion.copy(quat)
      c.visible = visible
    }
  })

  return (
    <group ref={vehicleRef}>
      {/* static stack (right) */}
      <group position={[STACK_X, 0, 0]}>
        {STACK_COLORS.map((color, i) => (
          <mesh key={i} position={[0, HOLD_HALF + i * 2.45, 0]}>
            <boxGeometry args={CONTAINER} />
            <meshStandardMaterial color={color} roughness={0.7} metalness={0.15} flatShading />
          </mesh>
        ))}
      </group>

      {/* reach stacker vehicle */}
      <group position={[-4.5, 0, 0]}>
        {/* body, cab window painted on front face (R2) */}
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[4.2, 1.5, 2.0]} />
          <meshStandardMaterial attach="material-0" color="#1e6bb0" roughness={0.6} metalness={0.3} />
          <meshStandardMaterial attach="material-1" color="#1e6bb0" roughness={0.6} metalness={0.3} />
          <meshStandardMaterial attach="material-2" color="#1e6bb0" roughness={0.6} metalness={0.3} />
          <meshStandardMaterial attach="material-3" color="#1e6bb0" roughness={0.6} metalness={0.3} />
          <meshStandardMaterial attach="material-4" map={cab} roughness={0.3} metalness={0.2} />
          <meshStandardMaterial attach="material-5" color="#1e6bb0" roughness={0.6} metalness={0.3} />
        </mesh>

        {/* hydraulic cylinder */}
        <mesh ref={hydraRef} position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1, 10]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* 4 wheels — R3: r .55, 24 segs, axis on X, bottom y=0 */}
        <Wheel x={1.7} z={0.75} />
        <Wheel x={1.7} z={-0.75} />
        <Wheel x={-1.7} z={0.75} />
        <Wheel x={-1.7} z={-0.75} />

        {/* boom pivot */}
        <group ref={boomRef} position={[1.5, 1.7, 0]} rotation={[0, 0, THREE.MathUtils.degToRad(18)]}>
          <mesh position={[BOOM_LEN / 2, 0, 0]}>
            <boxGeometry args={[3.2, 0.35, 0.5]} />
            <meshStandardMaterial color="#8a8a8a" roughness={0.6} metalness={0.4} />
          </mesh>
          <mesh ref={telescopRef} position={[BOOM_LEN + 1.4, 0, 0]}>
            <boxGeometry args={[2.8, 0.3, 0.45]} />
            <meshStandardMaterial color="#9a9a9a" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* spreader tip with hazard stripe painted on the tip face */}
          <group ref={spreaderRef} position={[BOOM_LEN + 2.8, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.6, 0.3, 0.5]} />
              <meshStandardMaterial attach="material-0" map={hazard} roughness={0.6} />
              <meshStandardMaterial attach="material-1" color="#1a1a1a" roughness={0.7} />
              <meshStandardMaterial attach="material-2" color="#1a1a1a" roughness={0.7} />
              <meshStandardMaterial attach="material-3" color="#1a1a1a" roughness={0.7} />
              <meshStandardMaterial attach="material-4" color="#1a1a1a" roughness={0.7} />
              <meshStandardMaterial attach="material-5" color="#1a1a1a" roughness={0.7} />
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

      {/* held container — OPAQUE (R1), ribs via texture (R2) */}
      <group ref={containerRef} position={[-4.6, 1.4, 0]}>
        <mesh>
          <boxGeometry args={CONTAINER} />
          <meshStandardMaterial map={ribs} color="#ffffff" roughness={0.7} metalness={0.15} flatShading />
        </mesh>
      </group>

      {/* reserved headroom so fitCamera frames the full carry arc */}
      <mesh position={[STACK_X, CARRY_TOP, 0]} visible={false}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
      </mesh>
    </group>
  )
}

export default function ReachStackerScene() {
  const modelRef = useRef<THREE.Group>(null)

  return (
    <SceneCanvas fallbackLabel="Freight" tone="orange" camera={{ position: [0, 5.5, 16.5], fov: 35 }}>
      <color attach="background" args={['#e6e1d8']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 12, 6]} intensity={1.5} color="#fff6e8" />
      <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#ffffff" />

      {/* R6 — studio cove floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#e6e1d8" roughness={1} />
      </mesh>

      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={44} blur={2.5} far={6} resolution={512} color="#000000" />

      <group ref={modelRef}>
        <StackerScene />
      </group>
      <AutoFitCamera target={modelRef} coverage={0.7} axis={[0, 0.35, 1]} fov={35} />
    </SceneCanvas>
  )
}