import { Radar, Network, Headphones } from 'lucide-react'
import { FEATURES } from '../data'

const ICONS = [Radar, Network, Headphones]

export default function Features() {
  return (
    <section id="features" className="relative border-y border-white/5 bg-carbon/40 py-28 md:py-36">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[50rem] -translate-x-1/2 bg-teal/5 blur-[140px]" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-2xl" data-reveal>
          <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-teal">
            <span className="h-px w-10 bg-teal" />
            Reliability at every milestone
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Logistics that works <span className="text-white/40">as hard as you do.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3" data-reveal-stagger>
          {FEATURES.map((feature, i) => {
            const Icon = ICONS[i]
            return (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-carbon p-8 transition-all duration-500 hover:-translate-y-1 hover:border-teal/40"
              >
                <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-teal/5 blur-3xl transition-all duration-700 group-hover:bg-teal/10" />
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 transition-all duration-500 group-hover:border-teal/60 group-hover:shadow-[0_0_25px_rgba(45,212,191,0.2)]">
                  <Icon size={22} className="text-teal" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white transition-colors duration-300 group-hover:text-teal">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{feature.desc}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}