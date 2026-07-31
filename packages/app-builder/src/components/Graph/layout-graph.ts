import Dagre from '@dagrejs/dagre';
import { type GraphRfEdge, type GraphRfNode, withBestHandles } from './GraphComponents';
import { bfsSpanningTreeEdges } from './utils';

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 56;
const NODESEP = 80;
const RANKSEP = 100;
/** Minimum ring radius so L1 nodes clear the start node. */
const RING_RADIUS_MIN = 220;
/** Extra space between adjacent subtree lateral extents. */
const RING_PADDING = 60;

type RankDir = 'TB' | 'BT' | 'LR' | 'RL';
type Point = { x: number; y: number };

function nodeMeasuredSize(node: GraphRfNode): { width: number; height: number } {
  return {
    width: node.measured?.width ?? node.width ?? DEFAULT_NODE_WIDTH,
    height: node.measured?.height ?? node.height ?? DEFAULT_NODE_HEIGHT,
  };
}

function topLeftFromCenter(center: Point, width: number, height: number): Point {
  return { x: center.x - width / 2, y: center.y - height / 2 };
}

/** Build parent → children adjacency from directed tree edges. */
function buildChildrenMap(treeEdges: Array<{ source: string; target: string }>): Map<string, string[]> {
  const children = new Map<string, string[]>();
  for (const { source, target } of treeEdges) {
    const list = children.get(source) ?? [];
    list.push(target);
    children.set(source, list);
  }
  return children;
}

/** Subtree size including `id` itself. */
function descendantCount(children: Map<string, string[]>, id: string): number {
  let count = 1;
  for (const child of children.get(id) ?? []) {
    count += descendantCount(children, child);
  }
  return count;
}

function collectSubtreeIds(children: Map<string, string[]>, rootId: string): string[] {
  const ids: string[] = [];
  const stack = [rootId];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    ids.push(cur);
    const kids = children.get(cur);
    if (kids) {
      for (let i = kids.length - 1; i >= 0; i--) {
        stack.push(kids[i]!);
      }
    }
  }
  return ids;
}

/**
 * Heaviest-first greedy: each item goes in the open slot whose nearest
 * already-placed neighbors have the smallest combined weight.
 */
export function greedySlotOrder(items: Array<{ id: string; weight: number }>): string[] {
  const n = items.length;
  if (n === 0) return [];

  const slots: Array<string | null> = Array.from({ length: n }, () => null);
  const slotWeight = Array.from({ length: n }, () => 0);
  const sorted = [...items].sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));

  for (const item of sorted) {
    let bestSlot = -1;
    let bestScore = Infinity;

    for (let s = 0; s < n; s++) {
      if (slots[s] !== null) continue;

      let leftW = 0;
      let leftDist = 0;
      let rightW = 0;
      let rightDist = 0;
      for (let d = 1; d < n; d++) {
        const left = (s - d + n) % n;
        if (slots[left] !== null) {
          leftW = slotWeight[left]!;
          leftDist = d;
          break;
        }
      }
      for (let d = 1; d < n; d++) {
        const right = (s + d) % n;
        if (slots[right] !== null) {
          rightW = slotWeight[right]!;
          rightDist = d;
          break;
        }
      }

      // Distance-weighted so opposite empty slots beat adjacent ones when only
      // one neighbor is placed (plain sum would tie and pick the next index).
      const score = (leftDist > 0 ? leftW / leftDist : 0) + (rightDist > 0 ? rightW / rightDist : 0);
      if (score < bestScore || (score === bestScore && (bestSlot < 0 || s < bestSlot))) {
        bestScore = score;
        bestSlot = s;
      }
    }

    slots[bestSlot] = item.id;
    slotWeight[bestSlot] = item.weight;
  }

  return slots as string[];
}

/** Slot angle: 12 o'clock, increasing clockwise (screen y-down). */
export function slotAngle(slotIndex: number, slotCount: number): number {
  return Math.PI / 2 + (2 * Math.PI * slotIndex) / slotCount;
}

/** Outward Dagre rankdir from angle (nearest cardinal axis). */
export function rankdirFromAngle(theta: number): RankDir {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  if (Math.abs(cos) >= Math.abs(sin)) {
    return cos >= 0 ? 'LR' : 'RL';
  }
  return sin >= 0 ? 'TB' : 'BT';
}

/**
 * Layout a subtree with Dagre. Positions are React Flow top-left.
 * Returns a map of node id → position for every id in `subtreeIds`.
 */
function layoutSubtreeLocal(
  subtreeIds: string[],
  treeEdges: Array<{ source: string; target: string }>,
  nodesById: Map<string, GraphRfNode>,
  rankdir: RankDir,
): Map<string, Point> {
  const idSet = new Set(subtreeIds);
  const positions = new Map<string, Point>();

  if (subtreeIds.length === 1) {
    const id = subtreeIds[0]!;
    const node = nodesById.get(id);
    if (!node) return positions;
    const { width, height } = nodeMeasuredSize(node);
    positions.set(id, topLeftFromCenter({ x: 0, y: 0 }, width, height));
    return positions;
  }

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir,
    nodesep: NODESEP,
    ranksep: RANKSEP,
  });

  for (const id of subtreeIds) {
    const node = nodesById.get(id);
    if (!node) continue;
    const { width, height } = nodeMeasuredSize(node);
    g.setNode(id, { width, height });
  }

  for (const edge of treeEdges) {
    if (!idSet.has(edge.source) || !idSet.has(edge.target)) continue;
    g.setEdge(edge.source, edge.target);
  }

  Dagre.layout(g);

  for (const id of subtreeIds) {
    const positioned = g.node(id);
    const node = nodesById.get(id);
    if (!positioned || !node) continue;
    const { width, height } = nodeMeasuredSize(node);
    positions.set(id, {
      x: positioned.x - width / 2,
      y: positioned.y - height / 2,
    });
  }

  return positions;
}

/** Half-extent of the subtree perpendicular to the outward (rank) axis, from the root center. */
function lateralHalfExtent(
  subtreeIds: string[],
  positions: Map<string, Point>,
  nodesById: Map<string, GraphRfNode>,
  rootId: string,
  rankdir: RankDir,
): number {
  const rootPos = positions.get(rootId);
  const rootNode = nodesById.get(rootId);
  if (!rootPos || !rootNode) return DEFAULT_NODE_WIDTH / 2;

  const rootSize = nodeMeasuredSize(rootNode);
  const rootCenter = {
    x: rootPos.x + rootSize.width / 2,
    y: rootPos.y + rootSize.height / 2,
  };

  const horizontal = rankdir === 'LR' || rankdir === 'RL';
  let half = horizontal ? rootSize.height / 2 : rootSize.width / 2;

  for (const id of subtreeIds) {
    const pos = positions.get(id);
    const node = nodesById.get(id);
    if (!pos || !node) continue;
    const { width, height } = nodeMeasuredSize(node);
    const cx = pos.x + width / 2;
    const cy = pos.y + height / 2;
    if (horizontal) {
      half = Math.max(half, Math.abs(cy - rootCenter.y) + height / 2);
    } else {
      half = Math.max(half, Math.abs(cx - rootCenter.x) + width / 2);
    }
  }

  return half;
}

function computeRingRadius(lateralHalves: number[]): number {
  const n = lateralHalves.length;
  if (n <= 1) return RING_RADIUS_MIN;

  let r = RING_RADIUS_MIN;
  const sinHalf = Math.sin(Math.PI / n);
  if (sinHalf > 1e-6) {
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const needed = (lateralHalves[i]! + lateralHalves[j]! + RING_PADDING) / (2 * sinHalf);
      r = Math.max(r, needed);
    }
  }
  return r;
}

/**
 * Radial L1 ring + per-subtree Dagre layout.
 * Uses a BFS spanning tree from `startKey` for structure; all edges remain for rendering.
 */
export function layoutGraphElements(
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
  startKey: string,
): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } {
  if (nodes.length === 0) return { nodes, edges };

  const nodesById = new Map(nodes.map((n) => [n.id, n]));
  const resolvedStart = nodesById.has(startKey) ? startKey : (nodes[0]?.id ?? '');
  if (!resolvedStart) return { nodes, edges };

  const treeEdges = bfsSpanningTreeEdges(
    nodes.map((n) => n.id),
    edges,
    resolvedStart,
  );
  const children = buildChildrenMap(treeEdges);
  const l1Ids = children.get(resolvedStart) ?? [];

  const positionById = new Map<string, Point>();

  // Start at origin (center).
  const startNode = nodesById.get(resolvedStart)!;
  const startSize = nodeMeasuredSize(startNode);
  positionById.set(resolvedStart, topLeftFromCenter({ x: 0, y: 0 }, startSize.width, startSize.height));

  if (l1Ids.length === 0) {
    const laidNodes = nodes.map((node) => {
      const pos = positionById.get(node.id);
      return pos ? { ...node, position: pos } : node;
    });
    return { nodes: laidNodes, edges: withBestHandles(laidNodes, edges) };
  }

  const weighted = l1Ids.map((id) => ({
    id,
    weight: descendantCount(children, id),
  }));
  const orderedL1 = greedySlotOrder(weighted);
  const n = orderedL1.length;

  type SubtreeLayout = {
    id: string;
    theta: number;
    subtreeIds: string[];
    localPositions: Map<string, Point>;
    lateralHalf: number;
  };

  const subtreeLayouts: SubtreeLayout[] = orderedL1.map((id, slotIndex) => {
    const theta = slotAngle(slotIndex, n);
    const rankdir = rankdirFromAngle(theta);
    const subtreeIds = collectSubtreeIds(children, id);
    const localPositions = layoutSubtreeLocal(subtreeIds, treeEdges, nodesById, rankdir);
    const lateralHalf = lateralHalfExtent(subtreeIds, localPositions, nodesById, id, rankdir);
    return { id, theta, subtreeIds, localPositions, lateralHalf };
  });

  const radius = computeRingRadius(subtreeLayouts.map((s) => s.lateralHalf));

  for (const layout of subtreeLayouts) {
    const targetCenter = {
      x: radius * Math.cos(layout.theta),
      y: radius * Math.sin(layout.theta),
    };

    const localRoot = layout.localPositions.get(layout.id);
    const rootNode = nodesById.get(layout.id);
    if (!localRoot || !rootNode) continue;

    const rootSize = nodeMeasuredSize(rootNode);
    const localRootCenter = {
      x: localRoot.x + rootSize.width / 2,
      y: localRoot.y + rootSize.height / 2,
    };
    const dx = targetCenter.x - localRootCenter.x;
    const dy = targetCenter.y - localRootCenter.y;

    for (const nodeId of layout.subtreeIds) {
      const local = layout.localPositions.get(nodeId);
      if (!local) continue;
      positionById.set(nodeId, { x: local.x + dx, y: local.y + dy });
    }
  }

  const laidNodes = nodes.map((node) => {
    const pos = positionById.get(node.id);
    return pos ? { ...node, position: pos } : node;
  });

  return {
    nodes: laidNodes,
    edges: withBestHandles(laidNodes, edges),
  };
}
