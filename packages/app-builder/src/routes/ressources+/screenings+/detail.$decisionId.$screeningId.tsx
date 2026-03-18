import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { fromParams } from '@app-builder/utils/short-uuid';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function getScreeningDetail({ params, context }) {
    const decisionId = fromParams(params, 'decisionId');
    const screeningId = fromParams(params, 'screeningId');

    const screenings = await context.authInfo.screening.listScreenings({ decisionId });
    const screening = screenings.find((s) => s.id === screeningId);

    if (!screening) {
      throw new Response(null, { status: 404, statusText: 'Not Found' });
    }

    return { screening };
  },
);
