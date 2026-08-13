import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Trail } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneProgress, ScenePoster } from './SceneShell'
import { Plane } from 'lucide-react'

function FlightPath() {
  const progress = useSceneProgress()
  const lineRef = useRef<THREE.Line>(null!)
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-14, 1.4, 0),
      new THREE.Vector3(-6, 3.6, 2),
      new THREE.Vector3(0, 4.6, 0),
      new THREE.Vector3(6, 3.4, -2),
      new THREE.Vector3(14, 1.2, 0),
    ])
  }, [])

  const pathPoints = useMemo(() => curve.getPoints(120), [curve])

  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(pathPoints.flatMap((pt) => [pt.x, pt.y, pt.z])), 3),
    )
    const material = new THREE.LineBasicMaterial({ color: '#2dd4bf', transparent: true, opacity: 0.3 })
    return new THREE.Line(geometry, material)
  }, [pathPoints])

  useFrame(() => {
    const line = lineRef.current
    if (!line) return
    const p = progress.value
    const drawCount = Math.max(2, Math.floor(pathPoints.length * (p * 1.1)))
    const geo = line.geometry as THREE.BufferGeometry
    geo.setDrawRange(0, drawCount)
    const mat = line.material as THREE.LineBasicMaterial
    mat.opacity = 0.25 + Math.sin(Date.now() * 0.004) * 0.08
  })

  return <primitive ref={lineRef} object={line} />
}

function CargoJet() {
  const ref = useRef<THREE.Group>(null!)
  const progress = useSceneProgress()
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-14, 1.4, 0),
      new THREE.Vector3(-6, 3.6, 2),
      new THREE.Vector3(0, 4.6, 0),
      new THREE.Vector3(6, 3.4, -2),
      new THREE.Vector3(14, 1.2, 0),
    ])
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const p = progress.value
    const pos = curve.getPoint(p)
    const tangent = curve.getTangent(p)
    ref.current.position.copy(pos)
    const look = pos.clone().add(tangent)
    const matrix = new THREE.Matrix4().lookAt(pos, look, new THREE.Vector3(0, 1, 0))
    ref.current.quaternion.setFromRotationMatrix(matrix)
    ref.current.rotateZ(Math.sin(t * 1.4) * 0.06)
    ref.current.position.y += Math.sin(t * 1.8) * 0.06
  })

  return (
    <group ref={ref} scale={1.6}>
      {/* Fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 3.2, 20]} />
        <meshStandardMaterial color="#e4eaf0" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Nose */}
      <mesh position={[1.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.32, 0.8, 20]} />
        <meshStandardMaterial color="#c9d3dd" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Tail */}
      <mesh position={[-1.55, 0.5, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.09, 0.9, 0.6]} />
        <meshStandardMaterial color="#dfe6ee" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Wings */}
      <mesh rotation={[0, 0, 0]}>
        <boxGeometry args={[5.2, 0.09, 0.85]} />
        <meshStandardMaterial color="#dfe6ee" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[2.6, 0.07, 0.45]} />
        <meshStandardMaterial color="#f5a524" emissive="#f5a524" emissiveIntensity={0.4} />
      </mesh>
      {/* Engines */}
      {[-0.85, 0.85].map((z) => (
        <mesh key={z} position={[0.9, -0.32, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
          <meshStandardMaterial color="#3a4048" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <pointLight position={[0.8, 0, 0]} intensity={5} distance={8} decay={2} color="#fff1cc" />
    </group>
  )
}

export function PlaneContent() {
  return (
    <>
      <ambientLight intensity={0.5} color="#456" />
      <directionalLight position={[4, 8, 4]} intensity={1.2} color="#e8f2ff" />
      <FlightPath />
      <Trail
        width={1.2}
        length={6}
        color={'#f5a524'}
        attenuation={(w) => w * w}
      >
        <CargoJet />
      </Trail>
      <Sparkles count={120} scale={[30, 8, 30]} size={2} speed={0.4} opacity={0.35} color="#2dd4bf" />
      <gridHelper args={[40, 30, '#1a2130', '#10141f']} position={[0, -0.5, 0]} />
      <fog attach="fog" args={['#060a13', 14, 30]} />
    </>
  )
}

export function PlanePoster() {
  return (
    <ScenePoster
      icon={<Plane size={72} strokeWidth={1} />}
      label="Air Freight & Express"
      title="Scroll to take off"
    />
  )
}