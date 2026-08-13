import { Quote } from 'lucide-react'
import { TESTIMONIALS } from '../data'

export default function Testimonials() {
  return (
    <section className="relative border-t border-white/5 bg-carbon/40 py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end" data-reveal>
          <div>
            <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-teal">
              <span className="h-px w-10 bg-teal" />
              Trusted by businesses across the network
            </p>
            <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              They let our team
              <span className="text-white/40"> carry the weight.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/50">
            From first-time importers to high-volume shippers, our customers keep coming back
            because we treat their freight like our own.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3" data-reveal-stagger>
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="group relative flex flex-col rounded-2xl border border-white/10 bg-carbon p-8 transition-all duration-500 hover:-translate-y-1 hover:border-white/25"
            >
              <Quote size={26} className="text-gold" />
              <blockquote className="mt-6 flex-1 text-sm leading-relaxed text-white/60">
                {t.quote}
              </blockquote>
              <figcaption className="mt-8 border-t border-white/10 pt-5">
                <p className="font-display text-sm font-semibold text-white">{t.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/40">{t.role}</p>
                <p className="mt-0.5 text-xs font-medium text-teal">{t.org}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}