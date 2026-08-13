import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'

const PAL = ['#B4362B', '#24457A', '#2E5B40', '#C46A2B', '#D0D0D0', '#6B2B8A']
const std = { roughness: 0.85, metalness: 0 }

export default function ShipScene() {
  const inst = useRef<THREE.InstancedMesh>(null)
  const grp = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    let i = 0
    for (let x = 0; x < 6; x++) {
      for (let z = 0; z < 10; z++) {
        const h = 1 + ((x * 7 + z * 3) % 3)
        for (let k = 0; k < h; k++) {
          m.setPosition(-3 + x * 1.2, 3.2 + k * 1.22, -9 + z * 2.2)
          inst.current!.setMatrixAt(i, m)
          inst.current!.setColorAt(i, c.set(PAL[(x * 5 + z * 3 + k) % 6]))
          i++
        }
      }
    }
    inst.current!.count = i
    inst.current!.instanceMatrix.needsUpdate = true
    if (inst.current!.instanceColor) inst.current!.instanceColor.needsUpdate = true
  }, [])

  const hull = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-3.5, -11)
    s.lineTo(3.5, -11)
    s.lineTo(3.5, 11)
    s.lineTo(0, 16)
    s.lineTo(-3.5, 11)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 3.8, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  return (
    <group>
      {/* sea floor — sibling of the measured group (pixel harness) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#1E56A0" {...std} />
      </mesh>
      <group ref={grp}>
      <VisualTest label="SHIP" target={() => grp.current} y={[150, 600]} x={[300, 980]} />
      <mesh geometry={hull} position={[0, -1.2, 0]} rotation-y={Math.PI}>
        <meshStandardMaterial color="#14213D" {...std} />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <boxGeometry args={[7.1, 0.15, 22]} />
        <meshStandardMaterial color="#F2F2F2" {...std} />
      </mesh>
      <mesh position={[0, 5.0, -9.5]}>
        <boxGeometry args={[6, 4.5, 2.2]} />
        <meshStandardMaterial color="#F2F2F2" {...std} />
      </mesh>
      <mesh position={[0, 6.6, -9.5]}>
        <boxGeometry args={[6, 0.5, 2.3]} />
        <meshStandardMaterial color="#101418" {...std} />
      </mesh>
      <instancedMesh ref={inst} args={[undefined as any, undefined as any, 200]}>
        <boxGeometry args={[1.14, 1.2, 2.14]} />
        <meshStandardMaterial {...std} />
      </instancedMesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 15]}>
        <planeGeometry args={[7, 6]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.2, 0.06, -2]}>
        <planeGeometry args={[1.1, 26]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.2, 0.06, -2]}>
        <planeGeometry args={[1.1, 26]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.3} />
      </mesh>
      </group>
    </group>
  )
}