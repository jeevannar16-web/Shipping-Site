import { useEffect, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * R4 — auto-fit camera. Compute the group's bounding sphere, then set the camera
 * at distance = radius / sin(fov/2) / coverage along the given axis, looking at center.
 */
export function fitCameraTo(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  coverage: number,
  axis: [number, number, number],
) {
  const box = new THREE.Box3().setFromObject(object)
  const sphere = box.getBoundingSphere(new THREE.Sphere())
  const fovRad = (camera.fov * Math.PI) / 180
  const dist = sphere.radius / Math.sin(fovRad / 2) / coverage
  const dir = new THREE.Vector3(axis[0], axis[1], axis[2]).normalize()
  camera.position.copy(sphere.center).addScaledVector(dir, dist)
  camera.lookAt(sphere.center)
  return { box, sphere }
}

function isDev() {
  return typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
}

/**
 * Hook: fit the camera to a group (once mounted + on every resize). Optional
 * damped mouse parallax (±`parallax` units) offsets the fitted framing (P1).
 */
export function useAutoFit(
  groupRef: RefObject<THREE.Group | null>,
  { coverage, axis, fov, parallax = 0, label = 'scene' }: {
    coverage: number
    axis: [number, number, number]
    fov: number
    parallax?: number
    label?: string
  },
) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const fitted = useRef(false)
  const optsRef = useRef({ coverage, axis, fov, parallax, label })
  optsRef.current = { coverage, axis, fov, parallax, label }
  const basePos = useRef<THREE.Vector3 | null>(null)
  const lookTarget = useRef(new THREE.Vector3())
  const offX = useRef(0)
  const offY = useRef(0)
  const logged = useRef(false)

  useEffect(() => {
    fitted.current = false
    basePos.current = null
  }, [size.width, size.height])

  useFrame((state, delta) => {
    const c = camera
    const g = groupRef.current
    if (!c.isPerspectiveCamera || !g) return
    if (!fitted.current) {
      c.fov = optsRef.current.fov
      c.updateProjectionMatrix()
      const { box, sphere } = fitCameraTo(g, c, optsRef.current.coverage, optsRef.current.axis)
      basePos.current = c.position.clone()
      lookTarget.current.copy(sphere.center)
      fitted.current = true
      if (isDev() && !logged.current) {
        logged.current = true
        const sizeVec = box.getSize(new THREE.Vector3())
        console.log(
          `[auto-fit ${optsRef.current.label}] coverage=${optsRef.current.coverage} fov=${c.fov}`,
          { position: c.position.toArray(), boxSize: sizeVec.toArray() },
        )
      }
    } else if (optsRef.current.parallax > 0 && basePos.current) {
      const tx = THREE.MathUtils.clamp(state.pointer.x, -1, 1) * optsRef.current.parallax
      const ty = THREE.MathUtils.clamp(state.pointer.y, -1, 1) * optsRef.current.parallax
      offX.current = THREE.MathUtils.damp(offX.current, tx, 3, delta)
      offY.current = THREE.MathUtils.damp(offY.current, ty, 3, delta)
      c.position.set(basePos.current.x + offX.current, basePos.current.y + offY.current, basePos.current.z)
      c.lookAt(lookTarget.current)
    }
  })
}

/**
 * Render INSIDE the Canvas. R3F hooks can only run within the Canvas tree,
 * so scenes place <AutoFitCamera target={ref} ... /> as a canvas child.
 */
export function AutoFitCamera({
  target,
  coverage,
  axis,
  fov,
  parallax = 0,
  label = 'scene',
}: {
  target: RefObject<THREE.Group | null>
  coverage: number
  axis: [number, number, number]
  fov: number
  parallax?: number
  label?: string
}) {
  useAutoFit(target, { coverage, axis, fov, parallax, label })
  return null
}
