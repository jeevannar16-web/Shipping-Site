import { lazy, Suspense } from 'react'
import { LineMask, FadeUp, usePageReveals } from '../lib/motion'
import { useTransitionNavigate } from '../lib/navigation'
import { SERVICES } from '../data'
import { ScenePoster } from '../components/SceneCanvas'

const TerminalScene = lazy(() => import('../scenes/TerminalScene'))

const MARQUEE = [
  'International Freight',
  'Customs Brokerage',
  'Logistics and Domestic Transport',
  'Specialist Solutions for Project Cargo',
  'Sensitive, Industrial & Defence Logistics',
]

export default function Services() {
  usePageReveals()
  const go = useTransitionNavigate()

  return (
    <div className="relative">
      {/* 3D container terminal */}
      <section className="relative h-[92vh] overflow-hidden">
        <Suspense fallback={<ScenePoster label="Coverage" tone="orange" />}>
          <TerminalScene />
        </Suspense>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/40" />

        <div className="absolute bottom-16 left-6 z-10 md:left-10">
          <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-orange">
            <span className="h-px w-10 bg-orange" /> Coverage
          </p>
          <LineMask as="h1" className="font-display text-[clamp(2.6rem,7vw,7rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-ink">
            Global Supply
          </LineMask>
          <LineMask as="h1" delay={0.1} className="font-display text-[clamp(2.6rem,7vw,7rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
            <span className="bg-gradient-to-r from-orange to-violet bg-clip-text text-transparent">Chain Coverage</span>
          </LineMask>
        </div>
      </section>

      {/* bottom marquee */}
      <div className="border-y border-white/[0.07] py-5">
        <div className="overflow-hidden">
          <div className="marquee-track-reverse flex w-max whitespace-nowrap">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="mx-8 inline-flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-white/40">
                {m}
                <span className="text-orange">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* six service blocks */}
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        {SERVICES.map((s, i) => (
          <div
            key={s.title}
            data-reveal
            className="group grid gap-6 border-b border-white/[0.07] py-12 md:grid-cols-12 md:items-center"
          >
            <div className="md:col-span-2">
              <p className="font-mono text-3xl font-semibold text-orange">0{i + 1}</p>
            </div>
            <div className="md:col-span-5">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/35">{s.tag}</p>
              <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-ink transition-colors group-hover:text-orange md:text-4xl">
                {s.title}
              </h2>
            </div>
            <div className="md:col-span-4">
              <p className="text-xs leading-relaxed text-dim">{s.desc}</p>
            </div>
            <div className="md:col-span-1 text-right">
              <button
                onClick={() => go('/contact')}
                className="text-white/30 transition-all group-hover:translate-x-1 group-hover:text-orange"
                aria-label={`Get a quote for ${s.title}`}
              >
                ⟶
              </button>
            </div>
          </div>
        ))}

        <FadeUp className="mt-16 text-center">
          <button
            onClick={() => go('/contact')}
            className="rounded-full border border-[#333] px-8 py-3.5 text-[11px] uppercase tracking-[0.16em] text-ink transition-all hover:bg-ink hover:text-void"
          >
            Request a Quote
          </button>
        </FadeUp>
      </div>
    </div>
  )
}