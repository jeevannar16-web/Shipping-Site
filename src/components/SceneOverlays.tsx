import { useMemo, useState } from 'react'
import { useSceneProgressValue } from './3d/SceneShell'
import { Boxes, Navigation, Radio, ShieldCheck, Thermometer, Truck, Wallet } from 'lucide-react'

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-carbon/60 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  )
}

function TelemetryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-1.5 last:border-0">
      <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
      <span className="font-mono text-xs text-white/80">{value}</span>
    </div>
  )
}

export function TruckTelemetry() {
  const p = useSceneProgressValue()
  const speed = Math.round(62 + p * 18)
  const progressPct = Math.round(p * 100)

  const eta = useMemo(() => {
    const mins = Math.round((1 - p) * 14)
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m.toString().padStart(2, '0')}m`
  }, [p])

  return (
    <div className="pointer-events-none absolute bottom-24 right-6 z-10 hidden w-64 md:right-16 md:block">
      <GlassCard className="overflow-hidden p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15">
            <Navigation size={14} className="text-gold" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">KTM → Route Alpha</p>
            <p className="flex items-center gap-1 text-[10px] text-teal">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-teal" /> Live GPS telemetry
            </p>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span>Route progress</span>
            <span className="font-mono text-gold">{progressPct}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-gold to-teal transition-[width] duration-150" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <TelemetryRow label="Speed" value={`${speed} km/h`} />
        <TelemetryRow label="ETA" value={eta} />
        <TelemetryRow label="Signal" value="GPS · 4G" />
        <TelemetryRow label="Driver" value="N. Sharma" />
      </GlassCard>
    </div>
  )
}

const RATES = [
  {
    id: 'fcl',
    label: 'FCL · Full Container Load',
    icon: Boxes,
    desc: 'Dedicated 20ft / 40ft dry containers for high-volume, single-destination cargo.',
    price: 'rate/container',
    items: [
      ['20ft Dry', 'From USD 1,150'],
      ['40ft High-Cube', 'From USD 1,950'],
      ['Reefer 40ft', 'From USD 2,850'],
    ],
  },
  {
    id: 'lcl',
    label: 'LCL · Less than Container Load',
    icon: Wallet,
    desc: 'Shared space for smaller shipments — pay only for the volume you use.',
    price: 'rate/m³',
    items: [
      ['0.5 – 1 m³', 'From USD 95'],
      ['1 – 3 m³', 'From USD 145'],
      ['3 – 10 m³', 'From USD 210'],
    ],
  },
]

export function ShipRates() {
  const [active, setActive] = useState<'fcl' | 'lcl'>('fcl')
  const rate = RATES.find((r) => r.id === active)!
  const Icon = rate.icon

  return (
    <div className="absolute bottom-24 right-6 z-10 hidden w-72 md:right-16 md:block">
      <GlassCard className="overflow-hidden p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal/15">
            <Icon size={14} className="text-teal" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Freight Rates</p>
            <p className="text-[10px] text-white/40">Indicative · major trade lanes</p>
          </div>
        </div>
        <div className="mb-3 flex gap-2">
          {RATES.map((r) => {
            const ItemIcon = r.icon
            const isActive = r.id === active
            return (
              <button
                key={r.id}
                onClick={() => setActive(r.id as 'fcl' | 'lcl')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-medium transition-all ${
                  isActive
                    ? 'border-gold/50 bg-gold/10 text-gold'
                    : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white'
                }`}
              >
                <ItemIcon size={12} />
                {r.id.toUpperCase()}
              </button>
            )
          })}
        </div>
        <p className="mb-2 text-[11px] leading-snug text-white/50">{rate.desc}</p>
        <div className="space-y-1">
          {rate.items.map(([name, price]) => (
            <div key={name} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
              <span className="text-xs text-white/70">{name}</span>
              <span className="font-mono text-xs text-teal">{price}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

const STOCK = [
  { sku: 'TX-8841', name: 'Industrial bearings', qty: 120, max: 200, status: 'In Stock' },
  { sku: 'GR-2207', name: 'Steel fasteners', qty: 46, max: 150, status: 'Low Stock' },
  { sku: 'EL-9910', name: 'Control modules', qty: 12, max: 60, status: 'Low Stock' },
  { sku: 'PK-5542', name: 'Packing materials', qty: 180, max: 220, status: 'In Stock' },
]

export function WarehouseInventory() {
  const p = useSceneProgressValue()
  const fillPct = (qty: number, max: number) => Math.min(100, Math.round((qty / max) * 100))
  const picking = Math.round(84 + p * 36)

  return (
    <div className="pointer-events-none absolute bottom-24 right-6 z-10 hidden w-72 md:right-16 md:block">
      <GlassCard className="overflow-hidden p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal/15">
            <Boxes size={14} className="text-teal" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Warehouse Inventory</p>
            <p className="text-[10px] text-white/40">Live stock status</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {STOCK.map((s) => {
            const pct = fillPct(s.qty, s.max)
            const low = s.status === 'Low Stock'
            return (
              <div key={s.sku}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-white/60">{s.sku}</span>
                  <span className={`flex items-center gap-1 ${low ? 'text-gold' : 'text-teal'}`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${low ? 'bg-gold' : 'bg-teal'} animate-pulse`} />
                    {s.status}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${low ? 'bg-gold' : 'bg-teal'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40">
            <Radio size={11} className="text-gold" /> Picks / hour
          </span>
          <span className="font-mono text-sm text-white/80">{picking}</span>
        </div>
      </GlassCard>
    </div>
  )
}

export function ShipSafetyBadges() {
  return (
    <div className="pointer-events-none absolute bottom-24 left-6 z-10 hidden gap-3 md:left-16 lg:flex">
      {[
        { icon: ShieldCheck, label: 'Insured cargo' },
        { icon: Thermometer, label: 'Temp logged' },
        { icon: Truck, label: 'Door-to-door' },
      ].map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-carbon/60 px-3.5 py-2 backdrop-blur-xl"
        >
          <Icon size={13} className="text-gold" />
          <span className="text-[11px] text-white/70">{label}</span>
        </div>
      ))}
    </div>
  )
}