import { Canvas } from '@react-three/fiber'
import { useState, type ReactNode } from 'react'
import { useMedia } from '../lib/media'
import ErrorBoundary from './ErrorBoundary'

export function ScenePoster({ label, tone = 'orange' }: { label: string; tone?: 'orange' | 'blue' | 'violet' }) {
  const colors = {
    orange: 'from-[#2b1508] via-[#0d0d0f] to-[#050506]',
    blue: 'from-[#0b1a3a] via-[#0a0f24] to-[#05060c]',
    violet: 'from-[#231030] via-[#120a1c] to-[#07050a]',
  }
  return (
    <div className={`relative h-full w-full bg-gradient-to-br ${colors[tone]}`}>
      {/* soft floor glow so the panel still feels like a scene, not an empty wall */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(1200px 500px at 50% 110%, rgba(255,255,255,0.14), transparent 62%)',
        }}
      />
      <span className="absolute bottom-5 right-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
        {label} · static view
      </span>
    </div>
  )
}

export default function SceneCanvas({
  children,
  fallbackLabel,
  tone = 'orange',
  camera = { position: [0, 0, 9], fov: 42 },
}: {
  children: ReactNode
  fallbackLabel: string
  tone?: 'orange' | 'blue' | 'violet'
  camera?: { position: [number, number, number]; fov: number }
}) {
  const [failed, setFailed] = useState(false)
  const isMobile = useMedia('(max-width: 767px)')
  const reduced = useMedia('(prefers-reduced-motion: reduce)')

  if (isMobile || reduced) return <ScenePoster label={fallbackLabel} tone={tone} />

  return (
    <div className="absolute inset-0">
      {failed ? (
        <ScenePoster label={fallbackLabel} tone={tone} />
      ) : (
        <ErrorBoundary fallback={<ScenePoster label={fallbackLabel} tone={tone} />}>
          <div className="absolute inset-0 touch-none">
            <Canvas
              frameloop="always"
              dpr={[1, 1.5]}
              camera={camera}
              shadows
              gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
              onCreated={({ gl }) => {
                gl.domElement.addEventListener('webglcontextlost', (e) => {
                  e.preventDefault()
                  setFailed(true)
                })
                gl.domElement.addEventListener('webglcontextrestored', () => {
                  setFailed(false)
                })
              }}
              onError={() => setFailed(true)}
            >
              {children}
            </Canvas>
          </div>
        </ErrorBoundary>
      )}
    </div>
  )
}
