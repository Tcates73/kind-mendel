import { useState, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { ImageCard } from './ImageCard';
import { CategoryFilter } from './CategoryFilter';
import { ReducedMotionToggle } from './ReducedMotionToggle';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useImagePreloader } from '../hooks/useImagePreloader';
import { GalleryImage } from '../types';

interface Gallery3DProps {
  images: GalleryImage[];
}

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#444" wireframe />
  </mesh>
);

export const Gallery3D: React.FC<Gallery3DProps> = ({ images }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const systemReducedMotion = useReducedMotion();
  const [manualReducedMotion, setManualReducedMotion] = useState(false);

  const reducedMotion = systemReducedMotion || manualReducedMotion;

  const { preloadFullImage, preloadNearbyImages } = useImagePreloader(images);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(images.map(img => img.category));
    return Array.from(uniqueCategories).sort();
  }, [images]);

  const handleHover = (id: string | null) => {
    setHoveredId(id);

    if (id) {
      preloadFullImage(id);
      preloadNearbyImages(id);
    }
  };

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    setHoveredId(null);
  };

  return (
    <>
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        reducedMotion={reducedMotion}
      />

      <ReducedMotionToggle
        reducedMotion={reducedMotion}
        onToggle={() => setManualReducedMotion(!manualReducedMotion)}
      />

      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 0, 5]} intensity={0.5} />

        <Suspense fallback={<LoadingFallback />}>
          <group>
            {images.map((image, index) => (
              <ImageCard
                key={image.id}
                image={image}
                index={index}
                totalImages={images.length}
                isHovered={hoveredId === image.id}
                onHover={handleHover}
                hoveredId={hoveredId}
                activeCategory={activeCategory}
                reducedMotion={reducedMotion}
              />
            ))}
          </group>

          <Environment preset="city" />

          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={!hoveredId}
            minDistance={5}
            maxDistance={20}
            rotateSpeed={reducedMotion ? 0.1 : 0.5}
            zoomSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </>
  );
};
