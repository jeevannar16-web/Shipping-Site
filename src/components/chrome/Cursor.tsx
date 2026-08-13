import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const labelRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.documentElement.classList.add('cursor-none-fine')
    const ring = ringRef.current
    const dot = dotRef.current
    const label = labelRef.current
    if (!ring || !dot || !label) return

    gsap.set(ring, { xPercent: -50, yPercent: -50, scale: 1 })
    gsap.set(dot, { xPercent: -50, yPercent: -50, scale: 1 })
    gsap.set(label, { opacity: 0 })

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

    const show = (text: string | null) => {
      if (text) {
        label.textContent = text
        gsap.to(label, { opacity: 1, scale: 1, duration: 0.25 })
        gsap.to(ring, { scale: 3, backgroundColor: 'rgba(255,74,0,0.08)', borderColor: '#ff4a00', duration: 0.4, ease: 'power3.out' })
      } else {
        gsap.to(label, { opacity: 0, scale: 0.6, duration: 0.2 })
        gsap.to(ring, { scale: 1, backgroundColor: 'rgba(255,255,255,0)', borderColor: 'rgba(255,74,0,0.8)', duration: 0.4, ease: 'power3.out' })
      }
    }

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('[data-cursor="drag"]')) show('DRAG')
      else if (t.closest('a')) show('VIEW')
      else if (t.closest('button')) show('OPEN')
      else if (t.closest('[data-hover]')) show(null)
    }
    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('a, button, [data-hover], [data-cursor="drag"]')) show(null)
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
        className="pointer-events-none fixed left-0 top-0 z-[120] flex h-8 w-8 items-center justify-center rounded-full border border-orange/80"
        style={{ opacity: 0.85 }}
      >
        <span ref={labelRef} className="font-mono text-[7px] uppercase leading-none tracking-[0.14em] text-orange">
          VIEW
        </span>
      </div>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[121] h-1.5 w-1.5 rounded-full bg-orange"
      />
    </>
  )
}