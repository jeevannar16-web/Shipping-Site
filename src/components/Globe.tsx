import { useMemo, useRef, useState, Suspense, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { Hub } from '../data'
import { HUBS } from '../data'

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

/** Shader for a soft neon atmosphere glow. */
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

function HubMarker({
  hub,
  radius,
  onHover,
  isActive,
}: {
  hub: Hub
  radius: number
  onHover: (hub: Hub | null) => void
  isActive: boolean
}) {
  const pulseRef = useRef<THREE.Mesh>(null!)
  const dotRef = useRef<THREE.Mesh>(null!)
  const pos = useMemo(() => latLngToVector3(clampLat(hub.lat), hub.lng, radius), [hub, radius])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (dotRef.current) dotRef.current.scale.setScalar(1 + Math.sin(t * 2.4 + pos.x * 5) * 0.2)
    if (pulseRef.current) {
      const s = ((t * 0.35 + hub.lng) % 1) * 5
      pulseRef.current.scale.setScalar(s)
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 0.8 * (1 - s / 5))
    }
  })

  return (
    <group position={pos}>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={isActive ? '#ff5500' : '#00f0ff'} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh
        ref={dotRef}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(hub)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onHover(null)
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[isActive ? 0.032 : 0.022, 16, 16]} />
        <meshBasicMaterial color={isActive ? '#ff5500' : '#00f0ff'} />
      </mesh>
      <pointLight color={isActive ? '#ff5500' : '#00f0ff'} intensity={8} distance={1.8} decay={2} />
    </group>
  )
}

function RouteArc({ points, active }: { points: THREE.Vector3[]; active: boolean }) {
  const lineRef = useRef<THREE.Line>(null!)
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3),
    )
    const material = new THREE.LineBasicMaterial({
      color: active ? '#ff5500' : '#00f0ff',
      transparent: true,
      opacity: 0.35,
    })
    return new THREE.Line(geometry, material)
  }, [points, active])
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
    if (dotRef.current) {
      dotRef.current.position.lerpVectors(a, b, f)
    }
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

function Globe({ activeHubId, onHover }: { activeHubId: string | null; onHover: (hub: Hub | null) => void }) {
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
    () => HUBS.map((h) => latLngToVector3(clampLat(h.lat), h.lng, radius)),
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
      const px = ((v.x / 2) + 0.5) * 512
      const py = ((-v.z / 2) + 0.5) * 256
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
      <Atmosphere radius={radius} />
      {arcs.map(({ points }, i) => (
        <RouteArc key={i} points={points} active={false} />
      ))}
      {arcs.map(({ points, offset }, i) => (
        <FlyingDot key={`dot-${i}`} points={points} offset={offset} />
      ))}
      {markers.map((_, i) => (
        <HubMarker
          key={HUBS[i].id}
          hub={HUBS[i]}
          radius={radius}
          onHover={onHover}
          isActive={HUBS[i].id === activeHubId}
        />
      ))}
      <ambientLight intensity={0.6} color="#334" />
      <directionalLight position={[5, 3, 5]} intensity={1.4} color="#dfe8ff" />
      <pointLight position={[0, -6, -4]} intensity={0.8} color="#00f0ff" />
    </group>
  )
}

function SceneFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-neon-orange" />
    </div>
  )
}

export default function GlobeScene({
  activeHubId,
  onHover,
}: {
  activeHubId: string | null
  onHover: (hub: Hub | null) => void
}) {
  const [ready, setReady] = useState(false)
  const onCreated = useCallback(() => setReady(true), [])

  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 5.8], fov: 45 }}
        onCreated={onCreated}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Stars radius={60} depth={50} count={4500} factor={3} saturation={0} fade speed={0.6} />
          <Globe activeHubId={activeHubId} onHover={onHover} />
          <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.5} autoRotate={false} />
        </Suspense>
      </Canvas>
      {!ready && <SceneFallback />}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/30">
        Drag to explore the network
      </div>
    </div>
  )
}