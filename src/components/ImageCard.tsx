import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { ImageCardProps } from '../types';

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  totalImages,
  isHovered,
  onHover,
  hoveredId,
  activeCategory,
  reducedMotion,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [currentImage, setCurrentImage] = useState(image.thumbURL);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fullImageLoaded, setFullImageLoaded] = useState(false);

  const isOtherHovered = hoveredId !== null && hoveredId !== image.id;
  const shouldShow = activeCategory === null || image.category === activeCategory;

  const phi = Math.acos(-1 + (2 * index) / totalImages);
  const theta = Math.sqrt(totalImages * Math.PI) * phi;
  const radius = 5;

  const basePosition: [number, number, number] = [
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(phi),
  ];

  const centerPosition: [number, number, number] = [0, 0, 3];

  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;

    if (!isHovered && hoveredId === null) {
      const rotationSpeed = 0.0003;
      const currentPos = meshRef.current.position;
      const angle = state.clock.getElapsedTime() * rotationSpeed;

      const rotatedX = currentPos.x * Math.cos(angle) - currentPos.z * Math.sin(angle);
      const rotatedZ = currentPos.x * Math.sin(angle) + currentPos.z * Math.cos(angle);

      meshRef.current.position.x = rotatedX;
      meshRef.current.position.z = rotatedZ;
    }
  });

  useEffect(() => {
    if (isHovered && !fullImageLoaded) {
      const img = new globalThis.Image();
      img.src = image.fullURL;
      img.onload = () => {
        setFullImageLoaded(true);
        setCurrentImage(image.fullURL);
      };
      img.onerror = () => {
        console.warn(`Failed to load full image: ${image.fullURL}`);
      };
    } else if (!isHovered && fullImageLoaded) {
      setCurrentImage(image.thumbURL);
    }
  }, [isHovered, image.fullURL, image.thumbURL, fullImageLoaded]);

  return (
    <group>
      <mesh
        ref={meshRef}
        position={isHovered ? centerPosition : basePosition}
        scale={isHovered ? 1.3 : 1}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover(image.id);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
      >
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          opacity={shouldShow ? (isOtherHovered ? 0.4 : 1) : 0.1}
          transparent
        >
          <Image
            url={currentImage}
            toneMapped={false}
            onLoad={() => setImageLoaded(true)}
          />
        </meshStandardMaterial>

        {imageLoaded && (
          <meshStandardMaterial
            opacity={shouldShow ? (isOtherHovered ? 0.4 : 1) : 0.1}
            transparent
            color={isHovered ? 0xffffff : 0x888888}
          />
        )}
      </mesh>

      {isHovered && (
        <Html
          position={[0, -2.5, 3]}
          center
          distanceFactor={8}
          style={{
            width: '400px',
            pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.3, delay: reducedMotion ? 0 : 0.3 }}
            style={{
              textAlign: 'center',
              color: 'white',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.1 : 0.3, delay: reducedMotion ? 0 : 0.3 }}
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '12px',
                fontFamily: 'Georgia, serif',
              }}
            >
              {image.title}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reducedMotion ? 0.1 : 0.3, delay: reducedMotion ? 0 : 0.4 }}
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '12px',
              }}
            >
              {image.tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reducedMotion ? 0.1 : 0.2, delay: reducedMotion ? 0 : 0.4 + i * 0.05 }}
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    padding: '4px 12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.1 : 0.3, delay: reducedMotion ? 0 : 0.5 }}
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                maxWidth: '360px',
                margin: '0 auto',
                opacity: 0.9,
                fontWeight: '300',
              }}
            >
              {image.description}
            </motion.p>
          </motion.div>
        </Html>
      )}
    </group>
  );
};
