import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { AutoFitCamera } from './fitCamera'

const COLORS = ['#d6451e', '#e06f27', '#3a7d44', '#2b4bff', '#8a8a8a', '#c7a03c', '#b03a2e', '#3f6f8f']

/** Bright sky gradient #B8C4CC → #D8DDE0 inside a dome. */
function SkyDome() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {},
        vertexShader: `
          varying vec3 vWorldPos;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          varying vec3 vWorldPos;
          void main() {
            float h = normalize(vWorldPos).y * 0.5 + 0.5;
            vec3 col = mix(vec3(0.722, 0.769, 0.80), vec3(0.847, 0.867, 0.878), pow(h, 0.7));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  )

  return (
    <mesh material={mat} frustumCulled={false}>
      <sphereGeometry args={[90, 24, 16]} />
    </mesh>
  )
}

/** 8 × 20 stack yard, heights 1–4, instanced by color. */
function ContainerYard() {
  const meshes = useMemo(() => {
    const geo = new THREE.BoxGeometry(2, 0.95, 0.9)
    const mats = COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.15, flatShading: true }))
    const inst = mats.map(() => new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial(), 640))
    const m = new THREE.Matrix4()
    let idx = 0
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 20; row++) {
        const z = row * 1.0 - 9.5
        const x = col * 2.1 - 7.35
        const stack = 1 + Math.floor(Math.random() * 4) // 1..4
        for (let s = 0; s < stack; s++) {
          const y = 0.475 + s * 0.98 + (s === 0 ? 0 : 0.02 * row)
          const color = COLORS[Math.floor(Math.random() * COLORS.length)]
          const mi = COLORS.indexOf(color)
          m.makeTranslation(x, y, z)
          inst[mi].setMatrixAt(idx++, m)
        }
      }
    }
    inst.forEach((mm, mi) => {
      mm.count = idx
      mm.material = mats[mi]
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

function GantryCrane() {
  const trolleyRef = useRef<THREE.Group>(null)
  const spreaderRef = useRef<THREE.Group>(null)
  const beamRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const cycle = (t * Math.PI * 2) / 12 // full traverse every 12s
    const xPos = Math.sin(cycle) * 9
    if (trolleyRef.current) trolleyRef.current.position.x = xPos
    if (beamRef.current) beamRef.current.rotation.z = Math.sin(cycle * 2) * 0.002
    if (spreaderRef.current) {
      const eased = 0.5 - 0.5 * Math.cos(cycle)
      spreaderRef.current.position.y = -1.2 - eased * 2.6
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* 4 legs (orange) */}
      {[-11, 11].map((x) =>
        [3, -3].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 7, z]}>
            <boxGeometry args={[0.3, 14, 0.3]} />
            <meshStandardMaterial color="#ff6a1a" roughness={0.5} metalness={0.3} />
          </mesh>
        )),
      )}
      {/* main beam */}
      <group ref={beamRef} position={[0, 14.2, 0]}>
        <mesh>
          <boxGeometry args={[24, 0.4, 1.6]} />
          <meshStandardMaterial color="#3a3f45" roughness={0.4} metalness={0.4} />
        </mesh>
        {/* red trolley */}
        <group ref={trolleyRef}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.1, 0.9, 1.2]} />
            <meshStandardMaterial color="#e02e2e" roughness={0.4} />
          </mesh>
          <group ref={spreaderRef}>
            <mesh position={[0, -1.0, 0]}>
              <boxGeometry args={[0.8, 1.5, 0.8]} />
              <meshStandardMaterial color="#2b4bff" roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

export default function TerminalScene() {
  const modelRef = useRef<THREE.Group>(null)

  return (
    <SceneCanvas fallbackLabel="Terminal" tone="orange" camera={{ position: [0, 6, 24], fov: 50 }}>
      <color attach="background" args={['#cdd5dc']} />
      <fog attach="fog" args={['#cdd5dc', 80, 220]} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[22, 34, 12]} intensity={1.9} color="#fff2dd" />
      <directionalLight position={[-10, 8, -14]} intensity={0.35} color="#ffffff" />

      <SkyDome />
      {/* concrete ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[200, 150]} />
        <meshStandardMaterial color="#c9ced2" roughness={0.9} />
      </mesh>

      <group ref={modelRef}>
        <ContainerYard />
        <GantryCrane />
      </group>
      <AutoFitCamera target={modelRef} coverage={0.8} axis={[0, 0.4, 1]} fov={50} />
    </SceneCanvas>
  )
}