import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { AutoFitCamera } from './fitCamera'

const CONTAINER_COLORS = ['#b4362b', '#24457a', '#2e5b40', '#c46a2b', '#d0d0d0', '#6b2b8a']
const CONTAINER: [number, number, number] = [2.2, 1.2, 2.2]

/** Canvas speckle texture — scrolling "white noise" on the sea. */
function useNoiseTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 128
    const ctx = c.getContext('2d')!
    for (let i = 0; i < 900; i++) {
      const a = Math.random() * 0.55
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 1.6, 1.6)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 5)
    return tex
  }, [])
}

/** Hull silhouette: 7 wide, 27 long (22 + pointed bow +5). */
function hullShape() {
  const s = new THREE.Shape()
  s.moveTo(-3.5, -11)
  s.lineTo(-3.5, 9)
  s.lineTo(0, 16)
  s.lineTo(3.5, 9)
  s.closePath()
  return s
}

function Hull() {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(hullShape(), { depth: 3.5, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  const stripeGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(hullShape(), { depth: 0.3, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  return (
    <group>
      {/* hull spans y -1..2.5 */}
      <mesh geometry={geo} position={[0, -1, 0]}>
        <meshStandardMaterial color="#14213d" roughness={0.55} metalness={0.25} flatShading />
      </mesh>
      {/* white waterline stripe */}
      <mesh geometry={stripeGeo} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#f2f2f2" roughness={0.6} />
      </mesh>
      {/* deck, y 2.5 */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[6.4, 0.4, 26]} />
        <meshStandardMaterial color="#cfd6de" roughness={0.8} />
      </mesh>
    </group>
  )
}

/**
 * G5 — STRICT 6x12 grid, no jitter, deterministic heights/colors.
 * Cell height h = 1 + ((col*7+row*3) % 3); stacked at y = 2.5 + k*1.22.
 */
function Containers() {
  const meshes = useMemo(() => {
    const geo = new THREE.BoxGeometry(...CONTAINER)
    const mats = CONTAINER_COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: true }))
    const inst = mats.map(() => new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial(), 216))
    const m = new THREE.Matrix4()
    const gap = 2.2 + 0.06
    let idx = 0
    for (let col = 0; col < 6; col++) {
      const x = (col - 2.5) * gap
      for (let row = 0; row < 12; row++) {
        const z = (row - 5.5) * gap
        const h = 1 + ((col * 7 + row * 3) % 3)
        const colorIdx = (col * 7 + row * 3) % 6
        for (let k = 0; k < h; k++) {
          m.makeTranslation(x, 2.5 + k * 1.22 + 0.6, z)
          inst[colorIdx].setMatrixAt(idx++, m)
        }
      }
    }
    inst.forEach((mm, i) => {
      mm.material = mats[i]
      mm.count = idx
      mm.instanceMatrix.needsUpdate = true
    })
    return inst
  }, [])

  return (
    <group>
      {meshes.map((mm, i) => (
        <primitive key={i} object={mm} />
      ))}
    </group>
  )
}

/** Instanced foam dots along both hull sides. */
function FoamDots() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const positions = useMemo(() => {
    const arr: number[][] = []
    for (let z = -13; z <= 13; z += 2) {
      for (const x of [3.65, -3.65]) arr.push([x, z, (Math.random() - 0.5) * 0.3])
    }
    return arr
  }, [])
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.18, 0.18)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4 }), [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * 0.6
    positions.forEach(([x, z], i) => {
      const m2 = new THREE.Matrix4()
      m2.makeTranslation(x + Math.sin(t + z * 0.5) * 0.12, 0.06, z)
      ref.current!.setMatrixAt(i, m2)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[geo, mat, positions.length]}>
      <primitive object={geo} attach="geometry" />
      <primitive object={mat} attach="material" />
    </instancedMesh>
  )
}

function Wake() {
  return (
    <group>
      {/* bow V-plane (bow faces -Z) */}
      <mesh rotation={[0, 0, 0]} position={[0, 0.07, -15]}>
        <planeGeometry args={[9, 5]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
      {/* trailing streaks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.3, 0.06, 3]}>
        <planeGeometry args={[1.4, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.3, 0.06, 3]}>
        <planeGeometry args={[1.4, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

function Ship() {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.x = Math.sin(t * 0.07) * 0.5
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.007 // ±0.4°
  })
  return (
    <group ref={ref}>
      <Hull />
      <Containers />
      {/* bridge at stern (+Z), taller than containers */}
      <group position={[0, 2.5, 10.5]}>
        <mesh>
          <boxGeometry args={[6, 4.5, 2.4]} />
          <meshStandardMaterial color="#f2f2f2" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.4, 1.22]}>
          <boxGeometry args={[5.4, 1.1, 0.06]} />
          <meshStandardMaterial color="#0a2a4a" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
      <FoamDots />
    </group>
  )
}

function Sea() {
  const tex = useNoiseTexture()
  const refs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)]
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.12
    refs.forEach((r, i) => {
      if (!r.current) return
      const m = r.current.material as THREE.MeshBasicMaterial
      if (m.map) m.map.offset.y = i === 0 ? -t : t
    })
  })
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#1b4e8a" roughness={0.4} metalness={0.1} />
      </mesh>
      {refs.map((r, i) => (
        <mesh key={i} ref={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001 + i * 0.001, 0]}>
          <planeGeometry args={[90, 90]} />
          <meshBasicMaterial map={tex} color="#ffffff" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function OceanScene() {
  const modelRef = useRef<THREE.Group>(null)

  return (
    <SceneCanvas fallbackLabel="Ocean" tone="blue" camera={{ position: [0, 38, 14], fov: 35 }}>
      <color attach="background" args={['#1b4e8a']} />
      <fog attach="fog" args={['#1b4e8a', 60, 140]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 30, 10]} intensity={1.6} color="#ffffff" />

      <Sea />
      <group ref={modelRef}>
        <Ship />
      </group>
      <Wake />
      <AutoFitCamera target={modelRef} coverage={0.8} axis={[0, 0.85, 0.35]} fov={35} />
    </SceneCanvas>
  )
}