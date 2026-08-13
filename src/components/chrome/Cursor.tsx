import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.documentElement.classList.add('cursor-none-fine')
    const ring = ringRef.current
    const dot = dotRef.current
    if (!ring || !dot) return

    gsap.set(ring, { xPercent: -50, yPercent: -50, scale: 1 })
    gsap.set(dot, { xPercent: -50, yPercent: -50, scale: 1 })

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { x: pos.x, y: pos.y }
    let raf = 0

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      gsap.to(dot, { x: pos.x, y: pos.y, duration: 0.06 })
    }

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16
      ringPos.y += (pos.y - ringPos.y) * 0.16
      gsap.set(ring, { x: ringPos.x, y: ringPos.y })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const grow = () => gsap.to(ring, { scale: 2.2, duration: 0.4, ease: 'power3.out' })
    const shrink = () => gsap.to(ring, { scale: 1, duration: 0.4, ease: 'power3.out' })

    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, [data-hover]')) grow()
    }
    const onOut = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('a, button, [data-hover]')) shrink()
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.documentElement.classList.remove('cursor-none-fine')
    }
  }, [])

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[120] h-8 w-8 rounded-full border border-orange/80"
        style={{ opacity: 0.85 }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[121] h-1.5 w-1.5 rounded-full bg-orange"
      />
    </>
  )
}