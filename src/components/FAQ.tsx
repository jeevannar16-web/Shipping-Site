import { useState } from 'react'
import { Plus, Minus, Mail } from 'lucide-react'
import { FAQS, CONTACT } from '../data'

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative mx-auto max-w-7xl px-6 py-28 md:py-36">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <div className="lg:sticky lg:top-32" data-reveal>
          <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold">
            <span className="h-px w-10 bg-gold" />
            FAQ
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Straightforward answers, so you can
            <span className="text-glow-gold text-gold"> move with confidence.</span>
          </h2>
          <p className="mt-8 max-w-md text-base leading-relaxed text-white/55">
            Still have questions? Our team is here to help.
          </p>
          <a
            href={`mailto:${CONTACT.email}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-teal hover:text-teal"
          >
            <Mail size={15} /> Email us
          </a>
        </div>

        <div className="space-y-3" data-reveal-stagger>
          {FAQS.map((faq, i) => {
            const isOpen = open === i
            return (
              <div
                key={faq.q}
                className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                  isOpen ? 'border-gold/40 bg-graphite' : 'border-white/10 bg-carbon'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className={`font-display text-base font-semibold transition-colors duration-300 md:text-lg ${isOpen ? 'text-gold' : 'text-white'}`}>
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen ? 'rotate-180 border-gold text-gold' : 'border-white/15 text-white/60'
                    }`}
                  >
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                <div
                  className="grid transition-all duration-500 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-sm leading-relaxed text-white/55">{faq.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}