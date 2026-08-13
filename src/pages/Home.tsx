import { lazy, Suspense, useState, type ReactNode } from 'react'
import { LineMask, FadeUp, Counter, usePageReveals } from '../lib/motion'
import { useTransitionNavigate } from '../lib/navigation'
import { HOME_STATS, SERVICES, HUBS, FAQS } from '../data'
import { ScenePoster } from '../components/SceneCanvas'

const GlobeScene = lazy(() => import('../scenes/GlobeScene'))
const ReachStackerScene = lazy(() => import('../scenes/ReachStackerScene'))
const TruckPaperScene = lazy(() => import('../scenes/TruckPaperScene'))
const OceanScene = lazy(() => import('../scenes/OceanScene'))

function SuspenseBox({ label, tone, children }: { label: string; tone?: 'orange' | 'blue' | 'violet'; children: ReactNode }) {
  return <Suspense fallback={<ScenePoster label={label} tone={tone} />}>{children}</Suspense>
}

export default function Home() {
  usePageReveals()
  const go = useTransitionNavigate()

  return (
    <div className="relative">
      {/* HERO — SHOT 2 */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full lg:w-[58%]">
          <SuspenseBox label="Global" tone="violet">
            <GlobeScene />
          </SuspenseBox>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void via-void/85 to-transparent lg:w-2/3" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 md:px-10">
          <p className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-orange">
            <span className="h-px w-10 bg-orange" /> One Operator
          </p>
          <LineMask as="h1" className="font-display text-[clamp(3rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-white/70">
            Every Leg
          </LineMask>
          <LineMask as="h1" delay={0.18} className="font-display text-[clamp(3rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
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

      {/* SHOT 3 — REACH STACKER ON PAPER-WHITE */}
      <section className="relative h-screen overflow-hidden bg-[#efeae3]">
        <SuspenseBox label="Freight" tone="orange">
          <ReachStackerScene />
        </SuspenseBox>
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex justify-center px-6">
          <h2 className="max-w-4xl text-center font-display text-[clamp(2rem,6vw,5rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-[#0a0a0a]">
            Everything your freight needs. <span className="text-orange">Under one group.</span>
          </h2>
        </div>
      </section>

      {/* SHOT 4 — SIDE-VIEW TRUCK ON PAPER-WHITE */}
      <section className="relative h-screen overflow-hidden bg-[#efeae3]">
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center overflow-hidden">
          <span className="text-stroke-paper slow-scroll whitespace-nowrap font-display text-[13vw] font-black uppercase leading-none tracking-tight">
            Under One Group
          </span>
        </div>
        <SuspenseBox label="Linehaul" tone="blue">
          <TruckPaperScene />
        </SuspenseBox>
        <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-10">
          {['Speed', 'Reliability', 'Coverage'].map((w, i) => (
            <div key={w} data-reveal className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#0a0a0a]">
              <span className="font-mono text-orange">0{i + 1}</span> {w}
            </div>
          ))}
        </div>
      </section>

      {/* SHOT 5 — TOP-DOWN CONTAINER SHIP */}
      <section className="relative h-screen overflow-hidden">
        <SuspenseBox label="Ocean" tone="blue">
          <OceanScene />
        </SuspenseBox>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
        <div className="absolute left-6 top-8 z-10 md:left-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-orange" />
            Ocean Freight — FCL / LCL / Specialised
          </p>
        </div>
        <div className="absolute bottom-10 right-6 z-10 hidden w-64 md:right-16 md:block">
          <div className="rounded-2xl border border-white/10 bg-black/70 p-5 font-mono backdrop-blur">
            {[
              ['20ft Dry', 'From USD 1,150'],
              ['40ft High-Cube', 'From USD 1,950'],
              ['Reefer 40ft', 'From USD 2,850'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-white/10 py-2 last:border-0">
                <span className="text-[10px] uppercase tracking-wider text-white/60">{k}</span>
                <span className="text-xs text-orange">{v}</span>
              </div>
            ))}
          </div>
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

      <HubsStrip />
      <FaqSection />
      <HomeShowcase />
    </div>
  )
}

function HubsStrip() {
  return (
    <section data-reveal className="border-t border-white/[0.07] bg-panel/40 py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <p className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-orange">
          <span className="h-px w-10 bg-orange" /> Global Network
        </p>
        <div className="grid gap-10 md:grid-cols-3">
          {HUBS.slice(0, 3).map((h) => (
            <div key={h.id} className="border-l border-white/10 pl-5">
              <p className="font-display text-2xl font-bold uppercase tracking-tight text-ink">{h.country}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
                {h.region} · {h.timezone.split('/')[1]}
              </p>
              <p className="mt-3 flex flex-wrap gap-2">
                {h.capabilities.slice(0, 4).map((c) => (
                  <span key={c} className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-white/50">
                    {c}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 md:px-10">
      <p className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-orange">
        <span className="h-px w-10 bg-orange" /> FAQ
      </p>
      <div className="space-y-0">
        {FAQS.map((f, i) => (
          <div key={i} className="border-b border-white/[0.07]">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="font-mono text-sm uppercase tracking-[0.08em] text-ink">{f.q}</span>
              <span className={`font-mono text-xl text-orange transition-transform ${open === i ? 'rotate-45' : ''}`}>+</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open === i ? 'pb-6' : 'max-h-0'}`}>
              <p className="max-w-2xl text-xs leading-relaxed text-dim" style={open === i ? { visibility: 'visible' } : { visibility: 'hidden' }}>
                {f.a}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
        More questions? Ask us via the contact page.
      </p>
    </section>
  )
}

function HomeShowcase() {
  const go = useTransitionNavigate()
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-3">
        {SERVICES.slice(0, 3).map((s, i) => (
          <FadeUp key={s.title} delay={i * 0.1} className="bg-panel p-10">
            <p className="mb-6 font-mono text-xs text-orange">0{i + 1}</p>
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">{s.title}</h3>
            <p className="mt-4 text-xs leading-relaxed text-dim">{s.desc}</p>
            <button onClick={() => go('/services')} className="mt-6 text-[10px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-orange">
              Explore ⟶
            </button>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}