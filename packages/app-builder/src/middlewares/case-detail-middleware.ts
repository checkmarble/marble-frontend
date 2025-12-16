import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { createMiddlewareWithGlobalContext } from '@app-builder/core/requests';
import { isNotFoundHttpError } from '@app-builder/models';
import { parseIdParamSafe, parseQuerySafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/server-runtime';
import { tryit } from 'radash';
import { z } from 'zod/v4';
import { authMiddleware } from './auth-middleware';

export const caseDetailMiddleware = createMiddlewareWithGlobalContext(
  [authMiddleware],
  async function caseDetailMiddleware({ request, params, context }, next, exit) {
    const { cases: caseRepository, inbox: inboxRepository } = context.authInfo;
    const { toastSessionService, i18nextService } = context.services;

    // Check if the case ID provided is valid
    const parsedResult = await parseIdParamSafe(params, 'caseId');
    if (!parsedResult.success) {
      return exit(redirect(getRoute('/cases/inboxes')));
    }

    const [toastSession, t, query] = await Promise.all([
      toastSessionService.getSession(request),
      i18nextService.getFixedT(request, ['common', 'cases']),
      parseQuerySafe(request, z.object({ fromInbox: z.string() }).optional()),
    ]);

    // Check if the case exists
    const [error, caseDetail] = await tryit(async () => caseRepository.getCase({ caseId: parsedResult.data.caseId }))();
    if (error) {
      const destinationInboxId = query.data?.fromInbox ? query.data.fromInbox : MY_INBOX_ID;

      setToastMessage(toastSession, {
        type: 'error',
        message: isNotFoundHttpError(error) ? t('cases:errors.case_not_found') : t('common:errors.unknown'),
      });

      // Redirect to the destination inbox with a toast message
      return exit(
        redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: destinationInboxId }), {
          headers: { 'Set-Cookie': await toastSessionService.commitSession(toastSession) },
        }),
      );
    }

    // If the user doesn't have access to the inbox, redirect to the inboxes page
    const inboxes = await inboxRepository.listInboxes();
    const caseInbox = inboxes.find((inbox) => inbox.id === caseDetail.inboxId);
    if (!caseInbox) {
      return exit(redirect(getRoute('/cases/inboxes')));
    }

    return next({
      context: {
        inboxes,
        case: { detail: caseDetail, inbox: caseInbox },
      },
    });
  },
);
