import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function getInboxesLoader({ context }) {
    const inboxes = await context.authInfo.inbox.listInboxesWithCaseCount();
    return { inboxes };
  },
);
