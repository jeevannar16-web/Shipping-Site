import { useState, useEffect } from 'react'
import { MapPin, Clock, Check, ArrowUpRight } from 'lucide-react'
import { HUBS, NETWORK_REGIONS } from '../data'

function useHubTime(tz: string) {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const update = () => setTime(fmt.format(new Date()))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [tz])
  return time
}

export default function GlobalNetwork() {
  const [region, setRegion] = useState(NETWORK_REGIONS[0])
  const [selected, setSelected] = useState(HUBS.filter((h) => h.region === region)[0])

  useEffect(() => {
    const first = HUBS.filter((h) => h.region === region)[0]
    if (first) setSelected(first)
  }, [region])

  const hubs = HUBS.filter((h) => h.region === region)

  return (
    <section id="network" className="relative mx-auto max-w-7xl px-6 py-28 md:py-36">
      <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end" data-reveal>
        <div>
          <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-cyber-blue">
            <span className="h-px w-10 bg-cyber-blue" />
            Global Network
          </p>
          <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            One accountable team,
            <span className="text-white/40"> across APAC.</span>
          </h2>
        </div>
        <div className="flex max-w-3xl flex-wrap gap-2" role="tablist" aria-label="Network regions">
          {NETWORK_REGIONS.map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={region === r}
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" data-reveal>
        <div className="space-y-2">
          {hubs.map((hub) => (
            <button
              key={hub.id}
              onClick={() => setSelected(hub)}
              className={`flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-all duration-300 ${
                selected.id === hub.id
                  ? 'border-neon-orange/50 bg-graphite shadow-[0_0_25px_rgba(255,85,0,0.12)]'
                  : 'border-white/10 bg-carbon hover:border-white/25'
              }`}
            >
              <span className="flex items-center gap-3">
                <MapPin size={16} className={selected.id === hub.id ? 'text-neon-orange' : 'text-cyber-blue'} />
                <span className={`font-display text-lg font-semibold ${selected.id === hub.id ? 'text-white' : 'text-white/60'}`}>
                  {hub.country}
                </span>
              </span>
              <ArrowUpRight size={16} className={selected.id === hub.id ? 'text-neon-orange' : 'text-white/20'} />
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-carbon p-8 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyber-blue/8 blur-3xl" />
          <div key={selected.id} className="relative" data-anim="hub-panel">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon-orange/10 text-neon-orange">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-white">{selected.country} Hub</h3>
                <p className="text-xs uppercase tracking-wider text-white/40">{selected.region}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-lg border border-cyber-blue/20 bg-void/50 px-4 py-3">
              <Clock size={14} className="text-cyber-blue" />
              <span className="text-xs uppercase tracking-wider text-white/40">Local time</span>
              <span className="ml-auto font-mono text-sm tabular-nums text-cyber-blue">
                {useHubTime(selected.timezone)}
              </span>
            </div>

            <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-white/40">Capabilities</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {selected.capabilities.map((cap) => (
                <li key={cap} className="flex items-center gap-2 text-sm text-white/70">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyber-blue/10">
                    <Check size={11} className="text-cyber-blue" />
                  </span>
                  {cap}
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-xs leading-relaxed text-white/45">
                In-house licensed brokerage, dedicated account management, and full visibility
                from origin to destination — handled by one accountable team.
              </p>
              <a
                href="#contact"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-neon-orange px-5 py-2.5 text-sm font-semibold text-void transition-all hover:shadow-[0_0_30px_rgba(255,85,0,0.35)]"
              >
                Contact this hub <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}