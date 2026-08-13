import { NEWS_TICKER } from '../../data'
import { useTransitionNavigate } from '../../lib/navigation'

export default function NewsTicker() {
  const go = useTransitionNavigate()
  const items = [...NEWS_TICKER, ...NEWS_TICKER]
  const row = items.map((n, i) => (
    <span key={i} className="mx-6 inline-flex items-center gap-6 text-[10px] uppercase tracking-[0.14em] text-white/55">
      {n}
      <span className="text-orange">✦</span>
    </span>
  ))
  return (
    <div className="relative z-40 flex items-center justify-between border-b border-white/[0.07] bg-void px-4 py-2 md:px-6">
      <div className="overflow-hidden flex-1">
        <div className="ticker-track flex w-max whitespace-nowrap">{row}</div>
      </div>
      <div className="ml-6 hidden shrink-0 items-center gap-5 md:flex">
        <button onClick={() => go('/contact')} className="transition-colors text-[10px] uppercase tracking-[0.14em] text-white/55 hover:text-orange">
          Carbon Calculator
        </button>
        <span className="h-3 w-px bg-white/15" />
        <button onClick={() => go('/contact')} className="transition-colors text-[10px] uppercase tracking-[0.14em] text-white/55 hover:text-orange">
          Live Tracking Portal
        </button>
      </div>
    </div>
  )
}