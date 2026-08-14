import { lazy, Suspense, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LineMask, FadeUp, Counter, Magnetic, usePageReveals, registerGsap } from '../lib/motion'
import { useTransitionNavigate } from '../lib/navigation'
import { HOME_STATS, SERVICES, HUBS, FAQS } from '../data'
import type { ScrubRef } from '../lib/scrub'

import { SceneStage } from '../components/SceneStage'
const GlobeScene = lazy(() => import('../scenes/GlobeScene'))
const StackerScene = lazy(() => import('../scenes/StackerScene'))
const TruckScene = lazy(() => import('../scenes/TruckScene'))
const ShipScene = lazy(() => import('../scenes/ShipScene'))
const TerminalScene = lazy(() => import('../scenes/TerminalScene'))
const ViaductScene = lazy(() => import('../scenes/ViaductScene'))

/** P1 — skeleton while a scene's canvas chunk loads (no blank flash). */
function SceneSkeleton({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">{label}</span>
      <span className="h-px w-24 animate-pulse bg-orange/50" />
    </div>
  )
}

function SuspenseBox({ label = 'scene', children }: { label?: string; children: ReactNode }) {
  return <Suspense fallback={<SceneSkeleton label={label} />}>{children}</Suspense>
}

/** S1 — drive a scrub ref from a 220vh sticky wrapper's scroll progress. */
function useSectionScrub(ref: RefObject<HTMLElement | null>, scrub?: ScrubRef) {
  useEffect(() => {
    if (!scrub) return
    registerGsap()
    const el = ref.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        scrub.current = self.progress
      },
    })
    return () => st.kill()
  }, [scrub, ref])
}

/** P1 — fixed right-edge rail showing which of the 6 film scenes is on screen. */
const SCENE_RAIL_LABELS = ['Network', 'Terminal', 'Linehaul', 'Highway', 'Yard', 'Ocean']

function SceneRail() {
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section.scene'))
    if (sections.length === 0) {
      setActive(0)
      return
    }
    const onScroll = () => {
      const dists = sections.map((s) => {
        const r = s.getBoundingClientRect()
        return Math.abs(r.top - window.innerHeight * 0.5)
      })
      const nearest = dists.indexOf(Math.min(...dists))
      setActive(nearest)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed right-5 top-1/2 z-[120] hidden -translate-y-1/2 flex-col items-end gap-4 md:flex">
      {SCENE_RAIL_LABELS.map((label, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span
            className={`font-mono text-[9px] tracking-[0.22em] uppercase transition-all duration-300 ${
              active === i ? 'text-orange opacity-100' : 'opacity-0'
            }`}
          >
            0{i + 1} {label}
          </span>
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              active === i ? 'w-5 bg-orange' : 'w-1.5 bg-white/25'
            }`}
          />
        </div>
      ))}
    </div>
  )
}

/** S1 — sticky scene wrapper: kicker + giant line over a full-bleed canvas. */
function StickyScene({
  index,
  mode,
  line,
  bg = 'bg-void',
  text = 'text-ink',
  sub,
  scrub,
  children,
}: {
  index: string
  mode: string
  line: string
  bg?: string
  text?: string
  sub?: string
  scrub?: ScrubRef
  children: ReactNode
}) {
  const wrapRef = useRef<HTMLElement>(null)
  useSectionScrub(wrapRef, scrub)
  return (
    <section ref={wrapRef} className={`scene ${bg}`}>
      <div className="pin flex flex-col">
        <div className="absolute inset-0">{children}</div>
        <div className="relative z-10 mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col justify-end px-6 pb-14 md:px-10">
          <p className="mb-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-orange">
            <span className="h-px w-8 bg-orange" />
            0{index} — {mode}
          </p>
          <h2 className={`font-display text-[clamp(2.25rem,5.5vw,5rem)] font-extrabold uppercase leading-[0.92] tracking-tight ${text}`}>
            {line}
          </h2>
          {sub && <p className={`mt-3 max-w-md text-xs leading-relaxed text-dim ${text === 'text-ink' ? '' : 'text-neutral-600'}`}>{sub}</p>}
        </div>
      </div>
    </section>
  )
}

/** S1 SHOT 1 — hero globe on the sticky reel (solid white heading preserved). */
function HeroSection() {
  const go = useTransitionNavigate()
  return (
    <section className="scene bg-[#0a0a0a]">
      <div className="pin flex items-center">
        <div className="absolute inset-0" data-cursor="DRAG">
          <SuspenseBox label="Global">
            <GlobeScene />
          </SuspenseBox>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void via-void/70 to-transparent lg:w-3/5" />

        <div className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-6 py-24 md:px-10">
          <p className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-orange">
            <span className="h-px w-10 bg-orange" /> 01 — Network
          </p>
          <LineMask as="h1" className="font-display text-[clamp(3rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-[#ededed]">
            Every Leg
          </LineMask>
          <LineMask as="h1" delay={0.18} className="font-display text-[clamp(3rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-[#ededed]">
            Of The Journey
          </LineMask>
          <FadeUp className="mt-8 max-w-md">
            <p className="text-sm leading-relaxed text-dim">
              Freight forwarding, customs brokerage, and transport — unified under one accountable team.
            </p>
            <div className="pointer-events-auto mt-8 flex flex-wrap gap-4">
              <Magnetic>
                <button
                  onClick={() => go('/contact')}
                  className="rounded-full border border-[#555] bg-transparent px-7 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white transition-all hover:bg-white hover:text-black"
                >
                  Talk With Us
                </button>
              </Magnetic>
              <Magnetic>
                <button
                  onClick={() => go('/services')}
                  className="rounded-full border border-[#555] bg-transparent px-7 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white transition-all hover:bg-white hover:text-black"
                >
                  Our Services
                </button>
              </Magnetic>
            </div>
          </FadeUp>
        </div>

        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
          <div className="bob flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40">
            Scroll <span className="text-orange">↓</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/** S1 SHOT 3 — side-view truck; the giant word lives in the scene at z -12 behind the trucks. */
function TruckSection({ scrub }: { scrub: ScrubRef }) {
  const wrapRef = useRef<HTMLElement>(null)
  useSectionScrub(wrapRef, scrub)
  return (
    <section ref={wrapRef} className={`scene bg-[#FAF9F7]`}>
      <div className="pin">
        <div className="absolute left-6 top-8 z-20 md:left-10">
          <p className="mb-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-orange">
            <span className="h-px w-8 bg-orange" />
            03 — Linehaul
          </p>
        </div>
        <div className="absolute inset-0">
          <SuspenseBox label="Linehaul">
            <SceneStage label="Linehaul" tone="orange">
              <TruckScene scrub={scrub} />
            </SceneStage>
          </SuspenseBox>
        </div>
        <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-10">
          {[
            ['01', 'Speed', 'label-fade'],
            ['02', 'Reliability', 'label-fade label-fade-2'],
            ['03', 'Coverage', 'label-fade label-fade-3'],
          ].map(([n, w, fade]) => (
            <div key={w} className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#0a0a0a] ${fade}`}>
              <span className="font-mono text-orange">{n}</span> {w}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** v18 SHOT 4 — RELIABILITY split: heading + ribbed bar + feature blocks, riding the scrub. */
function ReliabilitySection({ scrub }: { scrub: ScrubRef }) {
  const wrapRef = useRef<HTMLElement>(null)
  const ribRef = useRef<HTMLDivElement>(null)
  const blk1 = useRef<HTMLDivElement>(null)
  const blk2 = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  useSectionScrub(wrapRef, scrub)
  useEffect(() => {
    registerGsap()
    const el = wrapRef.current
    const rib = ribRef.current
    const b1 = blk1.current
    const b2 = blk2.current
    const hd = headRef.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        if (rib) rib.style.transform = `translateY(${(p * 2 - 1) * 15}%)`
        if (b1) {
          const o = Math.min(p / 0.45, 1)
          b1.style.opacity = String(o)
          b1.style.transform = `translateY(${(1 - o) * -20}px)`
        }
        if (b2) {
          const o = Math.min(Math.max((p - 0.25) / 0.45, 0), 1)
          b2.style.opacity = String(o)
          b2.style.transform = `translateY(${(1 - o) * -20}px)`
        }
        if (hd) hd.style.opacity = String(Math.min(p / 0.35, 1))
      },
    })
    return () => st.kill()
  }, [])
  return (
    <section ref={wrapRef} className="scene bg-[#101010]">
      <div className="pin flex flex-col">
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 md:px-10">
          <div className="flex flex-1 items-end justify-between gap-10 pb-10 pt-28 md:pt-36">
            <div ref={headRef} className="max-w-2xl">
              <h2 className="font-display text-[clamp(2.5rem,6vw,6rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-[#6a6a6a]">
                Reliability
              </h2>
              <h2 className="font-display text-[clamp(2.5rem,6vw,6rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-[#f2f2f2]">
                At Every Milestone
              </h2>
              <p className="mt-5 max-w-md font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-[#8a8a8a]">
                One shipment, one team. No hand-off between vendors — freight, customs and transport run under a single escalation path.
              </p>
            </div>
            <div className="hidden shrink-0 flex-col items-end gap-2 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a4a4a] md:flex">
              <span>Real-Time Visibility</span>
              <span>Proactive Exceptions</span>
              <span>Owned Outcome</span>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 items-stretch gap-10 border-t border-[#222] pb-8 pt-10 md:grid-cols-12 md:gap-8">
            <div className="hidden flex-col justify-between md:col-span-4 md:flex">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a4a4a]">
                Live telemetry on every lane — booking, customs, transit, final mile.
              </p>
              <p className="max-w-[10rem] font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-[#4a4a4a]">
                One accountable team per shipment — every milestone, owned to delivery.
              </p>
            </div>
            <div className="flex items-center justify-center md:col-span-2">
              <div ref={ribRef} className="rib-bar" />
            </div>
            <div className="flex flex-col justify-center gap-10 md:col-span-6 md:gap-0">
              <div ref={blk1} className="border-l border-white/10 pl-6 opacity-0 md:pb-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-orange">01</p>
                <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-tight text-[#f2f2f2]">Real-Time Freight Tracking</h3>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-[#8a8a8a]">
                  Know exactly where your cargo is at every milestone. Live visibility means faster decisions and zero guesswork.
                </p>
              </div>
              <div className="h-px w-20 bg-[#222]" />
              <div ref={blk2} className="border-l border-white/10 pl-6 pt-10 opacity-0 md:pt-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-orange">02</p>
                <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-tight text-[#f2f2f2]">24/7 Customer Support</h3>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-[#8a8a8a]">
                  Real people, always available. We pick up the phone and we own the outcome.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  usePageReveals()
  const stackerScrub = useRef(0)
  const truckScrub = useRef(0)
  const reliabilityScrub = useRef(0)
  const viaductScrub = useRef(0)
  const oceanScrub = useRef(0)

  return (
    <div className="relative">
      {/* ——— THE FILM (6 sticky scenes) ——— */}
      <SceneRail />
      <HeroSection />

      <StickyScene index="2" mode="TERMINAL" bg="bg-[#FAF9F7]" text="text-[#0a0a0a]" line="One team, every mode." scrub={stackerScrub}>
        <SuspenseBox label="Freight">
          <SceneStage label="Freight" tone="orange">
            <StackerScene scrub={stackerScrub} />
          </SceneStage>
        </SuspenseBox>
      </StickyScene>

      <TruckSection scrub={truckScrub} />

      <ReliabilitySection scrub={reliabilityScrub} />

      <StickyScene index="4" mode="HIGHWAY" bg="bg-[#101410]" text="text-[#ededed]" line="Built for every lane." scrub={viaductScrub}>
        <SuspenseBox label="About">
          <ViaductScene scrub={viaductScrub} />
        </SuspenseBox>
      </StickyScene>

      <StickyScene index="5" mode="YARD" bg="bg-[#C9D3D8]" text="text-[#0a0a0a]" line="Powering the network.">
        <SuspenseBox label="Terminal">
          <TerminalScene />
        </SuspenseBox>
      </StickyScene>

      <StickyScene index="6" mode="OCEAN" bg="bg-[#1E56A0]" line="Ocean freight, end to end." scrub={oceanScrub} sub="FCL, LCL and specialised cargo — across every major trade lane.">
        <SuspenseBox label="Ocean">
          <SceneStage label="Ocean" tone="blue" camera={{ position: [0, 36, 16], fov: 35 }}>
            <ShipScene scrub={oceanScrub} />
          </SceneStage>
        </SuspenseBox>
        <div className="absolute left-6 top-8 z-10 md:left-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-orange" />
            Ocean Freight — FCL / LCL / Specialised
          </p>
        </div>
        <div className="absolute right-6 top-8 z-10 hidden w-44 md:right-10 md:block">
          <div className="rounded-md border border-white/15 bg-black/55 p-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur">
            <p className="mb-2 text-white/50">Rates — FCL</p>
            {[
              ['20FT', '1,150'],
              ['40FT', '1,950'],
              ['REEFER', '2,850'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-t border-white/10 py-1.5">
                <span className="text-white/70">{k}</span>
                <span className="text-orange">${v}</span>
              </div>
            ))}
          </div>
        </div>
      </StickyScene>

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

      {/* ——— Services intro (from SHOT 3 copy) ——— */}
      <section className="bg-[#efeae3]">
        <div className="section-pad px-[6vw]">
          <h2 className="section-heading text-[#0a0a0a]">Everything your freight needs.</h2>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">01 — Air & Ocean</p>
              <p className="section-copy mt-2 text-sm leading-relaxed text-neutral-600">
                Express and priority lanes with disciplined schedules, from booking to final mile.
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">02 — Customs & Compliance</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Licensed in-house brokerage — classification, duties, and quarantine handled end to end.
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">03 — Ground & 3PL</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Warehousing, pick and pack, and linehaul transport managed under one accountable team.
              </p>
            </div>
          </div>
        </div>
        <p className="px-[6vw] pb-[10vh] font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Under one group — air, ocean, customs, warehouse.
        </p>
      </section>

      {/* STATS */}
      <section className="section-pad px-[6vw]">
        <div className="grid grid-cols-2 gap-y-14 md:grid-cols-5">
          {HOME_STATS.map((s) => (
            <FadeUp key={s.label} className="border-l border-white/10 pl-5">
              <p className="font-display text-4xl font-bold text-ink md:text-5xl">
                <Counter value={s.value} suffix={s.suffix} underline />
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">{s.label}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* WE MOVE FREIGHT */}
      <section className="relative overflow-hidden border-t border-white/[0.07] section-pad">
        <p data-reveal-parallax="0.25" className="text-stroke pointer-events-none select-none whitespace-nowrap font-display text-[16vw] font-extrabold uppercase leading-none">
          We Move Freight
        </p>
        <div className="px-[6vw]">
          <div className="mt-10 max-w-3xl">
            <LineMask as="h2" className="section-heading">
              We own the outcome.
            </LineMask>
            <FadeUp className="mt-8 max-w-xl">
              <p className="section-copy text-sm leading-relaxed">
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
    <section data-reveal className="border-t border-white/[0.07] bg-panel/40 section-pad">
      <div className="grid-88">
        <p className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-orange">
          <span className="h-px w-10 bg-orange" /> Global Network
        </p>
        <div className="bordered-grid">
          {HUBS.slice(0, 3).map((h, i) => (
            <div key={h.id} className="hover-card p-10">
              <p className="hc-index mb-2 font-mono text-[10px] tracking-[0.2em] text-white/40">0{i + 1} — {h.region}</p>
              <p className="font-display text-2xl font-bold uppercase tracking-tight text-ink">{h.country}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
                {h.region} · {h.timezone.split('/')[1]}
              </p>
              <p className="mt-3 flex flex-wrap gap-2">
                {h.capabilities.slice(0, 4).map((c) => (
                  <span key={c} className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-white/50 transition-colors hover:border-orange/60 hover:text-orange">
                    {c}
                  </span>
                ))}
              </p>
              <div className="hc-media mt-6 h-16 w-full rounded bg-gradient-to-br from-[#ff4a00]/20 via-transparent to-[#2b4bff]/20" />
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
    <section className="grid-88 section-pad">
      <p className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-orange">
        <span className="h-px w-10 bg-orange" /> FAQ
      </p>
      <div className="space-y-0 border border-[#222]">
        {FAQS.map((f, i) => (
          <div key={i} className="border-b border-[#222] last:border-0">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-6 bg-panel px-8 py-6 text-left"
            >
              <span className="font-mono text-sm uppercase tracking-[0.08em] text-ink">{f.q}</span>
              <span className={`font-mono text-xl text-orange transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`}>+</span>
            </button>
            <div className={`acc-panel ${open === i ? 'open' : ''}`}>
              <div>
                <p className="max-w-2xl px-8 pb-6 pt-0 text-xs leading-relaxed text-dim">{f.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 px-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
        More questions? Ask us via the contact page.
      </p>
    </section>
  )
}

function HomeShowcase() {
  const go = useTransitionNavigate()
  return (
    <section className="grid-88 section-pad">
      <div className="bordered-grid">
        {SERVICES.slice(0, 3).map((s, i) => (
          <FadeUp key={s.title} delay={i * 0.1} className="hover-card p-10">
            <p className="hc-index mb-6 font-mono text-xs text-white/40">0{i + 1}</p>
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">{s.title}</h3>
            <p className="mt-4 text-xs leading-relaxed text-dim">{s.desc}</p>
            <button
              onClick={() => go('/services')}
              className="mt-6 text-[10px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-orange"
            >
              Explore ⟶
            </button>
            <div className="hc-media mt-8 h-14 w-full rounded bg-gradient-to-br from-[#ff4a00]/15 via-transparent to-[#2b4bff]/15" />
          </FadeUp>
        ))}
      </div>
    </section>
  )
}