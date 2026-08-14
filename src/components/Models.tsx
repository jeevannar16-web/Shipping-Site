import { useGLTF } from '@react-three/drei'
import { forwardRef, useLayoutEffect, useMemo, type MutableRefObject } from 'react'
import * as THREE from 'three'

export type WheelRefs = MutableRefObject<Array<THREE.Object3D | null>>

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

function setShadow(o: THREE.Object3D) {
  o.traverse((c) => {
    if (c instanceof THREE.Mesh) c.castShadow = true
  })
}

function skinTruckGLB(g: THREE.Object3D, cabColor = '#3A3D42', boxColor = '#E8E8E8') {
  const std = { roughness: 0.7, metalness: 0.1 }
  const cabStd = { roughness: 0.35, metalness: 0.5 }
  const chassisStd = { roughness: 0.9, metalness: 0.05 }
  const wheelStd = { roughness: 0.6, metalness: 0.4 }
  const glassStd = { roughness: 0.1, metalness: 0.9 }
  g.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return
    if (/wheel/i.test(o.name)) {
      o.material = new THREE.MeshStandardMaterial({ ...wheelStd, color: '#8A8A8A' })
      return
    }
    if (/glass|window|windshield/i.test(o.name)) {
      o.material = new THREE.MeshStandardMaterial({ ...glassStd, color: '#101418' })
      return
    }
    const b = new THREE.Box3().setFromObject(o)
    const size = b.getSize(new THREE.Vector3())
    const center = b.getCenter(new THREE.Vector3())
    const isThin = size.y < 0.6 || (size.x < 1.5 && center.y < 1.2)
    const isAtBottom = center.y < 1.3
    const isAtFront = center.x > 4
    const isLargeBox = size.x > 3 && size.y > 1.2
    if (isThin && isAtBottom) {
      o.material = new THREE.MeshStandardMaterial({ ...chassisStd, color: '#1a1a1a' })
    } else if (isAtFront && !isLargeBox) {
      o.material = new THREE.MeshStandardMaterial({ ...cabStd, color: cabColor })
    } else if (isLargeBox) {
      o.material = new THREE.MeshStandardMaterial({ ...std, color: boxColor })
    } else {
      o.material = new THREE.MeshStandardMaterial({ ...std, color: '#333333' })
    }
  })
}

export const TruckGLB = forwardRef<THREE.Group, { wheels?: WheelRefs; tint?: string; isPassing?: boolean }>(
  function TruckGLB({ wheels, tint, isPassing }, ref) {
    const { scene } = useGLTF('/models/truck.glb')
    const glb = useMemo(() => scene.clone(true), [scene])
    useLayoutEffect(() => {
      normalizeTruck(glb)
      skinTruckGLB(glb, tint || '#3A3D42', '#E8E8E8')
      setShadow(glb)
      if (wheels) spinify(glb, wheels.current)
    }, [glb, wheels, tint])
    return <group ref={ref} scale={isPassing ? 0.9 : 1}><primitive object={glb} /></group>
  },
)

export const ContainerGLB = forwardRef<THREE.Object3D, { position?: [number, number, number]; tint?: string }>(
  function ContainerGLB({ position, tint }, ref) {
    const { scene } = useGLTF('/models/container.glb')
    const glb = useMemo(() => scene.clone(true), [scene])
    useLayoutEffect(() => {
      normalizeContainer(glb)
      setShadow(glb)
      if (tint) {
        glb.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.material = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.7, metalness: 0.15 })
          }
        })
      }
    }, [glb, tint])
    return <group ref={ref} position={position}><primitive object={glb} /></group>
  },
)

useGLTF.preload('/models/truck.glb')
useGLTF.preload('/models/container.glb')
