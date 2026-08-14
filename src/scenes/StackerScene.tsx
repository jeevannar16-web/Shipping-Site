import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'
import { TruckGLB, ContainerGLB, type WheelRefs } from '../components/Models'
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
    g.fillStyle = '#E5B31B'
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
    camera.fov = 35
    camera.position.set(-8, 4.2, 38)
    camera.lookAt(0, 2.6, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

const easeInOut = (t: number) => t * t * (3 - 2 * t)
const easeIn = (t: number) => t * t

const STACK_TOP = new THREE.Vector3(7, 5.75, 0)
const CONTAINER = [4.4, 1.6, 1.8] as const
const STACK_COLS = ['ribWhite', 'ribWhite', '#1E6BB0', '#E8590C']
const TEAL = '#2E9CC9'

export default function StackerScene({ scrub }: { scrub?: ScrubRef }) {
  const ribT = useMemo(ribWhite, [])
  const hazT = useMemo(hazard, [])
  const blobT = useMemo(shadowBlob, [])

  const boom = useRef<THREE.Group>(null)
  const tele = useRef<THREE.Group>(null)
  const truck = useRef<THREE.Group>(null)
  const truckWheels = useRef<Array<THREE.Object3D | null>>([]) as WheelRefs
  const held = useRef<THREE.Mesh>(null)
  const loaded = useRef<THREE.Object3D>(null)
  const spreader = useRef<THREE.Group>(null)
  const fitRef = useRef<THREE.Group>(null)

  const std = { roughness: 0.85, metalness: 0 }

  useFrame(() => {
    const p = scrub?.current ?? 0
    const pA = Math.min(Math.max(p / 0.25, 0), 1)
    const pB = Math.min(Math.max((p - 0.25) / 0.3, 0), 1)
    const pC = Math.min(Math.max((p - 0.55) / 0.2, 0), 1)
    const pD = Math.min(Math.max((p - 0.75) / 0.25, 0), 1)

    const hx = THREE.MathUtils.lerp(THREE.MathUtils.lerp(3.5, 3.5, easeInOut(pA)), -8, easeInOut(pB))
    const hy = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(0.85, 5.6, easeInOut(pA)),
      THREE.MathUtils.lerp(5.6, 2.0, easeInOut(pC)),
      easeInOut(pB),
    )
    if (held.current) {
      held.current.position.set(hx, hy, 0)
      held.current.rotation.set(0, 0, 0)
    }

    if (spreader.current) {
      spreader.current.position.set(hx, hy + 0.95, 0)
      spreader.current.rotation.set(0, 0, 0)
      spreader.current.visible = p < 0.95
    }

    const tipX = hx + 2.4
    const tipY = hy + 1.9 - 1.5
    if (boom.current) boom.current.rotation.z = Math.atan2(tipY, tipX)
    const reach = Math.hypot(tipX, tipY)
    if (tele.current) {
      const extend = Math.min(Math.max(reach - 4.6, 0), 2.6)
      tele.current.position.x = extend * (p < 0.75 ? 1 : 1 - easeInOut(pD))
    }

    if (loaded.current) loaded.current.visible = p >= 0.78
    if (held.current) held.current.visible = p < 0.78

    const pDrv = Math.min(Math.max((p - 0.82) / 0.18, 0), 1)
    const drive = -16 * easeIn(pDrv)
    if (truck.current) {
      truck.current.position.x = -8 + drive
      truck.current.position.y = -0.05 * easeInOut(pD) + 0.02 * Math.sin(pDrv * Math.PI * 8)
    }
    truckWheels.current.forEach((w) => w && (w.rotation.z = (16 * easeIn(pDrv)) / ((w.userData.radius as number) || 0.5)))

    if (import.meta.env.DEV && held.current) {
      const d = Math.hypot(hx - STACK_TOP.x, hy - STACK_TOP.y)
      console.assert(d >= 1.0, `[SHOT2] held within 1.0 of stack at p=${p.toFixed(3)} d=${d.toFixed(2)}`)
      console.assert(
        held.current.quaternion.x === 0 && held.current.quaternion.y === 0 && held.current.quaternion.z === 0 && held.current.quaternion.w === 1,
        '[SHOT2] held quaternion not identity',
      )
      if (p < 0.01) console.assert(loaded.current?.visible === false, '[SHOT2] loaded must be hidden at p=0')
      if (p >= 0.99) {
        console.assert(Boolean(truck.current && truck.current.position.x <= -14), `[SHOT2] loadedTruck must drive ≤ -14 at p=1 (got ${truck.current?.position.x})`)
        console.assert(Boolean(loaded.current && loaded.current.parent === truck.current), '[SHOT2] loaded container must stay a child of the driving truck')
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

        {/* LEFT parked GLB truck — TruckGLB @ (-8,0,0), ContainerGLB on deck */}
        <group ref={truck} position={[-8, 0, 0]}>
          <TruckGLB wheels={truckWheels} tint="#3A3D42" />
          <ContainerGLB ref={loaded} position={[0, 4.0, 0]} tint="#E8E8E8" />
          {/* shadowBlob MUST be a CHILD of the truck group (grep token: shadow-in-truck) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <planeGeometry args={[15, 5]} />
            <meshBasicMaterial map={blobT} transparent depthWrite={false} />
          </mesh>
        </group>

        {/* RIGHT stack x +7: 2× white ribbed on top, then blue, then orange; ground box teal */}
        {STACK_COLS.map((c, i) => (
          <mesh key={i} position={[7, 0.8 + i * 1.65, 0]}>
            <boxGeometry args={CONTAINER} />
            <meshStandardMaterial color={c === 'ribWhite' ? '#F4F3F1' : c} map={c === 'ribWhite' ? ribT : undefined} {...std} />
          </mesh>
        ))}
        <mesh position={[7, 0.05, 0]}>
          <boxGeometry args={[6, 0.3, 2.4]} />
          <meshStandardMaterial color={TEAL} {...std} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7, 0.01, 0]}>
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
            <meshStandardMaterial color="#1a1a1a" {...std} />
          </mesh>
          <group ref={tele} position={[3.0, 0.4, 0]}>
            <mesh position={[1.3, 0, 0]} rotation={[0, 0, -0.1]}>
              <boxGeometry args={[2.6, 0.4, 0.4]} />
              <meshStandardMaterial color="#1a1a1a" {...std} />
            </mesh>
            {/* spreader MUST be a CHILD of the boom-tip level group (grep token: spreader-child) */}
            <group ref={spreader} position={[2.6, 0, 0]}>
              <mesh>
                <boxGeometry args={[1.9, 0.25, 2.3]} />
                <meshStandardMaterial map={hazT} transparent opacity={1} {...std} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ROOT-level held load */}
        <mesh ref={held} position={[3.5, 0.85, 0]}>
          <boxGeometry args={CONTAINER} />
          <meshStandardMaterial map={ribT} color="#F4F3F1" {...std} />
        </mesh>
      </group>
    </group>
  )
}
