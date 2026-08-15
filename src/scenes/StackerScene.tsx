import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'
import { ProceduralTruck, type WheelRefs } from './builders'
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

function shadowBlob() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 6, 64, 64, 62)
  grad.addColorStop(0, 'rgba(0,0,0,0.3)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useLayoutEffect(() => {
    camera.fov = 38
    camera.position.set(-7, 3.6, 30)
    camera.lookAt(0, 2.6, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

const easeInOut = (t: number) => t * t * (3 - 2 * t)
const easeIn = (t: number) => t * t

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
const HOVER = new THREE.Vector3(-8, 3.6, 0)
const BED_REST = new THREE.Vector3(-8, 1.85, -1.9)
const IDLE_AIM = new THREE.Vector3(2.8, 1.6, 0)

export default function StackerScene({ scrub }: { scrub?: ScrubRef }) {
  const ribT = useMemo(ribWhite, [])
  const hazT = useMemo(hazard, [])
  const blobT = useMemo(shadowBlob, [])

  const boom = useRef<THREE.Group>(null)
  const tele = useRef<THREE.Group>(null)
  const boomTip = useRef<THREE.Group>(null)
  const truck = useRef<THREE.Group>(null)
  const truckWheels = useRef<Array<THREE.Object3D | null>>([]) as WheelRefs
  const spreader = useRef<THREE.Group>(null)
  const fitRef = useRef<THREE.Group>(null)
  const cargo = useRef<THREE.Mesh>(null)

  const std = { roughness: 0.85, metalness: 0 }

  useFrame(() => {
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

    // Carried-container target (fitRef-local hang point of the cargo box).
    const cargoTarget = new THREE.Vector3()
    if (p < 0.3) {
      cargoTarget.copy(IDLE_AIM).lerp(STACK_TOP, easeInOut(pS1))
    } else if (p < 0.55) {
      cargoTarget.copy(ARC.getPoint(easeInOut(pS2)))
    } else if (p < 0.75) {
      cargoTarget.copy(HOVER).lerp(BED_REST, easeInOut(pS3))
    } else {
      cargoTarget.copy(BED_REST).lerp(IDLE_AIM, easeInOut(pD))
    }

    // Reach-stacker arm IK: point the boom so the spreader hovers 0.95 above the target.
    const sx = cargoTarget.x
    const sy = cargoTarget.y + 0.95
    const dx = sx + 2.4
    const dy = sy - 1.5
    const reach = Math.hypot(dx, dy)
    const teleX = Math.min(Math.max(Math.sqrt(Math.max(reach * reach - 0.16, 0)) - 5.6, 0), 2.6)
    if (boom.current) boom.current.rotation.z = Math.atan2(dy, dx) - Math.atan2(0.4, 5.6 + teleX)
    if (tele.current) tele.current.position.x = 3.0 + teleX

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
        cargo.current.rotation.z = -boom.current!.rotation.z
      } else {
        if (cargo.current.parent !== truck.current) truck.current!.add(cargo.current)
        cargo.current.position.set(0, 1.85, -1.9)
        cargo.current.rotation.z = 0
      }
    }

    // Truck departure — preserved: monotonic exit, constant ground height, no vertical jump.
    const pDrv = Math.min(Math.max((p - 0.82) / 0.18, 0), 1)
    const driveEase = easeIn(pDrv)
    const exitX = THREE.MathUtils.lerp(0, -22, driveEase)
    const exitScale = THREE.MathUtils.lerp(1, 0.15, driveEase)
    if (truck.current) {
      truck.current.position.x = -8 + exitX
      truck.current.position.y = 0
      truck.current.scale.setScalar(exitScale)
    }
    truckWheels.current.forEach((w: THREE.Object3D | null) => w && (w.rotation.y = (16 * driveEase) / ((w.userData.radius as number) || 0.5)))

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
      <color attach="background" args={['#FAF9F7']} />
      <fog attach="fog" args={['#FAF9F7', 25, 70]} />
      <mesh scale={200}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#FAF9F7" side={THREE.BackSide} />
      </mesh>

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
        <mesh ref={cargo} position={[3.5, 5.75, 0]}>
          <boxGeometry args={CONTAINER} />
          <meshStandardMaterial color={STACK_COLS[3]} {...std} />
        </mesh>
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
            <meshStandardMaterial color={TEAL} {...std} />
          </mesh>
          {/* cab */}
          <mesh position={[-1.5, 1.55, 0]}>
            <boxGeometry args={[1.6, 1.3, 1.9]} />
            <meshStandardMaterial color={TEAL} {...std} />
          </mesh>
          {/* glass window */}
          <mesh position={[-1.5, 1.75, 0]}>
            <boxGeometry args={[1.4, 0.5, 1.7]} />
            <meshStandardMaterial color="#101418" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* counterweight / engine block */}
          <mesh position={[1.5, 1.0, 0]}>
            <boxGeometry args={[1.2, 1.0, 1.8]} />
            <meshStandardMaterial color="#1a1a1a" {...std} />
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
                <mesh>
                  <boxGeometry args={[1.9, 0.25, 2.3]} />
                  <meshStandardMaterial map={hazT} transparent opacity={1} {...std} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
