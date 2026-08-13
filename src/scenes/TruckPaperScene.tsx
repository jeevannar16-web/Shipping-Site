import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import SceneCanvas from '../components/SceneCanvas'
import { AutoFitCamera } from './fitCamera'
import { clamp01, type ScrubRef } from '../lib/scrub'

/** R2 — trailer rib texture (no thin rib meshes). */
function useTrailerTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, 256, 128)
    ctx.fillStyle = 'rgba(120,120,120,0.5)'
    for (let x = 5; x < 256; x += 21) {
      ctx.fillRect(x, 2, 3, 124)
    }
    ctx.strokeStyle = 'rgba(90,90,90,0.5)'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, 254, 126)
    const tex = new THREE.CanvasTexture(c)
    tex.needsUpdate = true
    return tex
  }, [])
}

/** R2 — cab front face: windshield painted on. */
function useCabFrontTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#d6d6d6'
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 14, 128, 54)
    ctx.strokeStyle = '#9a9a9a'
    ctx.lineWidth = 4
    ctx.strokeRect(-1, 44, 130, 6)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 2
    ctx.strokeRect(6, 22, 116, 32)
    const tex = new THREE.CanvasTexture(c)
    tex.needsUpdate = true
    return tex
  }, [])
}

/** R2 — cab side faces: door line + window painted on. */
function useCabSideTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#d6d6d6'
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(4, 12, 122, 46)
    ctx.fillStyle = 'rgba(120,120,120,0.8)'
    ctx.fillRect(52, 0, 4, 128)
    const tex = new THREE.CanvasTexture(c)
    tex.needsUpdate = true
    return tex
  }, [])
}

/** G4 — R3 wheel: tire #141414 + hub disc #9a9a9a, bottom y=0, axis along X. */
function Wheel({ x, z, refs, iBase }: { x: number; z: number; refs: React.MutableRefObject<(THREE.Mesh | null)[]>; iBase: number }) {
  return (
    <group position={[x, 0.55, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 0.32, 24]} />
        <meshStandardMaterial color="#141414" roughness={0.9} />
      </mesh>
      {[0.22, -0.22].map((off, i) => (
        <mesh
          key={i}
          position={[0, off, 0]}
          ref={(el) => {
            refs.current[iBase + i] = el
          }}
        >
          <cylinderGeometry args={[0.2, 0.2, 0.06, 16]} />
          <meshStandardMaterial color="#9a9a9a" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/** G4 — side-view truck: trailer -6.5..+3.0, cab +3.2..+5.6, wheels r .55. */
function TruckRig({ scrub }: { scrub?: ScrubRef }) {
  const groupRef = useRef<THREE.Group>(null)
  const wheelRefs = useRef<Array<THREE.Mesh | null>>([])

  const trailerTex = useTrailerTexture()
  const cabFront = useCabFrontTexture()
  const cabSide = useCabSideTexture()

  const AXLES = [-4.8, -3.6, -2.4, 3.8, 5.0]

  const wheelSpins = useRef(new Float32Array(10).fill(0))

  useFrame((_, dt) => {
    const t = performance.now() / 1000
    if (scrub && scrub.current !== undefined) {
      const p = clamp01(scrub.current)
      wheelRefs.current.forEach((w, i) => {
        if (w) w.rotation.y = p * 28 + i * 0.01
      })
      if (groupRef.current) groupRef.current.position.y = 0
    } else {
      wheelRefs.current.forEach((w, i) => {
        if (!w) return
        wheelSpins.current[i] += dt * 7
        w.rotation.y = wheelSpins.current[i]
      })
      if (groupRef.current) {
        groupRef.current.position.y = Math.sin(t * 2.2) * 0.02
      }
    }
  })

  return (
    <group ref={groupRef}>
        {/* trailer (9.5 long along x, -6.5..+3.0) */}
        <mesh position={[-1.75, 1.3, 0]}>
          <boxGeometry args={[9.5, 2.6, 2.4]} />
          <meshStandardMaterial attach="material-0" map={trailerTex} roughness={0.7} metalness={0.2} />
          <meshStandardMaterial attach="material-1" color="#f0f0f0" roughness={0.7} metalness={0.2} />
          <meshStandardMaterial attach="material-2" map={trailerTex} roughness={0.7} metalness={0.2} />
          <meshStandardMaterial attach="material-3" color="#f0f0f0" roughness={0.7} metalness={0.2} />
          <meshStandardMaterial attach="material-4" map={trailerTex} roughness={0.7} metalness={0.2} />
          <meshStandardMaterial attach="material-5" map={trailerTex} roughness={0.7} metalness={0.2} />
        </mesh>

        {/* cab (2.4,2.0,2.2), +3.2..+5.6 */}
        <mesh position={[4.4, 1.1, 0]}>
          <boxGeometry args={[2.4, 2.0, 2.2]} />
          <meshStandardMaterial attach="material-0" map={cabFront} roughness={0.6} />
          <meshStandardMaterial attach="material-1" color="#d6d6d6" roughness={0.6} />
          <meshStandardMaterial attach="material-2" color="#d6d6d6" roughness={0.6} />
          <meshStandardMaterial attach="material-3" color="#d6d6d6" roughness={0.6} />
          <meshStandardMaterial attach="material-4" map={cabSide} roughness={0.6} />
          <meshStandardMaterial attach="material-5" map={cabSide} roughness={0.6} />
        </mesh>

        {/* bumper */}
        <mesh position={[5.62, 0.6, 0]}>
          <boxGeometry args={[0.15, 0.7, 2.2]} />
          <meshStandardMaterial color="#3d3d3d" roughness={0.5} metalness={0.4} />
        </mesh>

        {/* one exhaust stack — inside cab bounding box */}
        <mesh position={[3.4, 2.05, 0.6]}>
          <cylinderGeometry args={[0.09, 0.1, 0.85, 12]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* chassis */}
        <mesh position={[1.1, 0.45, 0]}>
          <boxGeometry args={[11.4, 0.22, 2.0]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>

        {/* wheels: r .55, trailer 3 + cab 2 axles (R3/R5) */}
        {AXLES.map((x, i) =>
          [1, -1].map((side) => (
            <Wheel key={`${x}-${side}`} x={x} z={side * 1.1} refs={wheelRefs} iBase={i * 2 + (side === 1 ? 0 : 1)} />
          )),
        )}
      </group>
  )
}

export default function TruckPaperScene({ scrub }: { scrub?: ScrubRef }) {
  const modelRef = useRef<THREE.Group>(null)

  return (
    <SceneCanvas fallbackLabel="Linehaul" tone="blue" camera={{ position: [0, 2.4, 19], fov: 30 }}>
      <color attach="background" args={['#e6e1d8']} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 14, 10]} intensity={1.6} color="#fff6e8" />
      <directionalLight position={[-6, 3, -4]} intensity={0.35} color="#ffffff" />

      {/* R6 — studio cove floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#e6e1d8" roughness={1} />
      </mesh>

      {/* scrolling ground dashes */}
      <DashScroll scrub={scrub} />

      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2.5} far={7} resolution={512} color="#000000" />

      <group ref={modelRef}>
        <TruckRig scrub={scrub} />
      </group>
      <AutoFitCamera target={modelRef} coverage={0.75} axis={[0, 0.15, 1]} fov={30} />
    </SceneCanvas>
  )
}

/** Rendered inside the Canvas — scrolls the ground dash line. Scrubbed: dashes slide x -40 → 0. */
function DashScroll({ scrub }: { scrub?: ScrubRef }) {
  const dashRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (dashRef.current) {
      if (scrub && scrub.current !== undefined) {
        const p = clamp01(scrub.current)
        dashRef.current.position.x = -40 + 40 * p
        dashRef.current.children.forEach((c, i) => {
          c.position.x = -9 + ((p * 18 + i * 1.5) % 18)
        })
      } else {
        const off = (t * 4) % 1.5
        dashRef.current.children.forEach((c, i) => {
          c.position.x = -9 + ((i * 1.5 + off) % 18)
        })
      }
    }
  })
  return (
    <group ref={dashRef} position={[0, 0.02, 0]}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[i * 1.5 - 9, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 1.2]} />
          <meshBasicMaterial color="#cfc8bc" />
        </mesh>
      ))}
    </group>
  )
}