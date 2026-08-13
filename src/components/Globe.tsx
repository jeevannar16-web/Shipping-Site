import { useMemo, useRef, useState, Suspense, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { Country } from '../data'
import { COUNTRIES } from '../data'

const clampLat = (lat: number) => THREE.MathUtils.clamp(lat, -85, 85)

function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

function createArcPoints(start: THREE.Vector3, end: THREE.Vector3, radius: number, lift = 0.32) {
  const points: THREE.Vector3[] = []
  const segments = 64
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const base = start.clone().lerp(end, t).normalize()
    const midLength = start.clone().add(end).multiplyScalar(0.5).length() / radius
    const height = radius * lift * Math.sin(t * Math.PI) * (0.5 + midLength)
    const dir = base.clone().multiplyScalar(height)
    points.push(base.clone().multiplyScalar(radius).add(dir))
  }
  return points
}

/** Soft neon atmosphere rim glow (Fresnel). */
function Atmosphere({ radius }: { radius: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.02
  })
  return (
    <mesh ref={meshRef} scale={1.18}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 glow = mix(vec3(0.0, 0.94, 1.0), vec3(0.36, 0.06, 1.0), 0.25);
            gl_FragColor = vec4(glow, 1.0) * intensity;
          }
        `}
      />
    </mesh>
  )
}

/** Glowing lat/long wireframe grid overlay on the globe surface. */
function WireGrid({ radius }: { radius: number }) {
  const ref = useRef<THREE.LineSegments>(null!)
  const geometry = useMemo(() => {
    const pts: number[] = []
    const steps = 48
    for (let i = 0; i <= steps; i++) {
      const phi = (i / steps) * Math.PI * 2
      for (let j = 0; j <= steps; j++) {
        const theta = (j / steps) * Math.PI
        const x = radius * Math.sin(theta) * Math.cos(phi)
        const y = radius * Math.cos(theta)
        const z = radius * Math.sin(theta) * Math.sin(phi)
        pts.push(x, y, z)
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
    return geo
  }, [radius])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.012
      const mat = ref.current.material as THREE.LineBasicMaterial
      mat.opacity = 0.14 + Math.sin(clock.getElapsedTime() * 0.4) * 0.04
    }
  })

  return (
    <lineSegments ref={ref}>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#2dd4bf" transparent opacity={0.15} />
    </lineSegments>
  )
}

function CountryMarker({
  country,
  radius,
  onHover,
  isActive,
}: {
  country: Country
  radius: number
  onHover: (country: Country | null) => void
  isActive: boolean
}) {
  const pulseRef = useRef<THREE.Mesh>(null!)
  const dotRef = useRef<THREE.Mesh>(null!)
  const pos = useMemo(() => latLngToVector3(clampLat(country.lat), country.lng, radius), [country, radius])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (dotRef.current) dotRef.current.scale.setScalar(1 + Math.sin(t * 2.4 + pos.x * 5) * 0.2)
    if (pulseRef.current) {
      const s = ((t * 0.35 + country.lng) % 1) * 5
      pulseRef.current.scale.setScalar(s)
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 0.8 * (1 - s / 5))
    }
  })

  return (
    <group position={pos}>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={isActive ? '#f5a524' : '#2dd4bf'} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh
        ref={dotRef}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(country)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onHover(null)
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[isActive ? 0.032 : 0.022, 16, 16]} />
        <meshBasicMaterial color={isActive ? '#f5a524' : '#2dd4bf'} />
      </mesh>
      <pointLight color={isActive ? '#f5a524' : '#2dd4bf'} intensity={8} distance={1.8} decay={2} />
    </group>
  )
}

function RouteArc({ points }: { points: THREE.Vector3[] }) {
  const lineRef = useRef<THREE.Line>(null!)
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3),
    )
    const material = new THREE.LineBasicMaterial({
      color: '#2dd4bf',
      transparent: true,
      opacity: 0.35,
    })
    return new THREE.Line(geometry, material)
  }, [points])
  useFrame(({ clock }) => {
    const mat = lineRef.current?.material as THREE.LineBasicMaterial | undefined
    if (mat) {
      mat.opacity = 0.25 + Math.sin(clock.getElapsedTime() * 1.2 + points[0].x * 3) * 0.15
    }
  })
  return <primitive ref={lineRef} object={line} />
}

function FlyingDot({ points, offset }: { points: THREE.Vector3[]; offset: number }) {
  const dotRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.12 + offset) % 1
    const idx = t * (points.length - 1)
    const i = Math.floor(idx)
    const f = idx - i
    const a = points[i] ?? points[0]
    const b = points[Math.min(i + 1, points.length - 1)] ?? a
    if (dotRef.current) dotRef.current.position.lerpVectors(a, b, f)
  })
  return (
    <mesh ref={dotRef}>
      <sphereGeometry args={[0.014, 8, 8]} />
      <meshBasicMaterial
        color="#aef6ff"
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function CameraRig({ children }: { children: React.ReactNode }) {
  const { camera, mouse } = useThree()
  useFrame(() => {
    const targetX = mouse.x * 0.5
    const targetY = mouse.y * 0.3
    camera.position.x += (targetX - camera.position.x) * 0.04
    camera.position.y += (targetY - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return <>{children}</>
}

function Globe({ activeCountryId, onHover }: { activeCountryId: string | null; onHover: (country: Country | null) => void }) {
  const groupRef = useRef<THREE.Group>(null!)
  const radius = 2
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    const url = 'https://unpkg.com/three-globe/example/img/earth-dark.jpg'
    const fallback = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
    loader.load(
      url,
      (tex) => {
        if (!cancelled) setEarthTexture(tex)
      },
      undefined,
      () => {
        loader.load(
          fallback,
          (tex) => {
            if (!cancelled) setEarthTexture(tex)
          },
          undefined,
          () => {
            if (!cancelled) setEarthTexture(null)
          },
        )
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  const markers = useMemo(
    () => COUNTRIES.map((c) => latLngToVector3(clampLat(c.lat), c.lng, radius)),
    [radius],
  )

  const arcs = useMemo(() => {
    const a: { points: THREE.Vector3[]; offset: number }[] = []
    for (let i = 0; i < markers.length; i++) {
      for (let j = i + 1; j < markers.length; j++) {
        if (Math.random() > 0.68) continue
        const pts = createArcPoints(markers[i], markers[j], radius)
        a.push({ points: pts, offset: Math.random() })
      }
    }
    return a
  }, [markers, radius])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12
    }
  })

  const dotTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#0b0e14'
    ctx.fillRect(0, 0, 512, 256)
    for (let i = 0; i < 2200; i++) {
      const lat = Math.random() * 180 - 90
      const lng = Math.random() * 360 - 180
      const v = latLngToVector3(clampLat(lat), lng, 1)
      const px = (v.x / 2 + 0.5) * 512
      const py = (-v.z / 2 + 0.5) * 256
      ctx.fillStyle = `rgba(140,220,255,${0.1 + Math.random() * 0.25})`
      ctx.fillRect(px, py, 1.4, 1.4)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.anisotropy = 8
    return tex
  }, [])

  return (
    <group ref={groupRef}>
      {earthTexture ? (
        <mesh>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshPhongMaterial map={earthTexture} shininess={8} specular="#1a3a44" />
        </mesh>
      ) : (
        <>
          <mesh>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshBasicMaterial color="#0c1017" />
          </mesh>
          <mesh>
            <sphereGeometry args={[radius * 1.0005, 64, 64]} />
            <meshBasicMaterial map={dotTexture} transparent opacity={0.65} depthWrite={false} />
          </mesh>
        </>
      )}
      <WireGrid radius={radius * 1.004} />
      <Atmosphere radius={radius} />
      {arcs.map(({ points }, i) => (
        <RouteArc key={i} points={points} />
      ))}
      {arcs.map(({ points, offset }, i) => (
        <FlyingDot key={`dot-${i}`} points={points} offset={offset} />
      ))}
      {markers.map((_, i) => (
        <CountryMarker
          key={COUNTRIES[i].id}
          country={COUNTRIES[i]}
          radius={radius}
          onHover={onHover}
          isActive={COUNTRIES[i].id === activeCountryId}
        />
      ))}
      <ambientLight intensity={0.6} color="#334" />
      <directionalLight position={[5, 3, 5]} intensity={1.4} color="#dfe8ff" />
      <pointLight position={[0, -6, -4]} intensity={0.8} color="#2dd4bf" />
    </group>
  )
}

function SceneFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-gold" />
    </div>
  )
}

export default function GlobeScene({
  activeCountryId,
  onHover,
}: {
  activeCountryId: string | null
  onHover: (country: Country | null) => void
}) {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const onCreated = useCallback(() => setReady(true), [])

  return (
    <div className="relative h-full w-full">
      {failed ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="max-w-xs rounded-2xl border border-white/10 bg-carbon/80 p-8 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-gold/20 to-teal/20" />
            <p className="mt-4 font-display text-lg font-semibold text-white">Globe unavailable</p>
            <p className="mt-2 text-sm text-white/50">3D couldn't load on this device.</p>
          </div>
        </div>
      ) : (
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0.4, 5.8], fov: 45 }}
          onCreated={onCreated}
          onError={() => setFailed(true)}
          gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}
          fallback={<div className="flex h-full w-full items-center justify-center"><SceneFallback /></div>}
        >
          <Suspense fallback={null}>
            <CameraRig>
              <Stars radius={60} depth={50} count={4500} factor={3} saturation={0} fade speed={0.6} />
              <Globe activeCountryId={activeCountryId} onHover={onHover} />
              <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.5} autoRotate={false} />
            </CameraRig>
          </Suspense>
        </Canvas>
      )}
      {!ready && !failed && <SceneFallback />}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/30">
        Drag to explore the network
      </div>
    </div>
  )
}
