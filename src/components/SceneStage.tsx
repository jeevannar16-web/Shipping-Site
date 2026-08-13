import { useEffect, type ReactNode } from 'react'
import { useThree } from '@react-three/fiber'
import SceneCanvas from './SceneCanvas'

/** Point the camera at a target once (used when a scene has no internal Rig). */
export function CameraRig({ pos, look }: { pos: [number, number, number]; look: [number, number, number] }) {
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    camera.position.set(...pos)
    camera.lookAt(...look)
    camera.updateProjectionMatrix()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

const GlobalLights = (
  <>
    <ambientLight intensity={0.7} />
    <directionalLight position={[-6, 12, 8]} intensity={1.2} color="#ffffff" />
  </>
)

export function SceneStage({
  label,
  tone,
  camera,
  look,
  children,
}: {
  label: string
  tone: 'orange' | 'blue' | 'violet'
  camera?: { position: [number, number, number]; fov: number }
  look?: [number, number, number]
  children: ReactNode
}) {
  return (
    <SceneCanvas fallbackLabel={label} tone={tone} camera={camera}>
      {GlobalLights}
      {camera && look ? <CameraRig pos={camera.position} look={look} /> : null}
      {children}
    </SceneCanvas>
  )
}
