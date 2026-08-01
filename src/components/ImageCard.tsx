import { useRef, useState, memo } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Image, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { ImageCardProps } from '../types';

// Bolt Optimization: Pre-allocate static Three.js math helpers and constant positions outside of the component.
// This prevents garbage collection thrashing by completely removing temporary Vector3 and Plane allocations
// from the high-frequency (60fps) rendering loop across all rendered cards.
const planeNormal = new THREE.Vector3(0, 0, 1);
const dragPlane = new THREE.Plane();
const dragIntersection = new THREE.Vector3();
const scratchVector = new THREE.Vector3();
const centerPosition: [number, number, number] = [0, 0, 5];

export const ImageCard = memo(({
  node,
  position,
  isHovered,
  onHover,
  hoveredId,
  onDrag,
  onDragEnd,
}: ImageCardProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { raycaster } = useThree();

  const isOtherHovered = hoveredId !== null && hoveredId !== node.id;

  useFrame(() => {
    if (!groupRef.current) return;

    if (isDragging) {
      // Configure drag plane normal and constant offset in-place
      dragPlane.set(planeNormal, -groupRef.current.position.z);
      raycaster.ray.intersectPlane(dragPlane, dragIntersection);

      onDrag(node.id, [dragIntersection.x, dragIntersection.y, dragIntersection.z]);
    } else {
      const targetPos = isHovered ? centerPosition : position;
      // Re-use scratchVector in-place to avoid new THREE.Vector3(...targetPos) allocations
      scratchVector.set(targetPos[0], targetPos[1], targetPos[2]);
      groupRef.current.position.lerp(scratchVector, 0.1);
    }

    const pos = groupRef.current.position;
    if (pos.x !== 0 || pos.y !== 0 || pos.z !== 0) {
      groupRef.current.lookAt(0, 0, 0);
    }
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
    <group
      ref={groupRef}
      scale={isHovered ? 1.5 : 1}
    >
      {node.thumbURL ? (
        <Image
          url={node.thumbURL}
          toneMapped={false}
          transparent
          opacity={isOtherHovered ? 0.1 : 0.8}
          side={THREE.DoubleSide}
          onPointerEnter={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onHover(node.id);
          }}
          onPointerLeave={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onHover(null);
          }}
          onPointerDown={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            if (e.nativeEvent && e.nativeEvent.target && 'setPointerCapture' in e.nativeEvent.target) {
              (e.nativeEvent.target as any).setPointerCapture(e.pointerId);
            }
            setIsDragging(true);
          }}
          onPointerUp={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            if (e.nativeEvent && e.nativeEvent.target && 'releasePointerCapture' in e.nativeEvent.target) {
              (e.nativeEvent.target as any).releasePointerCapture(e.pointerId);
            }
            setIsDragging(false);
            onDragEnd(node.id);
          }}
        >
          {/* Glowing wireframe outline */}
          <mesh scale={[1.05, 1.05, 1]}>
            <planeGeometry args={[1.5, 1]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={isHovered ? 0.5 : 0.1}
              wireframe
            />
          </mesh>
        </Image>
      ) : (
        <mesh
          onPointerEnter={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onHover(node.id);
          }}
          onPointerLeave={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onHover(null);
          }}
          onPointerDown={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            if (e.nativeEvent && e.nativeEvent.target && 'setPointerCapture' in e.nativeEvent.target) {
              (e.nativeEvent.target as any).setPointerCapture(e.pointerId);
            }
            setIsDragging(true);
          }}
          onPointerUp={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            if (e.nativeEvent && e.nativeEvent.target && 'releasePointerCapture' in e.nativeEvent.target) {
              (e.nativeEvent.target as any).releasePointerCapture(e.pointerId);
            }
            setIsDragging(false);
            onDragEnd(node.id);
          }}
        >
          <planeGeometry args={[1.5, 1]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={isOtherHovered ? 0.05 : 0.15}
            side={THREE.DoubleSide}
          />
          {/* Glowing wireframe outline */}
          <mesh scale={[1.05, 1.05, 1]}>
            <planeGeometry args={[1.5, 1]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={isHovered ? 0.5 : 0.1}
              wireframe
            />
          </mesh>
          <Html center style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{ fontSize: '2rem', filter: isOtherHovered ? 'grayscale(1) opacity(0.2)' : 'none' }}>
              {getIcon()}
            </div>
          </Html>
        </mesh>
      )}

      {isHovered && !isDragging && (
        <Html
          position={[0, -2.5, 0]}
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
}, (prevProps, nextProps) => {
  // Bolt Optimization: Only re-render when properties that affect React rendering change.
  // We compare position values element-by-element since physical coordinate arrays are
  // re-created on each physics simulation tick, which would fail standard reference equality.
  // We bypass inline functions because their actions are identical for the same node ID.
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.type === nextProps.node.type &&
    prevProps.node.thumbURL === nextProps.node.thumbURL &&
    prevProps.index === nextProps.index &&
    prevProps.totalNodes === nextProps.totalNodes &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.hoveredId === nextProps.hoveredId &&
    prevProps.reducedMotion === nextProps.reducedMotion &&
    prevProps.position[0] === nextProps.position[0] &&
    prevProps.position[1] === nextProps.position[1] &&
    prevProps.position[2] === nextProps.position[2]
  );
});
