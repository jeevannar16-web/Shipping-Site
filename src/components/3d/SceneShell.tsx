import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ErrorBoundary from '../ErrorBoundary'
import { useReducedMotion } from '../../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

export type SceneProgress = { value: number }

export const SceneProgressContext = createContext<SceneProgress>({ value: 0 })

export function useSceneProgress() {
  return useContext(SceneProgressContext)
}

/** Reactive scroll progress (0→1) for DOM overlay widgets, synced via rAF. */
export function useSceneProgressValue() {
  const { value } = useSceneProgress()
  const [v, setV] = useState(value)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      setV((prev) => (Math.abs(prev - value) > 0.0005 ? value : prev))
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return v
}

function useNearViewport<T extends HTMLElement>(margin = '160% 0px 160% 0px') {
  const ref = useRef<T | null>(null)
  const [near, setNear] = useState(false)

  // Latch approach: once the section approaches the viewport, keep the canvas
  // mounted for the entire session. Unmounting/remounting canvases while
  // scrolling repeatedly creates and discards GPU contexts, which triggers
  // "WebGLRenderer: Context Lost" and leaves stale frames on screen.
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: margin, threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margin])

  return { ref, near }
}

export function ScenePoster({
  icon,
  label,
  from = 'rgba(245,165,36,0.18)',
  to = 'rgba(45,212,191,0.12)',
  title,
}: {
  icon: ReactNode
  label: string
  from?: string
  to?: string
  title?: string
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${from}, transparent 70%)` }}
        />
        <div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ background: `radial-gradient(circle, transparent 55%, ${to} 100%)` }}
        />
        <div className="relative">{icon}</div>
      </div>
      <p className="mt-6 font-display text-sm uppercase tracking-[0.3em] text-white/60">{label}</p>
      {title && <p className="mt-2 text-xs text-white/35">{title}</p>}
    </div>
  )
}

export default function SceneShell({
  id,
  kicker,
  title,
  description,
  children,
  poster,
  overlay,
}: {
  id: string
  kicker: string
  title: string
  description: string
  children: ReactNode
  poster?: ReactNode
  overlay?: ReactNode
}) {
  const reduced = useReducedMotion()
  const progress = useRef<SceneProgress>({ value: 0 })
  const sectionRef = useRef<HTMLElement | null>(null)
  const copyRef = useRef<HTMLDivElement | null>(null)
  const { ref: viewportRef, near } = useNearViewport<HTMLDivElement>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (reduced || !sectionRef.current) return
    const target = sectionRef.current
    const st = gsap.to(progress.current, {
      value: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: target,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
      },
    })

    if (copyRef.current) {
      const copy = copyRef.current
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: target,
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: true,
        },
      })
      tl.fromTo(copy, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3 })
        .to(copy, { opacity: 0, y: -40, duration: 0.15 }, '>0.6')
    }

    return () => {
      st.scrollTrigger?.kill()
      st.kill()
      ScrollTrigger.refresh()
    }
  }, [reduced])

  const showCanvas = !reduced && near && !failed

  return (
    <SceneProgressContext.Provider value={progress.current}>
      <section
        id={id}
        ref={sectionRef}
        className={`relative overflow-hidden bg-void ${reduced ? 'flex min-h-screen items-center py-32' : 'h-[280vh]'}`}
      >
        {reduced ? (
          <div className="relative mx-auto max-w-7xl px-6">
            {poster}
            <div className="mt-8 max-w-xl">
              <p className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold">
                <span className="h-px w-10 bg-gold" /> {kicker}
              </p>
              <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">{title}</h2>
              <p className="mt-5 text-base leading-relaxed text-white/55">{description}</p>
            </div>
          </div>
        ) : (
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <div ref={viewportRef} className="absolute inset-0">
              {showCanvas ? (
                <ErrorBoundary fallback={poster ?? null}>
                  <Canvas
                    dpr={[1, 1.5]}
                    camera={{ position: [0, 0, 9], fov: 42 }}
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
                </ErrorBoundary>
              ) : (
                poster ?? (
                  <ScenePoster
                    icon={<span className="font-display text-6xl text-white/20">{kicker.slice(-2)}</span>}
                    label={title}
                  />
                )
              )}
            </div>

            <div ref={copyRef} className="pointer-events-none absolute left-0 right-0 top-0 flex h-full items-center px-6 md:px-16">
              <div className="max-w-xl">
                <p className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold">
                  <span className="h-px w-10 bg-gold" /> {kicker}
                </p>
                <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">{title}</h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-white/55">{description}</p>
              </div>
            </div>

            {overlay}

            <div className="pointer-events-none absolute bottom-6 left-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/30 md:left-16">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
              Scroll to explore
            </div>
          </div>
        )}
      </section>
    </SceneProgressContext.Provider>
  )
}