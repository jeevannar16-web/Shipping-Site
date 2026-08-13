import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'

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
    tex.repeat.set(6, 7)
    return tex
  }, [])
}

/** Hull silhouette: 7 wide × 22 long, pointed bow (shape +Y). */
function hullShape() {
  const s = new THREE.Shape()
  s.moveTo(-3.5, -11)
  s.lineTo(-3.5, 9)
  s.lineTo(0, 11)
  s.lineTo(3.5, 9)
  s.closePath()
  return s
}

function Hull() {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(hullShape(), { depth: 0.7, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  const stripeGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(hullShape(), { depth: 0.08, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#14213d" roughness={0.55} metalness={0.25} flatShading />
      </mesh>
      {/* white waterline stripe */}
      <mesh geometry={stripeGeo} position={[0, 0.18, 0]}>
        <meshStandardMaterial color="#f2f2f2" roughness={0.6} />
      </mesh>
      {/* deck */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[6.4, 0.5, 21]} />
        <meshStandardMaterial color="#cfd6de" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Containers() {
  const meshes = useMemo(() => {
    const geo = new THREE.BoxGeometry(2.2, 1.2, 2.2)
    const mats = CONTAINER_COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: true }))
    const inst = mats.map((mat) => new THREE.InstancedMesh(geo, mat, 240))
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const s = new THREE.Vector3(1, 1, 1)
    const gap = 2.2 + 0.06
    let idx = 0
    for (let col = 0; col < 6; col++) {
      const x = (col - 2.5) * gap
      for (let row = 0; row < 12; row++) {
        const height = 1 + (Math.random() * 3) | 0 // 1..3
        const z = -5.4 + row * gap * 0.82
        for (let h = 0; h < height; h++) {
          e.set(0, (Math.random() - 0.5) * 0.04, 0) // rotY jitter ±.02 rad
          q.setFromEuler(e)
          m.compose(
            new THREE.Vector3(x, 1.45 + h * 1.2, z),
            q,
            s,
          )
          inst[Math.floor(Math.random() * mats.length)].setMatrixAt(idx++, m)
        }
      }
    }
    inst.forEach((mm) => {
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
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, transparent: true, opacity: 0.4 }), [])
  const positions = useMemo(() => {
    const arr: number[][] = []
    for (let z = -10; z <= 10; z += 2) {
      for (const x of [3.55, -3.55]) arr.push([x, z, (Math.random() - 0.5) * 0.3])
    }
    return arr
  }, [])
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.18, 0.18)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const m = new THREE.Matrix4()
    ref.current.getMatrixAt(0, m)
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
      {/* bow V-plane */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0.07, -12.4]}>
        <planeGeometry args={[9, 5]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      {/* trailing streaks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.4, 0.06, 2]}>
        <planeGeometry args={[1.4, 30]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.4, 0.06, 2]}>
        <planeGeometry args={[1.4, 30]} />
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
      {/* stern bridge, white with window stripe */}
      <group position={[0, 1.45, 9.2]}>
        <mesh>
          <boxGeometry args={[6, 2.6, 2.4]} />
          <meshStandardMaterial color="#f2f2f2" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.9, 1.22]}>
          <boxGeometry args={[5.4, 0.9, 0.06]} />
          <meshStandardMaterial color="#0a2a4a" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
      <FoamDots />
      <Wake />
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
      const tex2 = (r.current.material as THREE.MeshBasicMaterial).map
      if (tex2) tex2.offset.y = i === 0 ? -t : t
    })
  })
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <planeGeometry args={[70, 80]} />
        <meshStandardMaterial color="#16406e" roughness={0.4} metalness={0.1} />
      </mesh>
      {refs.map((r, i) => (
        <mesh key={i} ref={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001 + i * 0.001, 0]}>
          <planeGeometry args={[70, 80]} />
          <meshBasicMaterial map={tex} color="#ffffff" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function OceanScene() {
  return (
    <SceneCanvas fallbackLabel="Ocean" tone="blue" camera={{ position: [0, 38, 14], fov: 35 }}>
      <color attach="background" args={['#16406e']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 30, 10]} intensity={1.6} color="#ffffff" />

      <Sea />
      <Ship />
      <CameraLook />
    </SceneCanvas>
  )
}

function CameraLook() {
  useFrame((state) => {
    state.camera.lookAt(0, 0, -2)
  })
  return null
}