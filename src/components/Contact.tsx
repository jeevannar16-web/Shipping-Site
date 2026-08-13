import { useState } from 'react'
import { Send, MapPin, Mail, Clock, Phone, ArrowUpRight } from 'lucide-react'
import { CONTACT, SERVICES } from '../data'

const REASONS = SERVICES.map((s) => s.title)

export default function Contact() {
  const [reason, setReason] = useState(REASONS[0])
  const [sent, setSent] = useState(false)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contact" className="relative overflow-hidden border-t border-white/5 py-28 md:py-36">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[60rem] -translate-x-1/2 bg-neon-orange/6 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-[40rem] bg-cyber-blue/6 blur-[140px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16" data-reveal>
          <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neon-orange">
            <span className="h-px w-10 bg-neon-orange" />
            Contact
          </p>
          <h2 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-7xl">
            Talk <span className="text-glow-orange text-neon-orange">with us.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-2" data-reveal>
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
            <h3 className="font-display text-xl font-semibold text-white">Talk to a specialist</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              One point of contact, end to end. Our team owns the outcome from origin to
              destination.
            </p>

            <div className="mt-10 space-y-4">
              <a href={`mailto:${CONTACT.email}`} className="group flex items-center gap-4 rounded-xl border border-white/10 bg-carbon p-5 transition-all hover:border-cyber-blue/40">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyber-blue/10 text-cyber-blue">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Email</p>
                  <p className="truncate text-sm font-medium text-white group-hover:text-cyber-blue">{CONTACT.email}</p>
                </div>
              </a>
              <a href={CONTACT.phoneHref} className="group flex items-center gap-4 rounded-xl border border-white/10 bg-carbon p-5 transition-all hover:border-neon-orange/40">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neon-orange/10 text-neon-orange">
                  <Phone size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Hotline</p>
                  <p className="text-sm font-medium text-white group-hover:text-neon-orange">{CONTACT.phone}</p>
                </div>
              </a>
              <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-carbon p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/70">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Head Office</p>
                  <p className="text-sm font-medium text-white">{CONTACT.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-carbon p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/70">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Office Hours</p>
                  <p className="text-sm font-medium text-white">{CONTACT.hours}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-6">
              <p className="text-[10px] uppercase tracking-wider text-white/40">Operating across</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CONTACT.countries.map((c) => (
                  <span key={c} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/5 bg-carbon/40">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
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
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/50">
              Freight forwarding, land transport, and customs brokerage, unified across APAC
              under one accountable team.
            </p>
            <p className="mt-4 text-sm font-medium text-white/70">
              One operator. <span className="text-neon-orange">Every leg of the journey.</span>
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Company</p>
            <ul className="mt-5 space-y-3">
              {[
                { label: 'About', href: '#about' },
                { label: 'Services', href: '#services' },
                { label: 'Why Us', href: '#why-us' },
                { label: 'Insights', href: '#insights' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Contact', href: '#contact' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="group flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white">
                    {link.label}
                    <ArrowUpRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Services</p>
            <ul className="mt-5 space-y-3">
              {SERVICES.map((s) => (
                <li key={s.title}>
                  <a href="#services" className="text-sm text-white/50 transition-colors hover:text-white">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/30 md:flex-row">
          <p>© {year} United Carriers APAC Pty Ltd. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <a href="#" className="transition-colors hover:text-white/60">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-white/60">Terms & Conditions</a>
            <a href="#" className="transition-colors hover:text-white/60">QHSE</a>
          </div>
        </div>
      </div>
    </footer>
  )
}