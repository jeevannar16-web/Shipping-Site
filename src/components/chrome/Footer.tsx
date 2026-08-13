import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { useTransitionNavigate } from '../../lib/navigation'
import { PAGE_LINKS } from '../../lib/nav'
import { CONTACT, SERVICES } from '../../data'
import { registerGsap } from '../../lib/motion'

export default function Footer() {
  const go = useTransitionNavigate()
  const marqueeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    registerGsap()
    const el = marqueeRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.5,
        scrollTrigger: { trigger: el, start: 'top 95%' },
      },
    )
  }, [])

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-panel">
      <div className="px-6 pb-10 pt-16 md:px-10">
        <div className="text-stroke pointer-events-none select-none whitespace-nowrap text-[12vw] font-display font-extrabold uppercase leading-none tracking-tight">
          Jeevan ✦ Logistics
        </div>
      </div>

      <div className="grid gap-10 border-t border-white/[0.07] px-6 py-12 md:grid-cols-4 md:px-10">
        <div className="md:col-span-2">
          <p className="mb-4 font-display text-2xl font-bold uppercase tracking-tight text-ink">Jeevan ✦ Logistics</p>
          <p className="max-w-sm text-xs leading-relaxed text-dim">
            Freight forwarding, customs brokerage, and transport — unified under one accountable team, operating from our
            Kathmandu HQ around the clock.
          </p>
          <a
            href={`mailto:${CONTACT.email}`}
            className="mt-5 inline-block rounded-full border border-[#333] px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-ink transition-all hover:bg-ink hover:text-void"
          >
            Connect — {CONTACT.email}
          </a>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/35">Sitemap</p>
          <ul className="space-y-2">
            {PAGE_LINKS.map((link) => (
              <li key={link.to}>
                <button
                  onClick={() => go(link.to)}
                  className="text-xs uppercase tracking-[0.12em] text-dim transition-colors hover:text-orange"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/35">Services</p>
          <ul className="space-y-2">
            {SERVICES.map((s) => (
              <li key={s.title} className="text-xs uppercase tracking-[0.08em] text-dim">
                {s.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Services marquee */}
      <div ref={marqueeRef} className="border-t border-white/[0.07] py-5">
        <div className="overflow-hidden">
          <div className="marquee-track flex w-max whitespace-nowrap">
            {[...SERVICES, ...SERVICES].map((s, i) => (
              <span key={i} className="mx-8 inline-flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-white/40">
                {s.title}
                <span className="text-orange">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/[0.07] px-6 py-5 text-[10px] uppercase tracking-[0.16em] text-white/30 md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} Jeevan Global Logistics</span>
        <span>Kathmandu, Nepal</span>
      </div>
    </footer>
  )
}