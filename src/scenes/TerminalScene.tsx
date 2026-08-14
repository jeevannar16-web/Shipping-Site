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
  g.fillStyle = '#F4F3F1'
  g.fillRect(0, 0, 256, 128)
  g.fillStyle = '#C9C7C4'
  for (let x = 8; x < 256; x += 16) g.fillRect(x, 0, 4, 128)
  g.strokeStyle = '#B9B7B4'
  g.lineWidth = 1
  g.strokeRect(0.5, 0.5, 255, 127)
  return new THREE.CanvasTexture(c)
}

function hazard() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 32
  const g = c.getContext('2d')!
  for (let i = -32; i < 160; i += 32) {
    g.fillStyle = '#111'
    g.beginPath()
    g.moveTo(i, 32)
    g.lineTo(i + 16, 0)
    g.lineTo(i + 32, 0)
    g.lineTo(i + 16, 32)
    g.fill()
    g.fillStyle = '#E5B31B'
    g.beginPath()
    g.moveTo(i + 16, 32)
    g.lineTo(i + 32, 0)
    g.lineTo(i + 48, 0)
    g.lineTo(i + 32, 32)
    g.fill()
  }
  return new THREE.CanvasTexture(c)
}

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

const YARD_COLORS = ['ribWhite', '#2456B0', '#E8590C', '#2E8B57', '#7a3222']

function ContainerYard() {
  const ribT = useMemo(ribWhite, [])
  const yard = useMemo(() => {
    const geo = new THREE.BoxGeometry(6, 2.6, 2.4)
    const white = new THREE.MeshStandardMaterial({ color: '#F4F3F1', map: ribT, roughness: 0.75, metalness: 0.15, flatShading: true })
    const colorMap: Record<string, string> = {
      '#2456B0': '#2456B0',
      '#E8590C': '#E8590C',
      '#2E8B57': '#2E8B57',
      '#7a3222': '#7a3222',
    }
    const plainMats = Object.entries(colorMap).map(([, c]) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.15, flatShading: true }))
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
          const colorIdx = (r + c + s) % YARD_COLORS.length
          if (YARD_COLORS[colorIdx] === 'ribWhite') {
            whiteMesh.setMatrixAt(wi++, m)
          } else {
            const plainIdx = Object.keys(colorMap).indexOf(YARD_COLORS[colorIdx])
            plain[plainIdx >= 0 ? plainIdx : 0].setMatrixAt(pi++, m)
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

function GantryCrane() {
  const trolleyRef = useRef<THREE.Group>(null)
  const spreaderRef = useRef<THREE.Group>(null)
  const containerRef = useRef<THREE.Mesh>(null)
  const cableRefs = useRef<Array<THREE.Mesh | null>>([])
  const hazT = useMemo(hazard, [])

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
      {[-11, 11].map((x) =>
        [-9, 9].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 7, z]}>
            <boxGeometry args={[1, 14, 1]} />
            <meshStandardMaterial color="#E8E8E8" roughness={0.5} metalness={0.2} />
          </mesh>
        )),
      )}
      <mesh position={[0, 13.5, 0]}>
        <boxGeometry args={[24, 1.4, 1.8]} />
        <meshStandardMaterial color="#E8E8E8" roughness={0.4} metalness={0.4} />
      </mesh>
      <group ref={trolleyRef} position={[-6, 12.7, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 1, 2.5]} />
          <meshStandardMaterial color="#333333" roughness={0.4} />
        </mesh>
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
        <group ref={spreaderRef} position={[0, 9 + 1.3 - 12.7, 0]}>
          {/* hazard striped spreader */}
          <mesh>
            <boxGeometry args={[6.4, 0.4, 2.6]} />
            <meshStandardMaterial map={hazT} roughness={0.5} />
          </mesh>
          {/* orange container with hazard stripes on top */}
          <group ref={containerRef} position={[0, -1.3, 0]}>
            <mesh>
              <boxGeometry args={[6, 2.6, 2.4]} />
              <meshStandardMaterial color="#E8590C" roughness={0.7} metalness={0.15} flatShading />
            </mesh>
            <mesh position={[0, 1.3, 0]}>
              <boxGeometry args={[6.2, 0.15, 2.6]} />
              <meshStandardMaterial map={hazT} roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

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
