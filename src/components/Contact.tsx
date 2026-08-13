import { useState } from 'react'
import { Send, MapPin, Mail, Clock } from 'lucide-react'

const REASONS = [
  'Air Freight',
  'Sea Freight',
  'Customs Brokerage',
  'Warehousing & 3PL',
  'Project Cargo',
  'Road Freight',
  'General Inquiry',
]

const OFFICES = [
  { city: 'Melbourne', country: 'Australia', address: 'Level 12, 480 Collins St', phone: '+61 3 9000 1000' },
  { city: 'Hong Kong', country: 'Hong Kong SAR', address: 'Unit 1808, One Harbourfront', phone: '+852 3900 1000' },
  { city: 'London', country: 'United Kingdom', address: '6th Floor, 30 Fenchurch St', phone: '+44 20 3900 1000' },
  { city: 'Los Angeles', country: 'United States', address: '8800 Aviation Blvd, CA', phone: '+1 310 900 1000' },
]

export default function Contact() {
  const [reason, setReason] = useState(REASONS[0])
  const [sent, setSent] = useState(false)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contact" className="relative overflow-hidden py-28 md:py-36">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[60rem] -translate-x-1/2 bg-neon-orange/6 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-[40rem] bg-cyber-blue/6 blur-[140px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neon-orange">
            <span className="h-px w-10 bg-neon-orange" />
            Contact
          </p>
          <h2 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-glow-orange md:text-7xl">
            Let's move together.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-2">
          <div className="bg-carbon p-8 md:p-12">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyber-blue/15 text-cyber-blue">
                  <Send size={26} />
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold text-white">Inquiry received</h3>
                <p className="mt-3 max-w-xs text-sm text-white/50">
                  A freight specialist will reach out within one business day to scope your
                  shipment.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <h3 className="font-display text-xl font-semibold text-white">Request a quote</h3>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-white/40">Full name</label>
                    <input
                      required
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-white/10 bg-void px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-neon-orange"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-white/40">Company</label>
                    <input
                      type="text"
                      placeholder="Acme Industries"
                      className="w-full rounded-xl border border-white/10 bg-void px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-neon-orange"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-white/40">Work email</label>
                    <input
                      required
                      type="email"
                      placeholder="jane@company.com"
                      className="w-full rounded-xl border border-white/10 bg-void px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-neon-orange"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-white/40">Phone</label>
                    <input
                      type="tel"
                      placeholder="+61 400 000 000"
                      className="w-full rounded-xl border border-white/10 bg-void px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-neon-orange"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-wider text-white/40">Reason</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-void px-4 py-3 text-sm text-white outline-none transition-colors focus:border-neon-orange"
                    >
                      {REASONS.map((r) => (
                        <option key={r} value={r} className="bg-void">
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-wider text-white/40">Origin → Destination</label>
                    <input
                      type="text"
                      placeholder="e.g. Melbourne → Los Angeles"
                      className="w-full rounded-xl border border-white/10 bg-void px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-neon-orange"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-wider text-white/40">Message</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your cargo, timeline and any special requirements…"
                      className="w-full resize-none rounded-xl border border-white/10 bg-void px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-neon-orange"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-neon-orange py-4 text-sm font-semibold text-void transition-all hover:shadow-[0_0_40px_rgba(255,85,0,0.4)]"
                >
                  Send Inquiry
                  <Send size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                </button>
              </form>
            )}
          </div>

          <div className="bg-void p-8 md:p-12">
            <h3 className="font-display text-xl font-semibold text-white">Regional headquarters</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              Our control towers run 24/7 across four time zones — reach a specialist directly.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {OFFICES.map((office) => (
                <div key={office.city} className="rounded-xl border border-white/10 bg-carbon p-5 transition-colors hover:border-cyber-blue/40">
                  <p className="flex items-center gap-2 font-display text-sm font-semibold text-white">
                    <MapPin size={14} className="text-cyber-blue" />
                    {office.city}
                  </p>
                  <p className="mt-1 text-xs text-white/40">{office.country}</p>
                  <p className="mt-3 text-xs text-white/55">{office.address}</p>
                  <p className="mt-1 text-xs text-cyber-blue">{office.phone}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-3 border-t border-white/10 pt-8 text-sm">
              <p className="flex items-center gap-3 text-white/60">
                <Mail size={15} className="text-neon-orange" /> hello@unitedcarriers.com
              </p>
              <p className="flex items-center gap-3 text-white/60">
                <Clock size={15} className="text-neon-orange" /> Global support 24/7
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-28 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-neon-orange">
                <span className="font-display text-lg font-bold text-void">U</span>
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cyber-blue" />
              </div>
              <div className="leading-none">
                <span className="font-display text-lg font-bold tracking-tight">
                  United<span className="text-neon-orange">Carriers</span>
                </span>
                <span className="mt-0.5 block text-[9px] uppercase tracking-[0.28em] text-white/40">
                  Global Logistics
                </span>
              </div>
            </div>

            <nav className="flex flex-wrap gap-8">
              {['Global Network', 'Services', 'Insights', 'Contact'].map((l) => (
                <a key={l} href={`#${l.toLowerCase().replace(' ', '')}`} className="text-sm text-white/50 transition-colors hover:text-white">
                  {l}
                </a>
              ))}
            </nav>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/30 md:flex-row">
            <p>© {new Date().getFullYear()} United Carriers Pty Ltd. All rights reserved.</p>
            <div className="flex flex-wrap gap-6">
              <a href="#" className="transition-colors hover:text-white/60">Privacy</a>
              <a href="#" className="transition-colors hover:text-white/60">Terms</a>
              <a href="#" className="transition-colors hover:text-white/60">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}