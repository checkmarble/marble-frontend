import { createContinuousScreeningConfigSchema } from '@app-builder/components/ContinuousScreening/context/CreationStepper';
import { sanitizeTruthyDatasets } from '@app-builder/components/ListAndTopicConfiguration';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
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

export const listContinuousScreeningDatasetUpdatesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      offsetId: z.string().optional(),
      limit: z.number().optional(),
      order: z.enum(['ASC', 'DESC']).optional(),
      sorting: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    return context.authInfo.continuousScreening.listDatasetUpdates(data);
  });

export const listContinuousScreeningUpdateJobsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      offsetId: z.string().optional(),
      limit: z.number().optional(),
      order: z.enum(['ASC', 'DESC']).optional(),
      sorting: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    return context.authInfo.continuousScreening.listUpdateJobs(data);
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
