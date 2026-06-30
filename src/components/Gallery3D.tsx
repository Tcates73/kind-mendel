import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { ImageCard } from './ImageCard';
import { GraphLinks } from './GraphLinks';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useGraphPhysics } from '../hooks/useGraphPhysics';
import { MemoryNode } from '../types';

interface Gallery3DProps {
  nodes: MemoryNode[];
}

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#444" wireframe />
  </mesh>
);

export const Gallery3D: React.FC<Gallery3DProps> = ({ nodes }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const systemReducedMotion = useReducedMotion();
  const [manualReducedMotion] = useState(false);

  const reducedMotion = systemReducedMotion || manualReducedMotion;

  const { positions, updateNodePosition, releaseNode } = useGraphPhysics(nodes);

  const handleHover = (id: string | null) => {
    setHoveredId(id);
  };

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{
          width: '100vw',
          height: '100vh',
          background: '#000000',
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 10, 25]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#00ffff" />

        <Suspense fallback={<LoadingFallback />}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Sparkles count={200} scale={20} size={1} speed={0.3} color="#00ffff" />

          {/* Black Hole Singularity */}
          <group>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[2, 32, 32]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[0, 0, 0]} scale={1.05}>
              <sphereGeometry args={[2, 32, 32]} />
              <meshBasicMaterial color="#00ffff" transparent opacity={0.05} wireframe />
            </mesh>
          </group>

          <group>
            <GraphLinks nodes={nodes} positions={positions} />
            {nodes.map((node, index) => (
              <ImageCard
                key={node.id}
                node={node}
                index={index}
                totalNodes={nodes.length}
                position={positions[node.id] || [0, 0, 0]}
                isHovered={hoveredId === node.id}
                onHover={handleHover}
                hoveredId={hoveredId}
                reducedMotion={reducedMotion}
                onDrag={(pos) => updateNodePosition(node.id, pos)}
                onDragEnd={() => releaseNode(node.id)}
              />
            ))}
          </group>

          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={!hoveredId}
            minDistance={5}
            maxDistance={30}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </>
  );
};
