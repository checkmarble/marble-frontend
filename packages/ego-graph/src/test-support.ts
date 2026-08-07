import type { EgoGraph, LayoutEdge, LayoutNode, Point, Positions } from './types';

/** Matches the fallback size the React Flow adapter uses before measurement. */
export const NODE_SIZE = { width: 180, height: 56 };

export type TestNode = LayoutNode & { satellite?: true };
export type TestEdge = LayoutEdge & { associative?: true };

export function node(id: string, size: { width: number; height: number } = NODE_SIZE): TestNode {
  return { id, ...size };
}

export function satellite(id: string, size: { width: number; height: number } = NODE_SIZE): TestNode {
  return { id, ...size, satellite: true };
}

export function link(source: string, target: string): TestEdge {
  return { source, target };
}

export function match(source: string, target: string): TestEdge {
  return { source, target, associative: true };
}

export const classify = {
  isSatellite: (n: TestNode) => n.satellite === true,
  isStructural: (e: TestEdge) => e.associative !== true,
};

export function graph(nodes: TestNode[], edges: TestEdge[], root: string): EgoGraph<TestNode, TestEdge> {
  return { nodes, edges, root };
}

/** Center of `id` from a layout result. Throws rather than silently returning NaN. */
export function centerOf(positions: Positions, nodes: TestNode[], id: string): Point {
  const position = positions.get(id);
  const found = nodes.find((n) => n.id === id);
  if (!position || !found) throw new Error(`no placement for ${id}`);
  return { x: position.x + found.width / 2, y: position.y + found.height / 2 };
}

export function distance(a: Point, b: Point = { x: 0, y: 0 }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
