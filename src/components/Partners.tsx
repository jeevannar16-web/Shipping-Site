import { AIRLINES, SHIPPING_LINES } from '../data'

function MarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="overflow-hidden">
      <div
        className={`marquee-track flex items-center whitespace-nowrap py-4 ${
          reverse ? '[animation-direction:reverse]' : ''
        }`}
      >
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center">
            {items.map((name, i) => (
              <span
                key={`${dup}-${name}`}
                className={`mx-8 font-display text-lg font-semibold uppercase tracking-wide ${
                  i % 2 === 0 ? 'text-white/40 hover:text-white' : 'text-white/25 hover:text-white'
                } transition-colors duration-300`}
              >
                {name}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Partners() {
  return (
    <section className="relative border-y border-white/5 py-20">
      <div className="mx-auto max-w-7xl px-6" data-reveal>
        <p className="mb-8 text-center text-xs uppercase tracking-[0.3em] text-white/35">
          Our partners — airlines & shipping lines
        </p>
      </div>
      <div data-reveal>
        <div className="mb-6 space-y-2">
          <p className="px-6 text-[10px] uppercase tracking-[0.25em] text-teal/60">Airlines</p>
          <MarqueeRow items={AIRLINES} />
        </div>
        <div className="space-y-2">
          <p className="px-6 text-[10px] uppercase tracking-[0.25em] text-gold/60">Shipping lines</p>
          <MarqueeRow items={SHIPPING_LINES} reverse />
        </div>
      </div>
    </section>
  )
}