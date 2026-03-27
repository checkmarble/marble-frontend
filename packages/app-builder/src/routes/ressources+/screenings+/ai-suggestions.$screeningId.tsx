import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { fromParams } from '@app-builder/utils/short-uuid';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function getScreeningAiSuggestions({ params, context }) {
    const screeningId = fromParams(params, 'screeningId');

    const suggestions = await context.authInfo.screening.getAiSuggestions({ screeningId });

    return data({ suggestions });
  },
);
