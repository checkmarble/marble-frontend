import { type FtmEntityPersonOption } from '@app-builder/models/data-model';
import { type Edge, type Node } from '@xyflow/react';

export type PersonRfData = {
  label: string;
  subEntity: FtmEntityPersonOption;
  isStart: boolean;
  objectType: string;
  objectId: string;
  /** Set on a branch root the user drilled into: it can be regrouped. */
  isExpandedClusterRoot?: boolean;
};

export type PivotRfData = {
  label: string;
  rawType: string;
};

/** A collapsed branch. `memberIds` are the node ids folded away, `rootId` the branch root. */
export type ClusterRfData = {
  rootId: string;
  /** The branch entry point, rendered on the chip like a person node. */
  root: PersonRfData;
  nodeCount: number;
  internalEdgeCount: number;
  memberIds: string[];
};

export type PersonRfNode = Node<PersonRfData, 'person'>;
export type PivotRfNode = Node<PivotRfData, 'pivot'>;
export type ClusterRfNode = Node<ClusterRfData, 'cluster'>;
export type GraphRfNode = PersonRfNode | PivotRfNode | ClusterRfNode;

/** `mergedCount` is set on synthetic edges standing in for N collapsed member edges. */
export type GraphRfEdge = Edge<{ kind?: string; mergedCount?: number }, 'link' | 'match'>;
