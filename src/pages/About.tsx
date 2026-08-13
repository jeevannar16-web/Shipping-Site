import { lazy, Suspense } from 'react'
import { LineMask, FadeUp, usePageReveals } from '../lib/motion'
import { WHY_US, STATS } from '../data'
import { ScenePoster } from '../components/SceneCanvas'

const ViaductScene = lazy(() => import('../scenes/ViaductScene'))

export default function About() {
  usePageReveals()

  return (
    <div className="relative">
      {/* 3D viaduct hero */}
      <section className="relative h-[92vh] overflow-hidden">
        <Suspense fallback={<ScenePoster label="About" tone="blue" />}>
          <ViaductScene />
        </Suspense>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/40" />

        <div className="absolute bottom-16 left-6 z-10 md:left-10">
          <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-blue">
            <span className="h-px w-10 bg-blue" /> About Jeevan
          </p>
          <LineMask as="h1" className="font-display text-[clamp(2.4rem,6.5vw,6.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-ink">
            Your trusted partner for
          </LineMask>
        </div>
      </section>

      {/* story */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <LineMask as="h2" className="font-display text-[clamp(2.2rem,5vw,4.5rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-ink">
              Global freight forwarding and logistics
            </LineMask>
          </div>
          <FadeUp>
            <p className="text-sm leading-relaxed text-dim">
              Jeevan Global Logistics operates as an integrated freight forwarder and customs brokerage headquartered
              in Kathmandu, Nepal. We manage air, ocean, and land freight across a network spanning 9 countries —
              from planning and booking to customs clearance and final-mile delivery.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-dim">
              Our model is deliberately simple: one accountable team per shipment, with full visibility at every
              milestone. In-house licensed brokerage keeps compliance in our control; structured carrier selection keeps
              pricing competitive; 24/7 operations keep your cargo moving around the clock.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 border-y border-white/[0.07] py-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-bold text-ink">
                    {s.value}
                    {s.suffix}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-dim">{s.label}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* WHY US */}
      <section className="border-t border-white/[0.07] bg-panel/40 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-orange">
            <span className="h-px w-10 bg-orange" /> Why Us
          </p>
          <h2 className="mb-14 font-display text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase tracking-tight text-ink">
            One accountable team
          </h2>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((w, i) => (
              <FadeUp key={w.title} delay={i * 0.06} className="group bg-void p-10">
                <p className="mb-6 font-mono text-xs text-white/30 transition-colors group-hover:text-orange">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">{w.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-dim">{w.desc}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}