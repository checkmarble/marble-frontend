import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createAnalyticsCaseStatusByDateAction({ context }) {
    // const data = await context.authInfo.analytics.getCaseStatusByDate();
    const pow = Math.floor(Math.random() * (6 - 1) + 1);
    const multiplier = Math.pow(10, pow);
    const data = Array.from({ length: 10 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0],
      pending: Math.floor(Math.random() * multiplier),
      investigating: Math.floor(Math.random() * multiplier),
      closed: Math.floor(Math.random() * multiplier),
      snoozed: Math.floor(Math.random() * multiplier),
    }));
    return { casesStatusByDate: data };
  },
);
