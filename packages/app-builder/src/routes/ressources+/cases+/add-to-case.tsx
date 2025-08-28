import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusBadRequestHttpError } from '@app-builder/models';
import { addToCasePayloadSchema } from '@app-builder/queries/cases/add-to-case';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod/v4';

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

  const { success, error, data } = addToCasePayloadSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: z.treeifyError(error) });

  try {
    if (data.newCase) {
      const createdCase = await cases.createCase(data);
      return Response.json({
        redirectTo: getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(createdCase.id) }),
      });
    } else {
      await cases.addDecisionsToCase(data);

      setToastMessage(session, {
        type: 'success',
        messageKey: 'common:success.add_to_case',
      });

      return Response.json(
        { success: true },
        { headers: { 'Set-Cookie': await commitSession(session) } },
      );
    }
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: isStatusBadRequestHttpError(error)
        ? 'common:errors.add_to_case.invalid'
        : 'common:errors.unknown',
    });

    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
