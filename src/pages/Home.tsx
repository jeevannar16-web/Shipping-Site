import { lazy, Suspense, type ReactNode } from 'react'
import { LineMask, FadeUp, Counter, usePageReveals } from '../lib/motion'
import { useTransitionNavigate } from '../lib/navigation'
import { HOME_STATS, SERVICES } from '../data'
import { ScenePoster } from '../components/SceneCanvas'

const GlobeScene = lazy(() => import('../scenes/GlobeScene'))

function SuspenseFallback({ label, children }: { label: string; children: ReactNode }) {
  return <Suspense fallback={<ScenePoster label={label} tone="violet" />}>{children}</Suspense>
}

export default function Home() {
  usePageReveals()
  const go = useTransitionNavigate()

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full lg:w-[58%]">
          <SuspenseFallback label="Global">
            <GlobeScene />
          </SuspenseFallback>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void via-void/85 to-transparent lg:w-2/3" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 md:px-10">
          <p className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-orange">
            <span className="h-px w-10 bg-orange" /> One Operator
          </p>
          <LineMask as="h1" className="font-display text-[clamp(3rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-ink">
            Every Leg
          </LineMask>
          <LineMask as="h1" delay={0.12} className="font-display text-[clamp(3rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
            <span className="bg-gradient-to-r from-blue via-orange to-violet bg-clip-text text-transparent">Of The Journey</span>
          </LineMask>
          <FadeUp className="mt-8 max-w-md">
            <p className="text-sm leading-relaxed text-dim">
              Freight forwarding, customs brokerage, and transport — unified under one accountable team.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => go('/contact')}
                className="rounded-full bg-orange px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-void transition-all hover:shadow-[0_0_30px_rgba(255,74,0,0.45)]"
              >
                Talk With Us
              </button>
              <button
                onClick={() => go('/services')}
                className="rounded-full border border-[#333] px-7 py-3 text-[11px] uppercase tracking-[0.16em] text-ink transition-all hover:bg-ink hover:text-void"
              >
                Our Services
              </button>
            </div>
          </FadeUp>
        </div>

        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
          <div className="bob text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</div>
        </div>
      </section>

      {/* SERVICES MARQUEE */}
      <section className="border-y border-white/[0.07] py-5">
        <div className="overflow-hidden">
          <div className="marquee-track flex w-max whitespace-nowrap">
            {[...SERVICES, ...SERVICES].map((s, i) => (
              <span key={i} className="mx-8 inline-flex items-center gap-8 font-display text-sm uppercase tracking-[0.18em] text-white/45">
                {s.title}
                <span className="text-orange">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="grid grid-cols-2 gap-y-14 md:grid-cols-5">
          {HOME_STATS.map((s) => (
            <FadeUp key={s.label} className="border-l border-white/10 pl-5">
              <p className="font-display text-4xl font-bold text-ink md:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-dim">{s.label}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* WE MOVE FREIGHT */}
      <section className="relative overflow-hidden border-t border-white/[0.07] py-28">
        <p data-reveal-parallax="0.25" className="text-stroke pointer-events-none select-none whitespace-nowrap font-display text-[16vw] font-extrabold uppercase leading-none">
          We Move Freight
        </p>
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mt-10 max-w-3xl">
            <LineMask as="h2" className="font-display text-[clamp(2.2rem,6vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-ink">
              We own the outcome.
            </LineMask>
            <FadeUp className="mt-8 max-w-xl">
              <p className="text-sm leading-relaxed text-dim">
                From booking to final-mile delivery, one team manages your shipment end to end. Real-time visibility,
                in-house customs brokerage, and a network across 9 countries — engineered so your cargo arrives on time, every time.
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      <HomeShowcase />
    </div>
  )
}

function HomeShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-3">
        {SERVICES.slice(0, 3).map((s, i) => (
          <FadeUp key={s.title} delay={i * 0.1} className="bg-panel p-10">
            <p className="mb-6 font-mono text-xs text-orange">0{i + 1}</p>
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">{s.title}</h3>
            <p className="mt-4 text-xs leading-relaxed text-dim">{s.desc}</p>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}