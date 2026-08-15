import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { ChromaticAberrationEffect } from 'postprocessing'
import { VisualTest } from '../dev/VisualTest'
import { ProceduralTruck, shadowBlob, asphalt, roughMap, dashTrack, LANE, RoadStrip, type WheelRefs } from './builders'
import { useCompact } from '../lib/media'
import type { ScrubRef } from '../lib/scrub'

function ribWhite() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#F4F3F1'
  g.fillRect(0, 0, 256, 128)
  g.fillStyle = '#C9C7C4'
  for (let x = 8; x < 256; x += 16) g.fillRect(x, 0, 4, 128)
  g.strokeStyle = '#B9B7B4'
  g.lineWidth = 1
  g.strokeRect(0.5, 0.5, 255, 127)
  return new THREE.CanvasTexture(c)
}

function hazard() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 32
  const g = c.getContext('2d')!
  for (let i = -32; i < 160; i += 32) {
    g.fillStyle = '#111'
    g.beginPath()
    g.moveTo(i, 32)
    g.lineTo(i + 16, 0)
    g.lineTo(i + 32, 0)
    g.lineTo(i + 16, 32)
    g.fill()
    g.fillStyle = '#F2C230'
    g.beginPath()
    g.moveTo(i + 16, 32)
    g.lineTo(i + 32, 0)
    g.lineTo(i + 48, 0)
    g.lineTo(i + 32, 32)
    g.fill()
  }
  return new THREE.CanvasTexture(c)
}

/** R12: vertical atmospheric gradient for the sky dome — cooler at the zenith, hazy warm at the horizon. */
function skyGradient() {
  const c = document.createElement('canvas')
  c.width = 16
  c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#EDE9E3')
  grad.addColorStop(0.45, '#F5F2ED')
  grad.addColorStop(1, '#FAF9F7')
  g.fillStyle = grad
  g.fillRect(0, 0, 16, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** R12: transparent oil-sheen blotch map — glossy patches on the asphalt that catch the key light and env reflections. */
function oilSheen() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const g = c.getContext('2d')!
  g.clearRect(0, 0, 512, 512)
  for (let i = 0; i < 16; i++) {
    const x = 40 + Math.random() * 432
    const y = 40 + Math.random() * 432
    const r = 18 + Math.random() * 52
    const grad = g.createRadialGradient(x, y, 2, x, y, r)
    grad.addColorStop(0, 'rgba(192,202,212,0.85)')
    grad.addColorStop(0.55, 'rgba(152,162,177,0.35)')
    grad.addColorStop(1, 'rgba(120,130,145,0)')
    g.fillStyle = grad
    g.fillRect(x - r, y - r, r * 2, r * 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(3, 3)
  return t
}

function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const compact = useCompact()
  useLayoutEffect(() => {
    camera.fov = compact ? 46 : 38
    camera.position.set(-7, compact ? 4.2 : 3.6, compact ? 34 : 30)
    camera.lookAt(0, 2.6, 0)
    camera.updateProjectionMatrix()
  }, [camera, compact])
  return null
}

/** Studio-grade local env map (RoomEnvironment) so metals/teal get soft reflections instead of void-black. */
function StudioEnv() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envMap
    return () => {
      envMap.dispose()
      pmrem.dispose()
      scene.environment = null
    }
  }, [gl, scene])
  return null
}

const easeInOut = (t: number) => t * t * (3 - 2 * t)
const easeIn = (t: number) => t * t
/** Heavier ease-in-out (cubic) for weighty machinery motion. */
const easeHeavy = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** R10: horizon depth — distant container stacks, perimeter fencing, and a gantry silhouette.
    Lives in the env group (fitRef-local coords) so the heavy fog fades them into the background tone. */
function Backdrop() {
  const stackTints = ['#8a9499', '#75818a', '#a08d7d', '#6e7f86']
  return (
    <group>
      {[-44, -34, -24].map((x, i) => (
        <group key={i} position={[x, 0, -40]}>
          {[0, 1, 2].map((j) => (
            <mesh key={j} position={[0, 0.8 + j * 1.65, 0]}>
              <boxGeometry args={[4.4, 1.6, 1.8]} />
              <meshStandardMaterial color={stackTints[(i + j) % 4]} roughness={0.92} />
            </mesh>
          ))}
        </group>
      ))}
      {[-32, -26, -18, -12, -4, 2].map((x, i) => (
        <group key={`n${i}`} position={[x, 0, -18]}>
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[4.4, 1.6, 1.8]} />
            <meshStandardMaterial color={stackTints[(i + 1) % 4]} roughness={0.92} />
          </mesh>
          <mesh position={[0, 2.45, 0]}>
            <boxGeometry args={[4.4, 1.6, 1.8]} />
            <meshStandardMaterial color={stackTints[(i + 2) % 4]} roughness={0.92} />
          </mesh>
        </group>
      ))}
      {/* perimeter fencing along the back */}
      <mesh position={[-20, 1.0, -15.2]}>
        <boxGeometry args={[55, 0.06, 0.06]} />
        <meshStandardMaterial color="#26262a" roughness={0.9} />
      </mesh>
      <mesh position={[-20, 1.9, -15.2]}>
        <boxGeometry args={[55, 0.05, 0.05]} />
        <meshStandardMaterial color="#26262a" roughness={0.9} />
      </mesh>
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} position={[-42.5 + i * 5, 1.0, -15.2]}>
          <boxGeometry args={[0.08, 2.0, 0.08]} />
          <meshStandardMaterial color="#26262a" roughness={0.9} />
        </mesh>
      ))}
      {/* overhead gantry silhouette */}
      <group position={[-14, 0, -17]}>
        <mesh position={[0, 6.2, 0]}>
          <boxGeometry args={[17, 0.6, 0.5]} />
          <meshStandardMaterial color="#202024" roughness={0.9} />
        </mesh>
        <mesh position={[-8.5, 3.1, 0]}>
          <boxGeometry args={[0.5, 6.2, 0.5]} />
          <meshStandardMaterial color="#202024" roughness={0.9} />
        </mesh>
        <mesh position={[8.5, 3.1, 0]}>
          <boxGeometry args={[0.5, 6.2, 0.5]} />
          <meshStandardMaterial color="#202024" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

const STACK_TOP = new THREE.Vector3(3.5, 5.75, 0)
const CONTAINER = [4.4, 1.6, 1.8] as const
const STACK_COLS = ['ribWhite', 'ribWhite', '#1E6BB0', '#E8590C']
const TEAL = '#2E9CC9'

// Revision 6: spline-driven carry arch (fitRef-local space) from stack top over the truck bed.
// All points sit inside the boom's reachable disc so the spreader can hold the cargo throughout.
const ARC = new THREE.CatmullRomCurve3([
  new THREE.Vector3(3.5, 5.75, 0),
  new THREE.Vector3(0.5, 6.5, 0),
  new THREE.Vector3(-3.5, 5.6, 0),
  new THREE.Vector3(-8, 3.6, 0),
])
const BED_REST = new THREE.Vector3(-8, 1.85, -1.9)
const IDLE_AIM = new THREE.Vector3(2.8, 1.6, 0)
/** R12/R13: spreader lock height — spreader center rides so the frame's underside clears the container's
    raised corner-casting tops by a tiny seat gap, while the twistlock housings drop over the castings
    (0.80–0.96) so the lock reads flush and gapless through lift/arc/place. */
const CASTING_TOP = 0.96
const LOCK_LIFT = CASTING_TOP + 0.02 + 0.125 // casting top + seat gap + spreader half-thickness
/** R13: twistlock housing center nests the cargo's raised castings exactly (0.88 - LOCK_LIFT). */
const TWISTLOCK_Y = 0.88 - LOCK_LIFT
/** R12: container top-corner lock positions (X, Z) shared by the spreader twistlocks and the cargo castings. */
const LOCK_CORNERS: Array<[number, number]> = [
  [-1.95, 0.65],
  [1.95, 0.65],
  [-1.95, -0.65],
  [1.95, -0.65],
]

export default function StackerScene({ scrub }: { scrub?: ScrubRef }) {
  const ribT = useMemo(ribWhite, [])
  const hazT = useMemo(hazard, [])
  const blobT = useMemo(shadowBlob, [])
  const asphaltT = useMemo(asphalt, [])
  const roughT = useMemo(roughMap, [])
  const dashT = useMemo(dashTrack, [])
  const skyT = useMemo(skyGradient, [])
  const sheenT = useMemo(oilSheen, [])
  const caOffset = useMemo(() => new THREE.Vector2(0.0012, 0.0007), [])
  const caRef = useRef<ChromaticAberrationEffect | null>(null)
  const arrowShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(1.4, 0.7)
    s.lineTo(1.4, -0.7)
    s.closePath()
    return s
  }, [])

  const boom = useRef<THREE.Group>(null)
  const tele = useRef<THREE.Group>(null)
  const boomTip = useRef<THREE.Group>(null)
  const truck = useRef<THREE.Group>(null)
  const truckWheels = useRef<Array<THREE.Object3D | null>>([]) as WheelRefs
  const spreader = useRef<THREE.Group>(null)
  const fitRef = useRef<THREE.Group>(null)
  const cargo = useRef<THREE.Group>(null)
  const keyLight = useRef<THREE.PointLight>(null)
  const fillLight = useRef<THREE.PointLight>(null)
  const arcLag = useRef(0)
  const camPrevX = useRef(0)
  const camPrevY = useRef(0)

  const std = { roughness: 0.85, metalness: 0 }
  const paint = { roughness: 0.35, metalness: 0.3 }
  const paintDark = { roughness: 0.3, metalness: 0.55 }
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera

  // R12: radial chromatic aberration — weaker in the middle, stronger toward the screen edges (set via ref, since
  // the react wrapper's props type collapses the optional constructor options).
  useLayoutEffect(() => {
    if (caRef.current) {
      caRef.current.radialModulation = true
      caRef.current.modulationOffset = 0.4
    }
  }, [])

  useFrame((_, delta) => {
    const p = scrub?.current ?? 0
    // Revision 6 state machine:
    //   State 0-1 (0 -> 0.30): reach & attach   — arm sweeps to the stack, container rests in stack
    //   State 2   (0.30 -> 0.55): lift & arc    — container follows the CatmullRomCurve3 over the truck
    //   State 3   (0.55 -> 0.75): place         — container lowers onto the bed, reparents to truck
    //   State 4   (0.75 -> 1.00): departure     — spreader retracts, truck drives off
    const pS1 = Math.min(Math.max(p / 0.3, 0), 1)
    const pS2 = Math.min(Math.max((p - 0.3) / 0.25, 0), 1)
    const pS3 = Math.min(Math.max((p - 0.55) / 0.2, 0), 1)
    const pD = Math.min(Math.max((p - 0.75) / 0.25, 0), 1)

    // Heavy arc: damp the spline progress so the container lags with realistic weight.
    arcLag.current = THREE.MathUtils.damp(arcLag.current, easeHeavy(pS2), 3.5, delta)
    const arc = arcLag.current

    // Carried-container target (fitRef-local hang point of the cargo box).
    const cargoTarget = new THREE.Vector3()
    if (p < 0.3) {
      cargoTarget.copy(IDLE_AIM).lerp(STACK_TOP, easeHeavy(pS1))
    } else if (p < 0.55) {
      cargoTarget.copy(ARC.getPoint(arc))
    } else if (p < 0.75) {
      cargoTarget.copy(ARC.getPoint(arc)).lerp(BED_REST, easeHeavy(pS3))
    } else {
      cargoTarget.copy(BED_REST).lerp(IDLE_AIM, easeHeavy(pD))
    }

    // Reach-stacker arm IK: point the boom so the spreader sits flush on the container's top castings.
    const sx = cargoTarget.x
    const sy = cargoTarget.y + LOCK_LIFT
    const dx = sx + 2.4
    const dy = sy - 1.5
    const reach = Math.hypot(dx, dy)
    const teleX = Math.min(Math.max(Math.sqrt(Math.max(reach * reach - 0.16, 0)) - 5.6, 0), 2.6)
    if (boom.current) boom.current.rotation.z = Math.atan2(dy, dx) - Math.atan2(0.4, 5.6 + teleX)
    if (tele.current) tele.current.position.x = 3.0 + teleX
    // R12: gravity-stabilized spreader — counter-rotate so the twistlocks stay level and flush on the container
    // throughout the lift/arc (the boom tips, the spreader never does).
    if (spreader.current && boom.current) spreader.current.rotation.z = -boom.current.rotation.z

    // Container lifecycle — explicit parent switches with matrix attachment (no pre-loaded truck mesh).
    if (cargo.current) {
      if (p < 0.3) {
        if (cargo.current.parent !== fitRef.current) fitRef.current!.add(cargo.current)
        cargo.current.position.copy(STACK_TOP)
        cargo.current.rotation.z = 0
      } else if (p < 0.75) {
        if (cargo.current.parent !== spreader.current) spreader.current!.add(cargo.current)
        fitRef.current!.updateWorldMatrix(true, true)
        fitRef.current!.localToWorld(cargoTarget)
        spreader.current!.worldToLocal(cargo.current.position.copy(cargoTarget))
        cargo.current.rotation.z = 0 // level — the gravity-stabilized spreader is already upright
      } else {
        if (cargo.current.parent !== truck.current) truck.current!.add(cargo.current)
        cargo.current.position.set(0, 1.85, -1.9)
        cargo.current.rotation.z = 0
      }
    }

    // Truck departure — heading pivots onto the road tangent (-x, forward = +z → rotation.y = -π/2) BEFORE
    // driving forward, so the truck never slides sideways; world scale stays exactly 1 (no shrink), monotonic exit.
    const pivot = easeInOut(Math.min(Math.max((p - 0.78) / 0.08, 0), 1))
    const pDrv = Math.min(Math.max((p - 0.85) / 0.15, 0), 1)
    const driveEase = easeIn(pDrv)
    const exitX = THREE.MathUtils.lerp(0, -22, driveEase)
    // R12: chassis micro-bounce — fires the exact instant the container's bottom plane touches the bed
    // (p=0.75, where the place-lerp completes and BED_REST bottom y=1.05 = deck top), then decays to 0.
    const impact = Math.min(Math.max((p - 0.75) / 0.08, 0), 1)
    const bounce = -0.06 * Math.exp(-impact * 4.5) * Math.sin(impact * 16)
    if (truck.current) {
      truck.current.rotation.y = (-Math.PI / 2) * pivot
      truck.current.position.x = -8 + exitX
      truck.current.position.y = bounce
      truck.current.scale.setScalar(1)
    }
    truckWheels.current.forEach((w: THREE.Object3D | null) => w && (w.rotation.y = (16 * driveEase) / ((w.userData.radius as number) || 0.5)))

    // Scroll-blended lighting — warm key recedes, cool fill rises as the loaded truck departs (no hard cut).
    const exitTone = Math.min(Math.max((p - 0.8) / 0.2, 0), 1)
    if (keyLight.current) keyLight.current.intensity = THREE.MathUtils.lerp(30, 16, exitTone)
    if (fillLight.current) fillLight.current.intensity = THREE.MathUtils.lerp(18, 28, exitTone)

    // Camera parallax & damping — high-inertia follow (low lambda = more lag), FOV (38) and Z-distance (30)
    // locked for constant world scale; faint organic roll/pitch banked off camera velocity (cinematic rig feel).
    const camEase = easeInOut(p)
    const camTargetX = THREE.MathUtils.lerp(-7, -9.5, camEase)
    const camTargetY = THREE.MathUtils.lerp(3.6, 3.9, camEase)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, camTargetX, 3, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, camTargetY, 3, delta)
    const velX = (camera.position.x - camPrevX.current) / Math.max(delta, 0.001)
    const velY = (camera.position.y - camPrevY.current) / Math.max(delta, 0.001)
    camPrevX.current = camera.position.x
    camPrevY.current = camera.position.y
    camera.lookAt(
      THREE.MathUtils.lerp(0, -2.5, camEase),
      2.6 + THREE.MathUtils.clamp(velY * 0.02, -0.25, 0.25),
      0,
    )
    camera.rotation.z = THREE.MathUtils.clamp(-velX * 0.004, -0.03, 0.03)

    if (import.meta.env.DEV && cargo.current && truck.current) {
      if (p < 0.01) {
        console.assert(cargo.current.parent !== truck.current, '[SHOT2] truck must start empty (no pre-loaded container)')
        const cw = new THREE.Vector3()
        cargo.current.updateWorldMatrix(true, false)
        cargo.current.getWorldPosition(cw)
        console.assert(Math.abs(cw.x - (2.2 + 3.5 * 0.85)) < 0.1, `[SHOT2] container must rest in the stack at p=0 (x=${cw.x.toFixed(2)})`)
      }
      if (p >= 0.99) {
        console.assert(truck.current.position.x <= -14, `[SHOT2] loadedTruck must drive ≤ -14 at p=1 (got ${truck.current.position.x})`)
        console.assert(cargo.current.parent === truck.current, '[SHOT2] loaded container must stay a child of the driving truck')
      }
      if (truckWheels.current[0] && truck.current) {
        const wp = new THREE.Vector3()
        truckWheels.current[0].getWorldPosition(wp)
        const ca = truck.current.position.clone()
        console.assert(wp.distanceTo(ca) < 0.5, `[SHOT2] wheel detached: dist=${wp.distanceTo(ca).toFixed(3)}`)
      }
    }
  })

  return (
    <group>
      <Rig />
      <StudioEnv />
      {/* R8: localized studio lighting — warm key over the stack, cool fill toward the truck */}
      <pointLight ref={keyLight} position={[5, 7, 6]} intensity={30} color="#FFD9A8" decay={2} />
      <pointLight ref={fillLight} position={[-11, 4, 7]} intensity={18} color="#C9E0FF" decay={2} />
      {/* R10: warm directional key + cool ambient fill complete the multi-point studio setup */}
      <directionalLight position={[8, 12, 10]} intensity={0.8} color="#FFE3B8" />
      <ambientLight intensity={0.35} color="#DCE4F0" />
      <color attach="background" args={['#FAF9F7']} />
      <fog attach="fog" args={['#FAF9F7', 25, 74]} />
      {/* R12: atmospheric sky dome — vertical gradient (cool zenith → hazy horizon) adds real depth behind the fog */}
      <mesh scale={200}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial map={skyT} side={THREE.BackSide} />
      </mesh>

      {/* R12: studio color grading — bloom on hot highlights/markings, radial chromatic aberration, film grain, cinematic vignette */}
      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={1.0} luminanceSmoothing={0.4} mipmapBlur />
        <ChromaticAberration ref={caRef} offset={caOffset} />
        <Noise opacity={0.05} />
        <Vignette offset={0.2} darkness={0.68} />
      </EffectComposer>

      {/* R8: environment shares fitRef's transform (local coords unchanged) but lives outside the
          machinery group so the STACKER bbox stays meaningful. */}
      <group scale={0.85} position={[2.2, 0.6, 0]}>
        {/* R13: shared straight lane — asphalt apron + dashed guide + edge lines, one corridor across every scene.
            lane is env-scaled (÷0.85) so the world corridor still sits at ±LANE like Truck/Viaduct. */}
        <RoadStrip
          length={85}
          width={50}
          position={[-12.5, 0, 0]}
          lane={LANE / 0.85}
          asphaltT={asphaltT}
          roughT={roughT}
          dashT={dashT}
          glow
          clearcoat={0.15}
        />
        {/* R12: oil-sheen reflections — glossy blotches that catch the key light and studio env as the camera/truck move */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12.5, 0.006, 0]}>
          <planeGeometry args={[85, 50]} />
          <meshPhysicalMaterial map={sheenT} transparent roughness={0.2} metalness={0.8} clearcoat={0.6} clearcoatRoughness={0.3} envMapIntensity={1.5} depthWrite={false} />
        </mesh>
        {/* R7: directional guide arrows pointing toward the left exit */}
        {[-10, -16, -22].map((x) => (
          <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03, 0]}>
            <shapeGeometry args={[arrowShape]} />
            <meshStandardMaterial color="#E8E6E1" transparent opacity={0.5} roughness={0.9} />
          </mesh>
        ))}
        {/* R7: soft contact shadows anchoring stacker, containers, and truck to the road */}
        <ContactShadows position={[0, 0.05, 0]} scale={90} blur={2.4} far={10} opacity={0.45} resolution={1024} color="#111111" />
        {/* R10: horizon depth — stacks, fencing, gantry, all faded by fog */}
        <Backdrop />
      </group>

      <group ref={fitRef} scale={0.85} position={[2.2, 0.6, 0]}>
        <VisualTest label="STACKER" target={() => fitRef.current} y={[320, 600]} x={[220, 1340]} />

        {/* LEFT parked truck — ProceduralTruck @ (-8,0,0); bed starts EMPTY (no static container mesh) */}
        <group ref={truck} position={[-8, 0, 0]}>
          <ProceduralTruck wheelRefs={truckWheels} driving={false} bob={false} hideTrailer />
          {/* shadowBlob MUST be a CHILD of the truck group (grep token: shadow-in-truck) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <planeGeometry args={[15, 5]} />
            <meshBasicMaterial map={blobT} transparent depthWrite={false} />
          </mesh>
        </group>

        {/* RIGHT stack x +3.5 (inside the boom's reach), bottom→top [ribWhite, ribWhite, #1E6BB0, cargo #E8590C];
            the top container IS the carried cargo mesh (no static truck copy). */}
        {STACK_COLS.map((c, i) =>
          i === 3 ? null : (
            <mesh key={i} position={[3.5, 0.8 + i * 1.65, 0]}>
              <boxGeometry args={CONTAINER} />
              <meshStandardMaterial color={c === 'ribWhite' ? '#F4F3F1' : c} map={c === 'ribWhite' ? ribT : undefined} {...std} />
            </mesh>
          ),
        )}
        <group ref={cargo} position={[3.5, 5.75, 0]}>
          <mesh>
            <boxGeometry args={CONTAINER} />
            <meshStandardMaterial color={STACK_COLS[3]} {...std} />
          </mesh>
          {/* R12: raised top corner castings — the anchor seats for the spreader's twistlocks */}
          {LOCK_CORNERS.map(([x, z], i) => (
            <mesh key={i} position={[x, 0.88, z] as [number, number, number]}>
              <boxGeometry args={[0.34, 0.16, 0.34]} />
              <meshStandardMaterial color="#202024" roughness={0.45} metalness={0.45} />
            </mesh>
          ))}
        </group>
        <mesh position={[3.5, 0.05, 0]}>
          <boxGeometry args={[6, 0.3, 2.4]} />
          <meshStandardMaterial color={TEAL} {...std} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.5, 0.01, 0]}>
          <planeGeometry args={[6, 3]} />
          <meshBasicMaterial map={blobT} transparent depthWrite={false} />
        </mesh>

        {/* CENTER teal reach stacker — body + cab with glass, black tyres, TWO-segment angled black boom, hazard-spreader, container hung */}
        <group>
          {/* body */}
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[4.4, 1.4, 2]} />
            <meshStandardMaterial color={TEAL} {...paint} />
          </mesh>
          {/* cab */}
          <mesh position={[-1.5, 1.55, 0]}>
            <boxGeometry args={[1.6, 1.3, 1.9]} />
            <meshStandardMaterial color={TEAL} {...paint} />
          </mesh>
          {/* glass window */}
          <mesh position={[-1.5, 1.75, 0]}>
            <boxGeometry args={[1.4, 0.5, 1.7]} />
            <meshStandardMaterial color="#101418" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* counterweight / engine block */}
          <mesh position={[1.5, 1.0, 0]}>
            <boxGeometry args={[1.2, 1.0, 1.8]} />
            <meshStandardMaterial color="#1a1a1a" {...paintDark} />
          </mesh>
          {/* black tyres */}
          {[
            [-1.0, 0.5, 1.1],
            [-1.0, 0.5, -1.1],
            [1.0, 0.5, 1.1],
            [1.0, 0.5, -1.1],
          ].map((p, i) => (
            <group key={i} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.5, 0.5, 0.3, 24]} />
                <meshStandardMaterial color="#101010" {...std} />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.15, 0.15, 0.32, 16]} />
                <meshStandardMaterial color="#8A8A8A" metalness={0.6} roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[6, 3.2]} />
          <meshBasicMaterial map={blobT} transparent depthWrite={false} />
        </mesh>

        {/* TWO-segment angled black boom, pivot (-2.4,1.5,0) */}
        <group ref={boom} position={[-2.4, 1.5, 0]}>
          <mesh position={[1.5, 0, 0]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[3.0, 0.5, 0.45]} />
            <meshStandardMaterial color="#17181A" {...std} />
          </mesh>
          <group ref={tele} position={[3.0, 0.4, 0]}>
            <mesh position={[1.3, 0, 0]} rotation={[0, 0, -0.1]}>
              <boxGeometry args={[2.6, 0.4, 0.4]} />
              <meshStandardMaterial color="#17181A" {...std} />
            </mesh>
            {/* boomTip — spreader is a child of this; cargo reparents here during carry (grep token: spreader-child) */}
            <group ref={boomTip} position={[2.6, 0, 0]}>
              <group ref={spreader} position={[0, 0, 0]}>
                {/* R12: spreader frame sized to the container top so the corner locks seat on the castings */}
                <mesh>
                  <boxGeometry args={[4.4, 0.25, 1.8]} />
                  <meshStandardMaterial map={hazT} transparent opacity={1} {...std} />
                </mesh>
                {/* R13: corner twistlocks — housings drop over the cargo's raised castings (0.80–0.96) so the
                    lock reads gapless across lift/arc/place */}
                {LOCK_CORNERS.map(([x, z], i) => (
                  <mesh key={i} position={[x, TWISTLOCK_Y, z] as [number, number, number]}>
                    <boxGeometry args={[0.3, 0.24, 0.3]} />
                    <meshStandardMaterial color="#1f1f24" roughness={0.5} metalness={0.5} />
                  </mesh>
                ))}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
