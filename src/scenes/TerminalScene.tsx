import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { VisualTest } from '../dev/VisualTest'

function ribWhite() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#FAFAFA'
  g.fillRect(0, 0, 256, 128)
  g.fillStyle = '#d9d9d9'
  for (let x = 8; x < 256; x += 16) g.fillRect(x, 0, 4, 128)
  return new THREE.CanvasTexture(c)
}

/** v18 YARD — bright sky gradient #C9D3D8 → #D8DDE0 inside a dome. */
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
            vec3 col = mix(vec3(0.788, 0.827, 0.847), vec3(0.847, 0.867, 0.878), pow(h, 0.7));
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

/** v19 YARD — LONG containers (6,2.6,2.4), 4 rows × 6 cols; ~40% white ribbed + saturated palette. */
const YARD_COLORS = ['#7a3222', '#b45a1e', '#2e5b40', '#24457a', '#6a6a6a', '#8b3a2a']

function ContainerYard() {
  const ribT = useMemo(ribWhite, [])
  const yard = useMemo(() => {
    const geo = new THREE.BoxGeometry(6, 2.6, 2.4)
    const plainMats = YARD_COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.15, flatShading: true }))
    const white = new THREE.MeshStandardMaterial({ color: '#FAFAFA', map: ribT, roughness: 0.75, metalness: 0.15, flatShading: true })
    const plain = plainMats.map(() => new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial(), 216))
    const whiteMesh = new THREE.InstancedMesh(geo, white, 216)
    const m = new THREE.Matrix4()
    let pi = 0
    let wi = 0
    for (let r = 0; r < 4; r++) {
      const x = -9.45 + r * 6.3
      for (let c = 0; c < 6; c++) {
        const z = -6.5 + c * 2.6
        const stack = 1 + ((r + c) % 3)
        for (let s = 0; s < stack; s++) {
          const y = 1.3 + s * 2.6
          m.makeTranslation(x, y, z)
          const mi = (r * 7 + c * 3 + s) % YARD_COLORS.length
          // ~40% white ribbed shells
          if ((r + c + s) % 5 < 2) {
            whiteMesh.setMatrixAt(wi++, m)
          } else {
            plain[mi].setMatrixAt(pi++, m)
          }
        }
      }
    }
    plain.forEach((mm, mi) => {
      mm.count = pi
      mm.material = plainMats[mi]
      mm.instanceMatrix.needsUpdate = true
    })
    whiteMesh.count = wi
    whiteMesh.instanceMatrix.needsUpdate = true
    return [...plain, whiteMesh]
  }, [ribT])

  return (
    <group>
      {yard.map((mm, i) => (
        <primitive key={i} object={mm} />
      ))}
    </group>
  )
}

/** v18 YARD — 2 white lane stripes painted on the dark apron (z ± 12). */
function Lanes() {
  const stripes = useMemo(() => [-12, 12], [])
  return (
    <group>
      {stripes.map((z) => (
        <mesh key={z} position={[0, 0.02, z]}>
          <boxGeometry args={[40, 0.03, 0.08]} />
          <meshBasicMaterial color="#f2f2f2" />
        </mesh>
      ))}
    </group>
  )
}

/** v19 YARD — gantry crane: white legs (1,14,1) at (±11,7,±9), beam (24,1.4,1.8) y 13.5, trolley #333 y 12.7 x -6→6. */
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
      sy = 9 - p * 5
    } else if (t < 0.7) {
      const p = (t - 0.45) / 0.25
      tx = 6 - p * 12
      sy = 4
    } else if (t < 0.85) {
      const p = (t - 0.7) / 0.15
      tx = -6
      sy = 4 + p * 5
    } else {
      const p = (t - 0.85) / 0.15
      tx = -6 + p * 12
      sy = 9
    }

    trolley.position.x = tx
    spreader.position.y = sy + 1.3 - 12.7
    container.position.y = sy - 12.7

    const topY = 12.15
    const botY = sy + 1.5
    const len = Math.max(topY - botY, 0.3)
    cableRefs.current.forEach((c) => {
      if (!c) return
      c.position.y = (topY + botY) / 2 - 12.7
      c.scale.set(1, len, 1)
    })
  })

  return (
    <group position={[0, 0, 0]}>
      {/* v19 — 4 white legs (1,14,1) at (±11,7,±9) */}
      {[-11, 11].map((x) =>
        [-9, 9].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 7, z]}>
            <boxGeometry args={[1, 14, 1]} />
            <meshStandardMaterial color="#E8E8E8" roughness={0.5} metalness={0.2} />
          </mesh>
        )),
      )}
      {/* v19 — main beam (24,1.4,1.8) y 13.5 */}
      <mesh position={[0, 13.5, 0]}>
        <boxGeometry args={[24, 1.4, 1.8]} />
        <meshStandardMaterial color="#E8E8E8" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* v19 — trolley (2.5,1,2.5) #333 y 12.7 */}
      <group ref={trolleyRef} position={[-6, 12.7, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 1, 2.5]} />
          <meshStandardMaterial color="#333333" roughness={0.4} />
        </mesh>
        {/* cables trolley → spreader, r .05 */}
        {[1, -1].map((off, i) => (
          <mesh
            key={i}
            position={[0, 0, off]}
            ref={(el) => {
              cableRefs.current[i] = el
            }}
          >
            <cylinderGeometry args={[0.05, 0.05, 1, 6]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
          </mesh>
        ))}
        {/* spreader + hanging LONG container (6,2.6,2.4) #E8590C, y 4..9 */}
        <group ref={spreaderRef} position={[0, 9 + 1.3 - 12.7, 0]}>
          <mesh>
            <boxGeometry args={[6.4, 0.4, 2.6]} />
            <meshStandardMaterial color="#c46a2b" roughness={0.5} />
          </mesh>
          <mesh ref={containerRef} position={[0, -1.3, 0]}>
            <boxGeometry args={[6, 2.6, 2.4]} />
            <meshStandardMaterial color="#E8590C" roughness={0.7} metalness={0.15} flatShading />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/** v19 YARD — camera (0,22,55), lookAt (0,6,0), fov 35. */
function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useLayoutEffect(() => {
    camera.fov = 35
    camera.position.set(0, 22, 55)
    camera.lookAt(0, 6, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

export default function TerminalScene() {
  const fitRef = useRef<THREE.Group>(null)
  return (
    <SceneCanvas fallbackLabel="Terminal" tone="orange" camera={{ position: [0, 22, 55], fov: 35 }}>
      <color attach="background" args={['#C9D3D8']} />
      <fog attach="fog" args={['#C9D3D8', 50, 140]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[-6, 12, 8]} intensity={1.1} color="#ffffff" />

      <SkyDome />
      {/* v19 YARD — dark apron #2E2E2E 400×400 + white lanes (sibling of measured group) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#2e2e2e" roughness={0.9} />
      </mesh>
      <Lanes />

      <group ref={fitRef}>
        <VisualTest label="YARD" target={() => fitRef.current} y={[160, 470]} x={[270, 1360]} />
        <ContainerYard />
        <GantryCrane />
      </group>
      <CameraRig />
    </SceneCanvas>
  )
}