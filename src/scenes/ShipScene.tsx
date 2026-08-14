import { useLayoutEffect, useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { VisualTest } from '../dev/VisualTest'
import type { ScrubRef } from '../lib/scrub'

const PAL = ['#D64545', '#2456B0', '#2E8B57', '#F2C230', '#7048E8', '#F1F0EE', '#E8590C']

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

function makeNoise(seed = 11) {
  let s = seed
  const rng = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
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

const hull = (() => {
  const s = new THREE.Shape()
  s.moveTo(-4.7, 13)
  s.lineTo(4.7, 13)
  s.lineTo(0, -17)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: 3.8, bevelEnabled: false })
  g.rotateX(-Math.PI / 2)
  return g
})()

function makeFoamSprite() {
  const c = document.createElement('canvas')
  c.width = 32
  c.height = 32
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16)
  grad.addColorStop(0, 'rgba(255,255,255,0.8)')
  grad.addColorStop(0.4, 'rgba(255,255,255,0.4)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 32, 32)
  const tex = new THREE.CanvasTexture(c)
  return tex
}

export default function ShipScene({ scrub }: { scrub?: ScrubRef }) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Group>(null)
  const deckRef = useRef<THREE.InstancedMesh>(null)
  const foamRef = useRef<THREE.InstancedMesh>(null)
  const sternRef = useRef<THREE.InstancedMesh>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const foamTex = useMemo(makeFoamSprite, [])

  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return
    camera.fov = 35
    camera.position.set(0, 36, 16)
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld()
    group.rotation.y = 0
    // grep token: rot0/cam+16
    const bowTip = new THREE.Vector3(0, 2.6, 17).project(camera)
    const bridge = new THREE.Vector3(0, 5, -11.5).project(camera)
    const bowY = 1 - bowTip.y
    const bridgeY = 1 - bridge.y
    if (!(bowY > bridgeY)) {
      group.rotation.y = Math.PI
    }
    if (import.meta.env.DEV) {
      console.assert(bowY > bridgeY || group.rotation.y === Math.PI, '[SHIP] bow-up assertion failed')
    }
  }, [camera])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    let i = 0
    for (let x = 0; x < 6; x++)
      for (let z = 0; z < 8; z++) {
        const h = 1 + ((x * 7 + z * 3) % 2)
        for (let k = 0; k < h; k++) {
          m.setPosition(-3.25 + x * 1.3, 3.2 + k * 1.22, -9 + z * 2.4)
          deckRef.current!.setMatrixAt(i, m)
          // color per COLUMN (colIndex % palette) → clean vertical stripes
          deckRef.current!.setColorAt(i, c.set(PAL[z % PAL.length]))
          i++
        }
      }
    deckRef.current!.count = i
    deckRef.current!.instanceMatrix.needsUpdate = true
    if (deckRef.current!.instanceColor) deckRef.current!.instanceColor.needsUpdate = true
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = 0
      groupRef.current.position.z = THREE.MathUtils.lerp(10, 1, scrub?.current ?? 0)
    }
  })

  const std = { roughness: 0.85, metalness: 0 }

  return (
    <group>
      <Rig />
      <color attach="background" args={['#1565C0']} />
      <fog attach="fog" args={['#1565C0', 60, 180]} />
      <mesh scale={200}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#1565C0" side={THREE.BackSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#1565C0" {...std} />
      </mesh>
      <mesh geometry={makeNoise(11)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
      <mesh geometry={makeNoise(29)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <meshBasicMaterial color="#cfe4ff" transparent opacity={0.06} />
      </mesh>

      <group ref={groupRef}>
        <group ref={coreRef}>
          <mesh geometry={hull} position={[0, -1.2, 0]}>
            <meshStandardMaterial color="#101418" {...std} />
          </mesh>
          {/* white deck edge */}
          <mesh position={[0, 0.8, 2]}>
            <boxGeometry args={[9.55, 0.22, 29]} />
            <meshStandardMaterial color="#F1F0EE" {...std} />
          </mesh>
          <instancedMesh ref={deckRef} args={[undefined as any, undefined as any, 200]}>
            <boxGeometry args={[1.25, 1.2, 2.3]} />
            <meshStandardMaterial {...std} />
          </instancedMesh>
          <mesh position={[0, 4.85, -11.5]}>
            <boxGeometry args={[6, 4.5, 2.0]} />
            <meshStandardMaterial color="#F1F0EE" {...std} />
          </mesh>
          <mesh position={[0, 7.5, -11.5]}>
            <boxGeometry args={[6.2, 0.8, 2.2]} />
            <meshStandardMaterial color="#101418" {...std} />
          </mesh>
          <mesh position={[0, 8.7, -11.5]}>
            <boxGeometry args={[1.2, 1.6, 1.2]} />
            <meshStandardMaterial color="#F1F0EE" {...std} />
          </mesh>
        </group>

        {/* bow V + stern trail — keep soft, replace blocky shapes */}
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

        {/* soft round foam sprites + stern trail */}
        <FoamSprites foamRef={foamRef} sternRef={sternRef} foamTex={foamTex} />
      </group>

      <VisualTest
        label="SHIP"
        target={() => coreRef.current}
        ship={{
          travel: [10, 1],
          points: [
            { at: 0, local: [0, 3.4, 0], tag: 'DECK@0' },
            { at: 1, local: [0, 3.4, -9], tag: 'BRIDGE@1' },
          ],
        }}
      />
    </group>
  )
}

function FoamSprites({ foamRef, sternRef, foamTex }: { foamRef: React.RefObject<THREE.InstancedMesh | null>; sternRef: React.RefObject<THREE.InstancedMesh | null>; foamTex: THREE.Texture }) {
  useLayoutEffect(() => {
    let seed = 7
    const rnd = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    const m = new THREE.Matrix4()
    // side foam ~200 per side
    for (let k = 0; k < 400; k++) {
      const side = rnd() < 0.5 ? -1 : 1
      const s = 0.15 + rnd() * 0.15 // size <= .3u
      m.compose(
        new THREE.Vector3(side * (4.9 + rnd() * 0.8), 0.05, -16 + rnd() * 32),
        new THREE.Quaternion(),
        new THREE.Vector3(s, s, 1),
      )
      foamRef.current!.setMatrixAt(k, m)
    }
    foamRef.current!.count = 400
    foamRef.current!.instanceMatrix.needsUpdate = true

    // stern trail ~100
    for (let k = 0; k < 100; k++) {
      const s = 0.1 + rnd() * 0.2
      m.compose(
        new THREE.Vector3((rnd() - 0.5) * 3, 0.02 + rnd() * 0.1, -12 - rnd() * 8),
        new THREE.Quaternion(),
        new THREE.Vector3(s, s, 1),
      )
      sternRef.current!.setMatrixAt(k, m)
    }
    sternRef.current!.count = 100
    sternRef.current!.instanceMatrix.needsUpdate = true
  }, [foamRef, sternRef])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // drift aft and fade opacity via scale
    if (foamRef.current) {
      const m = new THREE.Matrix4()
      for (let i = 0; i < foamRef.current.count; i++) {
        foamRef.current.getMatrixAt(i, m)
        const pos = new THREE.Vector3()
        const quat = new THREE.Quaternion()
        const scl = new THREE.Vector3()
        m.decompose(pos, quat, scl)
        pos.z += 0.02
        pos.x += Math.sin(t + i) * 0.005
        scl.multiplyScalar(0.998)
        m.compose(pos, quat, scl)
        foamRef.current.setMatrixAt(i, m)
      }
      foamRef.current.instanceMatrix.needsUpdate = true
    }
    if (sternRef.current) {
      const m = new THREE.Matrix4()
      for (let i = 0; i < sternRef.current.count; i++) {
        sternRef.current.getMatrixAt(i, m)
        const pos = new THREE.Vector3()
        const quat = new THREE.Quaternion()
        const scl = new THREE.Vector3()
        m.decompose(pos, quat, scl)
        pos.z -= 0.03
        pos.x += Math.sin(t * 2 + i) * 0.01
        scl.multiplyScalar(0.997)
        m.compose(pos, quat, scl)
        sternRef.current.setMatrixAt(i, m)
      }
      sternRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group>
      <instancedMesh ref={foamRef} args={[undefined as any, undefined as any, 400]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={foamTex} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={sternRef} args={[undefined as any, undefined as any, 100]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={foamTex} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </instancedMesh>
    </group>
  )
}
