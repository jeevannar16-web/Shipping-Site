import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function VisualTest({
  label, target, y, x, ship,
}: {
  label: string; target: () => THREE.Object3D | null;
  y?: [number, number]; x?: [number, number];
  ship?: {
    travel: [number, number];
    points: { at: number; local: [number, number, number]; tag: string }[];
  };
}) {
  const { camera, size } = useThree()
  const f = useRef(0)

  useFrame(() => {
    const o = target()
    if (!o || f.current++ !== 30) return

    const b = new THREE.Box3().setFromObject(o)
    const mn = b.min.clone().project(camera)
    const mx = b.max.clone().project(camera)
    const sy = [(1 - mx.y) * size.height / 2, (1 - mn.y) * size.height / 2]
    const sx = [(mn.x + 1) * size.width / 2, (mx.x + 1) * size.width / 2]

    if (ship) {
      const [a, z] = ship.travel
      const at = (t: number, q: [number, number, number]) => {
        const w = new THREE.Vector3(q[0], q[1], q[2] + THREE.MathUtils.lerp(a, z, t)).project(camera)
        return w.x >= -1 && w.x <= 1 && w.y >= -1 && w.y <= 1 && w.z > 0 && w.z <= 1
      }
      const passWidth = sx[0] >= 0.3 * size.width && sx[1] <= 0.7 * size.width
      const pts = ship.points.map(({ at: t, local, tag }) => ({ tag, ok: at(t, local) }))
      const allInside = pts.every((p) => p.ok)
      const pass = passWidth && allInside
      console.log(`%c[VISUAL] ${label} ${pass ? 'PASS' : 'FAIL'}`,
        pass ? 'color:#22c55e' : 'color:#ef4444', { sx, sy, passWidth, points: pts })
      return
    }

    const pass = sy[0] >= (y?.[0] ?? -Infinity) && sy[1] <= (y?.[1] ?? Infinity) &&
      sx[0] >= (x?.[0] ?? -Infinity) && sx[1] <= (x?.[1] ?? Infinity)
    console.log(`%c[VISUAL] ${label} ${pass ? 'PASS' : 'FAIL'}`,
      pass ? 'color:#22c55e' : 'color:#ef4444', { sy, sx, y, x })
  })

  return null
}