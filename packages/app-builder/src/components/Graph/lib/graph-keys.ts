import { type FtmEntityPersonOption, type FtmEntityV2 } from '@app-builder/models/data-model';

/**
 * Every graph node id is the composite key `${objectType}:${objectId}`.
 * Cluster chips are the one exception: they prefix the key of the branch root
 * they folded away, so {@link rootNodeId} maps a chip back into the same space.
 */

export type GraphObjectRef = {
  objectType: string;
  objectId: string;
  /** Graph node metadata label. */
  label?: string;
  /** Risk level from the graph payload metadata (not a live score fetch). */
  riskLevel?: number;
  /** Table semantic type from the data model (`person` / `account` / `transaction` / `event` / `other`). */
  semanticType?: FtmEntityV2;
  /** Person table subtype from the data model (`natural` / `moral` / `generic`). */
  subEntity?: FtmEntityPersonOption;
};

export function nodeKey(objectType: string, objectId: string): string {
  return `${objectType}:${objectId}`;
}

export function parseNodeKey(key: string): GraphObjectRef {
  const colonIdx = key.indexOf(':');
  return {
    objectType: key.slice(0, colonIdx),
    objectId: key.slice(colonIdx + 1),
  };
}

/** Prefix keeps chip ids out of the `${objectType}:${objectId}` key space. */
const CLUSTER_ID_PREFIX = '__cluster__:';

export function clusterNodeId(rootNodeId: string): string {
  return `${CLUSTER_ID_PREFIX}${rootNodeId}`;
}

/**
 * The node a chip stands for: a cluster resolves to its branch root, every other
 * node to itself. Selection and checkboxes work in this space.
 */
export function rootNodeId(nodeId: string): string {
  return nodeId.startsWith(CLUSTER_ID_PREFIX) ? nodeId.slice(CLUSTER_ID_PREFIX.length) : nodeId;
}
