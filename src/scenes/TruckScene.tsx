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
  g.fillStyle = '#FAFAFA'
  g.fillRect(0, 0, 256, 128)
  g.fillStyle = '#C9C9C9'
  for (let x = 8; x < 256; x += 16) g.fillRect(x, 0, 4, 128)
  return new THREE.CanvasTexture(c)
}

function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useLayoutEffect(() => {
    camera.fov = 30
    camera.position.set(0, 2.4, 26)
    camera.lookAt(0, 1.8, 0)
    camera.updateProjectionMatrix()
  }, [])
  return null
}

export default function TruckScene() {
  const ribT = useMemo(rib, [])
  const wheels = useRef<THREE.Group>(null)
  const grp = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    wheels.current!.children.forEach((w) => (w.rotation.x = clock.elapsedTime * 3))
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
      <ContactShadows opacity={0.3} blur={3} scale={45} />

      <group ref={grp}>
        <VisualTest label="TRUCK" target={() => grp.current} y={[285, 505]} x={[270, 1030]} />
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[12.5, 0.4, 1.4]} />
          <meshStandardMaterial color="#111" {...std} />
        </mesh>
        <group ref={wheels}>
          {[-4.6, -3.4, -2.2, 3.6, 4.8].map((x, i) => (
            <group key={i} position={[x, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.5, 0.5, 0.35, 32]} />
                <meshStandardMaterial color="#141414" {...std} />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.18, 0.18, 0.37, 16]} />
                <meshStandardMaterial color="#9A9A9A" {...std} />
              </mesh>
            </group>
          ))}
        </group>
        <mesh position={[-1.75, 2.35, 0]}>
          <boxGeometry args={[9.5, 2.6, 2.4]} />
          <meshStandardMaterial color="#FAFAFA" map={ribT} {...std} />
        </mesh>
        <mesh position={[-1.75, 1.0, 0]}>
          <boxGeometry args={[9.5, 0.3, 2.2]} />
          <meshStandardMaterial color="#111" {...std} />
        </mesh>
        <mesh position={[4.4, 1.55, 0]}>
          <boxGeometry args={[2.4, 1.5, 2.2]} />
          <meshStandardMaterial color="#E8E8E8" {...std} />
        </mesh>
        <mesh position={[4.4, 2.45, 0]}>
          <boxGeometry args={[2.2, 0.3, 2.1]} />
          <meshStandardMaterial color="#E8E8E8" {...std} />
        </mesh>
        <mesh position={[5.55, 2.1, 0]} rotation={[0, 0, -0.28]}>
          <boxGeometry args={[0.12, 0.8, 2.0]} />
          <meshStandardMaterial color="#101418" {...std} />
        </mesh>
        <mesh position={[4.4, 2.0, -0.55]}>
          <planeGeometry args={[1.2, 0.5]} />
          <meshStandardMaterial color="#101418" {...std} />
        </mesh>
        <mesh position={[4.4, 2.0, 0.55]} rotation={[0, 0, 0]}>
          <planeGeometry args={[1.2, 0.5]} />
          <meshStandardMaterial color="#101418" {...std} />
        </mesh>
        <mesh position={[5.62, 1.3, 0]}>
          <boxGeometry args={[0.1, 0.6, 1.8]} />
          <meshStandardMaterial color="#101418" {...std} />
        </mesh>
        <mesh position={[3.2, 2.8, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 12]} />
          <meshStandardMaterial color="#111" {...std} />
        </mesh>
        <mesh position={[2.6, 1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 1, 16]} />
          <meshStandardMaterial color="#9A9A9A" {...std} />
        </mesh>
      </group>
    </group>
  )
}
