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

    // First count how many links have both source and target positions ready
    let activeLinksCount = 0;
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (positions[link.source] && positions[link.target]) {
        activeLinksCount++;
      }
    }
    const verticesLength = activeLinksCount * 6;

    if (verticesLength === 0) {
      // If no node positions are populated yet, clear the position attribute if it exists
      const positionAttr = lineGeometry.current.getAttribute('position') as THREE.BufferAttribute;
      if (positionAttr && positionAttr.array.length > 0) {
        lineGeometry.current.deleteAttribute('position');
      }
      return;
    }

    const positionAttr = lineGeometry.current.getAttribute('position') as THREE.BufferAttribute;

    let arr: Float32Array;
    // Bolt Optimization: If the buffer array already exists with the correct length, reuse it in-place.
    // This avoids creating temporary arrays and invoking garbage collection during the 60fps render loop.
    if (positionAttr && positionAttr.array.length === verticesLength) {
      arr = positionAttr.array as Float32Array;
    } else {
      arr = new Float32Array(verticesLength);
    }

    let index = 0;
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const start = positions[link.source];
      const end = positions[link.target];
      if (start && end) {
        arr[index++] = start[0];
        arr[index++] = start[1];
        arr[index++] = start[2];
        arr[index++] = end[0];
        arr[index++] = end[1];
        arr[index++] = end[2];
      }
    }

    if (positionAttr && positionAttr.array.length === verticesLength) {
      // Mark the attribute as needing an update to tell WebGL to re-upload the modified array
      positionAttr.needsUpdate = true;
    } else {
      // Create a new BufferAttribute if length changed or was not set
      lineGeometry.current.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(arr, 3)
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
