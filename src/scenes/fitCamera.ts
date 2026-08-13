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
}

/**
 * Hook: fit the camera to a group (once mounted + on every resize), so the full
 * model always stays framed with margin at any viewport size.
 */
export function useAutoFit(
  groupRef: RefObject<THREE.Group | null>,
  { coverage, axis, fov }: { coverage: number; axis: [number, number, number]; fov: number },
) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const fitted = useRef(false)
  const optsRef = useRef({ coverage, axis, fov })
  optsRef.current = { coverage, axis, fov }

  useEffect(() => {
    fitted.current = false
  }, [size.width, size.height])

  useFrame(() => {
    if (fitted.current || !groupRef.current) return
    const c = camera
    if (!(c as THREE.PerspectiveCamera).isPerspectiveCamera) return
    c.fov = optsRef.current.fov
    c.updateProjectionMatrix()
    fitCameraTo(groupRef.current, c, optsRef.current.coverage, optsRef.current.axis)
    fitted.current = true
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
}: {
  target: RefObject<THREE.Group | null>
  coverage: number
  axis: [number, number, number]
  fov: number
}) {
  useAutoFit(target, { coverage, axis, fov })
  return null
}