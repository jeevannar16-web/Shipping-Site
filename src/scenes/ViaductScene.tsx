import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { InstancedTrees, Truck } from './builders'
import { useCompact } from '../lib/media'
import type { ScrubRef } from '../lib/scrub'

const easeInOut = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1)

/** Single continuous journey path for the ONE primary truck. Phase 1: flat ground-level drive along +z→-z
    (the horizontal side-on shot). Phase 2: the road turns and climbs a ramp onto an elevated overpass. */
const JOURNEY = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 34),
  new THREE.Vector3(0, 0, 16),
  new THREE.Vector3(0, 0, -6),
  new THREE.Vector3(0, 0, -28),
  new THREE.Vector3(-7, 3.6, -34),
  new THREE.Vector3(-20, 6.8, -38),
  new THREE.Vector3(-38, 9, -40),
  new THREE.Vector3(-58, 9.8, -40),
  new THREE.Vector3(-72, 9.8, -40),
])

const ROAD_HALF = 2.8

/** Precomputed samples used to keep trees off the travel corridor. */
const PATH_SAMPLES = JOURNEY.getSpacedPoints(140)

/** 3D road ribbon that follows the journey path (climbs with the ramp), with dashed centre guide, edge
    lines, and guardrail barriers on the elevated section. */
function JourneyRoad() {
  const roadGeo = useMemo(() => {
    const pts = JOURNEY.getSpacedPoints(220)
    const positions: number[] = []
    const uvs: number[] = []
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      const t = JOURNEY.getTangent(i / (pts.length - 1))
      const right = new THREE.Vector3(-t.z, 0, t.x).normalize()
      positions.push(p.x - right.x * ROAD_HALF, p.y, p.z - right.z * ROAD_HALF)
      positions.push(p.x + right.x * ROAD_HALF, p.y, p.z + right.z * ROAD_HALF)
      uvs.push(0, i * 0.04, 1, i * 0.04)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    const indices: number[] = []
    for (let i = 0; i < pts.length - 1; i++) {
      const a = i * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
    g.setIndex(indices)
    g.computeVertexNormals()
    return g
  }, [])

  const dashes = useMemo(() => {
    const out: { pos: THREE.Vector3; rot: number }[] = []
    const pts = JOURNEY.getSpacedPoints(260)
    for (let i = 0; i < pts.length; i += 9) {
      const p = pts[i]
      const t = JOURNEY.getTangent(i / 259)
      out.push({ pos: new THREE.Vector3(p.x, p.y + 0.02, p.z), rot: Math.atan2(t.x, t.z) })
    }
    return out
  }, [])

  const edges = useMemo(() => {
    const out: { pos: THREE.Vector3; rot: number }[] = []
    const pts = JOURNEY.getSpacedPoints(260)
    for (let i = 0; i < pts.length; i += 6) {
      const p = pts[i]
      const t = JOURNEY.getTangent(i / 259)
      const right = new THREE.Vector3(-t.z, 0, t.x).normalize()
      for (const side of [1, -1]) {
        out.push({
          pos: new THREE.Vector3(p.x + right.x * ROAD_HALF * side, p.y + 0.015, p.z + right.z * ROAD_HALF * side),
          rot: Math.atan2(t.x, t.z),
        })
      }
    }
    return out
  }, [])

  const barriers = useMemo(() => {
    const out: { pos: THREE.Vector3; rot: number }[] = []
    const pts = JOURNEY.getSpacedPoints(260)
    for (let i = 0; i < pts.length; i += 6) {
      const p = pts[i]
      if (p.y < 0.7) continue
      const t = JOURNEY.getTangent(i / 259)
      const right = new THREE.Vector3(-t.z, 0, t.x).normalize()
      for (const side of [1, -1]) {
        out.push({
          pos: new THREE.Vector3(p.x + right.x * ROAD_HALF * side, p.y + 0.4, p.z + right.z * ROAD_HALF * side),
          rot: Math.atan2(t.x, t.z),
        })
      }
    }
    return out
  }, [])

  return (
    <group>
      <mesh geometry={roadGeo} receiveShadow>
        <meshStandardMaterial color="#23262B" roughness={0.92} />
      </mesh>
      {dashes.map((d, i) => (
        <mesh key={`d${i}`} position={d.pos} rotation={[0, d.rot, 0]}>
          <boxGeometry args={[0.14, 0.02, 1.0]} />
          <meshBasicMaterial color="#E8E8E8" />
        </mesh>
      ))}
      {edges.map((e, i) => (
        <mesh key={`e${i}`} position={e.pos} rotation={[0, e.rot, 0]}>
          <boxGeometry args={[0.1, 0.02, 1.0]} />
          <meshBasicMaterial color="#CFCFCF" />
        </mesh>
      ))}
      {barriers.map((b, i) => (
        <mesh key={`b${i}`} position={b.pos} rotation={[0, b.rot, 0]}>
          <boxGeometry args={[0.12, 0.75, 1.0]} />
          <meshStandardMaterial color="#6E6E74" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** Concrete support columns under the elevated portion so the climb reads as a real overpass. */
function RampPillars() {
  const pillars = useMemo(() => {
    const out: { pos: THREE.Vector3; h: number }[] = []
    const pts = JOURNEY.getSpacedPoints(260)
    for (let i = 0; i < pts.length; i += 12) {
      const p = pts[i]
      if (p.y < 0.8) continue
      out.push({ pos: new THREE.Vector3(p.x, p.y / 2, p.z), h: p.y })
    }
    return out
  }, [])
  return (
    <group>
      {pillars.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <cylinderGeometry args={[0.32, 0.46, p.h, 10]} />
          <meshStandardMaterial color="#3A3B40" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

/** The single primary truck — scroll drives its position along the journey path; it steers into the tangent
    and pitches up the ramp, wheels spinning for forward motion. */
function JourneyTruck({ scrub }: { scrub?: ScrubRef }) {
  const ref = useRef<THREE.Group>(null)
  const pitchRef = useRef<THREE.Group>(null)
  useFrame(() => {
    const p = clamp01(scrub?.current ?? 0)
    const pos = JOURNEY.getPointAt(p)
    const t = JOURNEY.getTangentAt(p)
    if (ref.current) {
      ref.current.position.copy(pos)
      ref.current.rotation.y = Math.atan2(t.x, t.z)
      if (pitchRef.current) pitchRef.current.rotation.x = -Math.atan2(t.y, Math.hypot(t.x, t.z))
    }
  })
  return (
    <group ref={ref}>
      <group ref={pitchRef}>
        <Truck cabColor="#D64545" containerColor="#F0F0F0" driving bob={false} />
      </group>
    </group>
  )
}

/** Cinematic tracking camera: Phase 1 — side-on at truck level, keeping the truck framed as it crosses the
    frame. Phase 2 — pulls up and behind to reveal the elevated ramp. Both blend continuously on scroll. */
function TrackingRig({ scrub }: { scrub?: ScrubRef }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const compact = useCompact()
  const fov = useRef(0)
  useLayoutEffect(() => {
    fov.current = compact ? 48 : 44
  }, [compact])
  useFrame(() => {
    const p = clamp01(scrub?.current ?? 0)
    const pos = JOURNEY.getPointAt(p)
    const t = JOURNEY.getTangentAt(p)
    const fwd = new THREE.Vector3(t.x, 0, t.z).normalize()
    const right = new THREE.Vector3(-t.z, 0, t.x).normalize()
    const blend = easeInOut(clamp01((p - 0.42) / 0.24))
    // Phase 1: side-on, truck-level, tracking in z.
    const side = pos.clone().addScaledVector(right, 15).add(new THREE.Vector3(0, 2.6, 0))
    // Phase 2: elevated, behind + above the truck, revealing the ramp.
    const high = pos.clone().addScaledVector(right, 20).addScaledVector(fwd, 6).add(new THREE.Vector3(0, 12, 0))
    camera.position.copy(side.lerp(high, blend))
    camera.fov = THREE.MathUtils.lerp(compact ? 48 : 44, compact ? 40 : 38, blend)
    camera.updateProjectionMatrix()
    camera.lookAt(pos.clone().add(new THREE.Vector3(0, 1.4, 0)))
  })
  return null
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
  const domeMat = useRef<THREE.MeshBasicMaterial>(null)

  return (
    <SceneCanvas fallbackLabel="About" tone="blue" camera={{ position: [-15, 3, 34], fov: 44 }}>
      <color attach="background" args={['#101410']} />
      <fog attach="fog" args={['#101410', 60, 170]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[-30, 40, -20]} intensity={2.2} color="#ffc98a" />
      <directionalLight position={[10, 4, 10]} intensity={0.3} color="#2b4bff" />

      <mesh scale={200}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial ref={domeMat} color="#101410" side={THREE.BackSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[260, 260]} />
        <meshStandardMaterial color="#101410" roughness={1} />
      </mesh>

      <JourneyRoad />
      <RampPillars />
      <JourneyTruck scrub={scrub} />

      <InstancedTrees
        count={260}
        min={1}
        max={2.4}
        area={30}
        center={[-2, -12]}
        height={0}
        avoid={(x, z) => {
          for (let i = 0; i < PATH_SAMPLES.length; i++) {
            const dx = PATH_SAMPLES[i].x - x
            const dz = PATH_SAMPLES[i].z - z
            if (dx * dx + dz * dz < 36) return true
          }
          return false
        }}
      />

      <BlendTone scrub={scrub} domeMat={domeMat} />
      <TrackingRig scrub={scrub} />
    </SceneCanvas>
  )
}
