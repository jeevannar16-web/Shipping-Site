import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { PRELOADER_COUNTRIES, PRELOADER_SERVICES } from '../../data'
import { registerGsap } from '../../lib/motion'

/** Simplified continent silhouettes as normalized polygon rings (dot-mask). */
const CONTINENTS: [number, number][][] = [
  // Eurasia (rough)
  [
    [-0.18, 0.18], [-0.05, 0.05], [0.08, 0.06], [0.22, 0.16], [0.32, 0.2], [0.36, 0.14], [0.28, 0.06],
    [0.18, 0.0], [0.05, -0.04], [-0.08, -0.06], [-0.2, -0.02], [-0.28, 0.06], [-0.22, 0.16],
  ],
  // Africa
  [
    [0.05, -0.08], [0.16, -0.1], [0.24, -0.04], [0.24, 0.04], [0.16, 0.1], [0.08, 0.06], [0.02, 0.0],
  ],
  // North America
  [
    [-0.55, 0.3], [-0.4, 0.34], [-0.3, 0.26], [-0.34, 0.18], [-0.44, 0.16], [-0.52, 0.22],
  ],
  // South America
  [
    [-0.42, -0.12], [-0.3, -0.14], [-0.26, -0.04], [-0.3, 0.06], [-0.4, 0.08], [-0.42, -0.02],
  ],
  // Australia
  [
    [0.36, -0.28], [0.46, -0.3], [0.52, -0.22], [0.46, -0.14], [0.38, -0.18],
  ],
]

function pointInPoly(x: number, y: number, pts: [number, number][]) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi
    if (intersect) inside = !inside
  }
  return inside
}

const HUBS = [
  { x: 0.035, y: 0.085 }, // Nepal
  { x: 0.035, y: 0.0 },   // India
  { x: 0.14, y: 0.04 },   // China
  { x: 0.09, y: 0.12 },   // HK
]

function DotMap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = canvas.clientWidth
    let h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    const gap = 7
    let raf = 0
    let t = 0

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const cols = Math.ceil(w / gap)
      const rows = Math.ceil(h / gap)
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * gap + gap / 2
          const y = r * gap + gap / 2
          const nx = x / w - 0.5
          const ny = y / h - 0.5
          const onLand = CONTINENTS.some((p) => pointInPoly(nx, ny, p))
          ctx.fillStyle = onLand ? 'rgba(242,242,242,0.5)' : 'rgba(242,242,242,0.06)'
          ctx.fillRect(x, y, 1.4, 1.4)
        }
      }
      // violet pulsing hubs
      for (const hub of HUBS) {
        const cx = (hub.x + 0.5) * w
        const cy = (hub.y + 0.5) * h
        const pulse = 0.5 + 0.5 * Math.sin(t / 300)
        ctx.beginPath()
        ctx.arc(cx, cy, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#c77cff'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(cx, cy, 4 + pulse * 5, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(199,124,255,${0.4 * (1 - pulse)})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      t += 16
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    const onResize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])
  return <canvas ref={canvasRef} className="h-full w-full" />
}

function ScrollingList({ items, align }: { items: string[]; align: 'left' | 'right' }) {
  const row = [...items, ...items, ...items]
  return (
    <div className={`pointer-events-none absolute inset-y-0 ${align === 'left' ? 'left-6 md:left-10' : 'right-6 md:right-10'} flex w-40 flex-col justify-center overflow-hidden`}>
      <p className={`mb-3 text-[9px] uppercase tracking-[0.2em] text-white/30 ${align === 'right' ? 'text-right' : ''}`}>
        {align === 'left' ? 'Routing // Active' : 'Capabilities // 001'}
      </p>
      <div className="vmarquee-track flex flex-col gap-4">
        {row.map((c, i) => (
          <span key={i} className={`whitespace-nowrap text-[11px] uppercase tracking-[0.16em] text-white/45 ${align === 'right' ? 'text-right' : ''}`}>
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    registerGsap()
    const obj = { n: 0 }
    const tw = gsap.to(obj, {
      n: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => setPct(Math.round(obj.n)),
      onComplete: () => {
        const el = rootRef.current
        if (!el) return
        gsap.to(el, {
          yPercent: -100,
          duration: 1,
          ease: 'power4.inOut',
          delay: 0.4,
          onComplete: onDone,
        })
      },
    })
    return () => {
      tw.kill()
    }
  }, [onDone])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-void"
    >
      <div className="relative h-full w-full">
        <DotMap />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void via-void/60 to-void" />
        <ScrollingList items={PRELOADER_COUNTRIES} align="left" />
        <ScrollingList items={PRELOADER_SERVICES} align="right" />

        {/* center block */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="font-display text-center text-3xl font-bold uppercase tracking-tight text-ink md:text-5xl">
            Jeevan <span className="text-orange">✦</span> Logistics
          </h1>
          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/40">Global Freight · Every Leg</p>
        </div>

        {/* top-right % */}
        <div className="absolute right-6 top-8 flex items-center gap-3 md:right-10">
          <span className="spinner inline-block h-4 w-4 rounded-full border border-white/20 border-t-orange" />
          <span className="font-mono text-2xl text-ink tabular-nums md:text-3xl">{pct}%</span>
        </div>

        {/* bottom hint */}
        <div className="absolute bottom-6 left-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/35 md:left-10">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet" />
          Loading network…
        </div>
        <div className="absolute bottom-6 right-6 text-[10px] uppercase tracking-[0.2em] text-white/35 md:right-10">
          Kathmandu HQ · 24/7
        </div>
      </div>
    </div>
  )
}