import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'

const RADIUS = 1.65

function latLng(lat: number, lng: number, r = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

const MARKERS = [
  { id: 'np', label: 'NEPAL', lat: 27.7172, lng: 85.324 },
  { id: 'in', label: 'INDIA', lat: 28.6139, lng: 77.209 },
  { id: 'cn', label: 'CHINA', lat: 39.9042, lng: 116.4074 },
  { id: 'hk', label: 'HONG KONG', lat: 22.3193, lng: 114.1694 },
  { id: 'au', label: 'AUSTRALIA', lat: -33.8688, lng: 151.2093 },
  { id: 'gb', label: 'UK', lat: 51.5074, lng: -0.1278 },
  { id: 'us', label: 'USA', lat: 34.0522, lng: -118.2437 },
]

function PointsSphere() {
  const pts = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(RADIUS, 4)
    const positions = geo.attributes.position.array
    const out = new Float32Array(positions.length)
    for (let i = 0; i < positions.length; i += 3) {
      const v = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]).multiplyScalar(0.998)
      out[i] = v.x
      out[i + 1] = v.y
      out[i + 2] = v.z
    }
    return out
  }, [])

  const matRef = useRef<THREE.PointsMaterial>(null)

  useFrame((state) => {
    if (!matRef.current) return
    const t = state.clock.elapsedTime
    matRef.current.size = 1.6 + 0.4 * Math.sin(t * 1.4)
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pts, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={matRef} size={1.7} color="#f2f2f2" sizeAttenuation transparent opacity={0.9} />
    </points>
  )
}

function FresnelRim() {
  const ref = useRef<THREE.Mesh>(null)
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float rim = 1.0 - abs(dot(vNormal, vView));
            rim = pow(clamp(rim, 0.0, 1.0), 3.0);
            // top orange, bottom blue based on world Y
            vec3 nWorld = normalize(normalMatrix * vNormal);
            float up = clamp(nWorld.y, 0.0, 1.0);
            vec3 top = vec3(1.0, 0.29, 0.0);
            vec3 bottom = vec3(0.17, 0.29, 1.0);
            vec3 col = mix(bottom, top, up);
            float flicker = 0.9 + 0.1 * sin(uTime * 2.0);
            gl_FragColor = vec4(col, rim * flicker);
          }
        `,
      }),
    [],
  )

  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.03
  })

  return (
    <mesh ref={ref} scale={1.018} material={mat}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
    </mesh>
  )
}

function Arc({ from, to, color, offset }: { from: [number, number]; to: [number, number]; color: string; offset: number }) {
  const a = useMemo(() => latLng(from[0], from[1]), [from])
  const b = useMemo(() => latLng(to[0], to[1]), [to])

  const curve = useMemo(() => {
    const mid = a.clone().add(b).multiplyScalar(0.5)
    mid.normalize().multiplyScalar(RADIUS * 1.32)
    return new THREE.QuadraticBezierCurve3(a, mid, b)
  }, [a, b])

  const tube = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.008, 6, false), [curve])

  const glowRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const progress = (t * 0.08 + offset) % 1
    if (glowRef.current) {
      curve.getPoint(progress, glowRef.current.position)
    }
    if (matRef.current) {
      matRef.current.opacity = 0.35 + 0.35 * (1 - Math.abs(progress - 0.5) * 2)
    }
  })

  return (
    <group>
      <mesh geometry={tube}>
        <meshBasicMaterial
          ref={matRef}
          color={color}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}

const ARCS: { from: [number, number]; to: [number, number]; color: string; offset: number }[] = [
  { from: [27.7, 85.3], to: [28.6, 77.2], color: '#ff4a00', offset: 0.0 },
  { from: [27.7, 85.3], to: [39.9, 116.4], color: '#ff4a00', offset: 0.2 },
  { from: [28.6, 77.2], to: [-33.9, 151.2], color: '#2b4bff', offset: 0.4 },
  { from: [39.9, 116.4], to: [-33.9, 151.2], color: '#2b4bff', offset: 0.6 },
  { from: [51.5, -0.1], to: [34.1, -118.2], color: '#ff4a00', offset: 0.8 },
  { from: [22.3, 114.2], to: [51.5, -0.1], color: '#c77cff', offset: 0.1 },
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

function Markers() {
  return (
    <group>
      {MARKERS.map((m) => {
        const pos = latLng(m.lat, m.lng, RADIUS * 0.99)
        return (
          <group key={m.id} position={pos}>
            <mesh>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshBasicMaterial color="#c77cff" />
            </mesh>
            <Html position={[0, 0.14, 0]} center distanceFactor={9} zIndexRange={[20, 0]} occlude style={{ pointerEvents: 'none' }}>
              <div className="whitespace-nowrap rounded border border-white/20 bg-black/80 px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] text-white/90">
                {m.label}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

function Rig() {
  const ref = useRef<THREE.Group>(null)
  useFrame((state, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.05
    const { x, y } = state.pointer
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, y * 0.15, 0.05)
    ref.current.rotation.y += x * 0.008
  })
  return (
    <group ref={ref} rotation={[0.4, 0, 0]}>
      <PointsSphere />
      <FresnelRim />
      <Arcs />
      <Markers />
    </group>
  )
}

export default function GlobeScene() {
  return (
    <SceneCanvas fallbackLabel="Global" tone="violet" camera={{ position: [0, 0.4, 5.4], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <Rig />
    </SceneCanvas>
  )
}