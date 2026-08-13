import { useEffect, useState } from 'react'
import { Menu, X, ArrowUpRight, Mail, Phone } from 'lucide-react'
import { NAV_LINKS, CONTACT } from '../data'

const CLOCKS = [
  { city: 'Melbourne', tz: 'Australia/Melbourne' },
  { city: 'Hong Kong', tz: 'Asia/Hong_Kong' },
  { city: 'London', tz: 'Europe/London' },
  { city: 'Los Angeles', tz: 'America/Los_Angeles' },
]

function useClock(tz: string) {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
  )
  useEffect(() => {
    const id = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString('en-GB', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      )
    }, 1000)
    return () => clearInterval(id)
  }, [tz])
  return time
}

function UTCLine() {
  return (
    <div className="hidden flex-wrap items-center gap-5 md:flex">
      {CLOCKS.map((c) => (
        <ClockItem key={c.city} city={c.city} tz={c.tz} />
      ))}
    </div>
  )
}

function ClockItem({ city, tz }: { city: string; tz: string }) {
  const time = useClock(tz)
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyber-blue" />
      <span className="text-xs text-white/40">{city}</span>
      <span className="font-mono text-xs tabular-nums text-white/70">{time}</span>
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'border-b border-white/5 bg-void/80 backdrop-blur-xl' : ''
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-3" aria-label="United Carriers home">
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
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-sm text-white/70 transition-colors hover:text-white"
              >
                <span className="mr-1 text-[10px] text-neon-orange">{link.num}</span>
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-neon-orange transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-white transition-all hover:border-neon-orange hover:bg-neon-orange hover:text-void sm:flex"
            >
              Work With Us
            </a>
            <button
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-all hover:border-cyber-blue hover:text-cyber-blue"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[80] flex flex-col bg-void transition-all duration-700 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-neon-orange/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 rounded-full bg-cyber-blue/10 blur-[120px]" />

        <div className="flex items-center justify-between px-6 py-4">
          <span className="font-display text-lg font-bold">
            United<span className="text-neon-orange">Carriers</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-all hover:border-neon-orange hover:text-neon-orange"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-1 px-6 md:px-16" aria-label="Menu">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="group flex items-center gap-4 overflow-hidden py-2 md:gap-8"
              tabIndex={open ? 0 : -1}
            >
              <span className="text-sm text-neon-orange md:text-base">{link.num}</span>
              <span
                className="font-display text-4xl font-bold tracking-tight text-white/90 transition-all duration-500 group-hover:translate-x-2 group-hover:text-cyber-blue md:text-6xl lg:text-7xl"
                style={{ transitionDelay: `${open ? i * 60 : 0}ms`, transform: open ? 'none' : 'translateY(110%)' }}
              >
                {link.label}
              </span>
              <ArrowUpRight className="h-6 w-6 text-white/0 transition-all duration-500 group-hover:text-cyber-blue md:h-10 md:w-10" />
            </a>
          ))}
        </nav>

        <div className="border-t border-white/5 px-6 py-6 md:px-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <UTCLine />
            <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/35 md:flex-row md:items-center md:gap-8">
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 transition-colors hover:text-cyber-blue">
                <Mail size={13} className="text-cyber-blue" /> {CONTACT.email}
              </a>
              <a href={CONTACT.phoneHref} className="flex items-center gap-2 transition-colors hover:text-neon-orange">
                <Phone size={13} className="text-neon-orange" /> {CONTACT.phone}
              </a>
              <span>© {new Date().getFullYear()} United Carriers</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}