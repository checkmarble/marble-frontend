import { createContinuousScreeningConfigSchema } from '@app-builder/components/ContinuousScreening/context/CreationStepper';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { reviewMatchPayloadSchema } from '@app-builder/schemas/continuous-screenings';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { setToast } from '@app-builder/services/toast.server';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const getContinuousScreeningConfigurationFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ stableId: z.string() }))
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

export const createContinuousScreeningConfigurationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createContinuousScreeningConfigSchema)
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

      await context.authInfo.continuousScreening.createConfiguration({ ...payload, inboxId });

      throw redirect({ to: '/continuous-screening/configurations' });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to create configuration');
    }
  });

export const dismissContinuousScreeningFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ screeningId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      await setToast({ type: 'success', message: 'continuousScreening:success.dismissed' });
      await context.authInfo.continuousScreening.dismiss(data.screeningId);
    } catch {
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to dismiss screening');
    }
  });

export const loadMoreContinuousScreeningMatchesFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ screeningId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.continuousScreening.loadMoreMatches(data.screeningId);
    } catch {
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to load more matches');
    }
  });

export const reviewContinuousScreeningMatchFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(reviewMatchPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.continuousScreening.updateMatchStatus(data);
    } catch {
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to review match');
    }
  });

export const updateContinuousScreeningConfigurationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createContinuousScreeningConfigSchema.and(z.object({ configStableId: z.string() })))
  .handler(async ({ context, data }) => {
    try {
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

      await context.authInfo.continuousScreening.updateConfiguration(configStableId, { ...payload, inboxId });
      await setToast({ type: 'success', messageKey: 'common:success.save' });
    } catch {
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to update configuration');
    }
  });
