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

    const maxVerticesLength = links.length * 6;
    if (maxVerticesLength === 0) {
      const positionAttr = lineGeometry.current.getAttribute('position') as THREE.BufferAttribute;
      if (positionAttr && positionAttr.array.length > 0) {
        lineGeometry.current.deleteAttribute('position');
      }
      return;
    }

    const positionAttr = lineGeometry.current.getAttribute('position') as THREE.BufferAttribute;

    let arr: Float32Array;
    // Bolt Optimization: Allocate/reuse Float32Array at max capacity (links.length * 6).
    // In a single pass, populate active link coordinates and use setDrawRange to specify active vertices.
    // This reduces loop iterations and object lookups by 50% on every 60fps frame, while completely
    // eliminating buffer array allocations when active link counts fluctuate.
    if (positionAttr && positionAttr.array.length === maxVerticesLength) {
      arr = positionAttr.array as Float32Array;
    } else {
      arr = new Float32Array(maxVerticesLength);
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

    if (positionAttr && positionAttr.array.length === maxVerticesLength) {
      // Mark the attribute as needing an update to tell WebGL to re-upload the modified array
      positionAttr.needsUpdate = true;
    } else {
      // Create a new BufferAttribute once at max capacity
      lineGeometry.current.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(arr, 3)
      );
    }

    // Set drawRange to render only active line segment vertices (index / 3 count)
    lineGeometry.current.setDrawRange(0, index / 3);
  });

  return (
    <lineSegments>
      <bufferGeometry ref={lineGeometry} />
      <lineBasicMaterial color="#00ffff" transparent opacity={0.2} />
    </lineSegments>
  );
};
