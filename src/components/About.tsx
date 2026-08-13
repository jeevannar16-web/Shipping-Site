import { ArrowRight } from 'lucide-react'
import { useCountUp } from '../hooks/useCountUp'
import { STATS } from '../data'

function StatItem({
  value,
  suffix,
  label,
  decimals,
}: {
  value: number
  suffix: string
  label: string
  decimals?: number
}) {
  const ref = useCountUp(value, { duration: 2.2, decimals })
  return (
    <div className="group relative flex-1 py-8 text-center">
      <p className="font-display text-4xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-cyber-blue md:text-6xl">
        <span ref={ref}>0</span>
        <span className="text-neon-orange">{suffix}</span>
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/40">{label}</p>
    </div>
  )
}

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-6 py-28 md:py-36">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neon-orange" data-reveal>
            <span className="h-px w-10 bg-neon-orange" />
            About United Carriers
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl" data-reveal>
            We move freight.
            <br />
            <span className="text-glow-orange text-neon-orange">We own the outcome.</span>
          </h2>
          <p className="mt-8 text-base leading-relaxed text-white/55 md:text-lg" data-reveal>
            With every service under one roof and one accountable team, your supply chain
            moves the way your business demands: predictably, transparently, and without
            excuses.
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/55 md:text-lg" data-reveal>
            That means no finger-pointing between vendors. No delays lost in handoffs. Just
            one team, accountable from origin to destination.
          </p>
          <a
            href="#services"
            className="group mt-10 inline-flex items-center gap-2 text-sm font-semibold text-cyber-blue transition-colors hover:text-white"
            data-reveal
          >
            Explore our services
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="lg:pl-10" data-reveal>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-carbon">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyber-blue/8 blur-3xl" />
            <div className="divide-y divide-white/10">
              {STATS.map((stat) => (
                <StatItem key={stat.label} {...stat} />
              ))}
            </div>
            <div className="border-t border-white/10 bg-void/50 px-6 py-5 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Built on accountability, measured by results
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
