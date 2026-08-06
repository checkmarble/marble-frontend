import { type GraphRfEdge, type GraphRfNode } from './graph-rf-types';

/** Fallbacks for the first layout pass, before React Flow has measured anything. */
export const DEFAULT_NODE_WIDTH = 180;
export const DEFAULT_NODE_HEIGHT = 56;

export type Point = { x: number; y: number };

export function nodeMeasuredSize(node: GraphRfNode): { width: number; height: number } {
  return {
    width: node.measured?.width ?? node.width ?? DEFAULT_NODE_WIDTH,
    height: node.measured?.height ?? node.height ?? DEFAULT_NODE_HEIGHT,
  };
}

export function nodeCenter(node: GraphRfNode, position: Point = node.position): Point {
  const { width, height } = nodeMeasuredSize(node);
  return { x: position.x + width / 2, y: position.y + height / 2 };
}

export function topLeftFromCenter(center: Point, width: number, height: number): Point {
  return { x: center.x - width / 2, y: center.y - height / 2 };
}

type HandleSide = 't' | 'r' | 'b' | 'l';

/** Dominant axis from source → target (avoids e.g. Top→Bottom when nodes are side-by-side). */
function sideFromDelta(dx: number, dy: number): HandleSide {
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'r' : 'l';
  }
  return dy >= 0 ? 'b' : 't';
}

/** Target handles are bare sides, source handles are `s`-prefixed — see `FourHandles`. */
function handlesForEdge(source: GraphRfNode, target: GraphRfNode) {
  const from = nodeCenter(source);
  const to = nodeCenter(target);
  return {
    sourceHandle: `s${sideFromDelta(to.x - from.x, to.y - from.y)}`,
    targetHandle: sideFromDelta(from.x - to.x, from.y - to.y),
  };
}

/** Re-point every edge at the handles facing its counterpart. Unchanged edges keep identity. */
export function withBestHandles(nodes: GraphRfNode[], edges: GraphRfEdge[]): GraphRfEdge[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return edges.map((edge) => {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target) return edge;
    const { sourceHandle, targetHandle } = handlesForEdge(source, target);
    if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) return edge;
    return { ...edge, sourceHandle, targetHandle };
  });
}
