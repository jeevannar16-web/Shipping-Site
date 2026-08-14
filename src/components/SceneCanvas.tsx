import { Canvas } from '@react-three/fiber'
import { useEffect, useState, type ReactNode } from 'react'
import ErrorBoundary from './ErrorBoundary'

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const onChange = () => setMatches(m.matches)
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export function ScenePoster({ label, tone = 'orange' }: { label: string; tone?: 'orange' | 'blue' | 'violet' }) {
  const colors = {
    orange: 'from-[#ff4a00] via-[#2b0a00] to-void',
    blue: 'from-[#2b4bff] via-[#0a0f3d] to-void',
    violet: 'from-[#c77cff] via-[#1c0a33] to-void',
  }
  return (
    <div className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${colors[tone]}`}>
      <span className="text-stroke font-display text-[11vw] font-extrabold uppercase tracking-tight">{label}</span>
      <span className="absolute bottom-5 right-6 text-[10px] uppercase tracking-[0.2em] text-white/40">
        Scene unavailable · reduced motion
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
