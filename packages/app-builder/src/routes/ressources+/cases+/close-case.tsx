import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { closeCasePayloadSchema } from '@app-builder/queries/cases/close-case';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { cases }] = await Promise.all([
    getFixedT(request, ['common', 'cases']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = closeCasePayloadSchema.safeParse(rawData);

  if (!success) return Response.json({ sucess: false, errors: z.treeifyError(error) });

  const { caseId, outcome, comment } = data;

  try {
    const promises = [
      cases.updateCase({
        caseId,
        body: { status: 'closed', outcome },
      }),
    ];

    if (data.comment !== '') {
      promises.push(
        cases.addComment({
          caseId,
          body: { comment },
        }),
      );
    }

    await Promise.all(promises);

    return Response.json({ success: true, errors: [] });
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
