import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'

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

/** V6 — 8×14 stack yard (heights 3–4, top ≈5), central aisle along x, deterministic colors. */
function ContainerYard() {
  const meshes = useMemo(() => {
    const geo = new THREE.BoxGeometry(1.05, 1.2, 0.9)
    const mats = COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.15, flatShading: true }))
    const inst = mats.map(() => new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial(), 448))
    const m = new THREE.Matrix4()
    let idx = 0
    for (let xi = 0; xi < 14; xi++) {
      const x = (xi - 6.5) * 1.15
      for (let zi = 0; zi < 8; zi++) {
        const z = zi < 4 ? -0.55 - (3 - zi) * 1.1 : 0.55 + (zi - 4) * 1.1
        const stack = 3 + ((xi * 7 + zi * 3) % 2)
        for (let s = 0; s < stack; s++) {
          const y = 0.6 + s * 1.22
          const mi = (xi * 7 + zi * 3 + s) % COLORS.length
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

/** V6 — 2 white lane stripes painted on the dark apron. */
function Lanes() {
  const stripes = useMemo(() => [-3.85, 3.85], [])
  return (
    <group>
      {stripes.map((z) => (
        <mesh key={z} rotation={[0, 0, 0]} position={[0, 0.02, z]}>
          <boxGeometry args={[40, 0.03, 0.08]} />
          <meshBasicMaterial color="#f2f2f2" />
        </mesh>
      ))}
    </group>
  )
}

/** V6 — gantry crane: white legs (1,16,1) at (±11,8,±7), beam (24,1.4,1.8) y16, trolley #222 y15.2 x -6→6. */
function GantryCrane() {
  const trolleyRef = useRef<THREE.Group>(null)
  const spreaderRef = useRef<THREE.Group>(null)
  const containerRef = useRef<THREE.Mesh>(null)
  const cableRefs = useRef<Array<THREE.Mesh | null>>([])

  useFrame((state) => {
    const t = (state.clock.elapsedTime % 16) / 16
    const trolley = trolleyRef.current
    const spreader = spreaderRef.current
    const container = containerRef.current
    if (!trolley || !spreader || !container) return

    let tx: number
    let sy: number
    if (t < 0.3) {
      const p = t / 0.3
      tx = -6 + p * 5
      sy = 11
    } else if (t < 0.5) {
      const p = (t - 0.3) / 0.2
      tx = -1
      sy = 11 - p * 6
    } else if (t < 0.72) {
      const p = (t - 0.5) / 0.22
      tx = -1 + p * 7
      sy = 5 + p * 6
    } else if (t < 0.95) {
      tx = 6
      sy = 11
    } else {
      const p = (t - 0.95) / 0.05
      tx = 6 - p * 2
      sy = 11
    }

    trolley.position.x = tx
    spreader.position.y = sy - 15.2
    container.position.set(0, sy - 0.9 - 15.2, 0)

    const topY = 14.7
    const botY = sy + 0.25
    const len = Math.max(topY - botY, 0.3)
    cableRefs.current.forEach((c) => {
      if (!c) return
      c.position.y = (topY + botY) / 2 - 15.2
      c.scale.set(1, len, 1)
    })
  })

  return (
    <group position={[0, 0, 0]}>
      {/* V6 — 4 white legs (1,16,1) at (±11,9,±8.5) */}
      {[-11, 11].map((x) =>
        [-7, 7].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 8, z]}>
            <boxGeometry args={[1, 16, 1]} />
            <meshStandardMaterial color="#f2f2f2" roughness={0.5} metalness={0.2} />
          </mesh>
        )),
      )}
      {/* V6 — main beam (24,1.4,1.8) y 16 */}
      <mesh position={[0, 16, 0]}>
        <boxGeometry args={[24, 1.4, 1.8]} />
        <meshStandardMaterial color="#3a3f45" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* V6 — trolley (2.5,1,2.5) #222 y 15.2 */}
      <group ref={trolleyRef} position={[-6, 15.2, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 1, 2.5]} />
          <meshStandardMaterial color="#222222" roughness={0.4} />
        </mesh>
        {/* V6 — cables trolley → spreader, r .06 */}
        {[0.7, -0.7].map((off, i) => (
          <mesh
            key={i}
            position={[0, 0, off]}
            ref={(el) => {
              cableRefs.current[i] = el
            }}
          >
            <cylinderGeometry args={[0.06, 0.06, 1, 6]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
          </mesh>
        ))}
        {/* V6 — spreader + hung red container, world y 5..11 */}
        <group ref={spreaderRef} position={[0, 11 - 15.2, 0]}>
          <mesh>
            <boxGeometry args={[2.6, 0.5, 2.6]} />
            <meshStandardMaterial color="#2b4bff" roughness={0.5} />
          </mesh>
          <mesh ref={containerRef} position={[0, -0.9, 0]}>
            <boxGeometry args={[1.05, 1.2, 0.9]} />
            <meshStandardMaterial color="#d43a2b" roughness={0.7} metalness={0.15} flatShading />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/** V6 — fixed framing: camera (0,18,30), lookAt (0,8,0). */
function CameraPush() {
  useFrame((state) => {
    state.camera.position.set(0, 18, 30)
    state.camera.lookAt(0, 8, 0)
  })
  return null
}

export default function TerminalScene() {
  return (
    <SceneCanvas fallbackLabel="Terminal" tone="orange" camera={{ position: [0, 18, 30], fov: 45 }}>
      <color attach="background" args={['#B8C4CC']} />
      <fog attach="fog" args={['#B8C4CC', 45, 110]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[22, 34, 12]} intensity={1.9} color="#fff2dd" />

      <SkyDome />
      {/* V6 — dark apron #2E2E2E 400×400 + white lanes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#2e2e2e" roughness={0.9} />
      </mesh>
      <Lanes />

      <ContainerYard />
      <GantryCrane />
      <CameraPush />
    </SceneCanvas>
  )
}
