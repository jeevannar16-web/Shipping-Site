import { useEffect, useRef, useState } from 'react'

export default function CursorManager() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    let x = innerWidth / 2
    let y = innerHeight / 2
    let rx = x
    let ry = y
    let raf = 0

    const mv = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      const t = (e.target as HTMLElement).closest('[data-cursor]')
      setLabel(t ? (t as HTMLElement).dataset.cursor! : '')
    }

    const lp = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      dot.current!.style.transform = `translate(${x}px,${y}px)`
      ring.current!.style.transform = `translate(${rx}px,${ry}px)`
      raf = requestAnimationFrame(lp)
    }

    addEventListener('mousemove', mv)
    raf = requestAnimationFrame(lp)
    return () => {
      removeEventListener('mousemove', mv)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring">{label ? <span>{label}</span> : null}</div>
    </>
  )
}