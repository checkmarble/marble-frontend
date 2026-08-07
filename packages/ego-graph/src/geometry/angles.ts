import type { Point, RankDir } from '../types';

/** Slot angle: 12 o'clock, increasing clockwise (screen y-down). */
export function slotAngle(slotIndex: number, slotCount: number): number {
  return Math.PI / 2 + (2 * Math.PI * slotIndex) / slotCount;
}

/** Normalize angle into (-π, π]. */
export function normalizeAngle(theta: number): number {
  let a = theta;
  while (a <= -Math.PI) a += 2 * Math.PI;
  while (a > Math.PI) a -= 2 * Math.PI;
  return a;
}

/** Smallest signed delta from `from` to `to` in (-π, π]. */
export function angleDelta(from: number, to: number): number {
  return normalizeAngle(to - from);
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

/** The axis a rankdir grows along, as an angle. */
export function rankdirAxisAngle(rankdir: RankDir): number {
  switch (rankdir) {
    case 'LR':
      return 0;
    case 'TB':
      return Math.PI / 2;
    case 'RL':
      return Math.PI;
    case 'BT':
      return -Math.PI / 2;
  }
}

export function rotateOffset(dx: number, dy: number, delta: number): Point {
  const c = Math.cos(delta);
  const s = Math.sin(delta);
  return { x: dx * c - dy * s, y: dx * s + dy * c };
}

/** Sector center angles: full circle when `outboundTheta` is null, else outward hemisphere. */
export function sectorAngles(sectorCount: number, outboundTheta: number | null): number[] {
  if (sectorCount <= 0) return [];
  if (outboundTheta == null) {
    return Array.from({ length: sectorCount }, (_, i) => slotAngle(i, sectorCount));
  }
  const span = Math.PI;
  const start = outboundTheta - span / 2;
  const width = span / sectorCount;
  return Array.from({ length: sectorCount }, (_, i) => start + width * (i + 0.5));
}

/**
 * Preferred pocket angle for a satellite: direction from the root center toward
 * the centroid of its already-placed associative neighbours.
 *
 * Returns `null` when there are no placed anchors — the caller should fall back
 * to {@link largestFreeGapAngle}.
 */
export function preferredSatelliteAngle(rootCenter: Point, placedNeighborCenters: Point[]): number | null {
  if (placedNeighborCenters.length === 0) return null;

  let sx = 0;
  let sy = 0;
  for (const p of placedNeighborCenters) {
    sx += p.x;
    sy += p.y;
  }
  const cx = sx / placedNeighborCenters.length;
  const cy = sy / placedNeighborCenters.length;
  return Math.atan2(cy - rootCenter.y, cx - rootCenter.x);
}

/**
 * Angle in the middle of the largest gap between existing level-1 slot angles.
 * Used when a satellite has no placed anchors. Falls back to east (0) when
 * there are no slots to avoid.
 */
export function largestFreeGapAngle(ringThetas: number[]): number {
  if (ringThetas.length === 0) return 0;

  const sorted = [...ringThetas].map(normalizeAngle).sort((a, b) => a - b);
  let bestMid = sorted[0]!;
  let bestGap = -Infinity;

  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const next = i + 1 < sorted.length ? sorted[i + 1]! : sorted[0]! + 2 * Math.PI;
    const gap = next - cur;
    if (gap > bestGap) {
      bestGap = gap;
      bestMid = normalizeAngle(cur + gap / 2);
    }
  }

  return bestMid;
}
