import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'
import { TruckGLB, ContainerGLB, type WheelRefs } from '../components/Models'
import type { ScrubRef } from '../lib/scrub'

/** v19 studio — white seamless #FAF9F7, fog 25→70, BackSide sphere, NO floor plane. */
function rib() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#FAFAFA'
  g.fillRect(0, 0, 256, 128)
  g.fillStyle = '#C9C7C4'
  for (let x = 8; x < 256; x += 16) g.fillRect(x, 0, 4, 128)
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

function bgWords() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 256
  const g = c.getContext('2d')!
  g.clearRect(0, 0, 1024, 256)
  g.fillStyle = '#D8D2C8'
  g.font = '800 150px Archivo, Arial, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText('UNDER ONE GROUP', 512, 128)
  const t = new THREE.CanvasTexture(c)
  return t
}

/** v20 SHOT 3 — camera (0, 2.6, 36), fov 30, lookAt (0, 1.8, 0). */
function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useLayoutEffect(() => {
    camera.fov = 30
    camera.position.set(0, 2.6, 36)
    camera.lookAt(0, 1.8, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

type TruckModelProps = { cabColor: string; ribT: THREE.Texture }

/** v19 SHOT 3 — TruckModel(cabColor): cab + windows, chassis, 5 dual wheels, tanks, exhaust, ribbed trailer. */
function TruckModel({ cabColor, ribT }: TruckModelProps) {
  const std = { roughness: 0.9, metalness: 0 }
  return (
    <group>
      {/* chassis (11.6,.4,1.4) #101010 — exact length */}
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[11.6, 0.4, 1.4]} />
        <meshStandardMaterial color="#101010" {...std} />
      </mesh>
      {/* ribbed trailer (9.5,2.6,2.4) #FAFAFA — carried at y 2.35 */}
      <mesh name="CONTAINER" position={[0, 2.35, 0]}>
        <boxGeometry args={[9.5, 2.6, 2.4]} />
        <meshStandardMaterial map={ribT} color="#FAFAFA" {...std} />
      </mesh>
      {/* cab (2.4,1.5,2.2) + windshield + side windows */}
      <mesh position={[4.6, 1.73, 0]}>
        <boxGeometry args={[2.4, 1.5, 2.2]} />
        <meshStandardMaterial color={cabColor} {...std} />
      </mesh>
      <mesh position={[5.75, 2.1, 0]} rotation={[0, 0, -0.28]}>
        <boxGeometry args={[0.12, 0.8, 2.0]} />
        <meshStandardMaterial color="#101418" {...std} />
      </mesh>
      <mesh position={[4.6, 2.05, -1.11]}>
        <planeGeometry args={[1.4, 0.55]} />
        <meshStandardMaterial color="#101418" {...std} />
      </mesh>
      <mesh position={[4.6, 2.05, 1.11]}>
        <planeGeometry args={[1.4, 0.55]} />
        <meshStandardMaterial color="#101418" {...std} />
      </mesh>
      <mesh position={[5.8, 1.35, 0]}>
        <boxGeometry args={[0.1, 0.6, 1.8]} />
        <meshStandardMaterial color="#111" {...std} />
      </mesh>
      {/* 5 dual wheels r.6 hub .15 — 24+ seg, opaque */}
      {[-5.0, -3.8, -2.6, 3.2, 4.4].map((x, i) =>
        [-0.8, 0.8].map((z, j) => (
          <group key={`${i}-${j}`} position={[x, 0.6, z]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.6, 0.6, 0.3, 32]} />
              <meshStandardMaterial color="#101010" {...std} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.15, 0.15, 0.32, 16]} />
              <meshStandardMaterial color="#8A8A8A" {...std} />
            </mesh>
          </group>
        )),
      )}
      {/* fuel tanks — 2 cyl r.3 len1.2 #9A9A9A at (2.2,1.0,±.95), attached */}
      {[-0.95, 0.95].map((z, i) => (
        <mesh key={i} name="TANK" position={[2.2, 1.0, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
          <meshStandardMaterial color="#9A9A9A" {...std} />
        </mesh>
      ))}
      {/* exhaust (0.08,.9,.08) @ (3.0,2.9,.6) */}
      <mesh position={[3.0, 2.9, 0.6]}>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 12]} />
        <meshStandardMaterial color="#111" {...std} />
      </mesh>
    </group>
  )
}

export default function TruckScene({ scrub }: { scrub?: ScrubRef }) {
  const ribT = useMemo(rib, [])
  const blobT = useMemo(shadowBlob, [])
  const wordT = useMemo(bgWords, [])
  const mainWheels = useRef<Array<THREE.Object3D | null>>([]) as WheelRefs
  const grp = useRef<THREE.Group>(null)
  const truckDrive = useRef<THREE.Group>(null)
  const truckPass = useRef<THREE.Group>(null)
  const bgText = useRef<THREE.Mesh>(null)
  const dashGroup = useRef<THREE.Group>(null)

  useFrame(() => {
    const p = scrub?.current ?? 0
    // GLB truck wheels spin with the scrub
    mainWheels.current.forEach((w) => w && (w.rotation.z = p * -18))
    // dashes + bg move as the trucks roll
    if (dashGroup.current) dashGroup.current.position.x = -p * 36
    if (bgText.current) bgText.current.position.x = (p - 0.5) * 10
    // v21 continuity — truck arrives from the terminal: x -16 → 0 during p 0→.15 (ease-out),
    // idles mid-scrub, exits right p .85→1 (existing). Drive on an outer wrapper so the
    // VisualTest framing target stays at rest.
    const pEnt = Math.min(Math.max(p / 0.15, 0), 1)
    const easeEnt = 1 - Math.pow(1 - pEnt, 3)
    const enterX = THREE.MathUtils.lerp(-16, 0, easeEnt)
    const pE = Math.min(Math.max((p - 0.85) / 0.15, 0), 1)
    const easeE = pE * pE * (3 - 2 * pE)
    if (truckDrive.current) truckDrive.current.position.x = enterX + 1.0 * easeE
    // PASSING drives one continuous pass, one group x +10→-16
    if (truckPass.current) truckPass.current.position.x = THREE.MathUtils.lerp(10, -16, p)

    if (import.meta.env.DEV) {
      const pass = truckPass.current
      if (pass) {
        console.assert(pass.children.length >= 8, `[SHOT3] passing group has only ${pass.children.length} children`)
        const tank = pass.getObjectByName('TANK')
        console.assert(tank && tank.parent === pass, '[SHOT3] fuel tanks must be parented to the passing truck')
      }
      if (bgText.current) console.assert(bgText.current.renderOrder === -1, '[SHOT3] bg text must render behind the trucks')
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

      {/* BG TEXT "UNDER ONE GROUP" — 3D plane at z -12, behind the trucks, never full-screen */}
      <mesh ref={bgText} position={[0, 1.7, -12]} renderOrder={-1}>
        <planeGeometry args={[26, 7.3]} />
        <meshBasicMaterial map={wordT} color="#D8D2C8" transparent opacity={0.3} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* floor dashes — move with the scrub */}
      <group ref={dashGroup}>
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} position={[-21 + i * 3, 0.02, 0]}>
            <boxGeometry args={[0.5, 0.02, 2.2]} />
            <meshBasicMaterial color="#e8e5df" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {/* PASSING — orange cab, scale .9, z -5.5, ONE group (all parts children) */}
      <group ref={truckPass} position={[10, 0, -5.5]} scale={0.9}>
        <TruckModel ribT={ribT} cabColor="#E8590C" />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -5.5]}>
        <planeGeometry args={[26, 6]} />
        <meshBasicMaterial map={blobT} transparent depthWrite={false} />
      </mesh>

      {/* MAIN — GLB truck (13 long) carrying the GLB container on its deck; drives in, idles, exits on the outer wrapper */}
      <group ref={grp} position={[0, 0.05, 0]}>
        <VisualTest label="TRUCK" target={() => grp.current} y={[175, 590]} x={[380, 1140]} />
        <group ref={truckDrive}>
          <TruckGLB wheels={mainWheels} />
          <ContainerGLB position={[0, 4.0, 0]} />
        </group>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[26, 6]} />
        <meshBasicMaterial map={blobT} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}