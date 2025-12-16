import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { reviewMatchPayloadSchema } from '@app-builder/queries/continuous-screening/review-match';
import { z } from 'zod/v4';

export const action = createServerFn([handleRedirectMiddleware, authMiddleware], async ({ request, context }) => {
  const {
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = context.services;
  const { continuousScreening: continuousScreeningRepository } = context.authInfo;

  const [toastSession, t, rawData] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common', 'cases']),
    request.json(),
  ]);

  const parsedData = reviewMatchPayloadSchema.safeParse(rawData);

  if (!parsedData.success) {
    return data({ success: false, errors: z.treeifyError(parsedData.error) });
  }

  try {
    await continuousScreeningRepository.updateMatchStatus(parsedData.data);
    return data({ success: true });
  } catch (_error) {
    setToastMessage(toastSession, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return data({ success: false, errors: [] }, [['Set-Cookie', await commitSession(toastSession)]]);
  }
});
