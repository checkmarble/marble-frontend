export const MAX_RISK_LEVELS = [3, 4, 5, 6] as const;
export type MaxRiskLevel = (typeof MAX_RISK_LEVELS)[number];

/**
 * Colors and labels are keyed by 1-based risk level to match the backend.
 * e.g. risk_level=1 → SCORING_LEVELS_COLORS[3][1] for a 3-level config.
 */
export type ScoringLevelMap = Record<number, string>;

export const SCORING_LEVELS_COLORS: Record<MaxRiskLevel, ScoringLevelMap> = {
  3: { 1: '#18AA5F', 2: '#EEA200', 3: '#FF6600' },
  4: { 1: '#18AA5F', 2: '#EEA200', 3: '#FF6600', 4: '#D2371D' },
  5: { 1: '#89D4AD', 2: '#FFD57E', 3: '#FDBD35', 4: '#FF6600', 5: '#D2371D' },
  6: { 1: '#89D4AD', 2: '#FFD57E', 3: '#FDBD35', 4: '#FF6600', 5: '#DB5F4A', 6: '#D2371D' },
};

/**
 * i18n keys for levels 3 and 4 (e.g. 'user-scoring:level.low').
 * Levels 5 and 6 use plain number strings (not translated).
 */
export const SCORING_LEVELS_LABEL_KEYS: Record<MaxRiskLevel, ScoringLevelMap> = {
  3: { 1: 'user-scoring:level.low', 2: 'user-scoring:level.medium', 3: 'user-scoring:level.high' },
  4: {
    1: 'user-scoring:level.low',
    2: 'user-scoring:level.medium',
    3: 'user-scoring:level.high',
    4: 'user-scoring:level.very_high',
  },
  5: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' },
  6: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' },
};

/** Returns entries as [level, value] pairs from a ScoringLevelMap, sorted by level. */
export function scoringLevelEntries(map: ScoringLevelMap): Array<[number, string]> {
  return Object.entries(map)
    .map(([k, v]) => [Number(k), v] as [number, string])
    .sort((a, b) => a[0] - b[0]);
}

export function isMaxRiskLevelInRange(maxRiskLevel: number): maxRiskLevel is MaxRiskLevel {
  return (MAX_RISK_LEVELS as readonly number[]).includes(maxRiskLevel);
}

export function formatCooldown(seconds: number): string | null {
  if (!seconds) return null;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0 && hours > 0) return `${days}j ${hours}h`;
  if (days > 0) return `${days}j`;
  if (hours > 0) return `${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  if (minutes > 0) return `${minutes}min`;
  return `${seconds}s`;
}
