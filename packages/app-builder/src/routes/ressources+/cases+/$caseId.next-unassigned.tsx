import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { redirect } from '@remix-run/server-runtime';
import invariant from 'tiny-invariant';

export const loader = createServerFn([authMiddleware], async ({ request, context, params }) => {
  const caseId = params['caseId'];
  invariant(caseId, 'Case ID is required');

  const {
    toastSessionService,
    i18nextService: { getFixedT },
  } = context.services;

  const [toastSession, t] = await Promise.all([
    toastSessionService.getSession(request),
    getFixedT(request, ['common', 'cases']),
  ]);

  try {
    const nextCaseId = await context.authInfo.cases.getNextUnassignedCaseId({ caseId });
    if (!nextCaseId) {
      setToastMessage(toastSession, {
        type: 'error',
        messageKey: t('cases:errors.no_next_unassigned_case'),
      });

      return redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: MY_INBOX_ID }), {
        headers: {
          'Set-Cookie': await toastSessionService.commitSession(toastSession),
        },
      });
    }

    return redirect(getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(nextCaseId) }));
  } catch {
    setToastMessage(toastSession, {
      type: 'error',
      messageKey: t('common:errors.unknown'),
    });

    return redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: MY_INBOX_ID }), {
      headers: {
        'Set-Cookie': await toastSessionService.commitSession(toastSession),
      },
    });
  }
});
