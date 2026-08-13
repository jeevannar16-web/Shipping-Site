import { createElement, useEffect, useRef, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

export function registerGsap() {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

/** Per-line mask reveal: wraps text in .line-mask spans animate yPercent 110 -> 0. */
export function LineMask({ children, as: Tag = 'h1', className = '', delay = 0, stagger = 0.09 }: {
  children: ReactNode
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
}) {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    registerGsap()
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const spans = Array.from(el.querySelectorAll<HTMLElement>('[data-line]'))
    if (reduced) {
      gsap.set(spans, { yPercent: 0 })
      return
    }
    const anim = gsap.fromTo(
      spans,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger,
        delay,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    )
    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
    }
  }, [delay, stagger])
  return createElement(
    Tag,
    { ref: ref as never, className },
    <span className="line-mask">
      <span data-line>{children}</span>
    </span>,
  )
}

/** Fade-up on scroll. */
export function FadeUp({ children, className = '', y = 40, delay = 0 }: {
  children: ReactNode
  className?: string
  y?: number
  delay?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    registerGsap()
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set(el, { opacity: 1, y: 0 })
      return
    }
    const anim = gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        delay,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      },
    )
    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
    }
  }, [y, delay])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/** Count up to target when scrolled into view. */
export function Counter({ value, suffix = '', className = '' }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  useEffect(() => {
    registerGsap()
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      el.textContent = `${value.toLocaleString()}${suffix}`
      return
    }
    const obj = { n: 0 }
    const anim = gsap.to(obj, {
      n: value,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          anim.play()
        },
      },
      paused: true,
      onUpdate: () => {
        el.textContent = `${Math.round(obj.n).toLocaleString()}${suffix}`
      },
    })
    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
    }
  }, [value, suffix])
  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  )
}

/** Scroll-velocity dominated image reveal (scale 1.15 -> 1). */
export function ImageReveal({ src, alt = '', className = '' }: { src: string; alt?: string; className?: string }) {
  const wrap = useRef<HTMLDivElement | null>(null)
  const img = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    registerGsap()
    const w = wrap.current
    const i = img.current
    if (!w || !i) return
    const tween = gsap.fromTo(
      i,
      { scale: 1.15 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])
  return (
    <div ref={wrap} className={`overflow-hidden ${className}`}>
      <img ref={img} src={src} alt={alt} loading="lazy" className="h-full w-full object-cover will-change-transform" />
    </div>
  )
}

/** Full-page scroll reveal helper — runs attributes-based animations once per route. */
export function usePageReveals() {
  useEffect(() => {
    registerGsap()
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          },
        )
      })
      gsap.utils.toArray<HTMLElement>('[data-reveal-line]').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          },
        )
      })
      gsap.utils.toArray<HTMLElement>('[data-reveal-parallax]').forEach((el) => {
        const speed = Number(el.dataset.revealParallax ?? '0.3')
        gsap.to(el, {
          yPercent: -speed * 20,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    })
    return () => ctx.revert()
  }, [])
}