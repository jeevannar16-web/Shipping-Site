import { ArrowUpRight } from 'lucide-react'
import { SERVICES } from '../data'

export default function Services() {
  return (
    <section id="services" className="relative py-28 md:py-36">
      <div className="mb-20 overflow-hidden border-y border-white/10 bg-carbon/60 py-6">
        <div className="marquee-track flex items-center whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center">
              {SERVICES.map((s) => (
                <span
                  key={`${dup}-${s.title}`}
                  className="mx-8 inline-flex items-center gap-8 font-display text-4xl font-bold tracking-tight text-white/25 md:text-6xl"
                >
                  {s.title}
                  <span className="text-neon-orange">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neon-orange">
              <span className="h-px w-10 bg-neon-orange" />
              Services
            </p>
            <h2 className="max-w-xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              End-to-end freight capability.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/50">
            From a single pallet to project-scale heavy lift — one digital thread across every
            mode, every border.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-carbon p-8 transition-all duration-500 hover:border-neon-orange/40 hover:bg-graphite"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyber-blue/5 blur-3xl transition-all duration-700 group-hover:bg-neon-orange/10" />

              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-white/45">
                  {service.tag}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-all duration-500 group-hover:rotate-45 group-hover:border-neon-orange group-hover:bg-neon-orange group-hover:text-void">
                  <ArrowUpRight size={16} />
                </span>
              </div>

              <h3 className="mt-8 font-display text-2xl font-semibold text-white transition-colors duration-300 group-hover:text-cyber-blue">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{service.desc}</p>

              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-[10px] uppercase tracking-wider text-white/35">Network size</span>
                <span className="font-display text-sm font-semibold text-neon-orange">{service.stat}</span>
              </div>
            </article>
          ))}

          <article className="relative overflow-hidden rounded-2xl bg-void p-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neon-orange/15 via-transparent to-cyber-blue/15" />
            <p className="relative text-[10px] uppercase tracking-wider text-neon-orange">Custom program</p>
            <h3 className="relative mt-6 font-display text-2xl font-semibold leading-snug text-white">
              Need a tailored <span className="text-cyber-blue">logistics solution?</span>
            </h3>
            <p className="relative mt-3 text-sm leading-relaxed text-white/55">
              Our specialists design bespoke freight programs for manufacturers, retailers and
              project teams worldwide.
            </p>
            <a
              href="#contact"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-neon-orange px-6 py-3 text-sm font-semibold text-void transition-all hover:shadow-[0_0_35px_rgba(255,85,0,0.35)]"
            >
              Build My Program <ArrowUpRight size={15} />
            </a>
          </article>
        </div>
      </div>
    </section>
  )
}