// @ts-nocheck
import { expect, test, vi } from 'vitest';
import * as React from 'react';
import { useGraphPhysics } from './useGraphPhysics';
import { MemoryNode } from '../types';

// Mock react to spy/intercept the hooks
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: vi.fn(),
    useRef: vi.fn(),
    useEffect: vi.fn(),
    useCallback: vi.fn((fn) => fn),
  };
});

test('useGraphPhysics maintains coordinate array references and avoids unnecessary allocations', () => {
  // Mock implementations
  let stateValue: any = {};
  const setPositionsMock = vi.fn((val) => {
    stateValue = typeof val === 'function' ? val(stateValue) : val;
  });

  vi.mocked(React.useState).mockReturnValue([stateValue, setPositionsMock]);

  const simulationRefObj = { current: null };
  const positionsRefObj = { current: {} as { [key: string]: [number, number, number] } };
  vi.mocked(React.useRef)
    .mockReturnValueOnce(simulationRefObj) // first call is simulation
    .mockReturnValueOnce(positionsRefObj); // second call is positionsRef

  let effectCallback: any = null;
  vi.mocked(React.useEffect).mockImplementation((cb) => {
    effectCallback = cb;
  });

  const mockNodes: MemoryNode[] = [
    {
      id: 'node1',
      type: 'photo',
      title: 'Node 1',
      tags: [],
      date: '2025-01-01',
      connections: ['node2']
    },
    {
      id: 'node2',
      type: 'journal',
      title: 'Node 2',
      tags: [],
      date: '2025-01-01',
      connections: ['node1']
    }
  ];

  // Invoke hook
  useGraphPhysics(mockNodes);

  // Verify useEffect was registered
  expect(effectCallback).toBeTypeOf('function');

  // Run the effect callback to initialize simulation
  effectCallback();

  expect(simulationRefObj.current).not.toBeNull();

  // Retrieve the registered tick handler from simulation
  const simulationObj = simulationRefObj.current as any;
  expect(simulationObj).toBeDefined();

  // Find the 'tick' listener
  const tickListener = simulationObj.on('tick');
  expect(tickListener).toBeTypeOf('function');

  // Let's mock the d3 nodes internally. D3 simulation mutates nodes in-place adding x, y, z
  const d3Nodes = simulationObj.nodes();
  expect(d3Nodes.length).toBe(2);

  // Simulate tick 1 (initial setup)
  d3Nodes[0].x = 1.5;
  d3Nodes[0].y = 2.5;
  d3Nodes[0].z = 3.5;
  d3Nodes[1].x = 4.5;
  d3Nodes[1].y = 5.5;
  d3Nodes[1].z = 6.5;

  tickListener();

  // Now positions state should be updated
  expect(setPositionsMock).toHaveBeenCalledTimes(1);
  const positionsAfterTick1 = setPositionsMock.mock.calls[0][0];
  expect(positionsAfterTick1['node1']).toEqual([1.5, 2.5, 3.5]);
  expect(positionsAfterTick1['node2']).toEqual([4.5, 5.5, 6.5]);

  const node1ArrayRef = positionsAfterTick1['node1'];
  const node2ArrayRef = positionsAfterTick1['node2'];

  // Simulate tick 2 (values change significantly, new arrays should be allocated for reactivity)
  d3Nodes[0].x = 1.9;
  d3Nodes[0].y = 2.9;
  d3Nodes[0].z = 3.9;
  d3Nodes[1].x = 4.9;
  d3Nodes[1].y = 5.9;
  d3Nodes[1].z = 6.9;

  setPositionsMock.mockClear();
  tickListener();

  expect(setPositionsMock).toHaveBeenCalledTimes(1);
  const positionsAfterTick2 = setPositionsMock.mock.calls[0][0];

  // Values are updated
  expect(positionsAfterTick2['node1']).toEqual([1.9, 2.9, 3.9]);
  expect(positionsAfterTick2['node2']).toEqual([4.9, 5.9, 6.9]);

  // Array references should be brand new because they changed significantly
  expect(positionsAfterTick2['node1']).not.toBe(node1ArrayRef);
  expect(positionsAfterTick2['node2']).not.toBe(node2ArrayRef);

  const node1ArrayRef2 = positionsAfterTick2['node1'];
  const node2ArrayRef2 = positionsAfterTick2['node2'];

  // Simulate tick 3 (values change micro-scopically, less than 1e-4, references should be preserved)
  d3Nodes[0].x = 1.9 + 0.00001;
  d3Nodes[0].y = 2.9 - 0.00001;
  d3Nodes[0].z = 3.9 + 0.00001;
  d3Nodes[1].x = 4.9 + 0.00001;
  d3Nodes[1].y = 5.9 - 0.00001;
  d3Nodes[1].z = 6.9 + 0.00001;

  setPositionsMock.mockClear();
  tickListener();

  // Since changes are below threshold, setPositions is NOT called and old references are preserved
  expect(setPositionsMock).not.toHaveBeenCalled();
  expect(positionsRefObj.current['node1']).toBe(node1ArrayRef2);
  expect(positionsRefObj.current['node2']).toBe(node2ArrayRef2);
});
