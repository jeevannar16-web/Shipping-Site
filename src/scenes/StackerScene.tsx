import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'
import type { ScrubRef } from '../lib/scrub'

/** v19 studio — white seamless #FAF9F7, fog 25→70, BackSide sphere, NO floor plane. */
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

/** radial rgba(0,0,0,.3) shadow blob — one under each actor. */
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

/** v19 SHOT 2 — camera (-9,4.6,18), lookAt (0,2.4,0), fov 35. */
function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useLayoutEffect(() => {
    camera.fov = 35
    camera.position.set(-9, 4.6, 18)
    camera.lookAt(0, 2.4, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

const easeInOut = (t: number) => t * t * (3 - 2 * t)

const STACK_TOP = new THREE.Vector3(7, 5.75, 0)
const CONTAINER = [4.4, 1.6, 1.8] as const
const STACK_COLS = ['#1E6BB0', '#E8590C', 'ribWhite', 'ribWhite']

export default function StackerScene({ scrub }: { scrub?: ScrubRef }) {
  const ribT = useMemo(ribWhite, [])
  const hazT = useMemo(hazard, [])
  const blobT = useMemo(shadowBlob, [])

  const boom = useRef<THREE.Group>(null)
  const tele = useRef<THREE.Group>(null)
  const truck = useRef<THREE.Group>(null)
  const held = useRef<THREE.Mesh>(null)
  const loaded = useRef<THREE.Mesh>(null)
  const spreader = useRef<THREE.Mesh>(null)
  const fitRef = useRef<THREE.Group>(null)

  const std = { roughness: 0.85, metalness: 0 }
  const teal = '#2E9CC9'

  useFrame(() => {
    const p = scrub?.current ?? 0
    const pA = Math.min(Math.max(p / 0.25, 0), 1)
    const pB = Math.min(Math.max((p - 0.25) / 0.3, 0), 1)
    const pC = Math.min(Math.max((p - 0.55) / 0.2, 0), 1)
    const pD = Math.min(Math.max((p - 0.75) / 0.25, 0), 1)

    // ——— held container: A(3.5,.85) → B(3.5,5.6) → C(-8,5.6) → D(-8,2.0) ———
    const hx = THREE.MathUtils.lerp(THREE.MathUtils.lerp(3.5, 3.5, easeInOut(pA)), -8, easeInOut(pB))
    const hy = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(0.85, 5.6, easeInOut(pA)),
      THREE.MathUtils.lerp(5.6, 2.0, easeInOut(pC)),
      easeInOut(pB),
    )
    if (held.current) {
      // RULE (a) — held is a ROOT mesh, identity quaternion, never a child of the boom
      held.current.position.set(hx, hy, 0)
      held.current.rotation.set(0, 0, 0)
    }

    // RULE (b) — spreader is a separate ROOT mesh at held + (0,.95,0), no tilt
    if (spreader.current) {
      spreader.current.position.set(hx, hy + 0.95, 0)
      spreader.current.rotation.set(0, 0, 0)
      spreader.current.visible = p < 0.95
    }

    // RULE (c) — boom aims at tip = held + (0,1.9,0), pivot (-2.4,1.5,0)
    const tipX = hx + 2.4
    const tipY = hy + 1.9 - 1.5
    if (boom.current) boom.current.rotation.z = Math.atan2(tipY, tipX)
    const reach = Math.hypot(tipX, tipY)
    if (tele.current) {
      const extend = Math.min(Math.max(reach - 4.6, 0), 2.6)
      // inner slides to the load, then retracts on the final beat
      tele.current.position.x = extend * (p < 0.75 ? 1 : 1 - easeInOut(pD))
    }

    // RULE (d) — swap at p≥.78: loaded (parented to trailer) shows, held hides, spreader fades
    if (loaded.current) loaded.current.visible = p >= 0.78
    if (held.current) held.current.visible = p < 0.78
    if (truck.current) truck.current.position.y = -0.05 * easeInOut(pD)

    // RULE (e) — held never within 1.0 of the 4-stack
    if (import.meta.env.DEV && held.current) {
      const d = Math.hypot(hx - STACK_TOP.x, hy - STACK_TOP.y)
      console.assert(d >= 1.0, `[SHOT2] held within 1.0 of stack at p=${p.toFixed(3)} d=${d.toFixed(2)}`)
      console.assert(
        held.current.quaternion.x === 0 && held.current.quaternion.y === 0 && held.current.quaternion.z === 0 && held.current.quaternion.w === 1,
        '[SHOT2] held quaternion not identity',
      )
      if (p < 0.01) console.assert(loaded.current?.visible === false, '[SHOT2] loaded must be hidden at p=0')
    }
  })

  return (
    <group>
      <Rig />
      <color attach="background" args={['#FAF9F7']} />
      <fog attach="fog" args={['#FAF9F7', 25, 70]} />
      {/* white studio cove — the SPHERE is the backdrop (no floor plane) */}
      <mesh scale={200}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#FAF9F7" side={THREE.BackSide} />
      </mesh>

      {/* fitted tableau — keeps the spec-local actor numbers, brings the wide cast into frame */}
      <group ref={fitRef} scale={0.51} position={[0.85, 1, 0]}>
        <VisualTest label="STACKER" target={() => fitRef.current} y={[120, 560]} x={[180, 1100]} />

        {/* ——— LEFT parked truck — bed @ (-8,1.05,0), cab @ (-11.4,1.5,0) ——— */}
        {/* loaded container (identical ribbed) is PARENTED here @ (-8,2.0,0), hidden at p=0 */}
        <group ref={truck}>
          <mesh position={[-8, 1.05, 0]}>
            <boxGeometry args={[6.2, 0.3, 2.5]} />
            <meshStandardMaterial color="#101010" {...std} />
          </mesh>
          {/* 5 dual wheels r.5 hub .12 */}
          {[-10.2, -9.1, -8, -6.9, -5.8].map((x, i) =>
            [-0.9, 0.9].map((z, j) => (
              <group key={`${i}-${j}`} position={[x, 0.5, z]} rotation={[Math.PI / 2, 0, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.5, 0.5, 0.3, 24]} />
                  <meshStandardMaterial color="#101010" {...std} />
                </mesh>
                <mesh>
                  <cylinderGeometry args={[0.12, 0.12, 0.32, 16]} />
                  <meshStandardMaterial color="#8A8A8A" {...std} />
                </mesh>
              </group>
            )),
          )}
          <mesh position={[-11.4, 1.5, 0]}>
            <boxGeometry args={[1.6, 1.5, 2.2]} />
            <meshStandardMaterial color="#DFDFDF" {...std} />
          </mesh>
          <mesh position={[-11.75, 1.95, 0]} rotation={[0, 0, -0.18]}>
            <boxGeometry args={[0.08, 0.55, 1.9]} />
            <meshStandardMaterial color="#101418" {...std} />
          </mesh>
          <mesh position={[-11.4, 1.9, -1.11]}>
            <planeGeometry args={[1.0, 0.4]} />
            <meshStandardMaterial color="#101418" {...std} />
          </mesh>
          <mesh position={[-11.4, 1.9, 1.11]}>
            <planeGeometry args={[1.0, 0.4]} />
            <meshStandardMaterial color="#101418" {...std} />
          </mesh>
          <mesh ref={loaded} position={[-8, 2.0, 0]} visible={false}>
            <boxGeometry args={CONTAINER} />
            <meshStandardMaterial map={ribT} color="#F4F3F1" {...std} />
          </mesh>
        </group>
        {/* truck shadow blob */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.01, 0]}>
          <planeGeometry args={[9, 3.2]} />
          <meshBasicMaterial map={blobT} transparent depthWrite={false} />
        </mesh>

        {/* ——— RIGHT stack x +7: 4 containers (4.4,1.6,1.8) gap .05, [#1E6BB0,#E8590C,ribWhite,ribWhite] ——— */}
        {STACK_COLS.map((c, i) => (
          <mesh key={i} position={[7, 0.8 + i * 1.65, 0]}>
            <boxGeometry args={CONTAINER} />
            <meshStandardMaterial color={c === 'ribWhite' ? '#F4F3F1' : c} map={c === 'ribWhite' ? ribT : undefined} {...std} />
          </mesh>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7, 0.01, 0]}>
          <planeGeometry args={[6, 3]} />
          <meshBasicMaterial map={blobT} transparent depthWrite={false} />
        </mesh>

        {/* ——— CENTER teal reach stacker — body (4.4,1.4,2), boom pivot (-2.4,1.5,0) ——— */}
        <group>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[4.4, 1.4, 2]} />
            <meshStandardMaterial color={teal} {...std} />
          </mesh>
          <mesh position={[-1.5, 1.55, 0]}>
            <boxGeometry args={[1.6, 1.3, 1.9]} />
            <meshStandardMaterial color={teal} {...std} />
          </mesh>
          <mesh position={[-1.75, 2.05, 0]}>
            <boxGeometry args={[0.06, 0.5, 1.6]} />
            <meshStandardMaterial color="#101418" {...std} />
          </mesh>
          {[
            [-1.3, -0.8],
            [-1.3, 0.8],
            [1.3, -0.8],
            [1.3, 0.8],
          ].map((q, i) => (
            <group key={i} position={[q[0], 0.5, q[1]]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.5, 0.5, 0.3, 24]} />
                <meshStandardMaterial color="#101010" {...std} />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.12, 0.12, 0.32, 16]} />
                <meshStandardMaterial color="#8A8A8A" {...std} />
              </mesh>
            </group>
          ))}
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[6, 3.2]} />
          <meshBasicMaterial map={blobT} transparent depthWrite={false} />
        </mesh>

        {/* ——— boom — 2 grey boxes #55585C, pivot (-2.4,1.5,0) ——— */}
        <group ref={boom} position={[-2.4, 1.5, 0]}>
          <mesh position={[2.3, 0, 0]}>
            <boxGeometry args={[4.6, 0.5, 0.45]} />
            <meshStandardMaterial color="#55585C" {...std} />
          </mesh>
          <group ref={tele} position={[4.6, 0, 0]}>
            <mesh position={[1.3, 0, 0]}>
              <boxGeometry args={[2.6, 0.4, 0.4]} />
              <meshStandardMaterial color="#55585C" {...std} />
            </mesh>
          </group>
        </group>

        {/* ——— ROOT-level held load + spreader (never boom children) ——— */}
        <mesh ref={held} position={[3.5, 0.85, 0]}>
          <boxGeometry args={CONTAINER} />
          <meshStandardMaterial map={ribT} color="#F4F3F1" {...std} />
        </mesh>
        <mesh ref={spreader} position={[3.5, 1.8, 0]}>
          <boxGeometry args={[1.9, 0.25, 2.3]} />
          <meshStandardMaterial map={hazT} transparent opacity={1} {...std} />
        </mesh>
      </group>
    </group>
  )
}