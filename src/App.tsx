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
import Testimonials from './components/Testimonials'
import Partners from './components/Partners'
import Insights from './components/Insights'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Contact, { Footer } from './components/Contact'

gsap.registerPlugin(ScrollTrigger)

function useRevealAnimations() {
  useEffect(() => {
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
    })
    return () => ctx.revert()
  }, [])
}

export default function App() {
  const hubRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
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
  }, [])

  useRevealAnimations()

  return (
    <main className="relative min-h-screen bg-void text-white">
      <div className="noise-overlay" />
      <Navbar />
      <Hero hubRef={(el) => (hubRef.current = el)} />
      <About />
      <Services />
      <Features />
      <WhyUs />
      <Testimonials />
      <Partners />
      <Insights />
      <FAQ />
      <CTA />
      <Contact />
      <Footer />
    </main>
  )
}