import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Features from './components/Features'
import WhyUs from './components/WhyUs'
import GlobalNetwork from './components/GlobalNetwork'
import Testimonials from './components/Testimonials'
import Partners from './components/Partners'
import Insights from './components/Insights'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Contact, { Footer } from './components/Contact'
import Cursor from './components/Cursor'
import LogisticsScene from './components/LogisticsScene'
import { TrackingSimulator, QuoteSimulator } from './components/Estimators'
import { useReducedMotion } from './hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

function useRevealAnimations(reduced: boolean) {
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((el) => {
        const children = Array.from(el.children) as HTMLElement[]
        gsap.fromTo(
          children,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          },
        )
      })

      const hero = document.querySelector('[data-anim="lines"]') as HTMLElement | null
      if (hero) {
        const lines = Array.from(hero.children) as HTMLElement[]
        gsap.fromTo(
          lines,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.15,
            ease: 'power4.out',
            delay: 0.15,
          },
        )
      }

      gsap.utils.toArray<HTMLElement>('[data-anim="fade-up"]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: 0.4 + i * 0.12,
            ease: 'power3.out',
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-anim="hub-panel"]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' },
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const speed = Number(el.dataset.parallax ?? '0.3')
        gsap.to(el, {
          yPercent: -speed * 20,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    })
    return () => ctx.revert()
  }, [reduced])
}

export default function App() {
  const hubRef = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const lenis = new Lenis({
      lerp: reduced ? 1 : 0.1,
      wheelMultiplier: 1,
    })
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const onAnchor = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]')
      if (!target) return
      const href = target.getAttribute('href')!
      if (href === '#') return
      const el = document.querySelector(href)
      if (el) {
        e.preventDefault()
        lenis.scrollTo(el as HTMLElement, { offset: -60 })
      }
    }
    document.addEventListener('click', onAnchor)

    return () => {
      document.removeEventListener('click', onAnchor)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [reduced])

  useRevealAnimations(reduced)

  return (
    <main className="relative min-h-screen bg-void text-white">
      <div className="noise-overlay" />
      <Cursor />
      <Navbar />
      <Hero hubRef={(el) => (hubRef.current = el)} />

      <div className="relative">
        <div className="pointer-events-none absolute right-0 top-16 z-20 hidden h-72 w-72 xl:block" data-parallax="0.4">
          <LogisticsScene type="plane" className="h-full w-full opacity-90" />
        </div>
        <About />
      </div>

      <Services />

      <div className="relative">
        <LogisticsScene type="ship" className="pointer-events-none mx-auto -mb-24 h-64 w-full max-w-2xl opacity-80" />
        <Features />
      </div>

      <WhyUs />
      <GlobalNetwork />
      <Testimonials />
      <Partners />

      <section id="tools" className="mx-auto max-w-7xl px-6 py-24" data-reveal>
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-teal">Digital tools</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            Track and estimate, <span className="text-white/40">in seconds.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TrackingSimulator />
          <QuoteSimulator />
        </div>
      </section>

      <Insights />
      <FAQ />
      <CTA />
      <Contact />
      <Footer />
    </main>
  )
}