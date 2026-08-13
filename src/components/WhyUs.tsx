import { UserRound, Eye, ShieldCheck, BadgeDollarSign, Zap } from 'lucide-react'
import { WHY_US } from '../data'

const ICONS = [UserRound, Eye, ShieldCheck, BadgeDollarSign, Zap]

export default function WhyUs() {
  return (
    <section id="why-us" className="relative mx-auto max-w-7xl px-6 py-28 md:py-36">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <div className="lg:sticky lg:top-32" data-reveal>
          <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold">
            <span className="h-px w-10 bg-gold" />
            Why Jeevan Global Logistics
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Built for businesses that
            <span className="text-glow-gold text-gold"> can't afford disruption.</span>
          </h2>
          <p className="mt-8 max-w-md text-base leading-relaxed text-white/55">
            With every service under one roof and one accountable team, your supply chain moves
            the way your business demands: predictably, transparently, and without excuses.
          </p>
        </div>

        <div className="space-y-3" data-reveal-stagger>
          {WHY_US.map((item, i) => {
            const Icon = ICONS[i]
            return (
              <div
                key={item.title}
                className="group flex items-start gap-5 rounded-2xl border border-white/10 bg-carbon p-6 transition-all duration-300 hover:border-gold/40 hover:bg-graphite md:p-7"
              >
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 transition-all duration-500 group-hover:border-gold/60 group-hover:shadow-[0_0_25px_rgba(245,165,36,0.2)]">
                  <Icon size={20} className="text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/50">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}