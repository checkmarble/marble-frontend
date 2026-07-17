import { createContinuousScreeningConfigSchema } from '@app-builder/components/ContinuousScreening/context/CreationStepper';
import { sanitizeTruthyDatasets } from '@app-builder/components/ListAndTopicConfiguration';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { type ContinuousScreeningRepository } from '@app-builder/repositories/ContinuousScreeningRepository';
import { reviewMatchPayloadSchema } from '@app-builder/schemas/continuous-screenings';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const getContinuousScreeningConfigurationFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ stableId: z.string() }))
  .handler(async ({ context, data }) => {
    const config = await context.authInfo.continuousScreening.getConfiguration(data.stableId);
    return { config };
  });

export const listContinuousScreeningConfigurationsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { continuousScreening, entitlements, inbox } = context.authInfo;

    const configurations = isContinuousScreeningAvailable(entitlements)
      ? await continuousScreening.listConfigurations()
      : [];
    const inboxes = await inbox.listInboxes();

    const configurationsWithInbox = configurations.map((config) => {
      const inboxItem = inboxes.find((inbox) => inbox.id === config.inboxId);
      return { ...config, inbox: inboxItem };
    });

    return { configurations: configurationsWithInbox };
  });

async function getActiveConfigurations(
  continuousScreening: ContinuousScreeningRepository,
  objectType: string,
  objectId: string,
) {
  const [objects, configurations] = await Promise.all([
    continuousScreening.listObjects({ objectType, objectId }),
    continuousScreening.listConfigurations(),
  ]);

  const enrolledStableIds = new Set(objects.map((object) => object.configStableId));
  return configurations.filter((config) => enrolledStableIds.has(config.stableId));
}

export const listActiveConfigsForObjectFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ objectType: z.string(), objectId: z.string() }))
  .handler(async ({ context, data }) => {
    const { continuousScreening, entitlements } = context.authInfo;

    if (!isContinuousScreeningAvailable(entitlements)) {
      return { configurations: [] };
    }

    const activeConfigurations = await getActiveConfigurations(continuousScreening, data.objectType, data.objectId);

    return { configurations: activeConfigurations };
  });

export const updateObjectMonitoringFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      objectType: z.string(),
      objectId: z.string(),
      configStableIds: z.array(z.string()),
    }),
  )
  .handler(async ({ context, data }) => {
    const { continuousScreening, entitlements, user } = context.authInfo;

    if (!isContinuousScreeningAvailable(entitlements) || !isAdmin(user)) {
      return { configurations: [] };
    }

    const currentObjects = await continuousScreening.listObjects({
      objectType: data.objectType,
      objectId: data.objectId,
    });
    const currentStableIds = new Set(currentObjects.map((object) => object.configStableId));
    const nextStableIds = new Set(data.configStableIds);

    const toDelete = [...currentStableIds].filter((stableId) => !nextStableIds.has(stableId));
    const toCreate = [...nextStableIds].filter((stableId) => !currentStableIds.has(stableId));

    // toDelete and toCreate are disjoint sets of configStableId, so these mutations
    // can safely run concurrently. We use allSettled (rather than all) so that every
    // change is attempted even if some fail, and report any partial failure explicitly.
    // No rollback is performed: the diff is recomputed from live state on each call, so
    // a retry naturally re-applies only the operations that did not succeed.
    const results = await Promise.allSettled([
      ...toDelete.map((configStableId) =>
        continuousScreening.deleteObject({
          objectType: data.objectType,
          objectId: data.objectId,
          configStableId,
        }),
      ),
      ...toCreate.map((configStableId) =>
        continuousScreening.createObject({
          objectType: data.objectType,
          objectId: data.objectId,
          configStableId,
        }),
      ),
    ]);

    if (results.some((result) => result.status === 'rejected')) {
      throw new Error('Failed to update object monitoring');
    }

    const activeConfigurations = await getActiveConfigurations(continuousScreening, data.objectType, data.objectId);

    return { configurations: activeConfigurations };
  });

export const createContinuousScreeningConfigurationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createContinuousScreeningConfigSchema)
  .handler(async ({ context, data }) => {
    try {
      const { inboxName, ...payload } = data;

      let inboxId: string;
      if (payload.inboxId === null) {
        if (!inboxName) {
          throw new Error('Inbox name is required when no inbox is selected');
        }
        const newInbox = await context.authInfo.inbox.createInbox({ name: inboxName });
        inboxId = newInbox.id;
      } else {
        inboxId = payload.inboxId;
      }

      await context.authInfo.continuousScreening.createConfiguration({
        ...payload,
        inboxId,
        datasets: sanitizeTruthyDatasets(payload.datasets),
      });

      throw redirect({ to: '/continuous-screening/configurations' });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
      throw new Error('Failed to create configuration');
    }
  });

export const dismissContinuousScreeningFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ screeningId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.continuousScreening.dismiss(data.screeningId);
    } catch {
      throw new Error('Failed to dismiss screening');
    }
  });

export const loadMoreContinuousScreeningMatchesFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ screeningId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.continuousScreening.loadMoreMatches(data.screeningId);
    } catch {
      throw new Error('Failed to load more matches');
    }
  });

export const reviewContinuousScreeningMatchFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(reviewMatchPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.continuousScreening.updateMatchStatus(data);
    } catch {
      throw new Error('Failed to review match');
    }
  });

export const updateContinuousScreeningConfigurationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createContinuousScreeningConfigSchema.and(z.object({ configStableId: z.string() })))
  .handler(async ({ context, data }) => {
    const { inboxName, configStableId, ...payload } = data;

    let inboxId: string;
    if (payload.inboxId === null) {
      if (!inboxName) {
        throw new Error('Inbox name is required when no inbox is selected');
      }
      const newInbox = await context.authInfo.inbox.createInbox({ name: inboxName });
      inboxId = newInbox.id;
    } else {
      inboxId = payload.inboxId;
    }

    await context.authInfo.continuousScreening.updateConfiguration(configStableId, {
      ...payload,
      inboxId,
      datasets: sanitizeTruthyDatasets(payload.datasets),
    });
  });
