import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';

export const loader = createServerFn([authMiddleware], async ({ context }) => {
  const { continuousScreening, entitlements } = context.authInfo;
  const configurations = isContinuousScreeningAvailable(entitlements)
    ? await continuousScreening.listConfigurations()
    : [];
  const inboxes = await context.authInfo.inbox.listInboxes();

  const configurationsWithInbox = configurations.map((config) => {
    const inbox = inboxes.find((inbox) => inbox.id === config.inboxId);
    return { ...config, inbox };
  });

  return { configurations: configurationsWithInbox };
});
