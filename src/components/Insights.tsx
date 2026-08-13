import { useState } from 'react'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { INSIGHTS } from '../data'

const FILTERS = ['All', 'Industry Insights', 'Customs Advice', 'Awards', 'Market Intelligence', 'Sustainability', 'Technology']

export default function Insights() {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? INSIGHTS : INSIGHTS.filter((i) => i.category === filter)

  return (
    <section id="insights" className="relative border-t border-white/5 bg-carbon/40 py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-cyber-blue">
              <span className="h-px w-10 bg-cyber-blue" />
              Insights & Case Studies
            </p>
            <h2 className="max-w-xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Intelligence from the front line.
            </h2>
          </div>
          <div className="flex max-w-3xl flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
                  filter === f
                    ? 'border-cyber-blue bg-cyber-blue text-void'
                    : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <article
              key={post.title}
              className="group cursor-pointer rounded-2xl border border-white/10 bg-carbon p-8 transition-all duration-500 hover:-translate-y-1 hover:border-white/25"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider ${
                    post.accent === 'orange'
                      ? 'bg-neon-orange/15 text-neon-orange'
                      : 'bg-cyber-blue/15 text-cyber-blue'
                  }`}
                >
                  {post.category}
                </span>
                <ArrowUpRight size={18} className="text-white/30 transition-all duration-300 group-hover:rotate-45 group-hover:text-cyber-blue" />
              </div>

              <h3 className="mt-8 font-display text-xl font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-cyber-blue">
                {post.title}
              </h3>

              <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-5 text-xs text-white/40">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={13} className="text-neon-orange" />
                  {post.date}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>{post.read}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}