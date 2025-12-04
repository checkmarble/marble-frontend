import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createAnalyticsCaseStatusByDateAction({ context }) {
    const data = await context.authInfo.analytics.getCaseStatusByDate();
    return { casesStatusByDate: data };
  },
);
