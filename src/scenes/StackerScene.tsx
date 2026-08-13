import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'

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

function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useLayoutEffect(() => {
    camera.fov = 35
    camera.position.set(-8.5, 4.2, 16.5)
    camera.lookAt(0.6, 2.2, 0)
    camera.updateProjectionMatrix()
  }, [])
  return null
}

export default function StackerScene() {
  const ribT = useMemo(rib, [])
  const hazT = useMemo(hazard, [])
  const boom = useRef<THREE.Group>(null)
  const tele = useRef<THREE.Group>(null)
  const level = useRef<THREE.Group>(null)
  const grp = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime % 12) / 12
    const e = t < 0.5 ? t * 2 : (1 - t) * 2
    const u = THREE.MathUtils.smoothstep(e, 0, 1)
    const ang = THREE.MathUtils.lerp(0.35, 0.9, u)
    boom.current!.rotation.z = ang
    tele.current!.position.x = 5.4 + 0.8 * e
    level.current!.rotation.z = -ang
  })

  const std = { roughness: 0.9, metalness: 0 }

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

      <group ref={grp}>
        <VisualTest label="STACKER" target={() => grp.current} y={[95, 600]} x={[95, 1160]} />
        <group position={[-4.6, 0, 0]}>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[4.4, 1.4, 2]} />
            <meshStandardMaterial color="#1E6BB0" {...std} />
          </mesh>
          <mesh position={[1.5, 1.55, 0]}>
            <boxGeometry args={[1.2, 0.9, 1.9]} />
            <meshStandardMaterial color="#1E6BB0" {...std} />
          </mesh>
          <mesh position={[2.12, 1.55, 0]}>
            <boxGeometry args={[0.06, 0.5, 1.6]} />
            <meshStandardMaterial color="#101418" {...std} />
          </mesh>
          <mesh position={[2.3, 0.5, 0]}>
            <boxGeometry args={[0.2, 0.4, 2]} />
            <meshStandardMaterial color="#111" {...std} />
          </mesh>
          <mesh position={[-2.0, 1.7, 0]}>
            <boxGeometry args={[0.15, 0.3, 0.15]} />
            <meshStandardMaterial color="#111" {...std} />
          </mesh>
          {[
            [-1.5, -0.9],
            [-1.5, 0.9],
            [1.5, -0.9],
            [1.5, 0.9],
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
<group ref={boom} position={[-2.5, 1.5, 0]}>
            <mesh position={[2.7, 0, 0]}>
              <boxGeometry args={[5.4, 0.35, 0.45]} />
              <meshStandardMaterial color="#8A8A8A" {...std} />
            </mesh>
            <group ref={tele} position={[5.4, 0, 0]}>
              <mesh>
                <boxGeometry args={[3, 0.28, 0.4]} />
                <meshStandardMaterial color="#A8A8A8" {...std} />
              </mesh>
              <group ref={level} position={[1.5, -0.45, 0]}>
                <mesh>
                  <boxGeometry args={[1.9, 0.25, 2.3]} />
                  <meshStandardMaterial map={hazT} {...std} />
                </mesh>
                <mesh position={[0, -1.35, 0]}>
                  <boxGeometry args={[5.6, 2.3, 2.3]} />
                  <meshStandardMaterial map={ribT} color="#EDEDED" roughness={0.85} metalness={0} transparent={false} opacity={1} depthWrite={true} />
                </mesh>
              </group>
            </group>
          </group>
        <mesh position={[7.2, 1.15, 0]}>
          <boxGeometry args={[5.6, 2.3, 2.3]} />
          <meshStandardMaterial color="#24457A" map={ribT} {...std} />
        </mesh>
        <mesh position={[7.2, 3.45, 0]}>
          <boxGeometry args={[5.6, 2.3, 2.3]} />
          <meshStandardMaterial color="#B45A1E" map={ribT} {...std} />
        </mesh>
        <mesh position={[7.2, 5.75, 0]}>
          <boxGeometry args={[5.6, 2.3, 2.3]} />
          <meshStandardMaterial color="#D8D2C8" map={ribT} {...std} />
        </mesh>
      </group>
    </group>
  )
}
