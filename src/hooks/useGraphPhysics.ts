import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3-force-3d';
import { MemoryNode } from '../types';

export const useGraphPhysics = (nodes: MemoryNode[]) => {
  const [positions, setPositions] = useState<{ [key: string]: [number, number, number] }>({});
  const simulation = useRef<any>(null);

  // Bolt Optimization: Keep a persistent reference to the latest positions state
  // to compare and reuse array references in tick callbacks.
  const positionsRef = useRef<{ [key: string]: [number, number, number] }>({});

  const updatePositionsState = (newPositions: { [key: string]: [number, number, number] }) => {
    positionsRef.current = newPositions;
    setPositions(newPositions);
  };

  useEffect(() => {
    const d3Nodes = nodes.map(node => ({ ...node }));
    const d3Links = nodes.flatMap(node =>
      node.connections.map(targetId => ({
        source: node.id,
        target: targetId
      }))
    );

    simulation.current = (d3 as any).forceSimulation()
      .numDimensions(3)
      .nodes(d3Nodes)
      .force('link', (d3 as any).forceLink(d3Links).id((d: any) => d.id).distance(7))
      .force('charge', (d3 as any).forceManyBody().strength(-50))
      .force('center', (d3 as any).forceCenter(0, 0, 0))
      .force('radial', (d3 as any).forceRadial(10, 0, 0, 0).strength(0.5))
      .on('tick', () => {
        const currentPositions = positionsRef.current;
        const newPositions: { [key: string]: [number, number, number] } = {};
        let changed = false;

        d3Nodes.forEach((node: any) => {
          const x = node.x || 0;
          const y = node.y || 0;
          const z = node.z || 0;

          const prev = currentPositions[node.id];
          // Bolt Optimization: Only allocate a new array if the node has moved
          // beyond a microscopic threshold (1e-4). If the position change is
          // negligible, we reuse the exact same array reference (prev). This
          // is 100% React-compliant, avoids GC thrashing, and allows React.memo
          // to perfectly bail out of rendering stable nodes.
          if (!prev || Math.abs(prev[0] - x) > 1e-4 || Math.abs(prev[1] - y) > 1e-4 || Math.abs(prev[2] - z) > 1e-4) {
            newPositions[node.id] = [x, y, z];
            changed = true;
          } else {
            newPositions[node.id] = prev;
          }
        });

        // Ensure deleted nodes are cleaned up from state
        const prevKeys = Object.keys(currentPositions);
        if (prevKeys.length !== d3Nodes.length) {
          changed = true;
        } else {
          for (let i = 0; i < d3Nodes.length; i++) {
            if (!currentPositions[d3Nodes[i].id]) {
              changed = true;
              break;
            }
          }
        }

        if (changed) {
          updatePositionsState(newPositions);
        }
      });

    return () => simulation.current.stop();
  }, [nodes]);

  // Bolt Optimization: Memoize helper functions to avoid re-creating new function
  // references on every state change/re-render of the parent component.
  const updateNodePosition = useCallback((id: string, pos: [number, number, number]) => {
    if (simulation.current) {
      const node = simulation.current.nodes().find((n: any) => n.id === id);
      if (node) {
        node.fx = pos[0];
        node.fy = pos[1];
        node.fz = pos[2];
        simulation.current.alpha(0.3).restart();
      }
    }
  }, []);

  const releaseNode = useCallback((id: string) => {
    if (simulation.current) {
      const node = simulation.current.nodes().find((n: any) => n.id === id);
      if (node) {
        node.fx = null;
        node.fy = null;
        node.fz = null;
        simulation.current.alpha(0.3).restart();
      }
    }
  }, []);

  return { positions, updateNodePosition, releaseNode };
};
