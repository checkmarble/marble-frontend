const MAX_RISK_LEVELS = [3, 4, 5, 6];
const SCORING_LEVELS_COLORS = {
  3: { 1: "#18AA5F", 2: "#EEA200", 3: "#FF6600" },
  4: { 1: "#18AA5F", 2: "#EEA200", 3: "#FF6600", 4: "#D2371D" },
  5: { 1: "#89D4AD", 2: "#FFD57E", 3: "#FDBD35", 4: "#FF6600", 5: "#D2371D" },
  6: { 1: "#89D4AD", 2: "#FFD57E", 3: "#FDBD35", 4: "#FF6600", 5: "#DB5F4A", 6: "#D2371D" }
};
const SCORING_LEVELS_LABEL_KEYS = {
  3: { 1: "user-scoring:level.low", 2: "user-scoring:level.medium", 3: "user-scoring:level.high" },
  4: {
    1: "user-scoring:level.low",
    2: "user-scoring:level.medium",
    3: "user-scoring:level.high",
    4: "user-scoring:level.very_high"
  },
  5: { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" },
  6: { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6" }
};
function scoringLevelEntries(map) {
  return Object.entries(map).map(([k, v]) => [Number(k), v]).sort((a, b) => a[0] - b[0]);
}
function isMaxRiskLevelInRange(maxRiskLevel) {
  return MAX_RISK_LEVELS.includes(maxRiskLevel);
}
export {
  MAX_RISK_LEVELS as M,
  SCORING_LEVELS_COLORS as S,
  SCORING_LEVELS_LABEL_KEYS as a,
  isMaxRiskLevelInRange as i,
  scoringLevelEntries as s
};
