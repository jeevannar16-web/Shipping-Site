import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ProceduralTruck, shadowBlob, roughMap, dashWhite, RoadStrip, type WheelRefs } from './builders'
import { useCompact } from '../lib/media'
import type { ScrubRef } from '../lib/scrub'

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
  const TEXT = 'UNDER ONE GROUP'
  let size = 150
  while (size > 24 && g.measureText(TEXT).width > 1024 - 24) {
    size -= 2
    g.font = `800 ${size}px Archivo, Arial, sans-serif`
  }
  g.fillText(TEXT, 512, 128)
  const t = new THREE.CanvasTexture(c)
  return t
}

function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const compact = useCompact()
  useLayoutEffect(() => {
    camera.fov = compact ? 46 : 38
    camera.position.set(0, compact ? 5.2 : 4.5, compact ? 38 : 34)
    camera.lookAt(0, 2, 0)
    camera.updateProjectionMatrix()
  }, [camera, compact])
  return null
}

export default function TruckScene({ scrub }: { scrub?: ScrubRef }) {
  const blobT = useMemo(shadowBlob, [])
  const wordT = useMemo(bgWords, [])
  const roughT = useMemo(roughMap, [])
  const dashT = useMemo(dashWhite, [])
  const mainWheels = useRef<Array<THREE.Object3D | null>>([]) as WheelRefs
  const passWheels = useRef<Array<THREE.Object3D | null>>([]) as WheelRefs
  const truckDrive = useRef<THREE.Group>(null)
  const truckPass = useRef<THREE.Group>(null)
  const bgText = useRef<THREE.Mesh>(null)
  const dashGroup = useRef<THREE.Group>(null)
  const chassisAnchor = useRef<THREE.Vector3>(new THREE.Vector3())

  useFrame(() => {
    const p = scrub?.current ?? 0
    mainWheels.current.forEach((w: THREE.Object3D | null) => w && (w.rotation.y = p * -18))
    passWheels.current.forEach((w: THREE.Object3D | null) => w && (w.rotation.y = p * -18))
    if (dashGroup.current) dashGroup.current.position.x = -p * 36
    if (bgText.current) bgText.current.position.x = (p - 0.5) * 10

    const pEnt = Math.min(Math.max(p / 0.15, 0), 1)
    const easeEnt = 1 - Math.pow(1 - pEnt, 3)
    const enterX = THREE.MathUtils.lerp(-24, 0, easeEnt)
    const pE = Math.min(Math.max((p - 0.85) / 0.15, 0), 1)
    const easeE = pE * pE * (3 - 2 * pE)
    if (truckDrive.current) {
      // R9: full-size drive-off (constant world scale 1), exits fully off-frame to the right.
      const exitX = THREE.MathUtils.lerp(0, 34, easeE)
      truckDrive.current.position.x = enterX + exitX
      truckDrive.current.scale.setScalar(1)
      if (import.meta.env.DEV && mainWheels.current[0]) {
        const wp = mainWheels.current[0].getWorldPosition(new THREE.Vector3())
        const ca = chassisAnchor.current
        console.assert(wp.distanceTo(ca) < 0.5, `[SHOT3] wheel detached: dist=${wp.distanceTo(ca).toFixed(3)}`)
      }
    }
    if (truckPass.current) {
      truckPass.current.position.x = THREE.MathUtils.lerp(10, -28, p)
    }

    if (import.meta.env.DEV) {
      const pass = truckPass.current
      if (pass) {
        console.assert(pass.children.length >= 8, `[SHOT3] passing group has only ${pass.children.length} children`)
      }
      if (bgText.current) console.assert(bgText.current.renderOrder === -1, '[SHOT3] bg text must render behind the trucks')
    }
  })

  useLayoutEffect(() => {
    if (truckDrive.current && mainWheels.current[0]) {
      chassisAnchor.current.copy(mainWheels.current[0].getWorldPosition(new THREE.Vector3()))
    }
  }, [])

  return (
    <group>
      <Rig />
      <color attach="background" args={['#FAF9F7']} />
      <fog attach="fog" args={['#FAF9F7', 25, 70]} />
      <mesh scale={200}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#FAF9F7" side={THREE.BackSide} />
      </mesh>

      {/* R13: shared straight lane — same corridor (dash at z=0, edges at ±LANE) as the stacker scene */}
        <RoadStrip
          length={72}
          width={18}
          position={[5, 0, 0]}
          roughT={roughT}
          dashT={dashT}
        />
      {/* R11: white guide dashes — the main truck follows this strip down the lane */}
      <mesh ref={bgText} position={[0, 6, -12]} renderOrder={-1}>
        <planeGeometry args={[26, 7.3]} />
        <meshBasicMaterial map={wordT} color="#D8D2C8" transparent opacity={0.3} depthWrite={false} toneMapped={false} />
      </mesh>

      <group ref={dashGroup}>
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} position={[-21 + i * 3, 0.02, 0]}>
            <boxGeometry args={[0.5, 0.02, 2.2]} />
            <meshBasicMaterial color="#e8e5df" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {/* PASSING — orange cab, silver ribbed trailer, scale .9, z -5.5 */}
      <group ref={truckPass} position={[10, 0, -5.5]} scale={0.9} rotation={[0, Math.PI / 2, 0]}>
        <ProceduralTruck wheelRefs={passWheels} driving={false} bob={false} cabColor="#E8590C" trailerColor="#E3E2DF" ribColor="#C9C8C4" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[14, 5]} />
          <meshBasicMaterial map={blobT} transparent depthWrite={false} />
        </mesh>
      </group>

      {/* MAIN — silver semi with ribbed trailer, enters from left, exits right */}
      <group ref={truckDrive} position={[-16, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ProceduralTruck wheelRefs={mainWheels} driving={false} bob={false} cabColor="#3A3D42" trailerColor="#E3E2DF" ribColor="#C9C8C4" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[15, 5]} />
          <meshBasicMaterial map={blobT} transparent depthWrite={false} />
        </mesh>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[26, 6]} />
        <meshBasicMaterial map={blobT} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}
