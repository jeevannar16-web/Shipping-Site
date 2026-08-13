import { useMemo, useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'

const PAL = ['#B4362B', '#24457A', '#2E5B40', '#C46A2B', '#D0D0D0', '#6B2B8A']

function Rig() {
  const { camera } = useThree()
  useLayoutEffect(() => {
    camera.position.set(0, 30, 20)
    camera.lookAt(0, 0, 1)
  }, [])
  return null
}

export default function ShipScene() {
  const inst = useRef<THREE.InstancedMesh>(null)
  const grp = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    let i = 0
    for (let x = 0; x < 6; x++)
      for (let z = 0; z < 8; z++) {
        const h = 1 + ((x * 7 + z * 3) % 3)
        for (let k = 0; k < h; k++) {
          m.setPosition(-3.25 + x * 1.3, 3.22 + k * 1.22, -10 + z * 2.4)
          inst.current!.setMatrixAt(i, m)
          inst.current!.setColorAt(i, c.set(PAL[(x * 5 + z * 3 + k) % 6]))
          i++
        }
      }
    inst.current!.count = i
    inst.current!.instanceMatrix.needsUpdate = true
    if (inst.current!.instanceColor) inst.current!.instanceColor.needsUpdate = true
  }, [])

  const hull = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-4, -13)
    s.lineTo(4, -13)
    s.lineTo(4, 13)
    s.lineTo(0, 17)
    s.lineTo(-4, 13)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 3.8, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  const std = { roughness: 0.85, metalness: 0 }

  return (
    <group>
      <Rig />
      <color attach="background" args={['#1E56A0']} />
      <fog attach="fog" args={['#1E56A0', 60, 160]} />
      {/* sea floor — sibling of the measured group (pixel harness) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#1E56A0" {...std} />
      </mesh>
      {/* far stern wake — backdrop sibling (out of measured group) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -20]}>
        <planeGeometry args={[3, 14]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.3} />
      </mesh>

      <group ref={grp}>
        <VisualTest label="SHIP" target={() => grp.current} y={[40, 700]} x={[480, 800]} />
        <mesh geometry={hull} position={[0, -1.2, 0]}>
          <meshStandardMaterial color="#14213D" {...std} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[8.2, 0.15, 26]} />
          <meshStandardMaterial color="#F2F2F2" {...std} />
        </mesh>
        <mesh position={[0, 5.1, -11.5]}>
          <boxGeometry args={[7, 5, 2.4]} />
          <meshStandardMaterial color="#F2F2F2" {...std} />
        </mesh>
        <mesh position={[0, 6.9, -11.5]}>
          <boxGeometry args={[7, 0.6, 2.5]} />
          <meshStandardMaterial color="#101418" {...std} />
        </mesh>
        <instancedMesh ref={inst} args={[undefined as any, undefined as any, 200]}>
          <boxGeometry args={[1.25, 1.2, 2.3]} />
          <meshStandardMaterial {...std} />
        </instancedMesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.6, 0.05, -2]}>
          <planeGeometry args={[1.2, 30]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.25} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.6, 0.05, -2]}>
          <planeGeometry args={[1.2, 30]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.25} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.8, 0.05, 15]}>
          <planeGeometry args={[2.5, 6]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, -0.5]} position={[1.8, 0.05, 15]}>
          <planeGeometry args={[2.5, 6]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  )
}
