import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { AutoFitCamera } from './fitCamera'
import { clamp01, type ScrubRef } from '../lib/scrub'

const CONTAINER_COLORS = ['#b4362b', '#24457a', '#2e5b40', '#c46a2b', '#d0d0d0', '#6b2b8a']

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

/** S4 — Hull silhouette: rect x±3.5, z -11..11 + bow point (0,16). */
function hullShape() {
  const s = new THREE.Shape()
  s.moveTo(-3.5, -11)
  s.lineTo(-3.5, 11)
  s.lineTo(0, 16)
  s.lineTo(3.5, 11)
  s.closePath()
  return s
}

function Hull() {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(hullShape(), { depth: 3.8, bevelEnabled: false })
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
      {/* S4 — hull depth 3.8 along Y (y -1.2..2.6) #14213D, bow is part of hull */}
      <mesh geometry={geo} position={[0, -1.2, 0]}>
        <meshStandardMaterial color="#14213d" roughness={0.55} metalness={0.25} flatShading />
      </mesh>
      {/* S4 — white waterline stripe at y .15 */}
      <mesh geometry={stripeGeo} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#f2f2f2" roughness={0.6} />
      </mesh>
      {/* deck, y 2.6 */}
      <mesh position={[0, 2.6, 0]}>
        <boxGeometry args={[6.4, 0.4, 26]} />
        <meshStandardMaterial color="#cfd6de" roughness={0.8} />
      </mesh>
    </group>
  )
}

/**
 * S4 — STRICT 6×10 grid on the deck: box (1.15,1.2,2.2), x -3..3 step 1.2,
 * z -10..10 step 2.2, heights h = 1 + ((c*7+r*3) % 3), y starts 2.62.
 */
function Containers() {
  const meshes = useMemo(() => {
    const geo = new THREE.BoxGeometry(1.15, 1.2, 2.2)
    const mats = CONTAINER_COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: true }))
    const inst = mats.map(() => new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial(), 216))
    const m = new THREE.Matrix4()
    let idx = 0
    for (let col = 0; col < 6; col++) {
      const x = -3 + col * 1.2
      for (let row = 0; row < 10; row++) {
        const z = -10 + row * 2.2
        const h = 1 + ((col * 7 + row * 3) % 3)
        const colorIdx = (col * 7 + row * 3) % 6
        for (let k = 0; k < h; k++) {
          m.makeTranslation(x, 2.62 + 0.6 + k * 1.26, z)
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

/** V5 — WAKE IS FLAT. Bow V opacity .5 + 2 side streaks length 26 opacity .35. */
function Wake({ scrub }: { scrub?: ScrubRef }) {
  const aRef = useRef<THREE.Mesh>(null)
  const bRef = useRef<THREE.Mesh>(null)
  const cRef = useRef<THREE.Mesh>(null)
  const bowV = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(6, 6.5)
    s.lineTo(-6, 6.5)
    s.closePath()
    const g = new THREE.ShapeGeometry(s)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  useFrame(() => {
    if (scrub && scrub.current !== undefined) {
      const p = clamp01(scrub.current)
      const op = 0.2 + 0.3 * p
      const set = (m: THREE.Mesh | null) => {
        if (m) (m.material as THREE.MeshBasicMaterial).opacity = op
      }
      set(aRef.current)
      set(bRef.current)
      set(cRef.current)
    }
  })
  return (
    <group>
      {/* bow V — flat on the water, apex at the stern, opening behind (bow faces -Z) */}
      <mesh ref={aRef} geometry={bowV} position={[0, 0.05, -15]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} depthWrite={false} />
      </mesh>
      {/* trailing streaks — flat, length 26 */}
      <mesh ref={bRef} rotation={[-Math.PI / 2, 0, -0.06]} position={[4.3, 0.05, 1]}>
        <planeGeometry args={[1.4, 26]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh ref={cRef} rotation={[-Math.PI / 2, 0, 0.06]} position={[-4.3, 0.05, 1]}>
        <planeGeometry args={[1.4, 26]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Ship({ scrub }: { scrub?: ScrubRef }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    if (scrub && scrub.current !== undefined) {
      const p = clamp01(scrub.current)
      ref.current.position.z = -8 + 16 * p
      ref.current.position.x = 0
      ref.current.rotation.z = Math.sin(t * 0.3) * 0.007 // S4 — roll ±0.4°
    } else {
      ref.current.position.x = Math.sin(t * 0.07) * 0.5
      ref.current.rotation.z = Math.sin(t * 0.3) * 0.007 // ±0.4°
    }
  })
  return (
    <group ref={ref}>
      <Hull />
      <Containers />
      {/* S4 — bridge white (6,4.5,2.2) stern z -10.5, taller than stacks */}
      <group position={[0, 4.85, -10.5]}>
        <mesh>
          <boxGeometry args={[6, 4.5, 2.2]} />
          <meshStandardMaterial color="#f2f2f2" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.1, 1.12]}>
          <boxGeometry args={[5.4, 1, 0.06]} />
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#1e56a0" roughness={0.4} metalness={0.1} />
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

export default function OceanScene({ scrub }: { scrub?: ScrubRef }) {
  const modelRef = useRef<THREE.Group>(null)

  return (
    <SceneCanvas fallbackLabel="Ocean" tone="blue" camera={{ position: [0, 26, 34], fov: 35 }}>
      <color attach="background" args={['#1e56a0']} />
      <fog attach="fog" args={['#1e56a0', 60, 140]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 30, 10]} intensity={1.6} color="#ffffff" />

      <Sea />
      <group ref={modelRef}>
        <Ship scrub={scrub} />
      </group>
      <Wake scrub={scrub} />
      <AutoFitCamera target={modelRef} coverage={0.9} axis={[0, 0.72, 0.45]} fov={35} label="ocean" />
    </SceneCanvas>
  )
}