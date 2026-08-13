import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const CONTAINER_COLORS = ['#7a3222', '#b45a1e', '#2e5b40', '#24457a', '#6a6a6a', '#8b3a2a', '#c46a2b']

export function Container({ color = '#c46a2b', size = [2.4, 2.6, 6] as [number, number, number] }: {
  color?: string
  size?: [number, number, number]
}) {
  return (
    <mesh>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.15} flatShading />
    </mesh>
  )
}

/** Procedural low-poly semi truck. Wheels spin when `driving`. */
export function Truck({
  cabColor = '#d0d0d0',
  containerColor = '#f0f0f0',
  ribCount = 12,
  driving = true,
  bob = true,
  shadow = false,
}: {
  cabColor?: string
  containerColor?: string
  ribCount?: number
  driving?: boolean
  bob?: boolean
  shadow?: boolean
}) {
  const wheelRefs = useRef<(THREE.Mesh | null)[]>([])
  const groupRef = useRef<THREE.Group | null>(null)

  useFrame((_, dt) => {
    if (driving) {
      wheelRefs.current.forEach((w) => {
        if (w) w.rotation.y += dt * 8
      })
    }
    if (bob && groupRef.current) {
      groupRef.current.position.y = Math.sin(performance.now() / 220) * 0.02
    }
  })

  const ribs = useMemo(() => Array.from({ length: ribCount }), [ribCount])

  const wheels: [number, number, number][] = [
    [-0.95, 0.42, 0.9], [0.95, 0.42, 0.9],
    [-0.95, 0.42, -0.6], [0.95, 0.42, -0.6],
    [-0.95, 0.42, -2.0], [0.95, 0.42, -2.0],
    [-0.95, 0.42, -3.4], [0.95, 0.42, -3.4],
  ]

  return (
    <group ref={groupRef}>
      {/* chassis */}
      <mesh position={[0, 0.35, -0.9]}>
        <boxGeometry args={[1.7, 0.12, 5.4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* cab */}
      <mesh position={[0, 1.1, 1.55]}>
        <boxGeometry args={[2.2, 1.9, 2.4]} />
        <meshStandardMaterial color={cabColor} roughness={0.6} />
      </mesh>
      {/* windshield */}
      <mesh position={[0, 1.35, 0.42]}>
        <boxGeometry args={[2.0, 0.9, 0.08]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* grille */}
      <mesh position={[0, 0.85, 2.78]}>
        <boxGeometry args={[1.9, 0.7, 0.06]} />
        <meshStandardMaterial color="#222" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* trailer */}
      <mesh position={[0, 1.85, -1.9]}>
        <boxGeometry args={[2.4, 2.6, 7.5]} />
        <meshStandardMaterial color={containerColor} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* corrugation ribs */}
      {ribs.map((_, i) => {
        const z = -1.9 + (i / (ribCount - 1) - 0.5) * 7.4
        return (
          <mesh key={i} position={[0, 1.85, z]}>
            <boxGeometry args={[2.44, 2.64, 0.03]} />
            <meshStandardMaterial color={i % 2 ? '#101010' : '#e8e8e8'} roughness={0.9} />
          </mesh>
        )
      })}
      {/* exhaust stacks */}
      <mesh position={[0.75, 1.6, 2.75]}>
        <cylinderGeometry args={[0.09, 0.09, 0.7, 8]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[1.15, 1.6, 2.75]}>
        <cylinderGeometry args={[0.09, 0.09, 0.7, 8]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* wheels — group orients axle along X, inner mesh spins on Y */}
      {wheels.map((p, i) => (
        <group key={i} position={p} rotation={[0, 0, Math.PI / 2]}>
          <mesh
            ref={(el) => {
              wheelRefs.current[i] = el
            }}
          >
            <cylinderGeometry args={[0.42, 0.42, 0.25, 12]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {shadow && (
        <mesh position={[0, 0.02, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 9]} />
          <meshBasicMaterial color="#000" transparent opacity={0.22} />
        </mesh>
      )}
    </group>
  )
}

/** Ribbon road geometry from a CatmullRomCurve3 + instanced center dashes + edge lines. */
export function CurvedRoad({
  curve,
  width = 6,
  color = '#161616',
  y = 0,
  dashed = true,
  edgeLines = true,
}: {
  curve: THREE.CatmullRomCurve3
  width?: number
  color?: string
  y?: number
  dashed?: boolean
  edgeLines?: boolean
}) {
  const roadGeo = useMemo(() => {
    const pts = curve.getSpacedPoints(160)
    const positions: number[] = []
    const uvs: number[] = []
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      const t = curve.getTangent(i / (pts.length - 1))
      const right = new THREE.Vector3(-t.z, 0, t.x).normalize()
      positions.push(p.x - right.x * (width / 2), y, p.z - right.z * (width / 2))
      positions.push(p.x + right.x * (width / 2), y, p.z + right.z * (width / 2))
      uvs.push(0, i * 0.05, 1, i * 0.05)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    const indices: number[] = []
    for (let i = 0; i < pts.length - 1; i++) {
      const a = i * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
    g.setIndex(indices)
    g.computeVertexNormals()
    return g
  }, [curve, width, y])

  const dashes = useMemo(() => {
    const out: { pos: THREE.Vector3; rot: number }[] = []
    const pts = curve.getSpacedPoints(200)
    for (let i = 0; i < pts.length; i += 8) {
      const p = pts[i]
      const t = curve.getTangent(i / 199)
      out.push({ pos: new THREE.Vector3(p.x, y + 0.02, p.z), rot: Math.atan2(t.x, t.z) })
    }
    return out
  }, [curve, y])

  const edges = useMemo(() => {
    const out: { pos: THREE.Vector3; rot: number; side: 1 | -1 }[] = []
    const pts = curve.getSpacedPoints(200)
    for (let i = 0; i < pts.length; i += 4) {
      const p = pts[i]
      const t = curve.getTangent(i / 199)
      const right = new THREE.Vector3(-t.z, 0, t.x).normalize()
      for (const side of [1, -1] as const) {
        out.push({
          pos: new THREE.Vector3(p.x + right.x * (width / 2) * side, y + 0.015, p.z + right.z * (width / 2) * side),
          rot: Math.atan2(t.x, t.z),
          side,
        })
      }
    }
    return out
  }, [curve, width, y])

  return (
    <group>
      <mesh geometry={roadGeo}>
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {dashed &&
        dashes.map((d, i) => (
          <mesh key={`d${i}`} position={d.pos} rotation={[0, d.rot, 0]}>
            <planeGeometry args={[0.18, 1.1]} />
            <meshBasicMaterial color="#f2f2f2" transparent opacity={0.75} />
          </mesh>
        ))}
      {edgeLines &&
        edges.map((e, i) => (
          <mesh key={`e${i}`} position={e.pos} rotation={[0, e.rot, 0]}>
            <planeGeometry args={[0.09, 1]} />
            <meshBasicMaterial color="#f2f2f2" transparent opacity={0.9} />
          </mesh>
        ))}
    </group>
  )
}

/** Instanced low-poly tree for forests / banks. */
export function InstancedTrees({
  count = 200,
  min = 0.8,
  max = 1.6,
  area = 40,
  center = [0, 0] as [number, number],
  avoid = (_x: number, _z: number) => false,
  height = 0,
}: {
  count?: number
  min?: number
  max?: number
  area?: number
  center?: [number, number]
  avoid?: (x: number, z: number) => boolean
  height?: number
}) {
  const { dark, light } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 0)
    const darkMat = new THREE.MeshStandardMaterial({ color: '#2e4b26', flatShading: true })
    const lightMat = new THREE.MeshStandardMaterial({ color: '#3e5b32', flatShading: true })
    const dark = new THREE.InstancedMesh(geo, darkMat, count)
    const light = new THREE.InstancedMesh(geo, lightMat, count)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    let placed = 0
    let guard = 0
    while (placed < count && guard < count * 20) {
      guard++
      const x = center[0] + (Math.random() - 0.5) * area * 2
      const z = center[1] + (Math.random() - 0.5) * area * 2
      if (avoid(x, z)) continue
      const s = min + Math.random() * (max - min)
      e.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3)
      q.setFromEuler(e)
      m.compose(new THREE.Vector3(x, height + s * 0.6, z), q, new THREE.Vector3(s, s, s))
      const target = placed % 2 === 0 ? dark : light
      target.setMatrixAt(Math.floor(placed / 2), m)
      placed++
    }
    dark.count = Math.ceil(placed / 2)
    light.count = Math.floor(placed / 2)
    dark.instanceMatrix.needsUpdate = true
    light.instanceMatrix.needsUpdate = true
    return { dark, light }
  }, [count, min, max, area, center, avoid, height])

  return (
    <group>
      <primitive object={dark} />
      <primitive object={light} />
    </group>
  )
}

/** Background starfield for the space hero. */
export function Starfield({ count = 300 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) arr[i] = (Math.random() - 0.5) * 80
    return arr
  }, [count])
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#ffffff" sizeAttenuation transparent opacity={0.85} />
    </points>
  )
}