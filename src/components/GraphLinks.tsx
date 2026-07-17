import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface GraphLinksProps {
  nodes: any[];
  positions: { [key: string]: [number, number, number] };
}

export const GraphLinks: React.FC<GraphLinksProps> = ({ nodes, positions }) => {
  const lineGeometry = useRef<THREE.BufferGeometry>(null);

  const links = useMemo(() => {
    const l: { source: string; target: string }[] = [];
    nodes.forEach(node => {
      node.connections.forEach((targetId: string) => {
        // Avoid duplicate lines for undirected links
        if (node.id < targetId) {
          l.push({ source: node.id, target: targetId });
        }
      });
    });
    return l;
  }, [nodes]);

  useFrame(() => {
    if (!lineGeometry.current) return;

    const vertices: number[] = [];
    links.forEach(link => {
      const start = positions[link.source];
      const end = positions[link.target];
      if (start && end) {
        vertices.push(...start, ...end);
      }
    });

    const positionAttr = lineGeometry.current.getAttribute('position') as THREE.BufferAttribute;
    if (positionAttr && positionAttr.array.length === vertices.length) {
      // Cast the Float32Array to number[] or copy values directly to avoid any type discrepancy
      const arr = positionAttr.array as Float32Array;
      for (let i = 0; i < vertices.length; i++) {
        arr[i] = vertices[i];
      }
      positionAttr.needsUpdate = true;
    } else {
      lineGeometry.current.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices, 3)
      );
    }
  });

  return (
    <lineSegments>
      <bufferGeometry ref={lineGeometry} />
      <lineBasicMaterial color="#00ffff" transparent opacity={0.2} />
    </lineSegments>
  );
};
