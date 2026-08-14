import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'
import type { ScrubRef } from '../lib/scrub'

function rib() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#E8E8E8'
  g.fillRect(0, 0, 256, 128)
  g.fillStyle = '#c6c6c6'
  for (let x = 8; x < 256; x += 16) g.fillRect(x, 0, 4, 128)
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

/** v18 SHOT 2 — camera (-9,4.6,18), lookAt (0,2.4,0), fov 35. */
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

export default function StackerScene({ scrub }: { scrub?: ScrubRef }) {
  const ribT = useMemo(rib, [])
  const hazT = useMemo(hazard, [])
  const boom = useRef<THREE.Group>(null)
  const tele = useRef<THREE.Group>(null)
  const level = useRef<THREE.Group>(null)
  const cam2 = useRef<THREE.Group>(null)
  const truck = useRef<THREE.Group>(null)
  const grp = useRef<THREE.Group>(null)

  useFrame(() => {
    const p = scrub?.current ?? 0
    const pA = Math.min(p / 0.25, 1)
    const pB = Math.min(Math.max((p - 0.25) / 0.25, 0), 1)
    const pC = Math.min(Math.max((p - 0.5) / 0.25, 0), 1)
    const pD = Math.min(Math.max((p - 0.75) / 0.25, 0), 1)

    // lift → carry right→left → lower onto parked trailer
    const cx = THREE.MathUtils.lerp(-2.4, -3.3, easeInOut(pB))
    const cy = THREE.MathUtils.lerp(THREE.MathUtils.lerp(1.2, 6.15, easeInOut(pA)), 3.55, easeInOut(pC))
    const dx = cx + 1.8
    const dy = cy - 1.4
    const a = Math.atan2(dy, dx)
    const len = Math.hypot(dx, dy)
    boom.current!.rotation.z = a
    tele.current!.position.x = Math.max(len - 4.6, 0)
    level.current!.rotation.z = -a
    cam2.current!.position.x = cx
    cam2.current!.position.y = cy
    cam2.current!.rotation.z = -a * (1 - pD * 0.7)
    if (truck.current) truck.current.position.y = -0.05 * easeInOut(pD)
  })

  const std = { roughness: 0.9, metalness: 0 }
  const teal = '#2E9CC9'
  const stackCols = ['#24457A', '#E8590C', '#D8D2C8', '#24457A']

  return (
    <group>
      <Rig />
      <color attach="background" args={['#EDE7DC']} />
      <fog attach="fog" args={['#EDE7DC', 40, 120]} />
      {/* studio cove sphere — sibling of the measured group (pixel harness) */}
      <mesh scale={200}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#EDE7DC" side={THREE.BackSide} />
      </mesh>
      {/* studio cove floor + contact shadow — siblings of the measured group (pixel harness) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#EDE7DC" {...std} />
      </mesh>
      <ContactShadows opacity={0.5} blur={2.5} far={8} scale={45} position={[0, 0.01, 0]} />

      {/* v18 composition — scaled tableau so the whole shot reads in-frame */}
      <group scale={0.72} position={[-0.4, 0.18, 0]}>
        <group ref={grp}>
          <VisualTest label="STACKER" target={() => grp.current} y={[60, 570]} x={[200, 1080]} />

          {/* ——— parked truck (LHS, facing left, trailer bed top y 2.4) ——— */}
          <group ref={truck}>
            <mesh position={[-4.0, 0.6, 0]}>
              <boxGeometry args={[3.2, 0.35, 1.4]} />
              <meshStandardMaterial color="#101010" {...std} />
            </mesh>
            <mesh position={[-3.9, 1.55, 0]}>
              <boxGeometry args={[2.9, 1.7, 2.3]} />
              <meshStandardMaterial map={ribT} color="#FAFAFA" {...std} />
            </mesh>
            <mesh position={[-5.45, 1.5, 0]}>
              <boxGeometry args={[1.5, 1.4, 2.2]} />
              <meshStandardMaterial color="#DFDFDF" {...std} />
            </mesh>
            <mesh position={[-5.2, 2.05, 0]} rotation={[0, 0, 0.18]}>
              <boxGeometry args={[0.08, 0.55, 1.9]} />
              <meshStandardMaterial color="#101418" {...std} />
            </mesh>
            <mesh position={[-5.45, 1.7, -1.11]}>
              <planeGeometry args={[1.0, 0.4]} />
              <meshStandardMaterial color="#101418" {...std} />
            </mesh>
            <mesh position={[-5.45, 1.7, 1.11]}>
              <planeGeometry args={[1.0, 0.4]} />
              <meshStandardMaterial color="#101418" {...std} />
            </mesh>
            <mesh position={[-6.1, 0.6, 0]}>
              <boxGeometry args={[0.12, 0.35, 1.7]} />
              <meshStandardMaterial color="#111" {...std} />
            </mesh>
            {/* wheels — dual r.5 + silver hub r.12, 24 seg, opaque */}
            {[-5.0, -3.2, -1.6].map((x, i) =>
              [-0.92, 0.92].map((z, j) => (
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
          </group>

          {/* ——— reach stacker (center, teal #2E9CC9) ——— */}
          <group position={[0, 0, 0]}>
            <mesh position={[-0.4, 0.9, 0]}>
              <boxGeometry args={[4.2, 1.4, 2]} />
              <meshStandardMaterial color={teal} {...std} />
            </mesh>
            <mesh position={[1.0, 1.55, 0]}>
              <boxGeometry args={[1.2, 0.9, 1.9]} />
              <meshStandardMaterial color={teal} {...std} />
            </mesh>
            <mesh position={[1.62, 1.55, 0]}>
              <boxGeometry args={[0.06, 0.5, 1.6]} />
              <meshStandardMaterial color="#101418" {...std} />
            </mesh>
            <mesh position={[-2.2, 1.75, -0.7]}>
              <boxGeometry args={[0.18, 0.5, 0.18]} />
              <meshStandardMaterial color="#111" {...std} />
            </mesh>
            {[
              [-1.5, -0.9],
              [-1.5, 0.9],
              [1.0, -0.9],
              [1.0, 0.9],
            ].map((p, i) => (
              <group key={i} position={[p[0], 0.5, p[1]]} rotation={[Math.PI / 2, 0, 0]}>
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

          {/* ——— boom (rotates z), telescope, level, cam (carry the held load) ——— */}
          <group ref={boom} position={[-1.8, 1.4, 0]}>
            <mesh position={[2.3, 0, 0]}>
              <boxGeometry args={[4.6, 0.35, 0.45]} />
              <meshStandardMaterial color="#8A8A8A" {...std} />
            </mesh>
            <group ref={tele} position={[4.6, 0, 0]}>
              <mesh position={[1.3, 0, 0]}>
                <boxGeometry args={[2.6, 0.28, 0.4]} />
                <meshStandardMaterial color="#A8A8A8" {...std} />
              </mesh>
              <group ref={level} position={[1.3, -0.45, 0]}>
                <mesh>
                  <boxGeometry args={[1.7, 0.22, 2.2]} />
                  <meshStandardMaterial map={hazT} {...std} />
                </mesh>
                <group ref={cam2} position={[0, -1.2, 0]}>
                  {/* held load — white ribbed, rides to the parked truck */}
                  <mesh position={[0, -1.15, 0]}>
                    <boxGeometry args={[5.6, 2.3, 2.3]} />
                    <meshStandardMaterial map={ribT} color="#EDEDED" roughness={0.85} metalness={0} transparent={false} opacity={1} depthWrite={true} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>

          {/* ——— 4-stack (right, all on the z=0 artboard) ——— */}
          {stackCols.map((c, i) => (
            <mesh key={i} position={[4.6, 1.15 + i * 2.25, 0]}>
              <boxGeometry args={[5.6, 2.3, 2.3]} />
              <meshStandardMaterial color={c} map={ribT} {...std} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}