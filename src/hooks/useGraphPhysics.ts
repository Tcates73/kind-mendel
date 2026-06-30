import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-force-3d';
import { MemoryNode } from '../types';

export const useGraphPhysics = (nodes: MemoryNode[]) => {
  const [positions, setPositions] = useState<{ [key: string]: [number, number, number] }>({});
  const simulation = useRef<any>(null);

  useEffect(() => {
    const d3Nodes = nodes.map(node => ({ ...node }));
    const d3Links = nodes.flatMap(node =>
      node.connections.map(targetId => ({
        source: node.id,
        target: targetId
      }))
    );

    simulation.current = (d3 as any).forceSimulation(d3Nodes)
      .force('link', (d3 as any).forceLink(d3Links).id((d: any) => d.id).distance(7))
      .force('charge', (d3 as any).forceManyBody().strength(-50))
      .force('center', (d3 as any).forceCenter(0, 0, 0))
      .force('radial', (d3 as any).forceRadial(10, 0, 0, 0).strength(0.5))
      .on('tick', () => {
        const newPositions: { [key: string]: [number, number, number] } = {};
        d3Nodes.forEach((node: any) => {
          newPositions[node.id] = [node.x || 0, node.y || 0, node.z || 0];
        });
        setPositions(newPositions);
      });

    return () => simulation.current.stop();
  }, [nodes]);

  const updateNodePosition = (id: string, pos: [number, number, number]) => {
    if (simulation.current) {
      const node = simulation.current.nodes().find((n: any) => n.id === id);
      if (node) {
        node.fx = pos[0];
        node.fy = pos[1];
        node.fz = pos[2];
        simulation.current.alpha(0.3).restart();
      }
    }
  };

  const releaseNode = (id: string) => {
    if (simulation.current) {
      const node = simulation.current.nodes().find((n: any) => n.id === id);
      if (node) {
        node.fx = null;
        node.fy = null;
        node.fz = null;
        simulation.current.alpha(0.3).restart();
      }
    }
  };

  return { positions, updateNodePosition, releaseNode };
};
