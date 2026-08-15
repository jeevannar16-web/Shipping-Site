import { useState } from 'react'
import { LineMask, FadeUp, usePageReveals } from '../lib/motion'
import { CONTACT, LOCATIONS, REASONS } from '../data'

export default function Contact() {
  usePageReveals()
  return (
    <div className="relative px-[6vw] pt-[10vh]">
      <LineMask as="h1" className="font-display font-extrabold uppercase tracking-tight text-ink section-heading">
        Get in Touch
      </LineMask>
      <FadeUp className="mt-6 max-w-lg">
        <p className="text-sm leading-relaxed text-dim">
          Have a question or need support? Our team is here to help.
        </p>
      </FadeUp>

      <div className="grid gap-12 section-pad md:grid-cols-12">
        {/* left column */}
        <div className="space-y-8 md:col-span-4">
          <InfoBlock label="Office" value={CONTACT.address} />
          <InfoBlock label="Working Hours" value="Sun–Fri / 9AM–6PM NPT" />
          <InfoBlock label="Socials" value={['LinkedIn', 'X', 'Instagram']} />
          <InfoBlock label="Email" value={CONTACT.email} />
          <FadeUp className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.07]">
            <div className="absolute inset-0 bg-gradient-to-br from-orange/30 via-panel to-void" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stroke font-display text-5xl font-extrabold uppercase">Jeevan</span>
            </div>
          </FadeUp>
        </div>

        {/* middle: booking form */}
        <div className="md:col-span-5">
          <AppointmentForm />
        </div>

        {/* right: locations */}
        <div className="md:col-span-3">
          <p className="mb-5 text-[10px] uppercase tracking-[0.24em] text-white/35">Locations</p>
          <ul className="space-y-0">
            {LOCATIONS.map((l, i) => (
              <li key={i} className="flex items-start justify-between border-b border-white/[0.07] py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{l.type}</p>
                  <p className="mt-1 font-display text-lg font-bold uppercase tracking-tight text-ink">{l.city}</p>
                  <p className="font-mono text-[10px] text-dim">{l.code}</p>
                </div>
                <span className="mt-1 font-mono text-[10px] text-white/35">{l.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* digital tools */}
      <div className="border-t border-white/[0.07] py-20" id="tools">
        <p className="mb-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-orange">
          <span className="h-px w-10 bg-orange" /> Digital Tools
        </p>
        <h2 className="mb-12 font-display text-[clamp(2rem,5vw,4rem)] font-extrabold uppercase tracking-tight text-ink">
          Track & estimate in seconds
        </h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <TrackingTool />
          <EstimatorTool />
        </div>
      </div>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string | string[] }) {
  return (
    <FadeUp className="border-b border-white/[0.07] pb-5">
      <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">{label}</p>
      {Array.isArray(value) ? (
        <div className="mt-2 flex flex-wrap gap-3">
          {value.map((v) => (
            <a key={v} href="#contact" className="text-sm text-ink underline-offset-4 transition-colors hover:text-orange hover:underline">
              {v}
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink">{value}</p>
      )}
    </FadeUp>
  )
}

function AppointmentForm() {
  const [reason, setReason] = useState('Air Freight')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <FadeUp className="rounded-2xl border border-white/[0.07] bg-panel p-8 md:p-10">
      <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">Book an appointment</h3>
      <p className="mt-2 text-xs leading-relaxed text-dim">
        Use the form below — our team responds within one business day.
      </p>

      {sent ? (
        <div className="mt-8 rounded-xl border border-orange/40 bg-orange/10 p-8 text-center">
          <p className="font-display text-lg font-bold text-ink">Request received</p>
          <p className="mt-2 text-xs text-dim">
            Thank you, {name || 'friend'}. We will reply to {email || 'your inbox'} within one business day.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <fieldset>
            <legend className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/40">Reason of enquiry</legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {REASONS.map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-2 text-xs text-dim transition-colors hover:text-ink">
                  <input
                    type="radio"
                    name="reason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-orange"
                  />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={name} onChange={setName} placeholder="Jane Doe" />
            <Field label="Company" value={company} onChange={setCompany} placeholder="Acme Industries" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="jane@company.com" />
            <Field label="Phone" value={phone} onChange={setPhone} placeholder="+977 9 0000 0000" />
          </div>
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-white/40">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Tell us about your cargo, timeline and any special requirements…"
              className="w-full resize-none rounded-lg border border-white/10 bg-void px-4 py-3 text-sm text-ink placeholder-white/25 outline-none transition-colors focus:border-orange"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-orange py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-void transition-all hover:shadow-[0_0_30px_rgba(255,74,0,0.45)]"
          >
            Submit enquiry
          </button>
          <p className="text-center text-[10px] text-white/30">Reason: {reason}</p>
        </form>
      )}
    </FadeUp>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-white/40">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-void px-4 py-3 text-sm text-ink placeholder-white/25 outline-none transition-colors focus:border-orange"
      />
    </div>
  )
}

/* ---- Digital tools (migrated + restyled) ---- */

const TRACKING_STEPS = [
  { label: 'Shipment created', eta: 'Day 0' },
  { label: 'Picked up from origin', eta: 'Day 1' },
  { label: 'In transit', eta: 'Day 2–6' },
  { label: 'Arrived at destination', eta: 'Day 7' },
  { label: 'Customs cleared', eta: 'Day 8' },
  { label: 'Delivered', eta: 'Day 9–10' },
]

const SAMPLE_IDS = ['UC-2026-000128', 'UC-2026-000454', 'UC-2026-000796']

function TrackingTool() {
  const [id, setId] = useState('')
  const [tracking, setTracking] = useState<null | { id: string; stage: number }>(null)
  const [error, setError] = useState(false)

  const onTrack = (e: React.FormEvent) => {
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
    <div className="rounded-2xl border border-white/[0.07] bg-panel p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange/10 text-orange">
          <SearchIcon />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-tight text-ink">Live tracking portal</h3>
          <p className="text-[11px] text-dim">Try a sample consignment below</p>
        </div>
      </div>
      <form onSubmit={onTrack} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter consignment number"
          className="flex-1 rounded-lg border border-white/10 bg-void px-4 py-3 font-mono text-sm text-ink placeholder-white/25 outline-none transition-colors focus:border-orange"
        />
        <button type="submit" className="rounded-full bg-orange px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-void">
          Track
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {SAMPLE_IDS.map((s) => (
          <button
            key={s}
            onClick={() => setId(s)}
            className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] text-dim transition-all hover:border-orange hover:text-orange"
          >
            {s}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-4 rounded-lg border border-orange/30 bg-orange/5 px-4 py-2 text-[11px] text-orange">
          Consignment not found. Try one of the sample numbers above.
        </p>
      )}
      {tracking && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] text-orange">{tracking.id}</p>
            <span className="rounded-full bg-orange/10 px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-orange">
              In transit
            </span>
          </div>
          <ol className="mt-6">
            {TRACKING_STEPS.map((step, i) => {
              const done = i <= tracking.stage
              const current = i === tracking.stage
              return (
                <li key={step.label} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < TRACKING_STEPS.length - 1 && (
                    <span className={`absolute left-[7px] top-6 h-full w-px ${done ? 'bg-orange/40' : 'bg-white/10'}`} />
                  )}
                  <span
                    className={`relative z-10 h-3.5 w-3.5 shrink-0 rounded-full border ${
                      current ? 'border-orange bg-orange' : done ? 'border-orange/60 bg-orange/30' : 'border-white/20'
                    }`}
                  />
                  <div className="pt-0.5">
                    <p className={`text-xs ${current ? 'font-semibold text-ink' : done ? 'text-ink/80' : 'text-dim'}`}>
                      {step.label}
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">{step.eta}</p>
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
  { id: 'air', label: 'AIR', base: 6.5, perKg: 0.02 },
  { id: 'ocean', label: 'OCEAN', base: 2.2, perKg: 0.004 },
  { id: 'road', label: 'ROAD', base: 1.4, perKg: 0.008 },
]

function EstimatorTool() {
  const [mode, setMode] = useState('air')
  const [weight, setWeight] = useState(100)
  const [origin, setOrigin] = useState('Kathmandu')
  const [dest, setDest] = useState('Los Angeles')

  const selected = MODES.find((m) => m.id === mode)!
  const estimate = Math.round(selected.base * weight + weight * selected.perKg * 1000)

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-panel p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet/10 text-violet">
          <CalcIcon />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-tight text-ink">Freight estimator</h3>
          <p className="text-[11px] text-dim">Ballpark pricing for planning purposes</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-lg border py-3 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all ${
              mode === m.id ? 'border-orange bg-orange/10 text-orange' : 'border-white/10 text-dim hover:text-ink'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Origin</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-void px-3 py-2.5 font-mono text-xs text-ink outline-none focus:border-orange"
          >
            {['Kathmandu', 'Delhi', 'Shanghai', 'Hong Kong'].map((c) => (
              <option key={c} className="bg-void">{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Destination</label>
          <select
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-void px-3 py-2.5 font-mono text-xs text-ink outline-none focus:border-orange"
          >
            {['Los Angeles', 'London', 'Hong Kong', 'Sydney'].map((c) => (
              <option key={c} className="bg-void">{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/40">Weight</label>
          <span className="font-mono text-sm text-ink">{weight} kg</span>
        </div>
        <input
          type="range"
          min={10}
          max={5000}
          step={10}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="mt-3 w-full accent-orange"
        />
      </div>

      <div className="mt-6 rounded-xl border border-orange/20 bg-void p-6 text-center">
        <p className="text-[9px] uppercase tracking-[0.25em] text-white/40">Estimated cost</p>
        <p className="mt-2 font-display text-4xl font-bold text-ink">USD {estimate.toLocaleString()}</p>
        <p className="mt-1 font-mono text-[11px] text-dim">
          {origin} → {dest} · {weight} kg
        </p>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function CalcIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" />
    </svg>
  )
}