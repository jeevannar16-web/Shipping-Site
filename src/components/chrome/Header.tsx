import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { useLocation } from 'react-router-dom'
import { useTransitionNavigate, useLockBody } from '../../lib/navigation'
import { PAGE_LINKS } from '../../lib/nav'
import { CONTACT, PRELOADER_COUNTRIES } from '../../data'
import { registerGsap } from '../../lib/motion'

function Wordmark({ onClick, large = false }: { onClick?: () => void; large?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-baseline gap-1 font-display font-bold uppercase tracking-tight ${
        large ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
      }`}
    >
      <span className="text-ink">Jeevan</span>
      <span className="text-orange">✦</span>
      <span className="text-ink">Logistics</span>
    </button>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const go = useTransitionNavigate()
  const location = useLocation()
  useLockBody(open)

  useEffect(() => {
    registerGsap()
    if (open) {
      const items = document.querySelectorAll('[data-menu-item]')
      gsap.fromTo(
        items,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out', delay: 0.15 },
      )
    }
  }, [open])

  const closeAndGo = (to: string) => {
    setOpen(false)
    go(to)
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.07] bg-void/85 px-4 py-3.5 backdrop-blur-md md:px-6">
        <div onClick={() => closeAndGo('/')}>
          <Wordmark />
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setOpen((v) => !v)}
            className="group flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:text-orange"
            aria-label="Toggle menu"
          >
            <span className="relative flex h-2.5 w-6 flex-col justify-between">
              <span className={`h-px w-full bg-current transition-transform ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
              <span className={`h-px w-full bg-current transition-transform ${open ? '-translate-y-[5px] -rotate-45' : ''}`} />
            </span>
            Menu
          </button>
          <button
            onClick={() => closeAndGo('/contact')}
            className="rounded-full border border-[#333] px-5 py-2 text-[11px] uppercase tracking-[0.14em] text-ink transition-all hover:bg-ink hover:text-void"
          >
            Work With Us
          </button>
        </div>
      </header>

      {/* MENU overlay */}
      <div
        className={`fixed inset-0 z-[70] flex flex-col bg-void transition-opacity duration-300 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div onClick={() => closeAndGo('/')}>
            <Wordmark />
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:text-orange"
          >
            Close ✕
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center overflow-hidden px-6 md:px-10">
          {PAGE_LINKS.map((link, i) => {
            const active = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to))
            return (
              <button
                key={link.to}
                data-menu-item
                onClick={() => closeAndGo(link.to)}
                className="group flex w-full items-center gap-5 border-b border-white/[0.06] py-3 text-left"
              >
                <span className="text-[11px] text-orange">0{i + 1}</span>
                <span
                  className={`font-display text-4xl font-bold uppercase tracking-tight transition-all group-hover:translate-x-3 md:text-6xl ${
                    active ? 'text-orange' : 'text-ink'
                  }`}
                >
                  {link.label}
                </span>
                <span className="ml-auto hidden text-[11px] text-white/30 transition-colors group-hover:text-orange md:block">
                  ⟶
                </span>
              </button>
            )
          })}
        </nav>

        <div className="grid gap-6 border-t border-white/[0.07] px-6 py-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/35">Connect with us</p>
            <a href={`mailto:${CONTACT.email}`} className="font-mono text-sm text-ink transition-colors hover:text-orange">
              {CONTACT.email}
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRELOADER_COUNTRIES.slice(0, 6).map((c) => (
              <span key={c} className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-white/40">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}