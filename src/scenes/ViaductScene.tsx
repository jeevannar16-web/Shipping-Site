import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'

/** S-curved centerline along which cars and roads are drawn. */
function viaductCurve(offset = 0) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-16, 5.4, 6 + offset),
    new THREE.Vector3(-8, 5.4, -2 + offset),
    new THREE.Vector3(0, 5.4, -6 + offset),
    new THREE.Vector3(8, 5.4, -2 + offset),
    new THREE.Vector3(16, 5.4, 6 + offset),
  ])
}

function RoadDeck({ offset = 0 }: { offset?: number }) {
  const curve = useMemo(() => viaductCurve(offset), [offset])
  const geo = useMemo(() => {
    const pts = curve.getSpacedPoints(120)
    const roadGeo = new THREE.BufferGeometry()
    const positions: number[] = []
    const uvs: number[] = []
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      const tangent = curve.getTangent(i / (pts.length - 1))
      const right = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()
      positions.push(p.x - right.x * 3.4, 5.4, p.z - right.z * 3.4)
      positions.push(p.x + right.x * 3.4, 5.4, p.z + right.z * 3.4)
      uvs.push(0, i * 0.1)
      uvs.push(1, i * 0.1)
    }
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    const indices: number[] = []
    for (let i = 0; i < pts.length - 1; i++) {
      const a = i * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
    roadGeo.setIndex(indices)
    roadGeo.computeVertexNormals()
    return roadGeo
  }, [curve])

  // dashed center line via instanced small boxes along the curve
  const dashes = useMemo(() => {
    const out: { pos: THREE.Vector3; dir: number }[] = []
    const pts = curve.getSpacedPoints(160)
    for (let i = 0; i < pts.length; i += 6) {
      const p = pts[i]
      const t = curve.getTangent(i / 159)
      out.push({ pos: p, dir: Math.atan2(t.x, t.z) })
    }
    return out
  }, [curve])

  return (
    <group>
      <mesh geometry={geo} position={[0, 0, 0]}>
        <meshStandardMaterial color="#18181b" roughness={0.9} />
      </mesh>
      {dashes.map((d, i) => (
        <mesh key={i} position={[d.pos.x, 5.48, d.pos.z]} rotation={[0, d.dir, 0]}>
          <planeGeometry args={[0.14, 0.9]} />
          <meshBasicMaterial color="#f2f2f2" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function Pillars() {
  const geo = useMemo(() => {
    const curve = viaductCurve()
    const pts = curve.getSpacedPoints(60)
    const g = new THREE.CylinderGeometry(0.14, 0.2, 5.4, 8)
    g.translate(0, 2.7, 0)
    const mat = new THREE.MeshStandardMaterial({ color: '#8a8a8a', roughness: 0.7 })
    const inst = new THREE.InstancedMesh(g, mat, pts.length)
    const m = new THREE.Matrix4()
    pts.forEach((p, i) => {
      const t = curve.getTangent(i / 59)
      const right = new THREE.Vector3(-t.z, 0, t.x).normalize()
      const offsetX = i % 2 === 0 ? 2.4 : -2.4
      m.makeTranslation(p.x + right.x * offsetX, 0, p.z + right.z * offsetX)
      inst.setMatrixAt(i, m)
    })
    inst.instanceMatrix.needsUpdate = true
    return inst
  }, [])

  return <primitive object={geo} />
}

type VehicleType = 'car' | 'truck'

function Vehicle({ type }: { type: VehicleType }) {
  const group = useRef<THREE.Group>(null)
  const curve = useMemo(() => viaductCurve(), [])
  const speed = type === 'car' ? 0.06 : 0.04
  const laneOffset = type === 'car' ? 1.3 : -1.3

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const base = (t * speed + (type === 'car' ? 0.2 : 0.7)) % 1
    const p = curve.getPointAt(base)
    const tangent = curve.getTangentAt(base)
    const right = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()
    if (group.current) {
      group.current.position.set(
        p.x + right.x * laneOffset,
        5.58,
        p.z + right.z * laneOffset,
      )
      group.current.lookAt(
        p.x + tangent.x + right.x * laneOffset,
        5.58,
        p.z + tangent.z + right.z * laneOffset,
      )
    }
  })

  return (
    <group ref={group}>
      {type === 'car' ? (
        <>
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[0.7, 0.26, 1.4]} />
            <meshStandardMaterial color="#ff4a00" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.55, -0.08]}>
            <boxGeometry args={[0.62, 0.26, 0.8]} />
            <meshStandardMaterial color="#141416" roughness={0.3} metalness={0.6} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 0.55, 0.2]}>
            <boxGeometry args={[1.0, 0.9, 2.4]} />
            <meshStandardMaterial color="#c77cff" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.4, 1.6]}>
            <boxGeometry args={[0.9, 0.6, 1.0]} />
            <meshStandardMaterial color="#f2f2f2" roughness={0.7} />
          </mesh>
        </>
      )}
    </group>
  )
}

function Trees() {
  const instances = useMemo(() => {
    const canopy = new THREE.IcosahedronGeometry(0.55, 0)
    const trunk = new THREE.CylinderGeometry(0.06, 0.09, 0.5, 6)
    const darkMat = new THREE.MeshStandardMaterial({ color: '#0f2b16', flatShading: true })
    const lightMat = new THREE.MeshStandardMaterial({ color: '#1c4526', flatShading: true })
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#4a2f1a' })
    const count = 140
    const canopyMesh = new THREE.InstancedMesh(canopy, darkMat, count)
    const lightMesh = new THREE.InstancedMesh(canopy, lightMat, count)
    const trunkMesh = new THREE.InstancedMesh(trunk, trunkMat, count)
    const m = new THREE.Matrix4()
    const s = new THREE.Matrix4()
    let i = 0
    while (i < count) {
      const x = (Math.random() - 0.5) * 60
      const z = (Math.random() - 0.5) * 60
      // keep trees away from the deck
      if (Math.abs(x) < 4 && z > -8 && z < 8) continue
      const y = 0.5
      const scale = 0.7 + Math.random() * 0.9
      m.makeTranslation(x, y, z)
      s.makeScale(scale, scale, scale)
      const combined = new THREE.Matrix4().multiplyMatrices(m, s)
      canopyMesh.setMatrixAt(i, combined)
      lightMesh.setMatrixAt(i, combined)
      trunkMesh.setMatrixAt(i, combined)
      i++
    }
    canopyMesh.instanceMatrix.needsUpdate = true
    lightMesh.instanceMatrix.needsUpdate = true
    trunkMesh.instanceMatrix.needsUpdate = true
    return { canopyMesh, lightMesh, trunkMesh }
  }, [])

  return (
    <group>
      <primitive object={instances.canopyMesh} />
      <primitive object={instances.lightMesh} />
      <primitive object={instances.trunkMesh} />
    </group>
  )
}

export default function ViaductScene() {
  return (
    <SceneCanvas fallbackLabel="About" tone="blue" camera={{ position: [0, 10, 22], fov: 48 }}>
      <color attach="background" args={['#0b0b0c']} />
      <fog attach="fog" args={['#0b0b0c', 12, 46]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 18, 4]} intensity={1.6} color="#ffb27d" />
      <directionalLight position={[-10, 4, -6]} intensity={0.4} color="#2b4bff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#0c1115" roughness={0.2} metalness={0.3} />
      </mesh>
      <RoadDeck />
      <RoadDeck offset={9} />
      <Pillars />
      <Trees />
      <Vehicle type="car" />
      <Vehicle type="truck" />
      <Vehicle type="car" />
      <Vehicle type="truck" />
    </SceneCanvas>
  )
}