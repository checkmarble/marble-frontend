import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createAnalyticsCaseStatusByDateAction({ context }) {
    // const data = await context.authInfo.analytics.getCaseStatusByInbox();
    const inboxes = await context.authInfo.inbox.listInboxes();
    const pow = Math.floor(Math.random() * (6 - 1) + 1);
    const multiplier = Math.pow(10, pow);
    const data = inboxes.map((inbox) => ({
      inbox: inbox.name,
      pending: Math.floor(Math.random() * multiplier),
      investigating: Math.floor(Math.random() * multiplier),
      closed: Math.floor(Math.random() * multiplier),
      snoozed: Math.floor(Math.random() * multiplier),
    }));

    return { caseStatusByInbox: data };
  },
);
