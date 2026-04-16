import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import {
  updateScoringRulesetPayloadSchema,
  updateScoringSettingsPayloadSchema,
} from '@app-builder/schemas/user-scoring';
import { setToast } from '@app-builder/services/toast.server';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const commitScoringRulesetFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ recordType: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      const { recordType } = data;
      const ruleset = await context.authInfo.userScoring.commitScoringRuleset(recordType);

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
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to commit ruleset');
    }
  });

export const listRulesetVersionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ recordType: z.string() }))
  .handler(async ({ context, data }) => {
    const versions = await context.authInfo.userScoring.listRulesetVersions(data.recordType);
    return { versions };
  });

export const listRulesetsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const rulesets = await context.authInfo.userScoring.listRulesets();
    return { rulesets };
  });

export const prepareScoringRulesetFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ recordType: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.userScoring.prepareScoringRuleset(data.recordType);
    } catch {
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to prepare ruleset');
    }
  });

export const updateScoringRulesetFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateScoringRulesetPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const { recordType, id: rulesetId, ...rulesetPayload } = data;
      const entityRulesets = await context.authInfo.userScoring.listRulesetVersions(recordType);

      rulesetPayload.name = `Scores ${recordType}`;
      const updatedRuleset = await context.authInfo.userScoring.updateScoringRuleset(recordType, rulesetPayload);

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
        throw redirect({
          to: '/user-scoring/$recordType/$version',
          params: { recordType, version: 'draft' },
        });
      }
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to update ruleset');
    }
  });

export const updateScoringSettingsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateScoringSettingsPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.userScoring.updateScoringSettings(data);
    } catch {
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to update scoring settings');
    }
  });
