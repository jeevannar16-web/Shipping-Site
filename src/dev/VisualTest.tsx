import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function VisualTest({ label, target, y, x }: {
  label: string; target: () => THREE.Object3D | null;
  y: [number, number]; x: [number, number] }) {
  const { camera, size } = useThree()
  const f = useRef(0)
  useFrame(() => {
    if (f.current++ !== 30) return
    const o = target()
    if (!o) return
    const b = new THREE.Box3().setFromObject(o)
    const mn = b.min.clone().project(camera)
    const mx = b.max.clone().project(camera)
    const sy = [(1 - mx.y) * size.height / 2, (1 - mn.y) * size.height / 2]
    const sx = [(mn.x + 1) * size.width / 2, (mx.x + 1) * size.width / 2]
    const pass = sy[0] >= y[0] && sy[1] <= y[1] && sx[0] >= x[0] && sx[1] <= x[1]
    console.log(`%c[VISUAL] ${label} ${pass ? 'PASS' : 'FAIL'}`,
      pass ? 'color:#22c55e' : 'color:#ef4444', { sy, sx, y, x })
  })
  return null
}