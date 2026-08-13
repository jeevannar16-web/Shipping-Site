import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { VisualTest } from '../dev/VisualTest'

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

/** YARD — LONG container block: containers LONG axis X (6,2.6,2.4), 4 rows × step 6.3, 6 cols z step 2.6, stacks 1–3. */
const YARD_COLORS = ['#7a3222', '#b45a1e', '#2e5b40', '#24457a', '#6a6a6a', '#8b3a2a']

function ContainerYard() {
  const meshes = useMemo(() => {
    const geo = new THREE.BoxGeometry(6, 2.6, 2.4)
    const mats = YARD_COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.15, flatShading: true }))
    const inst = mats.map(() => new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial(), 216))
    const m = new THREE.Matrix4()
    let idx = 0
    for (let r = 0; r < 4; r++) {
      const x = -9.45 + r * 6.3
      for (let c = 0; c < 6; c++) {
        const z = -6.5 + c * 2.6
        const stack = 1 + ((r + c) % 3)
        for (let s = 0; s < stack; s++) {
          const y = 1.3 + s * 2.6
          const mi = (r * 7 + c * 3 + s) % YARD_COLORS.length
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

/** YARD — gantry crane: white legs (1,12,1) at (±11,6,±9), beam (24,1.4,1.8) y 11.5, trolley #222 y 10.7 x -6→6. */
function GantryCrane() {
  const trolleyRef = useRef<THREE.Group>(null)
  const spreaderRef = useRef<THREE.Group>(null)
  const containerRef = useRef<THREE.Mesh>(null)
  const cableRefs = useRef<Array<THREE.Mesh | null>>([])

  useFrame((state) => {
    const t = (state.clock.elapsedTime % 20) / 20
    const trolley = trolleyRef.current
    const spreader = spreaderRef.current
    const container = containerRef.current
    if (!trolley || !spreader || !container) return

    let tx: number
    let sy: number
    if (t < 0.3) {
      const p = t / 0.3
      tx = -6 + p * 12
      sy = 9
    } else if (t < 0.45) {
      const p = (t - 0.3) / 0.15
      tx = 6
      sy = 9 - p * 6
    } else if (t < 0.7) {
      const p = (t - 0.45) / 0.25
      tx = 6 - p * 12
      sy = 3
    } else if (t < 0.85) {
      const p = (t - 0.7) / 0.15
      tx = -6
      sy = 3 + p * 6
    } else {
      const p = (t - 0.85) / 0.15
      tx = -6 + p * 12
      sy = 9
    }

    trolley.position.x = tx
    spreader.position.y = sy - 10.7
    container.position.y = sy - 1.3 - 10.7

    const topY = 10.15
    const botY = sy + 0.5
    const len = Math.max(topY - botY, 0.3)
    cableRefs.current.forEach((c) => {
      if (!c) return
      c.position.y = (topY + botY) / 2 - 10.7
      c.scale.set(1, len, 1)
    })
  })

  return (
    <group position={[0, 0, 0]}>
      {/* YARD — 4 white legs (1,12,1) at (±11,6,±9) */}
      {[-11, 11].map((x) =>
        [-9, 9].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 6, z]}>
            <boxGeometry args={[1, 12, 1]} />
            <meshStandardMaterial color="#f2f2f2" roughness={0.5} metalness={0.2} />
          </mesh>
        )),
      )}
      {/* YARD — main beam (24,1.4,1.8) y 11.5 */}
      <mesh position={[0, 11.5, 0]}>
        <boxGeometry args={[24, 1.4, 1.8]} />
        <meshStandardMaterial color="#3a3f45" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* YARD — trolley (2.5,1,2.5) #222 y 10.7 */}
      <group ref={trolleyRef} position={[-6, 10.7, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 1, 2.5]} />
          <meshStandardMaterial color="#222222" roughness={0.4} />
        </mesh>
        {/* YARD — cables trolley → spreader, r .06 */}
        {[1, -1].map((off, i) => (
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
        {/* YARD — spreader + hung LONG container same size (6,2.6,2.4), orange, y 3..9 */}
        <group ref={spreaderRef} position={[0, 9 - 10.7, 0]}>
          <mesh>
            <boxGeometry args={[6.4, 0.4, 2.6]} />
            <meshStandardMaterial color="#c46a2b" roughness={0.5} />
          </mesh>
          <mesh ref={containerRef} position={[0, -1.5, 0]}>
            <boxGeometry args={[6, 2.6, 2.4]} />
            <meshStandardMaterial color="#c46a2b" roughness={0.7} metalness={0.15} flatShading />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/** YARD — camera (0,13,26), lookAt (0,5,0). */
function CameraPush() {
  useFrame((state) => {
    state.camera.position.set(0, 13, 26)
    state.camera.lookAt(0, 5, 0)
  })
  return null
}

export default function TerminalScene() {
  const fitRef = useRef<THREE.Group>(null)
  return (
    <SceneCanvas fallbackLabel="Terminal" tone="orange" camera={{ position: [0, 13, 26], fov: 50 }}>
      <color attach="background" args={['#B8C4CC']} />
      <fog attach="fog" args={['#B8C4CC', 40, 110]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[-6, 12, 8]} intensity={1.2} color="#ffffff" />

      <SkyDome />
      {/* YARD — dark apron #2E2E2E 400×400 + white lanes (sibling of measured group) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#2e2e2e" roughness={0.9} />
      </mesh>
      <Lanes />

      <group ref={fitRef}>
        <VisualTest label="YARD" target={() => fitRef.current} y={[100, 680]} x={[0, 1280]} />
        <ContainerYard />
        <GantryCrane />
      </group>
      <CameraPush />
    </SceneCanvas>
  )
}
