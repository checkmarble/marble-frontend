import { topLeftFromCenter } from '../geometry/box';
import { resolveOptions } from '../options';
import { buildSpanningTree } from '../tree';
import type { EgoGraph, LayoutEdge, LayoutNode, LayoutOptions, Positions } from '../types';
import { layoutSatellitePockets } from './pockets';
import { layoutPolarTree, polarPocketStrategy } from './polar-subtree';

/**
 * Pure polar "flower petal" placement, all the way down: every node spreads its
 * children over a hemisphere centered on the ray it arrived along.
 *
 * The only layout here with **no dependencies** — nothing in its import graph
 * reaches `@dagrejs/dagre`. Prefers breadth over Dagre's rank discipline, so it
 * suits shallow bushy graphs better than deep ones.
 */
export function polarPetal<N extends LayoutNode = LayoutNode, E extends LayoutEdge = LayoutEdge>(
  graph: EgoGraph<N, E>,
  options: LayoutOptions<N, E> = {},
): Positions {
  const positionById: Positions = new Map();
  if (graph.nodes.length === 0) return positionById;

  const resolved = resolveOptions(options);
  const nodesById = new Map(graph.nodes.map((n) => [n.id, n]));
  const tree = buildSpanningTree(graph, resolved);
  if (!tree.root) return positionById;

  const weightOf = (id: string): number => {
    const node = nodesById.get(id);
    return node ? resolved.getWeight(node) : 1;
  };

  const rootNode = nodesById.get(tree.root)!;
  const rootCenter = { x: 0, y: 0 };
  positionById.set(tree.root, topLeftFromCenter(rootCenter, rootNode.width, rootNode.height));

  const ringThetas: number[] = [];
  layoutPolarTree({
    nodeId: tree.root,
    outboundTheta: null,
    children: tree.children,
    nodesById,
    positionById,
    ringThetas,
    isRoot: true,
    spacing: resolved,
    weightOf,
  });

  layoutSatellitePockets({
    graph,
    tree,
    nodesById,
    positionById,
    rootCenter,
    ringThetas,
    strategy: polarPocketStrategy,
    options: resolved,
  });

  return positionById;
}
