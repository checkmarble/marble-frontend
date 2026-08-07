import type { LayoutEdge, LayoutNode, Point, SpacingOptions } from '../types';

export type PocketContext = {
  /** Every id in this island, including `rootId`. */
  islandIds: string[];
  /** BFS tree edges within the island, rooted at `rootId`. */
  treeEdges: LayoutEdge[];
  rootId: string;
  nodesById: Map<string, LayoutNode>;
  spacing: Required<SpacingOptions>;
  weightOf: (id: string) => number;
};

/**
 * How a satellite's island is sized and drawn in its pocket.
 *
 * Two calls, deliberately separate: the caller measures every island first to
 * pick a shared pocket radius and fan the angles, and only then places.
 */
export type PocketStrategy = {
  measureLateralHalf: (args: PocketContext & { preferredTheta: number }) => number;
  place: (args: PocketContext & { targetCenter: Point; theta: number; positionById: Map<string, Point> }) => void;
};
