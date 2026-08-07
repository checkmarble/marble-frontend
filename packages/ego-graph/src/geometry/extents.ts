import type { LayoutNode, Point, RankDir, SpacingOptions } from '../types';
import { aabbHalfPerp } from './box';

/** Just the two dials the extent math needs. */
export type RadiusSpacing = Required<Pick<SpacingOptions, 'minRingRadius' | 'ringPadding'>>;

/**
 * Half-extent of a laid-out subtree perpendicular to the outward rank axis,
 * measured from the root's center. Cardinal axes only — for an arbitrary ray
 * use {@link lateralHalfExtentAtAngle}.
 */
export function lateralHalfExtent(
  subtreeIds: string[],
  positions: Map<string, Point>,
  nodesById: Map<string, LayoutNode>,
  rootId: string,
  rankdir: RankDir,
): number {
  const rootPos = positions.get(rootId);
  const rootNode = nodesById.get(rootId);
  if (!rootPos || !rootNode) return 0;

  const rootCenter = {
    x: rootPos.x + rootNode.width / 2,
    y: rootPos.y + rootNode.height / 2,
  };

  const horizontal = rankdir === 'LR' || rankdir === 'RL';
  let half = horizontal ? rootNode.height / 2 : rootNode.width / 2;

  for (const id of subtreeIds) {
    const pos = positions.get(id);
    const node = nodesById.get(id);
    if (!pos || !node) continue;
    const cx = pos.x + node.width / 2;
    const cy = pos.y + node.height / 2;
    if (horizontal) {
      half = Math.max(half, Math.abs(cy - rootCenter.y) + node.height / 2);
    } else {
      half = Math.max(half, Math.abs(cx - rootCenter.x) + node.width / 2);
    }
  }

  return half;
}

/**
 * Half-extent of a laid-out subtree perpendicular to the ray at `theta`,
 * measured from the root's center.
 *
 * Unlike {@link lateralHalfExtent} this does not snap to a cardinal axis, so it
 * stays honest for placements that fan to arbitrary angles.
 */
export function lateralHalfExtentAtAngle(
  subtreeIds: string[],
  positions: Map<string, Point>,
  nodesById: Map<string, LayoutNode>,
  rootId: string,
  theta: number,
): number {
  const rootPos = positions.get(rootId);
  const rootNode = nodesById.get(rootId);
  if (!rootPos || !rootNode) return 0;

  const rootCenter = {
    x: rootPos.x + rootNode.width / 2,
    y: rootPos.y + rootNode.height / 2,
  };
  // Unit vector perpendicular to the outbound ray.
  const px = -Math.sin(theta);
  const py = Math.cos(theta);

  let half = aabbHalfPerp(rootNode.width, rootNode.height, theta);

  for (const id of subtreeIds) {
    const pos = positions.get(id);
    const node = nodesById.get(id);
    if (!pos || !node) continue;
    const cx = pos.x + node.width / 2 - rootCenter.x;
    const cy = pos.y + node.height / 2 - rootCenter.y;
    const offset = Math.abs(cx * px + cy * py);
    half = Math.max(half, offset + aabbHalfPerp(node.width, node.height, theta));
  }

  return half;
}

/** Ring radius for `n` items spaced over a full circle (adjacent gap `2π/n`). */
export function computeRingRadius(lateralHalves: number[], spacing: RadiusSpacing): number {
  const n = lateralHalves.length;
  if (n <= 1) return spacing.minRingRadius;
  return computeArcRadius(lateralHalves, (2 * Math.PI) / n, true, spacing);
}

/**
 * Radius so adjacent lateral extents clear each other when placed with the
 * given angular gap between neighbors. When `closed` is true the first and
 * last items are also neighbors (full ring).
 */
export function computeArcRadius(
  lateralHalves: number[],
  adjacentGap: number,
  closed: boolean,
  spacing: RadiusSpacing,
): number {
  const n = lateralHalves.length;
  if (n <= 1) return spacing.minRingRadius;

  let r = spacing.minRingRadius;
  const sinHalf = Math.sin(adjacentGap / 2);
  if (sinHalf <= 1e-6) return r;

  const pairCount = closed ? n : n - 1;
  for (let i = 0; i < pairCount; i++) {
    const j = (i + 1) % n;
    const needed = (lateralHalves[i]! + lateralHalves[j]! + spacing.ringPadding) / (2 * sinHalf);
    r = Math.max(r, needed);
  }
  return r;
}

/**
 * Radius of the outer satellite pocket ring: clears the axis-aligned boxes of
 * everything already placed, measured from the root center, plus padding.
 */
export function computeSatellitePocketRadius(
  placedBoxes: Array<{ center: Point; width: number; height: number }>,
  rootCenter: Point,
  spacing: RadiusSpacing,
): number {
  let r = spacing.minRingRadius;
  for (const { center, width, height } of placedBoxes) {
    const dx = Math.abs(center.x - rootCenter.x) + width / 2;
    const dy = Math.abs(center.y - rootCenter.y) + height / 2;
    // Conservative clearance: distance to farthest bbox corner from the root.
    const dist = Math.hypot(center.x - rootCenter.x, center.y - rootCenter.y);
    const halfDiag = Math.hypot(width / 2, height / 2);
    r = Math.max(r, dist + halfDiag + spacing.ringPadding, dx + spacing.ringPadding, dy + spacing.ringPadding);
  }
  return r;
}
