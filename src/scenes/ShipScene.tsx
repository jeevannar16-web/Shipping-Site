import { useMemo, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'
import type { ScrubRef } from '../lib/scrub'

const PAL = ['#B4362B', '#24457A', '#2E5B40', '#C46A2B', '#D0D0D0', '#6B2B8A']

/** v14.2 — ship camera (0,36,16) fov35 lookAt(0,0,0); do NOT pull back or rotate. */
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
    pos.setZ(i, (rng() - 0.5) * 0.5)
  }
  geo.computeVertexNormals()
  return geo
}

export default function ShipScene({ scrub }: { scrub?: ScrubRef }) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Group>(null)
  const deckRef = useRef<THREE.InstancedMesh>(null)
  const foamRef = useRef<THREE.InstancedMesh>(null)

  const hull = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-4.2, -13)
    s.lineTo(4.2, -13)
    s.lineTo(4.2, 13)
    s.lineTo(0, 17)
    s.lineTo(-4.2, 13)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 3.8, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  const noiseA = useMemo(() => makeNoise(Math.random), [])
  const noiseB = useMemo(() => makeNoise(Math.random), [])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    let i = 0
    // v14 deck — ONLY 1-2 high (x*7+z*3)%2
    for (let x = 0; x < 6; x++)
      for (let z = 0; z < 8; z++) {
        const h = 1 + ((x * 7 + z * 3) % 2)
        for (let k = 0; k < h; k++) {
          m.setPosition(-3.25 + x * 1.3, 3.22 + k * 1.22, -10 + z * 2.4)
          deckRef.current!.setMatrixAt(i, m)
          deckRef.current!.setColorAt(i, c.set(PAL[(x * 5 + z * 3 + k) % 6]))
          i++
        }
      }
    deckRef.current!.count = i
    deckRef.current!.instanceMatrix.needsUpdate = true
    if (deckRef.current!.instanceColor) deckRef.current!.instanceColor.needsUpdate = true

    // FOAM fleet — 220 small planes scattered along both hull sides
    const f = new THREE.Matrix4()
    for (let k = 0; k < 220; k++) {
      const side = Math.random() < 0.5 ? -1 : 1
      const s = 0.6 + Math.random() * 0.8
      f.makeScale(s, s, 1)
      f.setPosition(side * (4.4 + Math.random() * 1.0), 0.05, -16 + Math.random() * 32)
      foamRef.current!.setMatrixAt(k, f)
    }
    foamRef.current!.count = 220
    foamRef.current!.instanceMatrix.needsUpdate = true
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      const p = scrub?.current ?? 0
      groupRef.current.position.z = THREE.MathUtils.lerp(8, 1, p)
    }
  })

  const std = { roughness: 0.85, metalness: 0 }

  return (
    <group>
      <Rig />
      <color attach="background" args={['#1E56A0']} />
      <fog attach="fog" args={['#1E56A0', 60, 180]} />
      {/* ocean cove sphere — sibling of the traveling ship (pixel harness backdrop) */}
      <mesh scale={200}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#1E56A0" side={THREE.BackSide} />
      </mesh>
      {/* sea floor — sibling of the traveling ship (pixel harness backdrop) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#1E56A0" {...std} />
      </mesh>
      <mesh geometry={noiseA} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </mesh>
      <mesh geometry={noiseB} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <meshBasicMaterial color="#cfe4ff" transparent opacity={0.06} />
      </mesh>

      {/* traveling ship — everything is a child of groupRef so it moves together */}
      <group ref={groupRef}>
        <group ref={coreRef}>
          <mesh geometry={hull} position={[0, -1.2, 0]}>
            <meshStandardMaterial color="#14213D" {...std} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[8.6, 0.15, 26]} />
            <meshStandardMaterial color="#F2F2F2" {...std} />
          </mesh>
          <mesh position={[0, 0.1, -15]}>
            <boxGeometry args={[4.4, 0.1, 2]} />
            <meshStandardMaterial color="#14213D" {...std} />
          </mesh>
          <mesh position={[0, 2.7, 14.5]}>
            <boxGeometry args={[7, 0.2, 4]} />
            <meshStandardMaterial color="#D8D2C8" {...std} />
          </mesh>
          <instancedMesh ref={deckRef} args={[undefined as any, undefined as any, 200]}>
            <boxGeometry args={[1.25, 1.2, 2.3]} />
            <meshStandardMaterial {...std} />
          </instancedMesh>
          <mesh position={[0, 5.1, -11.5]}>
            <boxGeometry args={[7, 5, 2.4]} />
            <meshStandardMaterial color="#F2F2F2" {...std} />
          </mesh>
          <mesh position={[0, 6.9, -11.5]}>
            <boxGeometry args={[7, 0.6, 2.5]} />
            <meshStandardMaterial color="#101418" {...std} />
          </mesh>
          <mesh position={[0, 8, -11.5]}>
            <boxGeometry args={[1.2, 1.5, 1.2]} />
            <meshStandardMaterial color="#F2F2F2" {...std} />
          </mesh>
        </group>

        {/* bow V foam */}
        <mesh rotation={[-Math.PI / 2, 0, -0.5]} position={[1.6, 0.05, 15.5]}>
          <planeGeometry args={[2, 5]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0.5]} position={[-1.6, 0.05, 15.5]}>
          <planeGeometry args={[2, 5]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        {/* stern trail */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -20]}>
          <planeGeometry args={[2.5, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        {/* scattered foam fleet */}
        <instancedMesh ref={foamRef} args={[undefined as any, undefined as any, 220]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.22} side={THREE.DoubleSide} />
        </instancedMesh>
      </group>

      <VisualTest
        label="SHIP"
        target={() => coreRef.current}
        ship={{
          travel: [8, 1],
          points: [
            { at: 0, local: [0, 2.6, -17], tag: 'BOW@0' },
            { at: 1, local: [0, 5.1, -11.5], tag: 'BRIDGE@1' },
          ],
        }}
      />
    </group>
  )
}