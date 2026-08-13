import SceneShell from './3d/SceneShell'
import { TruckContent, TruckPoster } from './3d/TruckScene'
import { ShipContent, ShipPoster } from './3d/ShipScene'
import { PlaneContent, PlanePoster } from './3d/PlaneScene'
import { ForkliftContent, ForkliftPoster } from './3d/ForkliftScene'
import { VaultContent, VaultPoster } from './3d/VaultScene'
import { TruckTelemetry, ShipRates, WarehouseInventory } from './SceneOverlays'

export function TruckSection() {
  return (
    <SceneShell
      id="land"
      kicker="Scene 02 · Land"
      title="Land & Linehaul Transport"
      description="Scheduled linehaul and metro fleets move your cargo across every major route — tracked and accountable at every kilometer."
      poster={<TruckPoster />}
      overlay={<TruckTelemetry />}
    >
      <TruckContent />
    </SceneShell>
  )
}

export function ShipSection() {
  return (
    <SceneShell
      id="ocean"
      kicker="Scene 03 · Ocean"
      title="Ocean Freight & Maritime"
      description="FCL, LCL and specialised cargo movements — driven by structured carrier selection and full vessel visibility."
      poster={<ShipPoster />}
      overlay={<ShipRates />}
    >
      <ShipContent />
    </SceneShell>
  )
}

export function PlaneSection() {
  return (
    <SceneShell
      id="air"
      kicker="Scene 04 · Air"
      title="Air Freight & Express"
      description="Express and priority air freight across global trade lanes — engineered for schedule integrity and speed."
      poster={<PlanePoster />}
    >
      <PlaneContent />
    </SceneShell>
  )
}

export function ForkliftSection() {
  return (
    <SceneShell
      id="warehouse"
      kicker="Scene 05 · Warehousing"
      title="Warehousing & 3PL"
      description="High-bay storage, pick and pack, and fulfilment — fully integrated with your freight and transport operations."
      poster={<ForkliftPoster />}
      overlay={<WarehouseInventory />}
    >
      <ForkliftContent />
    </SceneShell>
  )
}

export function VaultSection() {
  return (
    <SceneShell
      id="vault"
      kicker="Scene 06 · Vault"
      title="Container & Cargo Vault"
      description="Inspect the cargo vault — RFID tracking, temperature control and seismic bracing, engineered into every unit."
      poster={<VaultPoster />}
    >
      <VaultContent />
    </SceneShell>
  )
}