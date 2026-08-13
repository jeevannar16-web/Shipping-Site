import { useRef, type ReactNode, type MouseEvent } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function MagneticButton({
  children,
  className = '',
  strength = 0.35,
  ...props
}: {
  children: ReactNode
  className?: string
  strength?: number
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduced = useReducedMotion()

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }

  const onLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0px, 0px)'
  }

  return (
    <a
      ref={ref}
      {...props}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`magnetic inline-block transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
    </a>
  )
}
