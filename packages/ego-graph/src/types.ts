export type Point = { x: number; y: number };

/**
 * The minimal node contract: an id and a footprint. No renderer, no payload.
 * Bring your own node type — anything structurally assignable works.
 */
export type LayoutNode = { id: string; width: number; height: number };

/**
 * The minimal edge contract. Edge identity is the caller's business; the layout
 * only ever needs to know what connects to what.
 */
export type LayoutEdge = { source: string; target: string };

/** A graph seen from one node. `root` is the ego. */
export type EgoGraph<N extends LayoutNode = LayoutNode, E extends LayoutEdge = LayoutEdge> = {
  nodes: N[];
  edges: E[];
  root: string;
};

/** Top-left positions keyed by node id, matching the React Flow convention. */
export type Positions = Map<string, Point>;

/** Direction a Dagre sub-layout grows in. */
export type RankDir = 'TB' | 'BT' | 'LR' | 'RL';

/**
 * Which edges define the hierarchy, which nodes refuse to join it, and how much
 * room each node's branch deserves.
 *
 * The two predicates are orthogonal. `isSatellite` is a *role*: a satellite is
 * never in the spanning tree no matter what edges it has. `isStructural` is a
 * property of the *edge*: an associative edge is rendered but never positional,
 * even between two ordinary nodes.
 */
export type ClassifyOptions<N extends LayoutNode = LayoutNode, E extends LayoutEdge = LayoutEdge> = {
  /** Does this edge define hierarchy? Default: every edge does. */
  isStructural?: (edge: E) => boolean;
  /** Should this node be kept out of the tree and parked on the periphery? Default: none are. */
  isSatellite?: (node: N) => boolean;
  /**
   * How many nodes does this one stand for? Default: 1.
   * Return the member count for a node standing in for a folded branch, so the
   * ring gives it the room its contents would have needed.
   */
  getWeight?: (node: N) => number;
};

/** Spacing dials. All lengths in the same units as node width/height. */
export type SpacingOptions = {
  /** Gap between siblings within a Dagre sub-layout. */
  nodeSep?: number;
  /** Gap between ranks within a Dagre sub-layout. */
  rankSep?: number;
  /** Floor on the first ring's radius, so level-1 nodes clear the root. */
  minRingRadius?: number;
  /** Extra space between adjacent subtrees' lateral extents. */
  ringPadding?: number;
  /**
   * Satellites whose preferred angles fall within this circular distance count
   * as wanting the same side, and get fanned along an outer arc rather than
   * stacked on one ray.
   */
  satelliteGap?: number;
  /** Floor on the angular separation between fanned satellites. */
  minSatelliteGap?: number;
};

export type LayoutOptions<N extends LayoutNode = LayoutNode, E extends LayoutEdge = LayoutEdge> = ClassifyOptions<
  N,
  E
> &
  SpacingOptions;
