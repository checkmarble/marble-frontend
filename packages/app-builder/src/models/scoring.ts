import {
  NodeDto,
  ScoringRuleset as ScoringRulesetDto,
  ScoringRulesetWithRules as ScoringRulesetWithRulesDto,
  ScoringSettings as ScoringSettingsDto,
} from 'marble-api';

export type ScoringRule = {
  stableId: string;
  name: string;
  description: string;
  ast: NodeDto[];
};

export const adaptScoringRule = (
  dto: ScoringRulesetWithRulesDto['rules'][number],
): ScoringRule => ({
  stableId: dto.stable_id,
  name: dto.name,
  description: dto.description ?? '',
  ast: dto.ast,
});

export type ScoringSettings = {
  maxRiskLevel: number;
  createdAt: string;
  updatedAt: string;
};

export const adaptScoringSettings = (dto: ScoringSettingsDto): ScoringSettings => {
  return {
    maxRiskLevel: dto.max_risk_level,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

export type ScoringRuleset = {
  id: string;
  orgId: string;
  version: number;
  status: 'draft' | 'committed';
  name: string;
  description: string;
  recordType: string;
  thresholds: number[];
  cooldownSeconds: number;
  createdAt: string;
};

export type ScoringRulesetWithRules = ScoringRuleset & {
  rules: ScoringRule[];
};

export type UpdateScoringRuleset = {
  name: string;
  description?: string;
  thresholds: number[];
  cooldownSeconds?: number;
  rules: { stableId: string; name: string; description?: string; ast: NodeDto[] }[];
};

export const adaptScoringRuleset = (dto: ScoringRulesetDto): ScoringRuleset => ({
  id: dto.id,
  orgId: dto.org_id,
  version: dto.version,
  status: dto.status,
  name: dto.name,
  description: dto.description,
  recordType: dto.record_type,
  thresholds: dto.thresholds,
  cooldownSeconds: dto.cooldown_seconds,
  createdAt: dto.created_at,
});

export const adaptScoringRulesetWithRules = (
  dto: ScoringRulesetWithRulesDto,
): ScoringRulesetWithRules => ({
  ...adaptScoringRuleset(dto),
  rules: dto.rules.map(adaptScoringRule),
});

export const SCORING_LEVELS_COLORS = {
  3: ['#18AA5F', '#EEA200', '#FF6600'],
  4: ['#18AA5F', '#EEA200', '#FF6600', '#D2371D'],
  5: ['#89D4AD', '#FFD57E', '#FDBD35', '#FF6600', '#D2371D'],
  6: ['#89D4AD', '#FFD57E', '#FDBD35', '#FF6600', '#DB5F4A', '#D2371D'],
};

export const SCORING_LEVELS_LABELS = {
  3: ['Faible', 'Moyen', 'Elevé'],
  4: ['Faible', 'Moyen', 'Elevé', 'Très élevé'],
  5: ['1', '2', '3', '4', '5'],
  6: ['1', '2', '3', '4', '5', '6'],
};
