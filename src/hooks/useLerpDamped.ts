import { useEffect, useRef } from 'react'

export function useLerpDamped(initial = 0, factor = 0.06) {
  const current = useRef(initial)
  const target = useRef(initial)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      current.current += (target.current - current.current) * factor
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [factor])

  return {
    get value() {
      return current.current
    },
    set value(v: number) {
      target.current = v
    },
  }
}
