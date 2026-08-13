import { useEffect, useRef, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import LenisProvider from './lib/lenis'
import Preloader from './components/chrome/Preloader'
import NewsTicker from './components/chrome/NewsTicker'
import Header from './components/chrome/Header'
import Footer from './components/chrome/Footer'
import CursorManager from './components/CursorManager'
import PageTransition from './components/chrome/PageTransition'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Industries from './pages/Industries'
import Insights from './pages/Insights'
import Contact from './pages/Contact'

/** I1 — 2px orange scroll-progress bar pinned to the top. */
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      const p = h > 0 ? window.scrollY / h : 0
      el.style.transform = `scaleX(${p})`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div
      ref={ref}
      className="fixed left-0 top-0 z-[130] h-[2px] w-full origin-left bg-[#ff4a00]"
      style={{ transform: 'scaleX(0)' }}
      aria-hidden
    />
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PageShell() {
  const { pathname } = useLocation()
  return (
    <div key={pathname}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}

export default function App() {
  const [preloading, setPreloading] = useState(true)

  return (
    <LenisProvider>
      <div className="relative min-h-screen bg-void text-ink">
        <div className="noise-overlay" />
        <div className="vignette-overlay" />
        {preloading ? (
          <Preloader onDone={() => setPreloading(false)} />
        ) : (
          <>
            <ScrollProgress />
            <ScrollToTop />
            <NewsTicker />
            <Header />
            <main>
              <PageShell />
            </main>
            <Footer />
          </>
        )}
        <PageTransition />
        <CursorManager />
      </div>
    </LenisProvider>
  )
}