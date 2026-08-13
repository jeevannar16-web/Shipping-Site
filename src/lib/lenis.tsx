import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsap } from './motion'

const LenisContext = createContext<Lenis | null>(null)
export function useLenis() {
  return useContext(LenisContext)
}

let lenisSingleton: Lenis | null = null
export function getLenis() {
  return lenisSingleton
}

export function scrollToSection(id: string) {
  const el = document.querySelector(id) as HTMLElement | null
  if (!el) return
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(el, { offset: 0 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  const [, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    registerGsap()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const instance = new Lenis({
      lerp: reduced ? 1 : 0.1,
      wheelMultiplier: 1,
    })
    setLenis(instance)
    lenisSingleton = instance
    instance.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const scrollTop = () => window.scrollTo(0, 0)
    window.addEventListener('popstate', scrollTop)

    return () => {
      window.removeEventListener('popstate', scrollTop)
      gsap.ticker.remove(raf)
      instance.destroy()
      lenisSingleton = null
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenisSingleton}>{children}</LenisContext.Provider>
}