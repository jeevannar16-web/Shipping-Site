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
  const { camera } = useThree()
  useLayoutEffect(() => {
    camera.position.set(0, 2.6, 20)
    camera.lookAt(0, 1.9, 0)
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
      <color attach="background" args={['#E6E1D8']} />
      <fog attach="fog" args={['#E6E1D8', 30, 90]} />
      {/* studio cove floor + contact shadow — siblings of the measured group (pixel harness) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#E6E1D8" {...std} />
      </mesh>
      <ContactShadows opacity={0.3} blur={3} scale={40} />

      <group ref={grp}>
        <VisualTest label="TRUCK" target={() => grp.current} y={[260, 480]} x={[270, 950]} />
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[13, 0.5, 1.6]} />
          <meshStandardMaterial color="#111" {...std} />
        </mesh>
        <group ref={wheels}>
          {[-4.8, -3.6, -2.4, 3.8, 5.0].map((x, i) => (
            <group key={i} position={[x, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.55, 0.55, 0.35, 24]} />
                <meshStandardMaterial color="#141414" {...std} />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.2, 0.2, 0.37, 16]} />
                <meshStandardMaterial color="#9A9A9A" {...std} />
              </mesh>
            </group>
          ))}
        </group>
        <mesh position={[-1.75, 2.1, 0]}>
          <boxGeometry args={[9.5, 2.6, 2.4]} />
          <meshStandardMaterial color="#FAFAFA" map={ribT} {...std} />
        </mesh>
        <mesh position={[4.4, 1.7, 0]}>
          <boxGeometry args={[2.4, 2, 2.2]} />
          <meshStandardMaterial color="#E8E8E8" {...std} />
        </mesh>
        <mesh position={[5.0, 2.2, 0]}>
          <boxGeometry args={[1, 0.6, 2.1]} />
          <meshStandardMaterial color="#101418" {...std} />
        </mesh>
        <mesh position={[3.3, 3, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 12]} />
          <meshStandardMaterial color="#111" {...std} />
        </mesh>
      </group>
    </group>
  )
}
