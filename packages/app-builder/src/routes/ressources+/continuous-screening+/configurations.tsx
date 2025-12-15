import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';

export const loader = createServerFn([authMiddleware], async ({ context }) => {
  const configurations = await context.authInfo.continuousScreening.listConfigurations();
  const inboxes = await context.authInfo.inbox.listInboxes();

  const configurationsWithInbox = configurations.map((config) => {
    const inbox = inboxes.find((inbox) => inbox.id === config.inboxId);
    return { ...config, inbox };
  });

  return { configurations: configurationsWithInbox };
});
