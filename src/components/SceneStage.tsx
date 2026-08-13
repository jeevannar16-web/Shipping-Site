import { useEffect, type ReactNode } from 'react'
import { useThree } from '@react-three/fiber'
import SceneCanvas from './SceneCanvas'

/** Point the camera at a target once (fixed framing used by the pixel harness). */
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

export function SceneStage({
  label,
  tone,
  camera,
  look,
  children,
}: {
  label: string
  tone: 'orange' | 'blue' | 'violet'
  camera: { position: [number, number, number]; fov: number }
  look: [number, number, number]
  children: ReactNode
}) {
  const lights = (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[8, 18, 10]} intensity={1.8} color="#fff6e8" />
      <directionalLight position={[-8, 6, -6]} intensity={0.4} color="#ffffff" />
    </>
  )
  return (
    <SceneCanvas fallbackLabel={label} tone={tone} camera={camera}>
      {lights}
      <CameraRig pos={camera.position} look={look} />
      {children}
    </SceneCanvas>
  )
}