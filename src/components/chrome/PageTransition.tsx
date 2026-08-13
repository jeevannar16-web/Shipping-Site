import { useRef } from 'react'
import gsap from 'gsap'
import { registerGsap } from '../../lib/motion'

/**
 * Fixed black overlay whose 3 concentric rings expand from center.
 * Fire via `transitionPage(onComplete)` — used on every route change (~700ms).
 */
export function fireTransition(onComplete?: () => void) {
  const el = document.getElementById('page-transition')
  if (!el) {
    onComplete?.()
    return
  }
  registerGsap()
  const rings = Array.from(el.querySelectorAll<HTMLElement>('[data-ring]'))
  const tl = gsap.timeline({
    onComplete: () => {
      onComplete?.()
    },
  })
  gsap.set(el, { pointerEvents: 'auto', autoAlpha: 1 })
  rings.forEach((ring, i) => {
    gsap.set(ring, { scale: 0, opacity: 1 })
    tl.to(
      ring,
      { scale: 6, duration: 0.7, ease: 'power4.inOut', delay: i * 0.06 },
      0,
    )
  })
  tl.set(el, { autoAlpha: 0, pointerEvents: 'none', delay: 0.15 })
}

export default function PageTransition() {
  const ref = useRef<HTMLDivElement | null>(null)
  return (
    <div
      ref={ref}
      id="page-transition"
      className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center"
      style={{ opacity: 0, visibility: 'hidden' }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          data-ring
          className="absolute rounded-full border"
          style={{
            width: i === 0 ? '120vmax' : i === 1 ? '90vmax' : '60vmax',
            height: i === 0 ? '120vmax' : i === 1 ? '90vmax' : '60vmax',
            borderColor: i === 0 ? '#ff4a00' : i === 1 ? '#2b4bff' : '#c77cff',
            opacity: 0,
            transform: 'scale(0)',
          }}
        />
      ))}
    </div>
  )
}
