import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createCasePayloadSchema } from '@app-builder/queries/cases/create-case';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  return json({ inboxes: await inbox.listInboxes() });
}

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [raw, session, { cases }] = await Promise.all([
    request.json(),
    getSession(request),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = createCasePayloadSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: z.treeifyError(error) });

  try {
    const createdCase = await cases.createCase(data);

    return { redirectTo: getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(createdCase.id) }) };
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      { success: 'false', error: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
