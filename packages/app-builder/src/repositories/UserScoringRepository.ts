import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptNodeDto, isNotFoundHttpError } from '@app-builder/models';
import {
  adaptScoringRuleset,
  adaptScoringRulesetWithRules,
  adaptScoringSettings,
  ScoringRuleset,
  ScoringRulesetWithRules,
  ScoringSettings,
  UpdateScoringRuleset,
} from '@app-builder/models/scoring';

export interface UserScoringRepository {
  getSettings(): Promise<ScoringSettings | null>;
  listRulesets(): Promise<ScoringRuleset[]>;
  listRulesetVersions(recordType: string): Promise<ScoringRuleset[]>;
  getRulesetWithRules(recordType: string, version: string | number): Promise<ScoringRulesetWithRules>;
  updateScoringSettings(args: { maxRiskLevel: number }): Promise<ScoringSettings>;
  updateScoringRuleset(recordType: string, payload: UpdateScoringRuleset): Promise<ScoringRulesetWithRules>;
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
      const rulesets = await marbleCoreApiClient.listScoringRulesets();
      return rulesets.map(adaptScoringRuleset);
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
    async updateScoringRuleset(recordType, { name, description, thresholds, cooldownSeconds, rules }) {
      return adaptScoringRulesetWithRules(
        await marbleCoreApiClient.updateScoringRuleset(recordType, '', {
          name,
          description,
          thresholds,
          cooldown_seconds: cooldownSeconds,
          rules: rules.map(({ stableId, name, description, riskType, ast }) => ({
            stable_id: stableId ?? '',
            name,
            description,
            risk_type: riskType,
            ast: adaptNodeDto(ast),
          })),
        }),
      );
    },
  });
}
