import { useEffect, useRef } from 'react'

export function useCountUp(
  target: number,
  options?: { duration?: number; decimals?: number },
) {
  const { duration = 2, decimals = 0 } = options ?? {}
  const nodeRef = useRef<HTMLSpanElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const run = () => {
      if (startedRef.current) return
      startedRef.current = true
      const startTime = performance.now()
      const raf = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / (duration * 1000), 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = target * eased
        node.textContent = current.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
        if (progress < 1) requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          run()
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [target, duration, decimals])

  return nodeRef
}
