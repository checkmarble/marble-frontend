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
  type ScoringDryRunResult,
  type ScoringRuleset,
  type ScoringRulesetWithRules,
  type ScoringSettings,
  type UpdateScoringRuleset,
} from '@app-builder/models/scoring';
import { type ScoringScore } from 'marble-api';

export async function getSettings(api: MarbleCoreApi): Promise<ScoringSettings | null> {
  try {
    return adaptScoringSettings(await api.getScoringSettings());
  } catch (err) {
    if (isNotFoundHttpError(err)) {
      return null;
    }
    throw err;
  }
}

export async function listRulesets(api: MarbleCoreApi): Promise<ScoringRuleset[]> {
  try {
    const rulesets = await api.listScoringRulesets();
    return rulesets.map(adaptScoringRuleset);
  } catch (err) {
    if (isNotFoundHttpError(err)) {
      return [];
    }
    throw err;
  }
}

export async function listRulesetVersions(api: MarbleCoreApi, recordType: string): Promise<ScoringRuleset[]> {
  const versions = await api.listScoringRulesetVersions(recordType);
  return versions.map(adaptScoringRuleset);
}

export async function getRulesetWithRules(
  api: MarbleCoreApi,
  recordType: string,
  version?: string | number,
): Promise<ScoringRulesetWithRules> {
  return adaptScoringRulesetWithRules(await api.getScoringRuleset(recordType, { version }));
}

export async function updateScoringSettings(
  api: MarbleCoreApi,
  { maxRiskLevel }: { maxRiskLevel: number },
): Promise<ScoringSettings> {
  return adaptScoringSettings(await api.updateScoringSettings({ max_risk_level: maxRiskLevel }));
}

export async function updateScoringRuleset(
  api: MarbleCoreApi,
  recordType: string,
  payload: UpdateScoringRuleset,
): Promise<ScoringRulesetWithRules | { error: string }> {
  try {
    return adaptScoringRulesetWithRules(
      await api.updateScoringRuleset(recordType, '', {
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
}

export async function getRulesetPreparationStatus(
  api: MarbleCoreApi,
  recordType: string,
): Promise<ScenarioPublicationStatus | null> {
  try {
    return adaptScenarioPublicationStatus(await api.getScoringRulesetPreparationStatus(recordType));
  } catch (err) {
    if (isForbiddenHttpError(err)) {
      return null;
    }
    throw err;
  }
}

export async function getScoreLatest(
  api: MarbleCoreApi,
  recordType: string,
  recordId: string,
): Promise<ScoringScore | null> {
  return api.getScoreLatest(recordType, recordId, { includeEvaluation: false });
}

export async function getScoreLatestWithEvaluation(
  api: MarbleCoreApi,
  recordType: string,
  recordId: string,
): Promise<ScoringScore | null> {
  try {
    return await api.getScoreLatest(recordType, recordId, { includeEvaluation: true });
  } catch (err) {
    if (isNotFoundHttpError(err)) {
      return null;
    }
    throw err;
  }
}

export async function startScoringDryRun(api: MarbleCoreApi, recordType: string): Promise<ScoringDryRunResult> {
  try {
    return { dryRun: adaptScoringDryRun(await api.startScoringDryRun(recordType)), error: null };
  } catch (err) {
    const error = forbiddenApiMessage(err);
    if (error) return { dryRun: null, error };
    throw err;
  }
}

export async function getScoringDryRun(api: MarbleCoreApi, recordType: string): Promise<ScoringDryRunResult> {
  try {
    return { dryRun: adaptScoringDryRun(await api.getScoringDryRun(recordType)), error: null };
  } catch (err) {
    if (isNotFoundHttpError(err)) return { dryRun: null, error: null };
    const error = forbiddenApiMessage(err);
    if (error) return { dryRun: null, error };
    throw err;
  }
}
