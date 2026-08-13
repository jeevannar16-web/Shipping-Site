import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fireTransition } from '../components/chrome/PageTransition'
import { getLenis } from './lenis'

/** Navigate between routes with the radar-ring wipe transition. */
export function useTransitionNavigate() {
  const navigate = useNavigate()
  const location = useLocation()
  const current = location.pathname

  const go = useCallback(
    (to: string) => {
      if (to === current) {
        getLenis()?.scrollTo(0)
        return
      }
      fireTransition(() => navigate(to))
    },
    [current, navigate],
  )

  return go
}

/** Block the body scroll while the transition runs (~700ms). */
export function useLockBody(lock: boolean) {
  useEffect(() => {
    const lenis = getLenis()
    if (lock) {
      lenis?.stop()
      document.documentElement.style.overflow = 'hidden'
    } else {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
    return () => {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
  }, [lock])
}

export function useLockScrollForTransition() {
  const navigating = useRef(false)
  const lock = () => {
    navigating.current = true
    getLenis()?.stop()
  }
  const unlock = () => {
    navigating.current = false
    getLenis()?.start()
  }
  useEffect(() => {
    const onStart = () => {
      if (navigating.current) {
        getLenis()?.stop()
      }
    }
    const onEnd = () => {
      if (navigating.current) {
        getLenis()?.start()
      }
    }
    document.addEventListener('wheel', onStart, { passive: true })
    document.addEventListener('touchmove', onEnd, { passive: true })
    return () => {
      document.removeEventListener('wheel', onStart)
      document.removeEventListener('touchmove', onEnd)
    }
  }, [])
  return { lock, unlock }
}
