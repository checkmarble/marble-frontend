import {
  ScoringRuleset as ScoringRulesetDto,
  ScoringRulesetWithRules as ScoringRulesetWithRulesDto,
  ScoringSettings as ScoringSettingsDto,
} from 'marble-api';
import { AstNode, adaptAstNode } from '..';

export const RISK_TYPES = [
  'customer_features',
  'service_provided',
  'distribution_channels',
  'transaction_execution',
  'geo_risks',
] as const;
export type RiskType = (typeof RISK_TYPES)[number];

export type ScoringRule = {
  stableId: string;
  name: string;
  description: string;
  riskType: string;
  ast: AstNode;
};

export const adaptScoringRule = (dto: ScoringRulesetWithRulesDto['rules'][number]): ScoringRule => ({
  stableId: dto.stable_id,
  name: dto.name,
  description: dto.description ?? '',
  riskType: dto.risk_type,
  ast: adaptAstNode(dto.ast),
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

export type DurationUnit = 'days' | 'months' | 'years';

export const SECONDS_PER_UNIT: Record<DurationUnit, number> = {
  days: 86400,
  months: 30 * 86400,
  years: 365 * 86400,
};

export function secondsToDisplay(seconds: number): { value: number; unit: DurationUnit | null } {
  if (seconds === 0) return { value: 0, unit: null };
  if (seconds % SECONDS_PER_UNIT.years === 0) return { value: seconds / SECONDS_PER_UNIT.years, unit: 'years' };
  if (seconds % SECONDS_PER_UNIT.months === 0) return { value: seconds / SECONDS_PER_UNIT.months, unit: 'months' };
  return { value: seconds / SECONDS_PER_UNIT.days, unit: 'days' };
}

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
  scoringIntervalSeconds: number;
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
  scoringIntervalSeconds?: number;
  rules: { stableId?: string; name: string; description?: string; riskType: string; ast: AstNode }[];
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
  scoringIntervalSeconds: dto.scoring_interval_seconds,
  createdAt: dto.created_at,
});

export const adaptScoringRulesetWithRules = (dto: ScoringRulesetWithRulesDto): ScoringRulesetWithRules => ({
  ...adaptScoringRuleset(dto),
  rules: (dto.rules ?? []).map(adaptScoringRule),
});
