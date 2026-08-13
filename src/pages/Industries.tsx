import { lazy, Suspense } from 'react'
import { LineMask, FadeUp, usePageReveals } from '../lib/motion'
import { INDUSTRIES } from '../data'
import { ScenePoster } from '../components/SceneCanvas'

const ForestRoadScene = lazy(() => import('../scenes/ForestRoadScene'))

export default function Industries() {
  usePageReveals()

  return (
    <div className="relative">
      {/* top-down forest road */}
      <section className="relative h-[92vh] overflow-hidden">
        <Suspense fallback={<ScenePoster label="Industries" tone="violet" />}>
          <ForestRoadScene />
        </Suspense>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/40" />

        <div className="absolute bottom-16 left-6 z-10 md:left-10">
          <LineMask as="h1" className="font-display text-[clamp(3rem,9vw,8rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-ink">
            Industries
          </LineMask>
          <FadeUp className="mt-6 max-w-md">
            <p className="text-sm leading-relaxed text-dim">
              Jeevan Global Logistics operates where freight complexity is highest and reliability is essential.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* industry cards */}
      <section className="section-pad px-[6vw]">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((ind, i) => (
            <FadeUp
              key={ind.title}
              delay={i * 0.06}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-panel p-10 transition-all hover:border-orange/40"
            >
              <span className="text-stroke pointer-events-none absolute -right-2 -top-4 font-display text-[5.5rem] font-extrabold">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">{ind.title}</h3>
                <p className="mt-4 max-w-xs text-xs leading-relaxed text-dim">{ind.desc}</p>
                <p className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/35 transition-colors group-hover:text-orange">
                  Explore <span>⟶</span>
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>
    </div>
  )
}