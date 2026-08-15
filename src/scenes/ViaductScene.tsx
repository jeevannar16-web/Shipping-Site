import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { CurvedRoad, InstancedTrees, Truck, roughMap, dashWhite, RoadStrip } from './builders'
import { useCompact } from '../lib/media'
import type { ScrubRef } from '../lib/scrub'

const easeInOut = (t: number) => t * t * (3 - 2 * t)

function viaductCurve(offset = 0) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-14, 10, -40 + offset),
    new THREE.Vector3(-10, 10, -20 + offset),
    new THREE.Vector3(-16, 10, 0 + offset),
    new THREE.Vector3(-8, 10, 20 + offset),
    new THREE.Vector3(-14, 10, 40 + offset),
  ])
}

function viaductCurveMirror(offset = 0) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(14, 10, 40 - offset),
    new THREE.Vector3(10, 10, 20 - offset),
    new THREE.Vector3(16, 10, 0 - offset),
    new THREE.Vector3(8, 10, -20 - offset),
    new THREE.Vector3(14, 10, -40 - offset),
  ])
}

function Pillars({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const pillars = useMemo(() => {
    const pts = curve.getSpacedPoints(80)
    const g = new THREE.CylinderGeometry(0.5, 0.6, 10, 10)
    g.translate(0, 5, 0)
    const mat = new THREE.MeshStandardMaterial({ color: '#8a8a8a', roughness: 0.7 })
    const inst = new THREE.InstancedMesh(g, mat, pts.length * 2)
    const m = new THREE.Matrix4()
    let idx = 0
    pts.forEach((p, i) => {
      if (i % 2 !== 0) return
      const t = curve.getTangent(i / 79)
      const right = new THREE.Vector3(-t.z, 0, t.x).normalize()
      for (const side of [1, -1]) {
        m.makeTranslation(p.x + right.x * 2.5 * side, 0, p.z + right.z * 2.5 * side)
        inst.setMatrixAt(idx++, m)
      }
    })
    inst.count = idx
    inst.instanceMatrix.needsUpdate = true
    return inst
  }, [curve])

  return <primitive object={pillars} />
}

const CAR_COLORS = ['#2a2a35', '#2b2b35', '#1f1f2a', '#1a1a25', '#252530', '#2d2d38']
const CABIN_COLORS = ['#3a3a45', '#3b3b3b', '#30303a', '#2b2b35', '#353540', '#3d3d48']

function Traffic({ curve, laneSign = 1, count = 12 }: { curve: THREE.CatmullRomCurve3; laneSign?: 1 | -1; count?: number }) {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const cabinRef = useRef<THREE.InstancedMesh>(null)
  const speeds = useMemo(() => Array.from({ length: count }, () => 4 + Math.random() * 3), [count])
  const offsets = useMemo(() => Array.from({ length: count }, () => Math.random()), [count])
  const colors = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const c = new THREE.Color(CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)])
        return [c.r, c.g, c.b]
      }).flat(),
    [count],
  )
  const cabinColors = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const c = new THREE.Color(CABIN_COLORS[Math.floor(Math.random() * CABIN_COLORS.length)])
        return [c.r, c.g, c.b]
      }).flat(),
    [count],
  )

  const colorAttr = useMemo(() => {
    const attr = new THREE.InstancedBufferAttribute(new Float32Array(colors), 3)
    return attr
  }, [colors])

  const cabinColorAttr = useMemo(() => {
    const attr = new THREE.InstancedBufferAttribute(new Float32Array(cabinColors), 3)
    return attr
  }, [cabinColors])

  useFrame((state) => {
    const now = state.clock.elapsedTime
    const body = bodyRef.current
    const cabin = cabinRef.current
    if (!body || !cabin) return
    if (body.instanceColor === null) {
      body.instanceColor = colorAttr
    }
    if (cabin.instanceColor === null) {
      cabin.instanceColor = cabinColorAttr
    }
    const m = new THREE.Matrix4()
    const m2 = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const s = new THREE.Vector3(1, 1, 1)
    for (let i = 0; i < count; i++) {
      const progress = (now * speeds[i] * 0.01 + offsets[i]) % 1
      const p = curve.getPointAt(progress)
      const t = curve.getTangentAt(progress)
      const right = new THREE.Vector3(-t.z, 0, t.x).normalize()
      const pos = new THREE.Vector3(p.x + right.x * 1.6 * laneSign, 10.6, p.z + right.z * 1.6 * laneSign)
      const fwd = new THREE.Vector3(t.x, 0, t.z).normalize()
      e.set(0, Math.atan2(fwd.x, fwd.z), 0)
      q.setFromEuler(e)
      m.compose(pos, q, s)
      body.setMatrixAt(i, m)
      pos.y += 0.45
      m2.compose(pos, q, s)
      cabin.setMatrixAt(i, m2)
    }
    body.instanceMatrix.needsUpdate = true
    cabin.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1.8, 0.6, 3.6]} />
        <meshStandardMaterial vertexColors roughness={0.7} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={cabinRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1.6, 0.5, 2.0]} />
        <meshStandardMaterial vertexColors roughness={0.3} metalness={0.6} />
      </instancedMesh>
    </group>
  )
}

function SemiTraffic({
  curve,
  laneSign = -1,
  cab = '#f2f2f2',
  container = '#ff4a00',
  range = [0, 1],
  scrub,
}: {
  curve: THREE.CatmullRomCurve3
  laneSign?: 1 | -1
  cab?: string
  container?: string
  range?: [number, number]
  scrub?: ScrubRef
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    const p = scrub?.current ?? 0
    const progress = range[0] + (range[1] - range[0]) * Math.max(0, Math.min(1, p))
    const point = curve.getPointAt(progress)
    const tangent = curve.getTangentAt(progress)
    const right = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()
    const fwd = new THREE.Vector3(tangent.x, 0, tangent.z).normalize()
    if (ref.current) {
      ref.current.position.set(
        point.x + right.x * 2.0 * laneSign,
        10.05,
        point.z + right.z * 2.0 * laneSign,
      )
      ref.current.rotation.set(0, Math.atan2(fwd.x, fwd.z), 0)
    }
  })
  return (
    <group ref={ref}>
      <Truck cabColor={cab} containerColor={container} ribCount={10} bob={false} />
    </group>
  )
}

/** R9: scroll-blended background/fog/dome tone. Rendered INSIDE SceneCanvas so R3F hooks are legal. */
function BlendTone({ scrub, domeMat }: { scrub?: ScrubRef; domeMat: { current: THREE.MeshBasicMaterial | null } }) {
  const { scene } = useThree()
  const blendFrom = useMemo(() => new THREE.Color('#FAF9F7'), [])
  const blendDark = useMemo(() => new THREE.Color('#101410'), [])
  const blendTo = useMemo(() => new THREE.Color('#C9D3D8'), [])
  useFrame(() => {
    const p = scrub?.current ?? 0
    const entry = Math.min(Math.max(p / 0.12, 0), 1)
    const exit = Math.min(Math.max((p - 0.88) / 0.12, 0), 1)
    const col = blendFrom.clone().lerp(blendDark, easeInOut(entry)).lerp(blendTo, easeInOut(exit))
    if (scene.background instanceof THREE.Color) scene.background.copy(col)
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(col)
    if (domeMat.current) domeMat.current.color.copy(col)
  })
  return null
}

export default function ViaductScene({ scrub }: { scrub?: ScrubRef }) {
  const curveMain = useMemo(() => viaductCurve(), [])
  const curveMirror = useMemo(() => viaductCurveMirror(), [])
  const domeMat = useRef<THREE.MeshBasicMaterial>(null)
  const roughT = useMemo(roughMap, [])
  const dashT = useMemo(dashWhite, [])

  return (
    <SceneCanvas fallbackLabel="About" tone="blue" camera={{ position: [-95, 30, 0], fov: 48 }}>
      <color attach="background" args={['#101410']} />
      <fog attach="fog" args={['#101410', 130, 420]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[-30, 40, -20]} intensity={2.2} color="#ffc98a" />
      <directionalLight position={[10, 4, 10]} intensity={0.3} color="#2b4bff" />

      <mesh scale={200}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial ref={domeMat} color="#101410" side={THREE.BackSide} />
      </mesh>

      {/* R13: shared straight lane — same corridor (dash at z=0, edges at ±LANE) as the stacker/truck sections */}
        <RoadStrip
          length={90}
          width={90}
          position={[0, -0.05, 0]}
          roughT={roughT}
          dashT={dashT}
        />

      <InstancedTrees count={300} min={1} max={2.2} area={42} center={[0, 0]} height={0} />

      <CurvedRoad curve={curveMain} width={6} color="#6f6f6f" y={10.05} dashSize={[0.3, 3]} barriers />
      <Pillars curve={curveMain} />
      <Traffic curve={curveMain} laneSign={1} count={12} />
      <SemiTraffic curve={curveMain} laneSign={-1} cab="#f2f2f2" container="#D64545" range={[0.05, 0.5]} scrub={scrub} />
      <SemiTraffic curve={curveMain} laneSign={1} cab="#D64545" container="#f0f0f0" range={[0.55, 1]} scrub={scrub} />

      <CurvedRoad curve={curveMirror} width={6} color="#6f6f6f" y={10.05} dashSize={[0.3, 3]} barriers />
      <Pillars curve={curveMirror} />
      <Traffic curve={curveMirror} laneSign={-1} count={12} />
      <SemiTraffic curve={curveMirror} laneSign={1} cab="#f2f2f2" container="#D64545" range={[0.3, 0.75]} scrub={scrub} />

      <BlendTone scrub={scrub} domeMat={domeMat} />
      <CameraRig />
    </SceneCanvas>
  )
}

function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const compact = useCompact()
  useLayoutEffect(() => {
    camera.fov = compact ? 55 : 48
    camera.position.set(-95, 30, 0)
    camera.updateProjectionMatrix()
  }, [camera, compact])
  useFrame(() => {
    camera.lookAt(0, 10, 0)
  })
  return null
}
