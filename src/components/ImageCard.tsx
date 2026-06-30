import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Image, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { ImageCardProps } from '../types';

export const ImageCard: React.FC<ImageCardProps> = ({
  node,
  position,
  isHovered,
  onHover,
  hoveredId,
  onDrag,
  onDragEnd,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { raycaster } = useThree();

  const isOtherHovered = hoveredId !== null && hoveredId !== node.id;
  const centerPosition: [number, number, number] = [0, 0, 5];

  useFrame(() => {
    if (!meshRef.current) return;

    if (isDragging) {
      // Create a plane at the node's current Z depth
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -meshRef.current.position.z);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      onDrag([intersection.x, intersection.y, intersection.z]);
    } else {
      const targetPos = isHovered ? centerPosition : position;
      meshRef.current.position.lerp(new THREE.Vector3(...targetPos), 0.1);
    }

    meshRef.current.lookAt(0, 0, 0);
  });

  const getIcon = () => {
    switch (node.type) {
      case 'journal': return '📝';
      case 'voice': return '🎙️';
      case 'emotion': return '✨';
      default: return '🖼️';
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        scale={isHovered ? 1.5 : 1}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover(node.id);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          (e.target as any).setPointerCapture(e.pointerId);
          setIsDragging(true);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          (e.target as any).releasePointerCapture(e.pointerId);
          setIsDragging(false);
          onDragEnd();
        }}
      >
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          opacity={isOtherHovered ? 0.1 : 0.8}
          transparent
          side={THREE.DoubleSide}
        >
          {node.thumbURL ? (
            <Image
              url={node.thumbURL}
              toneMapped={false}
            />
          ) : (
             <meshBasicMaterial color="#00ffff" transparent opacity={0.1} />
          )}
        </meshStandardMaterial>

        {!node.thumbURL && (
           <Html center>
             <div style={{ fontSize: '2rem', filter: isOtherHovered ? 'grayscale(1) opacity(0.2)' : 'none', pointerEvents: 'none' }}>
               {getIcon()}
             </div>
           </Html>
        )}

        <mesh scale={[1.05, 1.05, 1]}>
          <planeGeometry args={[1.5, 1]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={isHovered ? 0.5 : 0.1}
            wireframe
          />
        </mesh>
      </mesh>

      {isHovered && !isDragging && (
        <Html
          position={[0, -2.5, 5]}
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
            style={{
              textAlign: 'center',
              color: 'white',
              fontFamily: 'monospace',
              background: 'rgba(0,0,0,0.8)',
              padding: '20px',
              border: '1px solid #00ffff',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ color: '#00ffff', fontSize: '10px', marginBottom: '5px' }}>
              [{node.type.toUpperCase()}] // {node.date}
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>{node.title}</h2>

            {node.content && (
              <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '15px' }}>{node.content}</p>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {node.tags.map(tag => (
                <span key={tag} style={{ fontSize: '10px', border: '1px solid rgba(0,255,255,0.3)', padding: '2px 8px' }}>
                  #{tag}
                </span>
              ))}
            </div>

            {node.emotion && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#ff00ff' }}>
                EMOTION: {node.emotion}
              </div>
            )}
          </motion.div>
        </Html>
      )}
    </group>
  );
};
