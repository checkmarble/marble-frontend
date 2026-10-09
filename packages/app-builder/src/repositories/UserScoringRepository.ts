import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptNodeDto, forbiddenApiMessage, isForbiddenHttpError, isNotFoundHttpError } from '@app-builder/models';
import {
  adaptScenarioPublicationStatus,
  type ScenarioPublicationStatus,
} from '@app-builder/models/scenario/publication';
import {
  adaptScoringDryRun,
  adaptScoringRuleset,
  adaptScoringRulesetWithRules,
  adaptScoringSettings,
  type ScoringDryRun,
  type ScoringRuleset,
  type ScoringRulesetWithRules,
  type ScoringSettings,
  type UpdateScoringRuleset,
} from '@app-builder/models/scoring';
import type { ScoringScore } from 'marble-api';

export type ScoreDistributionItem = { risk_level: number; count: number };

export type ScoringDryRunResult = {
  dryRun: ScoringDryRun | null;
  error: string | null;
};

export interface UserScoringRepository {
  getSettings(): Promise<ScoringSettings | null>;
  listRulesets(): Promise<ScoringRuleset[]>;
  listRulesetVersions(recordType: string): Promise<ScoringRuleset[]>;
  getRulesetWithRules(recordType: string, version?: string | number): Promise<ScoringRulesetWithRules>;
  updateScoringSettings(args: { maxRiskLevel: number }): Promise<ScoringSettings>;
  updateScoringRuleset(
    recordType: string,
    payload: UpdateScoringRuleset,
  ): Promise<ScoringRulesetWithRules | { error: string }>;
  getRulesetPreparationStatus(recordType: string): Promise<ScenarioPublicationStatus | null>;
  prepareScoringRuleset(recordType: string): Promise<void>;
  commitScoringRuleset(recordType: string): Promise<ScoringRuleset>;
  getScoreLatest(recordType: string, recordId: string): Promise<ScoringScore | null>;
  getScoreLatestWithEvaluation(recordType: string, recordId: string): Promise<ScoringScore | null>;
  getScoreDistribution(recordType: string): Promise<ScoreDistributionItem[]>;
  startScoringDryRun(recordType: string): Promise<ScoringDryRunResult>;
  getScoringDryRun(recordType: string): Promise<ScoringDryRunResult>;
}

export function makeGetUserScoringRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): UserScoringRepository => ({
    async getSettings() {
      try {
        return adaptScoringSettings(await marbleCoreApiClient.getScoringSettings());
      } catch (err) {
        if (isNotFoundHttpError(err)) {
          return null;
        }
        throw err;
      }
    },
    async listRulesets() {
      try {
        const rulesets = await marbleCoreApiClient.listScoringRulesets();
        return rulesets.map(adaptScoringRuleset);
      } catch (err) {
        if (isNotFoundHttpError(err)) {
          return [];
        }
        throw err;
      }
    },
    async listRulesetVersions(recordType) {
      const versions = await marbleCoreApiClient.listScoringRulesetVersions(recordType);
      return versions.map(adaptScoringRuleset);
    },
    async getRulesetWithRules(recordType, version) {
      return adaptScoringRulesetWithRules(await marbleCoreApiClient.getScoringRuleset(recordType, { version }));
    },
    async updateScoringSettings({ maxRiskLevel }) {
      return adaptScoringSettings(await marbleCoreApiClient.updateScoringSettings({ max_risk_level: maxRiskLevel }));
    },
    async updateScoringRuleset(recordType, payload) {
      try {
        return adaptScoringRulesetWithRules(
          await marbleCoreApiClient.updateScoringRuleset(recordType, '', {
            name: payload.name,
            description: payload.description,
            thresholds: payload.thresholds,
            cooldown_seconds: payload.cooldownSeconds,
            scoring_interval_seconds: payload.scoringIntervalSeconds,
            rules: payload.rules.map(({ stableId, name, description, riskType, ast }) => ({
              stable_id: stableId ?? '',
              name,
              description,
              risk_type: riskType,
              ast: adaptNodeDto(ast),
            })),
          }),
        );
      } catch (err) {
        const error = forbiddenApiMessage(err);
        if (error) return { error };
        throw err;
      }
    },
    async getRulesetPreparationStatus(recordType) {
      try {
        return adaptScenarioPublicationStatus(await marbleCoreApiClient.getScoringRulesetPreparationStatus(recordType));
      } catch (err) {
        if (isForbiddenHttpError(err)) {
          return null;
        }
        throw err;
      }
    },
    async prepareScoringRuleset(recordType) {
      await marbleCoreApiClient.prepareScoringDraft(recordType);
    },
    async commitScoringRuleset(recordType) {
      return adaptScoringRuleset(await marbleCoreApiClient.commitScoringRuleset(recordType));
    },
    async getScoreLatest(recordType, recordId) {
      return marbleCoreApiClient.getScoreLatest(recordType, recordId, { includeEvaluation: false });
    },
    async getScoreLatestWithEvaluation(recordType, recordId) {
      try {
        return await marbleCoreApiClient.getScoreLatest(recordType, recordId, { includeEvaluation: true });
      } catch (err) {
        if (isNotFoundHttpError(err)) {
          return null;
        }
        throw err;
      }
    },
    async getScoreDistribution(recordType) {
      return marbleCoreApiClient.getScoreDistribution(recordType);
    },
    async startScoringDryRun(recordType) {
      try {
        return { dryRun: adaptScoringDryRun(await marbleCoreApiClient.startScoringDryRun(recordType)), error: null };
      } catch (err) {
        const error = forbiddenApiMessage(err);
        if (error) return { dryRun: null, error };
        throw err;
      }
    },
    async getScoringDryRun(recordType) {
      try {
        return { dryRun: adaptScoringDryRun(await marbleCoreApiClient.getScoringDryRun(recordType)), error: null };
      } catch (err) {
        if (isNotFoundHttpError(err)) return { dryRun: null, error: null };
        const error = forbiddenApiMessage(err);
        if (error) return { dryRun: null, error };
        throw err;
      }
    },
  });
}
