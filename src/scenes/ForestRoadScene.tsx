import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'

function ForestCanopy() {
  const instances = useMemo(() => {
    const N = 480
    const geo = new THREE.IcosahedronGeometry(1, 0)
    const darkMat = new THREE.MeshStandardMaterial({ color: '#122718', flatShading: true })
    const lightMat = new THREE.MeshStandardMaterial({ color: '#1c4524', flatShading: true })
    const dark = new THREE.InstancedMesh(geo, darkMat, N)
    const light = new THREE.InstancedMesh(geo, lightMat, N)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    for (let i = 0; i < N; i++) {
      const ring = Math.pow(Math.random(), 0.7)
      const theta = Math.random() * Math.PI * 2
      const radius = ring * 34
      let x = Math.cos(theta) * radius
      let z = Math.sin(theta) * radius
      // clear a vertical lane for the road
      if (Math.abs(x) < 3.6) x += (x < 0 ? -1 : 1) * 4
      const scale = 4 + Math.random() * 7
      e.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4)
      q.setFromEuler(e)
      m.compose(new THREE.Vector3(x, 1.5, z), q, new THREE.Vector3(scale, scale * (0.6 + Math.random() * 0.5), scale))
      ;(i % 2 === 0 ? dark : light).setMatrixAt(i, m)
    }
    dark.instanceMatrix.needsUpdate = true
    light.instanceMatrix.needsUpdate = true
    return { dark, light }
  }, [])

  return (
    <group>
      <primitive object={instances.dark} />
      <primitive object={instances.light} />
    </group>
  )
}

function Road() {
  const dashes = useMemo(() => {
    const out: THREE.Vector3[] = []
    for (let z = -40; z <= 40; z += 2.2) out.push(new THREE.Vector3(0, 0.06, z))
    return out
  }, [])
  return (
    <group>
      {/* asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[7, 90]} />
        <meshStandardMaterial color="#141415" roughness={1} />
      </mesh>
      {/* center dashed line */}
      {dashes.map((d, i) => (
        <mesh key={i} position={d} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.16, 1.2]} />
          <meshBasicMaterial color="#c9a227" transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function SemiTruck() {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const z = ((t * 8) % 60) - 30
    if (ref.current) {
      ref.current.position.z = z
      ref.current.rotation.z = Math.sin(t * 0.3) * 0.5 * (z < 0 ? 1 : 1)
    }
  })
  return (
    <group ref={ref} rotation={[0, 0, 0]}>
      {/* cab */}
      <mesh position={[0, 0.9, 1.6]}>
        <boxGeometry args={[1.0, 1.2, 1.2]} />
        <meshStandardMaterial color="#f2f2f2" roughness={0.6} />
      </mesh>
      <mesh position={[-0.65, 0.95, 1.9]}>
        <boxGeometry args={[0.05, 0.7, 0.8]} />
        <meshStandardMaterial color="#c9a227" roughness={0.4} />
      </mesh>
      {/* trailer */}
      <mesh position={[0, 1.1, -2.2]}>
        <boxGeometry args={[1.08, 1.6, 4.6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      {/* wheels */}
      {[[-0.62, 0.28, 1.7], [0.62, 0.28, 1.7], [-0.62, 0.28, -2.0], [0.62, 0.28, -2.0], [-0.62, 0.28, -3.4], [0.62, 0.28, -3.4]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.18, 10]} />
          <meshStandardMaterial color="#0c0c0c" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export default function ForestRoadScene() {
  return (
    <SceneCanvas fallbackLabel="Industries" tone="violet" camera={{ position: [0, 60, 0.01], fov: 55 }}>
      <color attach="background" args={['#0b0b0c']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 60, 20]} intensity={1.4} color="#fff3e0" />
      <ForestCanopy />
      <Road />
      <SemiTruck />
    </SceneCanvas>
  )
}