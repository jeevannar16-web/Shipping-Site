import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { TruckGLB, ContainerGLB, type WheelRefs } from '../components/Models'
import type { ScrubRef } from '../lib/scrub'

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

function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useLayoutEffect(() => {
    camera.fov = 40
    camera.position.set(0, 6, 42)
    camera.lookAt(0, 1.8, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

export default function TruckScene({ scrub }: { scrub?: ScrubRef }) {
  const blobT = useMemo(shadowBlob, [])
  const wordT = useMemo(bgWords, [])
  const mainWheels = useRef<Array<THREE.Object3D | null>>([]) as WheelRefs
  const passWheels = useRef<Array<THREE.Object3D | null>>([]) as WheelRefs
  const truckDrive = useRef<THREE.Group>(null)
  const truckPass = useRef<THREE.Group>(null)
  const bgText = useRef<THREE.Mesh>(null)
  const dashGroup = useRef<THREE.Group>(null)
  const chassisAnchor = useRef<THREE.Vector3>(new THREE.Vector3())

  useFrame(() => {
    const p = scrub?.current ?? 0
    mainWheels.current.forEach((w) => w && (w.rotation.z = p * -18))
    passWheels.current.forEach((w) => w && (w.rotation.z = p * -18))
    if (dashGroup.current) dashGroup.current.position.x = -p * 36
    if (bgText.current) bgText.current.position.x = (p - 0.5) * 10

    const pEnt = Math.min(Math.max(p / 0.15, 0), 1)
    const easeEnt = 1 - Math.pow(1 - pEnt, 3)
    const enterX = THREE.MathUtils.lerp(-16, 0, easeEnt)
    const pE = Math.min(Math.max((p - 0.85) / 0.15, 0), 1)
    const easeE = pE * pE * (3 - 2 * pE)
    if (truckDrive.current) {
      truckDrive.current.position.x = enterX + 1.0 * easeE
      if (import.meta.env.DEV && mainWheels.current[0]) {
        const wp = mainWheels.current[0].getWorldPosition(new THREE.Vector3())
        const ca = chassisAnchor.current
        console.assert(wp.distanceTo(ca) < 0.5, `[SHOT3] wheel detached: dist=${wp.distanceTo(ca).toFixed(3)}`)
      }
    }
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

      <mesh ref={bgText} position={[0, 1.7, -12]} renderOrder={-1}>
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

      {/* PASSING — orange cab tint, silver ribbed trailer, scale .9, z -5.5 */}
      <group ref={truckPass} position={[10, 0, -5.5]} scale={0.9}>
        <TruckGLB wheels={passWheels} tint="#E8590C" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[14, 5]} />
          <meshBasicMaterial map={blobT} transparent depthWrite={false} />
        </mesh>
      </group>

      {/* MAIN — GLB truck carrying ContainerGLB, enters from left, exits right */}
      <group ref={truckDrive} position={[-16, 0, 0]}>
        <TruckGLB wheels={mainWheels} tint="#3A3D42" />
        <ContainerGLB position={[0, 4.0, 0]} tint="#E8E8E8" />
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
