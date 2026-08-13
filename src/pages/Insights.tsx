import { useState } from 'react'
import { LineMask, FadeUp, usePageReveals } from '../lib/motion'
import { INSIGHTS, INSIGHT_CATEGORIES } from '../data'

export default function Insights() {
  usePageReveals()
  const [active, setActive] = useState('CASE STUDIES')

  const filtered = active === 'ALL' ? INSIGHTS : INSIGHTS.length > 0 ? INSIGHTS : []
  const highlight = filtered[0]

  return (
    <div className="relative">
      {/* header */}
      <section className="section-pad px-[6vw]">
        <LineMask as="h1" className="font-display font-extrabold uppercase tracking-tight text-ink section-heading">
          Insights
        </LineMask>
      </section>

      <div className="section-pad px-[6vw] pt-0">
        <div className="grid gap-12 md:grid-cols-12">
          {/* sidebar */}
          <aside className="md:col-span-4">
            <p className="mb-5 text-[10px] uppercase tracking-[0.24em] text-white/35">Categories</p>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActive('ALL')}
                  className={`group flex w-full items-center justify-between border-b border-white/[0.07] py-3 text-left transition-colors ${
                    active === 'ALL' ? 'text-orange' : 'text-dim hover:text-ink'
                  }`}
                >
                  <span className="text-sm font-semibold uppercase tracking-[0.1em]">All</span>
                  <span className="font-mono text-xs">{INSIGHTS.length}</span>
                </button>
              </li>
              {INSIGHT_CATEGORIES.map((c) => (
                <li key={c.label}>
                  <button
                    onClick={() => setActive(c.label)}
                    className={`group flex w-full items-center justify-between border-b border-white/[0.07] py-3 text-left transition-colors ${
                      active === c.label ? 'text-orange' : 'text-dim hover:text-ink'
                    }`}
                  >
                    <span className="text-sm font-semibold uppercase tracking-[0.1em]">{c.label}</span>
                    <span className="font-mono text-xs">{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* main */}
          <div className="md:col-span-8">
            {highlight ? (
              <FadeUp className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-panel">
                <div className="grid md:grid-cols-2">
                  <div className="p-10 md:p-12">
                    <p className="mb-3 inline-block rounded-full bg-orange px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-void">
                      {highlight.category}
                    </p>
                    <h2 className="font-display text-2xl font-bold leading-snug uppercase tracking-tight text-ink md:text-3xl">
                      {highlight.title}
                    </h2>
                    <p className="mt-6 font-mono text-xs text-dim">{highlight.date}</p>
                  </div>
                  <div className="relative min-h-[220px] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue/40 via-violet/30 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-stroke font-display text-6xl font-extrabold uppercase tracking-tight">
                        {highlight.category.split(' ')[0]}
                      </span>
                    </div>
                    <span className="absolute bottom-4 right-5 text-4xl text-ink transition-transform group-hover:translate-x-2">
                      ⟶
                    </span>
                  </div>
                </div>
              </FadeUp>
            ) : null}

            {/* grid */}
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {filtered.slice(1).map((ins, i) => (
                <FadeUp
                  key={i}
                  delay={i * 0.05}
                  className="group rounded-xl border border-white/[0.07] bg-panel p-7 transition-all hover:border-orange/40"
                >
                  <p className="mb-4 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-white/35">
                    <span>{ins.category}</span>
                    <span className="font-mono">{ins.date}</span>
                  </p>
                  <h3 className="font-display text-lg font-bold uppercase leading-snug tracking-tight text-ink transition-colors group-hover:text-orange">
                    {ins.title}
                  </h3>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}