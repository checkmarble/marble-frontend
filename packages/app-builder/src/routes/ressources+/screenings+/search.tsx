import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { ScreeningMatchPayload } from '@app-builder/models/screening';
import { refineScreeningPayloadSchema } from '@app-builder/queries/screening/schemas';
import { z } from 'zod/v4';

type ScreeningSearchResult = { success: true; data: ScreeningMatchPayload[] } | { success: false; error: string[] };

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function screeningSearchAction({ request, context }): ServerFnResult<ScreeningSearchResult> {
    const { toastSessionService, i18nextService } = context.services;
    const { screening } = context.authInfo;

    const rawPayload = await request.json();
    const submission = refineScreeningPayloadSchema.safeParse(rawPayload);

    if (!submission.success) {
      return data({ success: false, error: z.treeifyError(submission.error).errors });
    }

    try {
      const matches = await screening.searchScreeningMatches(submission.data);
      return data({ success: true, data: matches });
    } catch {
      const session = await toastSessionService.getSession(request);
      const t = await i18nextService.getFixedT(request, ['common', 'cases']);

      setToastMessage(session, { type: 'error', message: t('common:errors.unknown') });

      return data({ success: false, error: [] }, [['Set-Cookie', await toastSessionService.commitSession(session)]]);
    }
  },
);
