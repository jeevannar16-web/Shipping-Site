import { useState, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { INSIGHTS } from '../data'

gsap.registerPlugin(ScrollTrigger)

const FILTERS = ['All', 'Case Studies', 'Global', 'Customs Advice']

export default function Insights() {
  const [filter, setFilter] = useState('All')
  const gridRef = useRef<HTMLDivElement>(null)

  const filtered = filter === 'All' ? INSIGHTS : INSIGHTS.filter((i) => i.category === filter)

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const cards = Array.from(grid.children) as HTMLElement[]
    const tl = gsap.timeline()
    tl.fromTo(
      cards,
      { opacity: 0, y: 24, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.06, ease: 'power3.out' },
    )
    return () => {
      tl.kill()
    }
  }, [filter])

  return (
    <section id="insights" className="relative border-t border-white/5 bg-carbon/40 py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end" data-reveal>
          <div>
            <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-cyber-blue">
              <span className="h-px w-10 bg-cyber-blue" />
              Insights
            </p>
            <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              What's moving
              <span className="text-white/40"> in your industry.</span>
            </h2>
          </div>
          <div className="flex max-w-3xl flex-wrap gap-2" role="tablist" aria-label="Insight categories">
            {FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" ref={gridRef} key={filter}>
          {filtered.map((post, i) => (
            <article
              key={`${filter}-${post.title}`}
              className="group cursor-pointer rounded-2xl border border-white/10 bg-carbon p-8 transition-all duration-500 hover:-translate-y-1 hover:border-white/25"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-wider ${
                    post.accent === 'orange'
                      ? 'border-neon-orange/30 bg-neon-orange/15 text-neon-orange'
                      : 'border-cyber-blue/30 bg-cyber-blue/15 text-cyber-blue'
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
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}