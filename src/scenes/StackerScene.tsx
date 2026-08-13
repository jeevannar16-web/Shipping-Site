import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'

const PIV = new THREE.Vector3(-2.6, 1.7, 0)

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

export default function StackerScene() {
  const ribT = useMemo(rib, [])
  const hazT = useMemo(hazard, [])
  const boom = useRef<THREE.Group>(null)
  const beam = useRef<THREE.Mesh>(null)
  const held = useRef<THREE.Mesh>(null)
  const spread = useRef<THREE.Mesh>(null)
  const grp = useRef<THREE.Group>(null)

  const path = useMemo(() => {
    const p = new THREE.CurvePath<THREE.Vector3>()
    const V = (x: number, y: number) => new THREE.Vector3(x, y, 0)
    p.add(new THREE.LineCurve3(V(-2.5, 1.3), V(-2.5, 9.6)))
    p.add(new THREE.LineCurve3(V(-2.5, 9.6), V(4.5, 9.6)))
    p.add(new THREE.LineCurve3(V(4.5, 9.6), V(4.5, 8.5)))
    return p
  }, [])

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime % 12) / 12
    const u = t < 0.5 ? t * 2 : (1 - t) * 2
    const pos = path.getPoint(u)
    held.current!.position.copy(pos)
    spread.current!.position.set(pos.x, pos.y + 1.35, 0)
    const tip = new THREE.Vector3(pos.x, pos.y + 1.7, 0)
    boom.current!.rotation.z = Math.atan2(tip.y - PIV.y, tip.x - PIV.x)
    const len = tip.distanceTo(PIV)
    beam.current!.scale.x = len
    beam.current!.position.x = len / 2
  })

  const std = { roughness: 0.9, metalness: 0 }

  return (
    <group>
      {/* studio cove floor — sibling of the measured group (pixel harness) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#E6E1D8" {...std} />
      </mesh>
      <ContactShadows position={[0, 0, 0]} opacity={0.45} blur={2.8} far={6} scale={30} />
      <group ref={grp}>
        <VisualTest label="STACKER" target={() => grp.current} y={[180, 540]} x={[200, 1080]} />
      <group position={[-4.5, 0, 0]}>
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[4.2, 1.5, 2]} />
          <meshStandardMaterial color="#1E6BB0" {...std} />
        </mesh>
        <mesh position={[1.5, 1.45, 0]}>
          <boxGeometry args={[1, 0.7, 1.9]} />
          <meshStandardMaterial color="#101418" {...std} />
        </mesh>
        {[[-1.5, -0.9], [-1.5, 0.9], [1.5, -0.9], [1.5, 0.9]].map((p, i) => (
          <mesh key={i} position={[p[0], 0.55, p[1]]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.3, 24]} />
            <meshStandardMaterial color="#141414" {...std} />
          </mesh>
        ))}
      </group>
      <group position={[PIV.x, PIV.y, 0]} ref={boom}>
        <mesh ref={beam}>
          <boxGeometry args={[1, 0.35, 0.5]} />
          <meshStandardMaterial color="#8a8a8a" {...std} />
        </mesh>
      </group>
      <mesh ref={spread}>
        <boxGeometry args={[1.8, 0.3, 0.6]} />
        <meshStandardMaterial map={hazT} {...std} />
      </mesh>
      <mesh ref={held}>
        <boxGeometry args={[5.5, 2.4, 2.4]} />
        <meshStandardMaterial color="#E8E8E8" map={ribT} {...std} />
      </mesh>
      <mesh position={[4.5, 1.2, 0]}>
        <boxGeometry args={[5.5, 2.4, 2.4]} />
        <meshStandardMaterial color="#24457A" {...std} />
      </mesh>
      <mesh position={[4.5, 3.6, 0]}>
        <boxGeometry args={[5.5, 2.4, 2.4]} />
        <meshStandardMaterial color="#B45A1E" {...std} />
      </mesh>
      <mesh position={[4.5, 6.0, 0]}>
        <boxGeometry args={[5.5, 2.4, 2.4]} />
        <meshStandardMaterial color="#D0D0D0" map={ribT} {...std} />
      </mesh>
      </group>
    </group>
  )
}