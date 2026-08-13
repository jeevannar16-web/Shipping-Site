import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import ErrorBoundary from './ErrorBoundary'
import { CargoPlane, ContainerShip } from './LogisticsObjects'

export default function LogisticsScene({
  type,
  className = '',
}: {
  type: 'plane' | 'ship'
  className?: string
}) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <ErrorBoundary>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} color="#556" />
            <directionalLight position={[3, 3, 4]} intensity={1.6} color="#dfe8ff" />
            <pointLight position={[0, -3, -3]} intensity={0.8} color="#2dd4bf" />
            {type === 'plane' ? (
              <CargoPlane position={[0, 0, 0]} scale={1.15} />
            ) : (
              <ContainerShip position={[0, -0.2, 0]} scale={1.1} />
            )}
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
