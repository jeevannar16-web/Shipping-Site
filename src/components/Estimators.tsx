import { useState } from 'react'
import { Search, Box, Package, Truck, Ship, Plane, Home, CheckCircle2, Clock } from 'lucide-react'

const TRACKING_STEPS = [
  { label: 'Shipment created', desc: 'Booking confirmed and documentation issued', icon: Box, eta: 'Day 0' },
  { label: 'Picked up from origin', desc: 'Cargo collected and customs paperwork lodged', icon: Package, eta: 'Day 1' },
  { label: 'In transit', desc: 'Main carriage underway — air, ocean or road', icon: Truck, eta: 'Day 2–6' },
  { label: 'Arrived at destination port/airport', desc: 'Vessel / aircraft arrived and cargo offloaded', icon: Plane, eta: 'Day 7' },
  { label: 'Customs cleared', desc: 'In-house brokerage completed clearance', icon: Ship, eta: 'Day 8' },
  { label: 'Delivered', desc: 'Final mile completed, POD available', icon: Home, eta: 'Day 9–10' },
]

const SAMPLE_IDS = ['UC-2026-000128', 'UC-2026-000454', 'UC-2026-000796']

export function TrackingSimulator() {
  const [id, setId] = useState('')
  const [tracking, setTracking] = useState<null | { id: string; stage: number }>(null)
  const [error, setError] = useState(false)

  const onTrack = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const clean = id.trim().toUpperCase()
    if (SAMPLE_IDS.includes(clean)) {
      const stage = clean === SAMPLE_IDS[0] ? 2 : clean === SAMPLE_IDS[1] ? 4 : 5
      setTracking({ id: clean, stage })
      setError(false)
    } else {
      setError(true)
      setTracking(null)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-carbon p-8 md:p-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-blue/10 text-cyber-blue">
          <Search size={18} />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-white">Live shipment tracking</h3>
          <p className="text-xs text-white/45">Try one of the sample consignments below</p>
        </div>
      </div>

      <form onSubmit={onTrack} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter consignment number"
          className="flex-1 rounded-xl border border-white/10 bg-void px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-cyber-blue"
          aria-label="Consignment number"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-cyber-blue px-6 py-3 text-sm font-semibold text-void transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.35)]"
        >
          Track <Search size={15} />
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {SAMPLE_IDS.map((s) => (
          <button
            key={s}
            onClick={() => setId(s)}
            className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/50 transition-all hover:border-cyber-blue/50 hover:text-cyber-blue"
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-neon-orange/30 bg-neon-orange/5 px-4 py-2 text-xs text-neon-orange">
          Consignment not found. Try one of the sample numbers above.
        </p>
      )}

      {tracking && (
        <div className="mt-8" key={tracking.id} data-anim="hub-panel">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-cyber-blue">{tracking.id}</p>
            <span className="flex items-center gap-1.5 rounded-full bg-cyber-blue/10 px-3 py-1 text-[10px] uppercase tracking-wider text-cyber-blue">
              <Clock size={11} /> In transit
            </span>
          </div>
          <ol className="mt-6 space-y-0">
            {TRACKING_STEPS.map((step, i) => {
              const done = i <= tracking.stage
              const current = i === tracking.stage
              const Icon = step.icon
              return (
                <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < TRACKING_STEPS.length - 1 && (
                    <span className={`absolute left-[15px] top-9 h-full w-px ${done ? 'bg-cyber-blue/40' : 'bg-white/10'}`} />
                  )}
                  <span
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      current
                        ? 'border-cyber-blue bg-cyber-blue/15 text-cyber-blue'
                        : done
                          ? 'border-cyber-blue/50 bg-cyber-blue/10 text-cyber-blue'
                          : 'border-white/10 bg-carbon text-white/20'
                    }`}
                  >
                    {done ? <CheckCircle2 size={15} /> : <Icon size={14} />}
                  </span>
                  <div className="pt-1">
                    <p className={`text-sm font-medium ${current ? 'text-cyber-blue' : done ? 'text-white' : 'text-white/35'}`}>
                      {step.label}
                    </p>
                    {current && <p className="mt-1 text-xs text-white/50">{step.desc}</p>}
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/30">{step.eta}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}

const MODES = [
  { id: 'air', label: 'Air Freight', icon: Plane, base: 6.5, perKg: 0.02 },
  { id: 'ocean', label: 'Ocean Freight', icon: Ship, base: 2.2, perKg: 0.004 },
  { id: 'road', label: 'Road Freight', icon: Truck, base: 1.4, perKg: 0.008 },
]

export function QuoteSimulator() {
  const [mode, setMode] = useState('air')
  const [weight, setWeight] = useState(100)
  const [origin, setOrigin] = useState('Melbourne')
  const [dest, setDest] = useState('Los Angeles')

  const selected = MODES.find((m) => m.id === mode)!
  const estimate = Math.round(selected.base * weight + weight * selected.perKg * 1000)

  return (
    <div className="rounded-2xl border border-white/10 bg-carbon p-8 md:p-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-orange/10 text-neon-orange">
          <Search size={18} className="rotate-90" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-white">Instant freight estimate</h3>
          <p className="text-xs text-white/45">Ballpark pricing for planning purposes</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
                  mode === m.id
                    ? 'border-neon-orange bg-neon-orange/10 text-neon-orange'
                    : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="text-[10px] uppercase tracking-wider">{m.label.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">Origin</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-void px-3 py-2.5 text-sm text-white outline-none focus:border-neon-orange"
            >
              {['Melbourne', 'Sydney', 'Auckland', 'Hong Kong'].map((c) => (
                <option key={c} className="bg-void">{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">Destination</label>
            <select
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-void px-3 py-2.5 text-sm text-white outline-none focus:border-neon-orange"
            >
              {['Los Angeles', 'London', 'Hong Kong', 'Auckland'].map((c) => (
                <option key={c} className="bg-void">{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-wider text-white/40">Estimated weight</label>
            <span className="font-mono text-sm text-neon-orange">{weight} kg</span>
          </div>
          <input
            type="range"
            min={10}
            max={5000}
            step={10}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="mt-2 w-full accent-neon-orange"
            aria-label="Estimated weight"
          />
        </div>

        <div className="rounded-xl border border-neon-orange/20 bg-void/60 p-5 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
            Estimated {selected.label.toLowerCase()} cost
          </p>
          <p className="mt-2 font-display text-4xl font-bold text-glow-orange text-neon-orange">
            AUD ${estimate.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-white/40">
            {origin} → {dest} · {weight} kg
          </p>
        </div>

        <a
          href="#contact"
          className="block rounded-xl bg-neon-orange py-3.5 text-center text-sm font-semibold text-void transition-all hover:shadow-[0_0_30px_rgba(255,85,0,0.35)]"
        >
          Get an exact quote
        </a>
      </div>
    </div>
  )
}