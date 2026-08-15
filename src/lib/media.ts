import { useEffect, useState } from 'react'

/** Reactive CSS media-query match (used by the scene camera rigs + canvas gating). */
export function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const onChange = () => setMatches(m.matches)
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** Narrow viewport (tablet / small laptop) — scene rigs widen FOV and pull the camera back
    so the same world content keeps its full-width framing without re-composing every shot. */
export function useCompact() {
  return useMedia('(max-width: 1024px)')
}
