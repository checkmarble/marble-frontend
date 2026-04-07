import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import type { CaseAnalyticsQueryDto } from 'marble-api';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function caseStatusByDateAction({ request, context }) {
    const query = (await request.json()) as CaseAnalyticsQueryDto;
    const data = await context.authInfo.analytics.getCaseStatusByDate(query);
    return { casesStatusByDate: data };
  },
);
