import { useState } from 'react'
import { MapPin, Gauge, Building2, Cpu, ArrowUpRight } from 'lucide-react'
import { HUBS } from '../data'

const REGIONS = ['All Regions', 'Australia', 'New Zealand', 'Hong Kong', 'China', 'Europe', 'Americas']

export default function GlobalNetwork() {
  const [region, setRegion] = useState('All Regions')

  const filtered = region === 'All Regions' ? HUBS : HUBS.filter((h) => h.region === region || (region === 'China' && h.id === 'hongkong'))

  return (
    <section id="network" className="relative mx-auto max-w-7xl px-6 py-28 md:py-36">
      <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-cyber-blue">
            <span className="h-px w-10 bg-cyber-blue" />
            Global Network
          </p>
          <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Seven hubs. <span className="text-white/40">One connected</span> world.
          </h2>
        </div>
        <div className="flex max-w-3xl flex-wrap gap-2">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
                region === r
                  ? 'border-neon-orange bg-neon-orange text-void'
                  : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((hub, i) => (
          <div
            key={hub.id}
            className="group relative bg-carbon p-8 transition-colors duration-500 hover:bg-graphite"
            style={{ transitionDelay: `${i * 30}ms` }}
          >
            <div className="pointer-events-none absolute right-6 top-6 opacity-0 transition-all duration-500 group-hover:opacity-100">
              <ArrowUpRight size={20} className="text-neon-orange" />
            </div>

            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 transition-all duration-500 group-hover:border-neon-orange/50 group-hover:shadow-[0_0_25px_rgba(255,85,0,0.2)]">
              <MapPin size={20} className="text-cyber-blue" />
            </div>

            <h3 className="font-display text-2xl font-semibold text-white">{hub.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-wider text-white/40">{hub.region}</p>

            <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3">
                <Gauge size={15} className="text-neon-orange" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">Throughput</p>
                  <p className="text-sm font-medium text-white">{hub.throughput}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 size={15} className="text-neon-orange" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">Offices</p>
                  <p className="text-sm font-medium text-white">{hub.offices} local offices</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Cpu size={15} className="text-neon-orange" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">Integration</p>
                  <p className="text-sm font-medium text-cyber-blue">{hub.integration}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length > 0 && (
          <div className="flex flex-col justify-between bg-void p-8">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/35">Network Pulse</p>
              <p className="mt-3 font-display text-5xl font-bold text-glow-blue text-cyber-blue">
                {filtered.length}
              </p>
              <p className="mt-1 text-sm text-white/50">
                strategic {filtered.length === 1 ? 'hub' : 'hubs'} in this region
              </p>
            </div>
            <p className="mt-8 text-sm leading-relaxed text-white/40">
              Every hub is live on our integrated control tower — booking to delivery, one thread.
            </p>
          </div>
        )}
      </div>

      <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { value: '220k+', label: 'Containers Moved' },
          { value: '0.6%', label: 'Dwell Time Variance' },
          { value: '40', label: 'Border Markets' },
          { value: '99.98%', label: 'Document Accuracy' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-carbon/60 p-6">
            <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}