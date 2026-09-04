import { type ClassifyOptions, type CustomLayoutOptions, type LayoutNode } from 'ego-graph';
import { customLayout } from 'ego-graph/dagre';
import { type FoldPlan, foldGraph } from 'ego-graph/fold';
import { applyPositions, retargetHandles, toLayoutGraph } from 'ego-graph/react-flow';
import { clusterNodeId } from './graph-keys';
import { type ClusterRfNode, type GraphRfEdge, type GraphRfNode, isMatchEdge } from './graph-rf-types';

/** What `toLayoutGraph` hands the layout: our RF node plus a required footprint. */
type LaidOutRfNode = GraphRfNode & LayoutNode;

/**
 * Marble's half of the contract with `ego-graph`: which of our node types the
 * layout must keep out of the tree, which of our edges carry hierarchy, and how
 * much room a chip should be given.
 */
const CLASSIFY: ClassifyOptions<LaidOutRfNode, GraphRfEdge> = {
  isSatellite: (node) => node.type === 'pivot',
  isStructural: (edge) => !isMatchEdge(edge),
  getWeight: (node) => (node.type === 'cluster' ? node.data.nodeCount : 1),
};

const LAYOUT: CustomLayoutOptions<LaidOutRfNode, GraphRfEdge> = {
  ...CLASSIFY,
  // adjust the thresholds here for a better rendering
  innerRingCapacity: 5,
  firstLayer: [{ upTo: 4, mode: 'dagre' }, { upTo: 12, mode: 'radial' }, { mode: 'bubble' }],
  nextLayers: [
    { upTo: 5, mode: 'dagre' },
    { upTo: 15, mode: 'radial' },
    { mode: 'cloud', threshold: 8 },
  ],
};

/** A chip is drawn like a person card, so it gets that footprint before measurement. */
const CHIP_SIZE = { width: 192, height: 72 };

export function layoutGraph(
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
  startKey: string,
): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } {
  if (nodes.length === 0) return { nodes, edges };

  const graph = toLayoutGraph(nodes, edges, startKey);
  const positions = customLayout(graph, LAYOUT);

  const laid = applyPositions(nodes, positions);
  return { nodes: laid, edges: retargetHandles(laid, edges) };
}

/** Re-point every edge at the handles facing its counterpart. */
export function withBestHandles(nodes: GraphRfNode[], edges: GraphRfEdge[]): GraphRfEdge[] {
  return retargetHandles(nodes, edges);
}

export type ClusterOptions = {
  startKey: string;
  /** A branch collapses once its foldable size *exceeds* this. `0` disables clustering. */
  threshold: number;
  /** Branch roots the user drilled into; their chips are suppressed. */
  expandedRootIds: Set<string>;
};

/**
 * Turn a {@link FoldPlan} into the chips and merged edges React Flow renders.
 *
 * The plan says *what* collapses; every decision about what a chip looks like
 * (its id scheme, its 192x72 footprint, the record payload it carries, the
 * `agg:` edge ids) lives here, because none of it means anything to a graph
 * layout library.
 */
function materialise(
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
  plan: FoldPlan,
): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } {
  if (plan.folds.length === 0 && plan.heldOpen.length === 0) return { nodes, edges };

  const nodesById = new Map(nodes.map((n) => [n.id, n]));

  // Chips reuse the record card (`PersonRfData`), so only record nodes can head
  // one. RF type `person` is every table-backed node (person, account,
  // transaction, ...) not a person-only domain. Pivots never reach the planner
  // (satellites); hypernodes in the tree are skipped rather than drawn as a record.
  const chips: ClusterRfNode[] = [];
  const foldedIds = new Set<string>();
  const chipIdByRoot = new Map<string, string>();

  for (const fold of plan.folds) {
    const rootNode = nodesById.get(fold.rootId);
    if (rootNode?.type !== 'person') continue;

    const chipId = clusterNodeId(fold.rootId);
    chipIdByRoot.set(fold.rootId, chipId);
    for (const id of fold.memberIds) foldedIds.add(id);

    chips.push({
      id: chipId,
      position: { x: 0, y: 0 },
      ...CHIP_SIZE,
      type: 'cluster',
      data: {
        root: rootNode.data,
        nodeCount: fold.memberIds.length,
        internalEdgeCount: fold.internalEdgeCount,
        memberIds: fold.memberIds,
      },
    });
  }

  const mergedEdges: GraphRfEdge[] = [];
  for (const merged of plan.mergedEdges) {
    const source = chipIdByRoot.get(merged.source) ?? merged.source;
    const target = chipIdByRoot.get(merged.target) ?? merged.target;
    // Neither end became a chip, so the original edges already say this.
    if (source === merged.source && target === merged.target) continue;

    mergedEdges.push({
      id: `agg:${source}->${target}`,
      source,
      target,
      type: merged.allAssociative ? 'match' : 'link',
      animated: true,
      data: { kind: merged.allAssociative ? 'match' : 'link', mergedCount: merged.mergedFrom.length },
    });
  }

  const heldOpen = new Set(plan.heldOpen);
  const survivors = nodes
    .filter((n) => !foldedIds.has(n.id))
    .map((n) =>
      n.type === 'person' && heldOpen.has(n.id) ? { ...n, data: { ...n.data, isExpandedClusterRoot: true } } : n,
    );

  const passthrough = edges.filter((e) => !foldedIds.has(e.source) && !foldedIds.has(e.target));

  return { nodes: [...survivors, ...chips], edges: [...passthrough, ...mergedEdges] };
}

/** Fold branches of the graph into chips, ready for React Flow. */
export function clusterGraphElements(
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
  options: ClusterOptions,
): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } {
  if (options.threshold <= 0 || nodes.length === 0) return { nodes, edges };

  const plan = foldGraph(toLayoutGraph(nodes, edges, options.startKey), {
    ...CLASSIFY,
    threshold: options.threshold,
    expandedRoots: options.expandedRootIds,
  });

  return materialise(nodes, edges, plan);
}
