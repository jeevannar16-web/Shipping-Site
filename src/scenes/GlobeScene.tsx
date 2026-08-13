import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { Starfield } from './builders'

const RADIUS = 2.8
const DOT_TOTAL = 4500

function latLng(lat: number, lng: number, r = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

const MARKERS: { id: string; label: string; lat: number; lng: number }[] = [
  { id: 'gb', label: 'UK', lat: 54, lng: -2 },
  { id: 'de', label: 'GERMANY', lat: 51, lng: 10 },
  { id: 'us', label: 'USA', lat: 39, lng: -98 },
  { id: 'jp', label: 'JAPAN', lat: 36, lng: 138 },
  { id: 'cn', label: 'CHINA', lat: 35, lng: 104 },
  { id: 'in', label: 'INDIA', lat: 21, lng: 78 },
  { id: 'hk', label: 'HONG KONG', lat: 22, lng: 114 },
  { id: 'au', label: 'AUSTRALIA', lat: -25, lng: 134 },
  { id: 'np', label: 'NEPAL', lat: 28, lng: 84 },
]

const FRESNEL_VERT = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const FRESNEL_FRAG = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float r = RADIUS;
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.0);
    float up = clamp(normalize(vNormal).y, 0.0, 1.0);
    vec3 top = vec3(1.0, 0.29, 0.0);
    vec3 bottom = vec3(0.17, 0.29, 1.0);
    vec3 col = mix(bottom, top, pow(up, 0.7));
    float pulse = 0.85 + 0.15 * sin(uTime * 1.5);
    gl_FragColor = vec4(col, rim * pulse * 0.9);
  }
`

/** F1 — dot-matrix planet: 4500 fibonacci points, land only via equirect mask. */
function DotPlanet() {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  // safe 1x1 white texture so a failed mask load keeps ALL dots (fallback)
  const fallback = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1)
    t.needsUpdate = true
    return t
  }, [])

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(
      '/earth-mask.png',
      (t) => {
        t.colorSpace = THREE.NoColorSpace
        t.anisotropy = 4
        setTex(t)
      },
      undefined,
      () => setTex(null),
    )
  }, [])

  const { positions } = useMemo(() => {
    const pos = new Float32Array(DOT_TOTAL * 3)
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < DOT_TOTAL; i++) {
      const y = 1 - (i / (DOT_TOTAL - 1)) * 2
      const radius = Math.sqrt(1 - y * y) * RADIUS
      const theta = golden * i
      pos[i * 3] = Math.cos(theta) * radius
      pos[i * 3 + 1] = y * RADIUS
      pos[i * 3 + 2] = Math.sin(theta) * radius
    }
    return { positions: pos }
  }, [])

  useFrame((state) => {
    if (!matRef.current) return
    const cam = state.camera as THREE.PerspectiveCamera
    const size = state.size
    const d = cam.position.length()
    const halfH = 'fov' in cam ? d * Math.tan((cam.fov * Math.PI) / 360) : d
    const uPC = size.height / (2 * halfH)
    matRef.current.uniforms.uPC.value = uPC
  })

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTex: { value: fallback },
          uPC: { value: 0 },
          uSize: { value: 0.03 },
        },
        vertexShader: `
          attribute vec3 position;
          uniform float uPC;
          uniform float uSize;
          varying vec2 vUv;
          void main() {
            vec3 n = normalize(position);
            vUv = vec2(
              mod((atan(n.z, -n.x) + 3.14159265359) / 6.28318530718 + 0.5, 1.0),
              1.0 - acos(clamp(n.y, -1.0, 1.0)) / 3.14159265359
            );
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = clamp(uPC * uSize / max(-mv.z, 0.1), 1.0, 14.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTex;
          varying vec2 vUv;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            if (dot(c, c) > 0.25) discard;
            float lum = texture2D(uTex, vUv).r;
            if (lum < 0.5) discard;
            gl_FragColor = vec4(vec3(0.725), 1.0);
          }
        `,
      }),
    [fallback],
  )

  useEffect(() => {
    if (material.uniforms.uTex.value instanceof THREE.Texture && tex) {
      material.uniforms.uTex.value = tex
      material.needsUpdate = true
    }
  }, [tex, material])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <primitive object={material} ref={matRef} attach="material" />
    </points>
  )
}

function FresnelShell() {
  const mat = useMemo(() => new THREE.ShaderMaterial(createShell()), [])
  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime
  })
  return (
    <mesh material={mat}>
      <sphereGeometry args={[2.95, 64, 64]} />
    </mesh>
  )
}

function createShell() {
  return {
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: FRESNEL_VERT,
    fragmentShader: FRESNEL_FRAG,
  }
}

/** F1 — arc with dash draw-on (2s) + travelling dot, respawn every 3s. */
function Arc({ from, to, offset }: { from: [number, number]; to: [number, number]; offset: number }) {
  const a = useMemo(() => latLng(from[0], from[1]), [from])
  const b = useMemo(() => latLng(to[0], to[1]), [to])

  const curve = useMemo(() => {
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS * 1.35)
    return new THREE.QuadraticBezierCurve3(a.clone().multiplyScalar(1.03), mid, b.clone().multiplyScalar(1.03))
  }, [a, b])

  const tube = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.01, 6, false), [curve])

  const meshRef = useRef<THREE.Mesh>(null)
  const dotRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const phase = (t * 0.333 + offset) % 1 // cycle 3s
    const draw = Math.min(phase / 0.667, 1) // draw over 2s
    const g = meshRef.current?.geometry as THREE.TubeGeometry | undefined
    if (g && g.index) {
      g.setDrawRange(0, Math.floor(g.index.count * draw))
    }
    if (meshRef.current) {
      const m = meshRef.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.35 + 0.35 * draw
    }
    if (dotRef.current) {
      curve.getPoint(draw, dotRef.current.position)
      dotRef.current.visible = draw > 0.01 && draw < 1
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={tube}>
        <meshBasicMaterial color="#ff4a00" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshBasicMaterial color="#ff4a00" />
      </mesh>
    </group>
  )
}

const ARCS: { from: [number, number]; to: [number, number]; offset: number }[] = [
  { from: [28, 84], to: [54, -2], offset: 0.0 },
  { from: [28, 84], to: [39, -98], offset: 0.25 },
  { from: [21, 78], to: [36, 138], offset: 0.5 },
  { from: [35, 104], to: [-25, 134], offset: 0.75 },
]

function Arcs() {
  return (
    <group>
      {ARCS.map((arc, i) => (
        <Arc key={i} {...arc} />
      ))}
    </group>
  )
}

/** F1 — 9 orange marker dots + tags; hide a tag when its point faces away. */
function Markers() {
  const groupRef = useRef<THREE.Group>(null)
  const labelRefs = useRef<Array<HTMLDivElement | null>>([])
  const base = useMemo(() => MARKERS.map((m) => latLng(m.lat, m.lng, RADIUS * 0.99)), [])
  const center = useMemo(() => new THREE.Vector3(), [])
  const worldPos = useMemo(() => new THREE.Vector3(), [])
  const normal = useMemo(() => new THREE.Vector3(), [])
  const camDir = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const g = groupRef.current
    if (!g) return
    g.updateMatrixWorld()
    g.getWorldPosition(center)
    for (let i = 0; i < base.length; i++) {
      worldPos.copy(base[i]).applyMatrix4(g.matrixWorld)
      normal.copy(worldPos).sub(center).normalize()
      camDir.copy(state.camera.position).sub(worldPos).normalize()
      const el = labelRefs.current[i]
      if (el) el.style.opacity = camDir.dot(normal) < 0.1 ? '0' : '1'
    }
  })

  return (
    <group ref={groupRef}>
      {MARKERS.map((m, i) => {
        const pos = base[i]
        return (
          <group key={m.id} position={pos}>
            <mesh>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ff4a00" />
            </mesh>
            <Html
              position={[0, 0.18, 0]}
              center
              distanceFactor={30}
              zIndexRange={[20, 0]}
              style={{ pointerEvents: 'none' }}
            >
              <div
                ref={(el) => {
                  labelRefs.current[i] = el
                }}
                className="whitespace-nowrap rounded border border-[#333] bg-[#0a0a0a] px-2.5 py-0.5 font-mono text-[9px] tracking-[0.14em] text-white shadow-[0_2px_12px_rgba(0,0,0,0.5)] transition-opacity duration-300"
              >
                {m.label}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

/** F1 — slow rotation + parallax + positions globe center at 68% / 55%. */
function Rig() {
  const ref = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const g = ref.current
    if (!g) return
    const cam = state.camera as THREE.PerspectiveCamera
    const d = cam.position.length()
    const halfH = 'fov' in cam ? d * Math.tan((cam.fov * Math.PI) / 360) : d
    const halfW = halfH * state.size.width / Math.max(state.size.height, 1)
    g.position.x = 0.36 * halfW
    g.position.y = 0.1 * halfH
    g.rotation.y += 0.048 * delta
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.05, 0.05)
  })

  return (
    <group ref={ref}>
      <DotPlanet />
      <FresnelShell />
      <Arcs />
      <Markers />
    </group>
  )
}

export default function GlobeScene() {
  return (
    <SceneCanvas fallbackLabel="Global" tone="violet" camera={{ position: [0, 0, 19.3], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <Starfield count={300} />
      <Rig />
    </SceneCanvas>
  )
}