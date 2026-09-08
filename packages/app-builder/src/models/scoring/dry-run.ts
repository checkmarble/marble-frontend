import type { ScoringDryRun as ScoringDryRunDto } from 'marble-api';

export type ScoringDryRunStatus = ScoringDryRunDto['status'];

export type ScoringDryRunDistributionItem = {
  riskLevel: number;
  count: number;
};

export type ScoringDryRun = {
  id: string;
  rulesetId: string;
  status: ScoringDryRunStatus;
  recordCount: number;
  progress: number;
  distribution: ScoringDryRunDistributionItem[];
  createdAt: string;
};

export const adaptScoringDryRun = (dto: ScoringDryRunDto): ScoringDryRun => ({
  id: dto.id,
  rulesetId: dto.ruleset_id,
  status: dto.status,
  recordCount: dto.record_count,
  progress: dto.progress,
  distribution: dto.distribution.map((item) => ({
    riskLevel: item.risk_level,
    count: item.count,
  })),
  createdAt: dto.created_at,
});
