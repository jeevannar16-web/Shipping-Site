import { useEffect, useRef } from 'react'
import gsap from 'gsap'

let activeOverlay: HTMLDivElement | null = null

export function registerIris(el: HTMLDivElement | null) {
  activeOverlay = el
}

/**
 * Fires a cinematic iris-wipe (circular zoom) transition across the screen.
 * Runs `done` at the peak of the wipe, before closing back out.
 */
export function fireIris(done: () => void) {
  if (!activeOverlay) {
    done()
    return
  }
  const el = activeOverlay
  const tl = gsap.timeline({
    onStart: () => {
      el.style.pointerEvents = 'auto'
    },
    onComplete: () => {
      el.style.pointerEvents = 'none'
    },
  })
  tl.set(el, { display: 'block' })
    .fromTo(el, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(100% at 50% 50%)', duration: 0.55, ease: 'power2.inOut' })
    .add(() => done())
    .to(el, { clipPath: 'circle(0% at 50% 50%)', duration: 0.6, ease: 'power2.inOut' })
    .set(el, { display: 'none' })
  return tl
}

export default function IrisWipe() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.clipPath = 'circle(0% at 50% 50%)'
    registerIris(el)
    return () => registerIris(null)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[110] hidden"
      style={{
        clipPath: 'circle(0% at 50% 50%)',
        background:
          'radial-gradient(circle at 50% 50%, #141d31 0%, #0c1322 45%, #060a13 100%)',
      }}
    />
  )
}