import type { ClassifyOptions, LayoutEdge, LayoutNode, LayoutOptions, SpacingOptions } from './types';

/**
 * Tuned against ~180x56 nodes. If yours are much larger, scale these up —
 * nothing here derives spacing from the nodes it is spacing.
 */
export const DEFAULT_SPACING: Required<SpacingOptions> = {
  nodeSep: 80,
  rankSep: 100,
  minRingRadius: 220,
  ringPadding: 60,
  satelliteGap: Math.PI / 3,
  minSatelliteGap: Math.PI / 12,
};

export type ResolvedOptions<N extends LayoutNode, E extends LayoutEdge> = Required<SpacingOptions> &
  Required<ClassifyOptions<N, E>>;

/** Fill in every dial and predicate, so nothing downstream has to handle `undefined`. */
export function resolveOptions<N extends LayoutNode, E extends LayoutEdge>(
  options: LayoutOptions<N, E> = {},
): ResolvedOptions<N, E> {
  return {
    ...DEFAULT_SPACING,
    ...options,
    isStructural: options.isStructural ?? (() => true),
    isSatellite: options.isSatellite ?? (() => false),
    getWeight: options.getWeight ?? (() => 1),
  };
}
