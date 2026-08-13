import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'

const RADIUS = 3.2
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

const MARKERS: { id: string; label: string; sub: string; lat: number; lng: number }[] = [
  { id: 'gb', label: 'UK', sub: 'EUROPE', lat: 54, lng: -2 },
  { id: 'de', label: 'GERMANY', sub: 'EUROPE', lat: 51, lng: 10 },
  { id: 'us', label: 'USA', sub: 'AMERICAS', lat: 39, lng: -98 },
  { id: 'jp', label: 'JAPAN', sub: 'EAST ASIA', lat: 36, lng: 138 },
  { id: 'cn', label: 'CHINA', sub: 'EAST ASIA', lat: 35, lng: 104 },
  { id: 'in', label: 'INDIA', sub: 'SOUTH ASIA', lat: 21, lng: 78 },
  { id: 'hk', label: 'HONG KONG', sub: 'EAST ASIA', lat: 22, lng: 114 },
  { id: 'au', label: 'AUSTRALIA', sub: 'OCEANIA', lat: -25, lng: 134 },
  { id: 'np', label: 'NEPAL', sub: 'SOUTH ASIA', lat: 28, lng: 84 },
]

/** Canvas-generated round alpha map so every point renders as a clean circle. */
function useDotAlphaMap() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(0.4, '#ffffff')
    g.addColorStop(1, '#000000')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    const tex = new THREE.CanvasTexture(c)
    tex.needsUpdate = true
    return tex
  }, [])
}

/** G1 — full fibonacci sphere, 4500 points, radius 3.2, #CFCFCF round dots. */
function DotPlanet() {
  const alphaMap = useDotAlphaMap()

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

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#cfcfcf"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        alphaMap={alphaMap}
        alphaTest={0.5}
      />
    </points>
  )
}

/** Canvas radial-gradient sprite for a soft additive glow. */
function useGlowTexture(color: string) {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, color)
    g.addColorStop(0.35, color)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    const tex = new THREE.CanvasTexture(c)
    tex.needsUpdate = true
    return tex
  }, [color])
}

/** G1 — two additive glow sprites at globe top (orange) / bottom (blue) edges. */
function Glow() {
  const orange = useGlowTexture('#ff4a00')
  const blue = useGlowTexture('#2b4bff')
  return (
    <group>
      <sprite position={[0, 3.1, -0.8]} scale={[6.5, 6.5, 1]} renderOrder={-1}>
        <spriteMaterial map={orange} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite position={[0, -3.3, -0.8]} scale={[7, 7, 1]} renderOrder={-1}>
        <spriteMaterial map={blue} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
  )
}

/** Starfield across the whole hero. */
function Stars({ count = 400 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) arr[i] = (Math.random() - 0.5) * 80
    return arr
  }, [count])
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#ffffff" sizeAttenuation transparent opacity={0.5} />
    </points>
  )
}

/** G1 — arc with dash draw-on (2s) + travelling dot, respawn every 3s. */
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

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const phase = (t * 0.333 + offset) % 1
    const draw = Math.min(phase / 0.667, 1)
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
    <group>
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

/** 0.3 — ONE tag per country. Shown only if facing camera AND x ∈ [55vw,96vw]; max 4 nearest. Black bg default, orange only while hovered. */
function Markers() {
  const groupRef = useRef<THREE.Group>(null)
  const labelRefs = useRef<Array<HTMLDivElement | null>>([])
  const hoverRefs = useRef<Array<THREE.Mesh | null>>([])
  const base = useMemo(() => MARKERS.map((m) => latLng(m.lat, m.lng, RADIUS * 0.99)), [])
  const center = useMemo(() => new THREE.Vector3(), [])
  const worldPos = useMemo(() => new THREE.Vector3(), [])
  const normal = useMemo(() => new THREE.Vector3(), [])
  const camDir = useMemo(() => new THREE.Vector3(), [])
  const screen = useMemo(() => new THREE.Vector3(), [])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointerNdc = useMemo(() => new THREE.Vector2(), [])
  const info = useRef<{ dist: number; on: boolean; hover: boolean }[]>(MARKERS.map(() => ({ dist: 0, on: false, hover: false })))

  useFrame((state) => {
    const g = groupRef.current
    if (!g) return
    g.updateMatrixWorld()
    g.getWorldPosition(center)
    const vw = state.size.width

    // hovered marker (raycast) — forced visible
    let hovered = -1
    pointerNdc.set(state.pointer.x, state.pointer.y)
    raycaster.setFromCamera(pointerNdc, state.camera)
    for (let i = 0; i < base.length; i++) {
      const hitMesh = hoverRefs.current[i]
      if (hitMesh && hitMesh.visible) {
        const hit = raycaster.intersectObject(hitMesh, false)
        if (hit.length > 0) hovered = i
      }
    }

    const now = info.current
    for (let i = 0; i < base.length; i++) {
      worldPos.copy(base[i]).applyMatrix4(g.matrixWorld)
      normal.copy(worldPos).sub(center).normalize()
      camDir.copy(state.camera.position).sub(worldPos).normalize()
      screen.copy(worldPos).project(state.camera)
      const screenX = (screen.x * 0.5 + 0.5) * vw
      const facing = camDir.dot(normal)
      const inBand = screenX >= vw * 0.55 && screenX <= vw * 0.96
      now[i].on = facing > 0.15 && inBand && screen.z < 1
      now[i].dist = worldPos.distanceTo(state.camera.position)
      now[i].hover = i === hovered
    }

    // nearest depth wins — cap at 4 visible (hover always visible)
    const candidates = now
      .map((n, i) => ({ i, n }))
      .filter(({ n }) => n.on)
      .sort((a, b) => a.n.dist - b.n.dist)
    for (let k = 0; k < candidates.length; k++) {
      if (k >= 4) candidates[k].n.on = false
    }

    for (let i = 0; i < base.length; i++) {
      const el = labelRefs.current[i]
      if (!el) continue
      const visible = now[i].on || now[i].hover
      el.style.opacity = visible ? '1' : '0'
      el.style.backgroundColor = now[i].hover ? '#ff4a00' : '#0a0a0a'
      el.style.color = now[i].hover ? '#ffffff' : '#ffffff'
      el.classList.toggle('globe-tag-active', now[i].hover)
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
            <mesh
              visible={false}
              ref={(mesh) => {
                hoverRefs.current[i] = mesh
              }}
            >
              <sphereGeometry args={[0.25, 6, 6]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <Html
              position={[0, 0.18, 0]}
              center
              distanceFactor={30}
              zIndexRange={[30, 0]}
              style={{ pointerEvents: 'none' }}
            >
              <div
                ref={(el) => {
                  labelRefs.current[i] = el
                }}
                data-hover
                className="globe-tag flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 font-mono text-[10px] leading-none tracking-[0.14em] text-white transition-opacity duration-300"
                style={{ backgroundColor: '#0a0a0a', zIndex: 30 }}
              >
                <span className="inline-block h-[3px] w-[3px] rounded-full bg-[#ff4a00]" />
                <span className="flex flex-col">
                  <span>{m.label}</span>
                  <span className="globe-tag-sub font-mono text-[8px] tracking-[0.18em] text-white/80">{m.sub}</span>
                </span>
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

/** V1 — group at (3.1,-0.2,0): target-rotation drag (damped), auto-spin after 3s idle. */
function Rig() {
  const ref = useRef<THREE.Group>(null)
  const drag = useRef({ down: false, lastX: 0, lastY: 0, targetY: 0, targetX: 0, idleAt: -6000 })
  const domEl = useThree((s) => s.gl.domElement)

  useEffect(() => {
    const d = drag.current
    const onDown = (e: PointerEvent) => {
      d.down = true
      d.lastX = e.clientX
      d.lastY = e.clientY
      try {
        domEl.setPointerCapture(e.pointerId)
      } catch {
        /* pointer capture unsupported */
      }
    }
    const onMove = (e: PointerEvent) => {
      if (!d.down) return
      const dx = e.clientX - d.lastX
      const dy = e.clientY - d.lastY
      d.lastX = e.clientX
      d.lastY = e.clientY
      d.targetY += dx * 0.005
      d.targetX = THREE.MathUtils.clamp(d.targetX + dy * 0.003, -0.6, 0.6)
    }
    const onUp = () => {
      d.down = false
      d.idleAt = performance.now()
    }
    domEl.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      domEl.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [domEl])

  useFrame((_, delta) => {
    const g = ref.current
    if (!g) return
    const d = drag.current
    if (!d.down && performance.now() - d.idleAt > 3000) d.targetY += 0.0008
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, d.targetY, 4, delta)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, d.targetX, 4, delta)
  })

  return (
    <group ref={ref} position={[3.1, -0.2, 0]}>
      <DotPlanet />
      <Glow />
      <Arcs />
      <Markers />
    </group>
  )
}

export default function GlobeScene() {
  return (
    <SceneCanvas fallbackLabel="Global" tone="violet" camera={{ position: [0, 0, 10], fov: 45 }}>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.5} />
      <Stars count={400} />
      <Rig />
    </SceneCanvas>
  )
}