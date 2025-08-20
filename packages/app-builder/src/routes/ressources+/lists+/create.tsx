import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createListPayloadSchema } from '@app-builder/schemas/lists';
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

  const [raw, session, { customListsRepository }] = await Promise.all([
    request.json(),
    getSession(request),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = createListPayloadSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: z.treeifyError(error) });

  try {
    const result = await customListsRepository.createCustomList(data);

    return { redirectTo: getRoute('/lists/:listId', { listId: fromUUIDtoSUUID(result.id) }) };
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: isStatusConflictHttpError(error)
        ? 'common:errors.list.duplicate_list_name'
        : 'common:errors.unknown',
    });

    return json(
      { success: 'false', error: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
