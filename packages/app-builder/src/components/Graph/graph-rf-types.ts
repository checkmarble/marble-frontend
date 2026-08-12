import { type FtmEntityPersonOption } from '@app-builder/models/data-model';
import { type Edge, type Node } from '@xyflow/react';

export type PersonRfData = {
  label: string;
  subEntity: FtmEntityPersonOption;
  isStart: boolean;
  objectType: string;
  objectId: string;
  /** Risk level from the graph payload metadata (not a live score fetch). */
  riskLevel?: number;
  /** Tag ids from the graph payload metadata (not a live annotations fetch). */
  tagIds: string[];
  /** Set on a branch root the user drilled into: it can be regrouped. */
  isExpandedClusterRoot?: boolean;
};

export type PivotRfData = {
  label: string;
  rawType: string;
};

export type HypernodeRfData = {
  count: number;
  objectType: string;
  objectId: string;
};

/**
 * A collapsed branch. `memberIds` are the node ids folded away; the branch root
 * is `root`, and the chip's own id is `clusterNodeId(<root node id>)`.
 */
export type ClusterRfData = {
  /** The branch entry point, rendered on the chip like a person node. */
  root: PersonRfData;
  nodeCount: number;
  internalEdgeCount: number;
  memberIds: string[];
};

export type PersonRfNode = Node<PersonRfData, 'person'>;
export type PivotRfNode = Node<PivotRfData, 'pivot'>;
export type HypernodeRfNode = Node<HypernodeRfData, 'hypernode'>;
export type ClusterRfNode = Node<ClusterRfData, 'cluster'>;
export type GraphRfNode = PersonRfNode | PivotRfNode | HypernodeRfNode | ClusterRfNode;

/** `mergedCount` is set on synthetic edges standing in for N collapsed member edges. */
export type GraphRfEdge = Edge<{ kind?: string; mergedCount?: number }, 'link' | 'match' | 'hypernode'>;

/** `type` and `data.kind` can each carry the match flag depending on who built the edge. */
export function isMatchEdge(edge: GraphRfEdge): boolean {
  if (edge.type === 'hypernode') return false;
  return edge.type === 'match' || edge.data?.kind === 'match';
}

export function isLinkEdge(edge: GraphRfEdge): boolean {
  return !isMatchEdge(edge);
}
