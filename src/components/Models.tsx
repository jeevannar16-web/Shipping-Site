import { useGLTF } from '@react-three/drei'
import { forwardRef, useLayoutEffect, useMemo, type MutableRefObject } from 'react'
import * as THREE from 'three'

export type WheelRefs = MutableRefObject<Array<THREE.Object3D | null>>

/** Normalize a loaded GLB so its bottom sits at y0 with its horizontal centre at the origin.
 *  Truck spec: largest horizontal (max of x/z) scaled to 13 units; if size.z > size.x the
 *  model is rotated Y by 90° so its length runs along X. */
function normalizeTruck(g: THREE.Object3D) {
  const b = new THREE.Box3().setFromObject(g)
  const size = b.getSize(new THREE.Vector3())
  if (size.z > size.x) g.rotation.y = Math.PI / 2
  g.updateMatrixWorld(true)
  const b2 = new THREE.Box3().setFromObject(g)
  const s2 = b2.getSize(new THREE.Vector3())
  const s = 13 / Math.max(s2.x, s2.z)
  g.scale.setScalar(s)
  g.updateMatrixWorld(true)
  const b3 = new THREE.Box3().setFromObject(g)
  g.position.x = -b3.min.x - (b3.max.x - b3.min.x) / 2
  g.position.y = -b3.min.y
  g.position.z = -b3.min.z - (b3.max.z - b3.min.z) / 2
}

/** Container spec: per-axis scale the bbox to (4.4, 1.6, 1.8), then centre the origin. */
function normalizeContainer(g: THREE.Object3D) {
  const b = new THREE.Box3().setFromObject(g)
  const size = b.getSize(new THREE.Vector3())
  g.scale.set(size.x ? 4.4 / size.x : 1, size.y ? 1.6 / size.y : 1, size.z ? 1.8 / size.z : 1)
  g.updateMatrixWorld(true)
  const b2 = new THREE.Box3().setFromObject(g)
  const c = b2.getCenter(new THREE.Vector3())
  g.position.x = -c.x
  g.position.y = -c.y
  g.position.z = -c.z
}

/** Re-parent every /wheel/i node into an identity pivot at its own centroid so the scene can
 *  spin `pivot.rotation.z` (the axle runs along the truck width) without orbiting the wheel. */
function spinify(g: THREE.Object3D, out: Array<THREE.Object3D | null>) {
  g.updateMatrixWorld(true)
  const found: THREE.Object3D[] = []
  const isWheel = (o: THREE.Object3D) => /wheel/i.test(o.name)
  g.traverse((o) => {
    if (!isWheel(o)) return
    let a = o.parent
    let nested = false
    while (a && a !== g) {
      if (isWheel(a)) {
        nested = true
        break
      }
      a = a.parent
    }
    if (nested) return
    const parent = o.parent
    if (!parent) return
    const box = new THREE.Box3().setFromObject(o)
    if (box.isEmpty()) return
    const localCenter = parent.worldToLocal(box.getCenter(new THREE.Vector3()))
    const pivot = new THREE.Group()
    pivot.position.copy(localCenter)
    parent.remove(o)
    pivot.add(o)
    o.position.sub(localCenter)
    parent.add(pivot)
    const ws = box.getSize(new THREE.Vector3())
    pivot.userData.radius = Math.max(ws.x, ws.y) / 2 || 0.5
    found.push(pivot)
  })
  out.length = 0
  out.push(...found)
}

export const TruckGLB = forwardRef<THREE.Group, { wheels?: WheelRefs }>(function TruckGLB({ wheels }, ref) {
  const { scene } = useGLTF('/models/truck.glb')
  const glb = useMemo(() => scene.clone(true), [scene])
  useLayoutEffect(() => {
    normalizeTruck(glb)
    if (wheels) spinify(glb, wheels.current)
  }, [glb, wheels])
  return <group ref={ref}><primitive object={glb} /></group>
})

export const ContainerGLB = forwardRef<THREE.Object3D, { position?: [number, number, number] }>(
  function ContainerGLB({ position }, ref) {
    const { scene } = useGLTF('/models/container.glb')
    const glb = useMemo(() => scene.clone(true), [scene])
    useLayoutEffect(() => {
      normalizeContainer(glb)
    }, [glb])
    return <group ref={ref} position={position}><primitive object={glb} /></group>
  },
)

useGLTF.preload('/models/truck.glb')
useGLTF.preload('/models/container.glb')
