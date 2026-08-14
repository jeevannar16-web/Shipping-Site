import { useLayoutEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'
import type { ScrubRef } from '../lib/scrub'

/** v19 SHOT 7 — vivid 7-tone container palette. */
const PAL = ['#D64545', '#2456B0', '#2E8B57', '#F2C230', '#7048E8', '#F1F0EE', '#E8590C']

/** v19 SHOT 7 — ship camera FIXED (0,36,16), lookAt (0,0,0), fov 35. */
function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useLayoutEffect(() => {
    camera.fov = 35
    camera.position.set(0, 36, 16)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

function makeNoise(rng: () => number) {
  const geo = new THREE.PlaneGeometry(26, 40, 24, 32)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    pos.setZ(i, (rng() - 0.5) * 0.1)
  }
  geo.computeVertexNormals()
  return geo
}

/** v19 — pointed bow, length 30, width 9.4, #101820. Bow at local z +17 (near), stern -13 (far). */
const hull = (() => {
  const s = new THREE.Shape()
  s.moveTo(-4.7, 13)
  s.lineTo(4.7, 13)
  s.lineTo(0, -17)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.8, bevelEnabled: false })
  g.rotateX(-Math.PI / 2)
  return g
})()

export default function ShipScene({ scrub }: { scrub?: ScrubRef }) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Group>(null)
  const deckRef = useRef<THREE.InstancedMesh>(null)
  const [rotY, setRotY] = useState(0)

  // BOW-UP AUTO-FLIP — project bow tip (0,0,17) and bridge (0,5,-11.5) for rotY ∈ {0, π}
  useLayoutEffect(() => {
    const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 1000)
    camera.position.set(0, 36, 16)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    const screenY = (ry: number, q: [number, number, number]) => {
      const x = Math.cos(ry) * q[0] + Math.sin(ry) * q[2]
      const z = -Math.sin(ry) * q[0] + Math.cos(ry) * q[2]
      const w = new THREE.Vector3(x, q[1], z + 10).project(camera)
      return (1 - w.y) * 400
    }
    const bow0 = screenY(0, [0, 0, 17])
    const bridge0 = screenY(0, [0, 5, -11.5])
    const bowP = screenY(Math.PI, [0, 0, 17])
    const bridgeP = screenY(Math.PI, [0, 5, -11.5])
    const chosen = bowP < bridgeP ? Math.PI : 0
    setRotY(chosen)
    const b = chosen === Math.PI ? bowP : bow0
    const g = chosen === Math.PI ? bridgeP : bridge0
    if (import.meta.env.DEV) {
      console.assert(b < g, `[SHOT7] auto-flip chosen rotY=${chosen} but bow is NOT up-frame`)
      console.assert(chosen === Math.PI, '[SHOT7] bow-up means rotY=PI')
    }
  }, [])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    let i = 0
    for (let x = 0; x < 6; x++)
      for (let z = 0; z < 8; z++) {
        const h = 1 + ((x * 7 + z * 3) % 2)
        for (let k = 0; k < h; k++) {
          m.setPosition(-3.25 + x * 1.3, 1.6 + k * 1.22, -9 + z * 2.4)
          deckRef.current!.setMatrixAt(i, m)
          deckRef.current!.setColorAt(i, c.set(PAL[(x * 5 + z * 3 + k) % 7]))
          i++
        }
      }
    deckRef.current!.count = i
    deckRef.current!.instanceMatrix.needsUpdate = true
    if (deckRef.current!.instanceColor) deckRef.current!.instanceColor.needsUpdate = true
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotY
      // scrub shipGroup.position.z lerp(10,1,p)
      groupRef.current.position.z = THREE.MathUtils.lerp(10, 1, scrub?.current ?? 0)
    }
  })

  const std = { roughness: 0.85, metalness: 0 }

  return (
    <group>
      <Rig />
      <color attach="background" args={['#1565C0']} />
      <fog attach="fog" args={['#1565C0', 60, 180]} />
      {/* ocean cove sphere — sibling of the traveling ship (pixel harness backdrop) */}
      <mesh scale={200}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#1565C0" side={THREE.BackSide} />
      </mesh>
      {/* vivid sea floor + .10 noise — siblings of the traveling ship */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#1565C0" {...std} />
      </mesh>
      <mesh geometry={makeNoise(Math.random)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
      <mesh geometry={makeNoise(Math.random)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <meshBasicMaterial color="#cfe4ff" transparent opacity={0.06} />
      </mesh>

      {/* traveling ship — rotY auto-flipped bow-up, z lerp(10,1) */}
      <group ref={groupRef}>
        <group ref={coreRef}>
          <mesh geometry={hull} position={[0, -1.8, 0]}>
            <meshStandardMaterial color="#101820" {...std} />
          </mesh>
          {/* white waterline band around the upper hull */}
          <mesh position={[0, -0.1, 2]}>
            <boxGeometry args={[9.55, 0.22, 29]} />
            <meshStandardMaterial color="#F1F0EE" {...std} />
          </mesh>
          <mesh position={[0, 1.0, -1.5]}>
            <boxGeometry args={[9.6, 0.15, 17]} />
            <meshStandardMaterial color="#E8E6E2" {...std} />
          </mesh>
          {/* deck — 6×8 containers, heights 1–2, 7-tone palette */}
          <instancedMesh ref={deckRef} args={[undefined as any, undefined as any, 200]}>
            <boxGeometry args={[1.25, 1.2, 2.3]} />
            <meshStandardMaterial {...std} />
          </instancedMesh>
          {/* tall white bridge + black band at the stern */}
          <mesh position={[0, 3.5, -11.5]}>
            <boxGeometry args={[7, 7, 2.4]} />
            <meshStandardMaterial color="#F1F0EE" {...std} />
          </mesh>
          <mesh position={[0, 6.9, -11.5]}>
            <boxGeometry args={[7.2, 0.8, 2.6]} />
            <meshStandardMaterial color="#101418" {...std} />
          </mesh>
          <mesh position={[0, 8.2, -11.5]}>
            <boxGeometry args={[1.2, 1.6, 1.2]} />
            <meshStandardMaterial color="#F1F0EE" {...std} />
          </mesh>
        </group>

        {/* bow V + stern trail */}
        <mesh rotation={[-Math.PI / 2, 0, -0.5]} position={[1.6, 0.05, 15]}>
          <planeGeometry args={[2, 5]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0.5]} position={[-1.6, 0.05, 15]}>
          <planeGeometry args={[2, 5]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -12]}>
          <planeGeometry args={[2.5, 10]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* 400 instanced white foam quads (.4–1.2, opacity .2–.5) hugging hull sides */}
        <FoamQuads />
      </group>

      <VisualTest
        label="SHIP"
        target={() => coreRef.current}
        ship={{
          travel: [10, 1],
          points: [
            { at: 0, local: [0, 1, -17], tag: 'BOW@0' },
            { at: 1, local: [0, 3, -1], tag: 'BRIDGE@1' },
          ],
        }}
      />
    </group>
  )
}

/** 400 instanced foam quads (.4–1.2 sizes, opacity .2–.5) hugging the hull sides + wakes. */
function FoamQuads() {
  const refs = useRef<Array<THREE.InstancedMesh | null>>([])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    for (let k = 0; k < 400; k++) {
      const side = Math.random() < 0.5 ? -1 : 1
      const s = 0.4 + Math.random() * 0.8
      e.set(0, Math.random() * Math.PI, 0)
      q.setFromEuler(e)
      m.compose(new THREE.Vector3(side * (4.9 + Math.random() * 0.8), 0.05, -12 + Math.random() * 28), q, new THREE.Vector3(s, s, 1))
      const idx = k % 4
      refs.current[idx]!.setMatrixAt(Math.floor(k / 4), m)
    }
    refs.current.forEach((r) => {
      r!.count = 100
      r!.instanceMatrix.needsUpdate = true
    })
  }, [])
  return (
    <group>
      {[0.2, 0.3, 0.4, 0.5].map((op, i) => (
        <instancedMesh key={i} ref={(el) => (refs.current[i] = el)} args={[undefined as any, undefined as any, 100]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={op} side={THREE.DoubleSide} />
        </instancedMesh>
      ))}
    </group>
  )
}