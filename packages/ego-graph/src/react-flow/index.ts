import type { EgoGraph, LayoutEdge, LayoutNode, Point, Positions } from '../types';

/**
 * These describe React Flow's node and edge shapes structurally, so this
 * adapter has no dependency on `@xyflow/react` — not even a type-only one.
 * Anything with the same fields works, svelte-flow included.
 */
export type MeasuredNode = {
  id: string;
  position: Point;
  measured?: { width?: number | null; height?: number | null } | null;
  width?: number | null;
  height?: number | null;
};

export type HandledEdge = {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

/** Used until React Flow has measured a node for real. */
export const DEFAULT_NODE_SIZE = { width: 180, height: 56 };

export function measuredSize(
  node: MeasuredNode,
  fallback: { width: number; height: number } = DEFAULT_NODE_SIZE,
): { width: number; height: number } {
  return {
    width: node.measured?.width ?? node.width ?? fallback.width,
    height: node.measured?.height ?? node.height ?? fallback.height,
  };
}

/**
 * Project React Flow nodes and edges onto the layout's minimal shape.
 *
 * Extra fields ride along untouched, so predicates you pass to a layout still
 * see your own node — `isSatellite: n => n.type === 'pivot'` works.
 */
export function toLayoutGraph<N extends MeasuredNode, E extends LayoutEdge>(
  nodes: N[],
  edges: E[],
  root: string,
  fallback?: { width: number; height: number },
): EgoGraph<N & LayoutNode, E> {
  return {
    nodes: nodes.map((node) => ({ ...node, ...measuredSize(node, fallback) })),
    edges,
    root,
  };
}

/** Write computed positions back. Nodes the layout did not place keep theirs. */
export function applyPositions<N extends MeasuredNode>(nodes: N[], positions: Positions): N[] {
  return nodes.map((node) => {
    const position = positions.get(node.id);
    return position ? { ...node, position } : node;
  });
}

export type HandleSide = 't' | 'r' | 'b' | 'l';

/**
 * Map a side to the handle id your node component renders.
 *
 * The default matches the eight-handle node in the README: bare sides for
 * targets (`t` `r` `b` `l`), `s`-prefixed for sources (`st` `sr` `sb` `sl`).
 * Override it if your nodes name their handles differently.
 */
export type HandleIdMapper = (side: HandleSide, kind: 'source' | 'target') => string;

export const defaultHandleId: HandleIdMapper = (side, kind) => (kind === 'source' ? `s${side}` : side);

/** Dominant axis, so side-by-side nodes connect left/right rather than top/bottom. */
function sideFromDelta(dx: number, dy: number): HandleSide {
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'r' : 'l';
  }
  return dy >= 0 ? 'b' : 't';
}

/**
 * Re-point every edge at the handles facing its counterpart. Call this *after*
 * {@link applyPositions} — it reads `node.position`.
 *
 * Edges whose handles are already correct are returned by identity, so React
 * Flow will not re-render them.
 */
export function retargetHandles<N extends MeasuredNode, E extends HandledEdge>(
  nodes: N[],
  edges: E[],
  handleId: HandleIdMapper = defaultHandleId,
  fallback?: { width: number; height: number },
): Array<E & HandledEdge> {
  const centers = new Map<string, Point>();
  for (const node of nodes) {
    const { width, height } = measuredSize(node, fallback);
    centers.set(node.id, { x: node.position.x + width / 2, y: node.position.y + height / 2 });
  }

  return edges.map((edge) => {
    const from = centers.get(edge.source);
    const to = centers.get(edge.target);
    if (!from || !to) return edge;

    const sourceHandle = handleId(sideFromDelta(to.x - from.x, to.y - from.y), 'source');
    const targetHandle = handleId(sideFromDelta(from.x - to.x, from.y - to.y), 'target');
    if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) return edge;

    return { ...edge, sourceHandle, targetHandle };
  });
}
