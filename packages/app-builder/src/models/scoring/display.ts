export const MAX_RISK_LEVELS = [3, 4, 5, 6] as const;
export type MaxRiskLevel = (typeof MAX_RISK_LEVELS)[number];

export const SCORING_LEVELS_COLORS: Record<MaxRiskLevel, string[]> = {
  3: ['#18AA5F', '#EEA200', '#FF6600'],
  4: ['#18AA5F', '#EEA200', '#FF6600', '#D2371D'],
  5: ['#89D4AD', '#FFD57E', '#FDBD35', '#FF6600', '#D2371D'],
  6: ['#89D4AD', '#FFD57E', '#FDBD35', '#FF6600', '#DB5F4A', '#D2371D'],
};

/**
 * i18n keys for levels 3 and 4 (e.g. 'user-scoring:level.low').
 * Levels 5 and 6 use plain number strings (not translated).
 */
export const SCORING_LEVELS_LABEL_KEYS: Record<MaxRiskLevel, string[]> = {
  3: ['user-scoring:level.low', 'user-scoring:level.medium', 'user-scoring:level.high'],
  4: ['user-scoring:level.low', 'user-scoring:level.medium', 'user-scoring:level.high', 'user-scoring:level.very_high'],
  5: ['1', '2', '3', '4', '5'],
  6: ['1', '2', '3', '4', '5', '6'],
};

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
