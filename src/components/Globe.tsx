import { useMemo, useRef, useState, Suspense, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
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

function createArcPoints(start: THREE.Vector3, end: THREE.Vector3, radius: number, lift = 0.35) {
  const points: THREE.Vector3[] = []
  const segments = 50
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const p = start.clone().lerp(end, t).normalize().multiplyScalar(radius)
    const midpoint = start.clone().add(end).multiplyScalar(0.5).length()
    const height = radius * lift * Math.sin(t * Math.PI)
    const dir = start.clone().add(end).multiplyScalar(0.5).normalize()
    p.add(dir.multiplyScalar(height * (midpoint / radius)))
    points.push(p)
  }
  return points
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
  const ref = useRef<THREE.Mesh>(null!)
  const pos = useMemo(() => latLngToVector3(clampLat(hub.lat), hub.lng, radius), [hub, radius])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.scale.setScalar(1 + Math.sin(t * 2 + pos.x) * 0.25)
  })

  return (
    <mesh
      ref={ref}
      position={pos}
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
      <sphereGeometry args={[isActive ? 0.035 : 0.024, 16, 16]} />
      <meshBasicMaterial color={isActive ? '#ff5500' : '#00f0ff'} />
      <pointLight color={isActive ? '#ff5500' : '#00f0ff'} intensity={6} distance={1.6} decay={2} />
    </mesh>
  )
}

function Globe({ activeHubId, onHover }: { activeHubId: string | null; onHover: (hub: Hub | null) => void }) {
  const groupRef = useRef<THREE.Group>(null!)
  const radius = 2

  const { texture, glowTexture, markers, arcs } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#0d0d11'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let i = 1; i < 7; i++) {
      ctx.beginPath()
      ctx.arc(512, 256, (256 / 6) * i, 0, Math.PI * 2)
      ctx.stroke()
    }
    for (let i = 0; i < 24; i++) {
      ctx.beginPath()
      ctx.moveTo((i / 24) * 1024, 0)
      ctx.lineTo((i / 24) * 1024, 512)
      ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(0,240,255,0.25)'
    ctx.lineWidth = 1.5
    const drawEllipse = (rx: number) => {
      ctx.beginPath()
      ctx.ellipse(512, 256, rx, 60, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    drawEllipse(70)
    drawEllipse(140)
    drawEllipse(210)

    const dots = 900
    for (let i = 0; i < dots; i++) {
      const lat = Math.random() * 180 - 90
      const lng = Math.random() * 360 - 180
      if (Math.random() > 0.55) continue
      const { x, y } = latLngToVector3(clampLat(lat), lng, 1)
      const px = (x / 2 + 0.5) * 1024
      const py = (y / 2 + 0.5) * 512
      ctx.fillStyle = `rgba(255,255,255,${0.12 + Math.random() * 0.2})`
      ctx.fillRect(px, py, 1.6, 1.6)
    }

    const texture = new THREE.CanvasTexture(canvas)

    const glowCanvas = document.createElement('canvas')
    glowCanvas.width = 512
    glowCanvas.height = 512
    const gctx = glowCanvas.getContext('2d')!
    const grad = gctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    grad.addColorStop(0, 'rgba(0,240,255,0.55)')
    grad.addColorStop(0.4, 'rgba(0,240,255,0.14)')
    grad.addColorStop(1, 'rgba(0,240,255,0)')
    gctx.fillStyle = grad
    gctx.fillRect(0, 0, 512, 512)
    const glowTexture = new THREE.CanvasTexture(glowCanvas)

    const markers = HUBS.map((h) => latLngToVector3(clampLat(h.lat), h.lng, radius))

    const arcs: THREE.Vector3[][] = []
    for (let i = 0; i < markers.length; i++) {
      for (let j = i + 1; j < markers.length; j++) {
        if (Math.random() > 0.62) continue
        arcs.push(createArcPoints(markers[i], markers[j], radius))
      }
    }

    return { texture, glowTexture, markers, arcs }
  }, [radius])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial map={texture} color="#1a1a1f" transparent opacity={0.96} />
      </mesh>
      <sprite scale={[radius * 2.35, radius * 2.35, 1]}>
        <spriteMaterial map={glowTexture} transparent opacity={0.5} depthWrite={false} />
      </sprite>
      {arcs.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#00f0ff"
          transparent
          opacity={0.35}
          lineWidth={1}
        />
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
        camera={{ position: [0, 0.4, 5.6], fov: 45 }}
        onCreated={onCreated}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 4, 4]} intensity={1.2} color="#ffffff" />
        <Suspense fallback={null}>
          <Globe activeHubId={activeHubId} onHover={onHover} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={0.5}
          autoRotate={false}
        />
      </Canvas>
      {!ready && <SceneFallback />}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/30">
        Drag to explore the network
      </div>
    </div>
  )
}
