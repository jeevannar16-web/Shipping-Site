import { useEffect, type MutableRefObject, type RefObject } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsap } from './motion'

/** A stable mutable progress value — scenes read `.current` (0..1) inside useFrame. */
export type ScrubRef = MutableRefObject<number>

/**
 * S1 — drive a ref from a sticky section's scroll progress. The trigger is the
 * tall (220vh) wrapper; progress goes 0 → 1 as it scrolls through the viewport.
 */
export function useStickyScrub(
  wrapperRef: RefObject<HTMLElement | null>,
  progressRef: ScrubRef,
) {
  useEffect(() => {
    registerGsap()
    const el = wrapperRef.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress
      },
    })
    return () => st.kill()
  }, [progressRef, wrapperRef])
}

/** Clamp helper reused by the frame loops. */
export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}