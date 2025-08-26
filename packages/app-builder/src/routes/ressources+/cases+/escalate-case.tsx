import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { escalateCasePayloadSchema } from '@app-builder/queries/cases/escalate-case';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [raw, session, t, { cases }] = await Promise.all([
    request.json(),
    getSession(request),
    getFixedT(request, ['cases', 'common']),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, data, error } = escalateCasePayloadSchema.safeParse(raw);

  if (!success) return { success: false, errors: z.treeifyError(error) };

  try {
    await cases.escalateCase({ caseId: data.caseId });

    setToastMessage(session, {
      type: 'success',
      messageKey: t('cases:case.escalated'),
    });

    return Response.json(
      {
        redirectTo: getRoute('/cases/inboxes/:inboxId', { inboxId: fromUUIDtoSUUID(data.inboxId) }),
      },
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    );
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [] },
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    );
  }
}
