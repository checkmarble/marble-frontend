import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst, isForbiddenHttpError, isNotFoundHttpError, isUnauthorizedHttpError } from '@app-builder/models';
import { adaptScoringRuleset } from '@app-builder/models/scoring';
import {
  updateScoringRulesetPayloadSchema,
  updateScoringSettingsPayloadSchema,
} from '@app-builder/schemas/user-scoring';
import {
  getRulesetWithRules,
  getScoreLatest,
  getScoreLatestWithEvaluation,
  getScoringDryRun,
  getSettings,
  listRulesets,
  listRulesetVersions,
  startScoringDryRun,
  updateScoringRuleset,
  updateScoringSettings,
} from '@app-builder/server/user-scoring';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const commitScoringRulesetFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ recordType: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      const { recordType } = data;
      const ruleset = adaptScoringRuleset(await context.api.commitScoringRuleset(recordType));

      if (!ruleset) {
        throw new Error('No ruleset returned');
      }

      throw redirect({
        to: '/user-scoring/$recordType/$version',
        params: {
          recordType,
          version: ruleset.version.toString(),
        },
      });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
      throw new Error('Failed to commit ruleset');
    }
  });

export const listRulesetVersionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ recordType: z.string() }))
  .handler(async ({ context, data }) => {
    const versions = await listRulesetVersions(context.api, data.recordType);
    return { versions };
  });

export const listRulesetsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const rulesets = await listRulesets(context.api);
    return { rulesets };
  });

export const prepareScoringRulesetFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ recordType: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      await context.api.prepareScoringDraft(data.recordType);
    } catch {
      throw new Error('Failed to prepare ruleset');
    }
  });

export const updateScoringRulesetFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateScoringRulesetPayloadSchema)
  .handler(async ({ context, data }) => {
    const { recordType, id: rulesetId, ...rulesetPayload } = data;
    const entityRulesets = await listRulesetVersions(context.api, recordType);

    rulesetPayload.name = `Scores ${recordType}`;
    const updatedRuleset = await updateScoringRuleset(context.api, recordType, rulesetPayload);
    if ('error' in updatedRuleset) return updatedRuleset;

    if (!rulesetId) {
      throw redirect({
        to: '/user-scoring/$recordType/$version',
        params: { recordType, version: 'draft' },
      });
    }

    const currentRuleset = entityRulesets.find((r) => r.id === rulesetId);
    if (!currentRuleset) {
      throw new Error('Non existing ruleset');
    }

    if (currentRuleset.status === 'committed' && updatedRuleset.status === 'draft') {
      return updatedRuleset;
    }
  });

export const updateScoringSettingsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateScoringSettingsPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await updateScoringSettings(context.api, data);
    } catch {
      throw new Error('Failed to update scoring settings');
    }
  });

export const getScoringRulesetFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      recordType: z.string(),
      version: z.union([z.string(), z.number()]).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const ruleset = await getRulesetWithRules(context.api, data.recordType, data.version);
    return { ruleset };
  });

export const getScoreDistributionFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ recordType: z.string() }))
  .handler(async ({ context, data }) => {
    const distribution = await context.api.getScoreDistribution(data.recordType);
    return { distribution };
  });

export const getScoringSettingsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const settings = await getSettings(context.api);
    return { settings: settings ?? null };
  });

export const getScoreLatestFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ objectType: z.string(), objectId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      const score = await getScoreLatestWithEvaluation(context.api, data.objectType, data.objectId);
      return { score: score ?? null };
    } catch (error) {
      if (isNotFoundHttpError(error) || isUnauthorizedHttpError(error) || isForbiddenHttpError(error)) {
        return { score: null };
      }
      throw error;
    }
  });

/** The latest risk level only, without the evaluation. Never fails: no access, no score or an error give `null`. */
export const getRiskLevelLatestFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ objectType: z.string(), objectId: z.string() }))
  .handler(async ({ context, data }) => {
    // Analysts can't see risk levels, whatever the organization's entitlement.
    if (isAnalyst(context.user)) return { riskLevel: null };
    try {
      const score = await getScoreLatest(context.api, data.objectType, data.objectId);
      return { riskLevel: score?.risk_level ?? null };
    } catch {
      return { riskLevel: null };
    }
  });

export const startScoringDryRunFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ recordType: z.string() }))
  .handler(async ({ context, data }) => {
    return startScoringDryRun(context.api, data.recordType);
  });

export const getScoringDryRunFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ recordType: z.string() }))
  .handler(async ({ context, data }) => {
    return getScoringDryRun(context.api, data.recordType);
  });
