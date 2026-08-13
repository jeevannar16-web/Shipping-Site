import { ArrowRight, Globe2 } from 'lucide-react'

export default function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[30rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-orange/8 blur-[160px]" />
        <div className="absolute right-[10%] top-[20%] h-48 w-48 rounded-full bg-cyber-blue/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center" data-reveal>
        <Globe2 size={28} className="mx-auto mb-6 text-cyber-blue" />
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/45">Ready to move smarter?</p>
        <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-7xl">
          One operator.
          <br />
          <span className="text-glow-orange text-neon-orange">Every leg of the journey.</span>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-white/55 md:text-lg">
          We are here to help you grow without hassle. No call centres. No runaround. Just
          experienced people ready to help.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#contact"
            className="group inline-flex items-center gap-3 rounded-full bg-neon-orange px-8 py-4 text-sm font-semibold text-void transition-all hover:shadow-[0_0_40px_rgba(255,85,0,0.4)]"
          >
            Work With Us
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  )
}