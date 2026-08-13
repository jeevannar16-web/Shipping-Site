import { useState } from 'react'
import { ArrowRight, Globe2 } from 'lucide-react'
import GlobeScene from './Globe'
import MagneticButton from './MagneticButton'
import type { Country } from '../data'

export default function Hero({ hubRef }: { hubRef: (el: HTMLElement | null) => void }) {
  const [activeCountry, setActiveCountry] = useState<Country | null>(null)

  return (
    <section className="relative flex min-h-screen flex-col justify-end overflow-hidden pt-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[60vh] w-[70vw] -translate-x-1/2 bg-cyber-blue/5 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[40vh] w-[40vw] bg-neon-orange/6 blur-[140px]" />
      </div>

      <div className="pointer-events-none absolute right-0 top-16 h-[70vh] w-[55vw] max-w-[900px] lg:top-10">
        <GlobeScene
          activeCountryId={activeCountry?.id ?? null}
          onHover={setActiveCountry}
        />
      </div>

      {activeCountry && (
        <div className="pointer-events-none absolute right-[6vw] top-[24vh] z-20 hidden max-w-xs animate-pulse rounded-xl border border-cyber-blue/30 bg-void/80 p-5 backdrop-blur-xl lg:block">
          <p className="font-display text-sm font-semibold text-cyber-blue">{activeCountry.name}</p>
          <p className="mt-1 text-xs text-white/50">Active operating country</p>
        </div>
      )}

      <div ref={hubRef} className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24">
        <p className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/45" data-anim="fade-up">
          <Globe2 size={15} className="text-neon-orange" />
          One operator. Every leg of the journey.
          <span className="h-px w-12 bg-white/20" />
        </p>

        <h1 className="max-w-5xl font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[5.5rem]" data-anim="lines">
          Every leg
          <br />
          <span className="text-glow-orange text-neon-orange">of the journey.</span>
        </h1>

        <p className="mt-8 max-w-xl text-base leading-relaxed text-white/55 md:text-lg" data-anim="fade-up">
          Freight forwarding, land transport, and customs brokerage, unified across APAC
          under one accountable team.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4" data-anim="fade-up">
          <MagneticButton
            href="#contact"
            className="group flex items-center gap-3 rounded-full bg-neon-orange px-7 py-4 text-sm font-semibold text-void transition-all hover:shadow-[0_0_40px_rgba(255,85,0,0.4)] active:scale-[0.97]"
          >
            Talk With Us
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </MagneticButton>
          <MagneticButton
            href="#services"
            className="flex items-center gap-3 rounded-full border border-white/15 px-7 py-4 text-sm font-semibold text-white transition-all hover:border-cyber-blue hover:text-cyber-blue active:scale-[0.97]"
          >
            Our Services
          </MagneticButton>
        </div>

        <div className="mt-16 flex max-w-2xl flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-8" data-anim="fade-up">
          {[
            { value: 'Australia', label: 'Operational HQ' },
            { value: '9', label: 'Countries Served' },
            { value: '5', label: 'Freight Modes' },
            { value: '24/7', label: 'Support' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl font-bold text-white md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}