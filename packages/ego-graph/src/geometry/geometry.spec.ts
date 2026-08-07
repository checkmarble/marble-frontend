import { describe, expect, it } from 'vitest';
import { claimUnplacedComponent, fanSatelliteAngles } from '../layouts/pockets';
import { DEFAULT_SPACING } from '../options';
import { largestFreeGapAngle, normalizeAngle, preferredSatelliteAngle } from './angles';

describe('preferredSatelliteAngle', () => {
  it('returns null when there are no placed anchors', () => {
    expect(preferredSatelliteAngle({ x: 0, y: 0 }, [])).toBeNull();
  });

  it('points toward the centroid of placed neighbours', () => {
    const theta = preferredSatelliteAngle({ x: 0, y: 0 }, [
      { x: 100, y: 0 },
      { x: 200, y: 0 },
    ]);
    expect(theta).not.toBeNull();
    expect(theta!).toBeCloseTo(0, 5);
  });
});

describe('largestFreeGapAngle', () => {
  it('defaults to east when there are no ring slots', () => {
    expect(largestFreeGapAngle([])).toBe(0);
  });

  it('returns the midpoint of the largest gap between ring angles', () => {
    // Clustered on the right; the largest open sector is the left half-plane.
    const mid = largestFreeGapAngle([-0.2, 0, 0.2]);
    // Wrap gap from 0.2 → (-0.2 + 2π); midpoint ≈ π.
    expect(Math.abs(normalizeAngle(mid - Math.PI))).toBeLessThan(0.05);
  });
});

describe('fanSatelliteAngles', () => {
  it('keeps a single satellite on its preferred angle', () => {
    const angles = fanSatelliteAngles(
      [{ id: 'a', preferredTheta: Math.PI / 2, lateralHalf: 40 }],
      300,
      DEFAULT_SPACING,
    );
    expect(angles.get('a')).toBeCloseTo(Math.PI / 2, 5);
  });

  it('spreads two satellites that want the same side', () => {
    const angles = fanSatelliteAngles(
      [
        { id: 'a', preferredTheta: 0, lateralHalf: 80 },
        { id: 'b', preferredTheta: 0.05, lateralHalf: 80 },
      ],
      300,
      DEFAULT_SPACING,
    );
    expect(Math.abs(normalizeAngle(angles.get('b')! - angles.get('a')!))).toBeGreaterThan(0.1);
  });
});

describe('claimUnplacedComponent', () => {
  it('claims the full unplaced component and removes ids from the set', () => {
    const unplaced = new Set(['sat', 'only_a', 'only_b', 'other']);
    const adj = new Map<string, string[]>([
      ['sat', ['only_a']],
      ['only_a', ['sat', 'only_b']],
      ['only_b', ['only_a']],
      ['other', []],
    ]);

    expect(claimUnplacedComponent('sat', unplaced, adj)).toEqual(['sat', 'only_a', 'only_b']);
    expect(unplaced.has('other')).toBe(true);
    expect(unplaced.has('sat')).toBe(false);
  });

  it('first claim wins — a second satellite cannot re-claim nodes', () => {
    const unplaced = new Set(['s1', 's2', 'shared']);
    const adj = new Map<string, string[]>([
      ['s1', ['shared']],
      ['s2', ['shared']],
      ['shared', ['s1', 's2']],
    ]);
    const skip = new Set(['s1', 's2']);

    expect(claimUnplacedComponent('s1', unplaced, adj, skip)).toEqual(['s1', 'shared']);
    expect(claimUnplacedComponent('s2', unplaced, adj, skip)).toEqual(['s2']);
  });
});
