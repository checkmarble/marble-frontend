import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createLinkValueSchema } from '@app-builder/queries/data/create-link';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, t, raw, { apiClient }] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common', 'data']),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = createLinkValueSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: z.treeifyError(error) });
  const { name, parentFieldId, childFieldId, parentTableId, childTableId } = data;

  try {
    await apiClient.postDataModelTableLink({
      name,
      parent_field_id: parentFieldId,
      child_field_id: childFieldId,
      parent_table_id: parentTableId,
      child_table_id: childTableId,
    });

    return json({ success: 'true', errors: [] });
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      setToastMessage(session, {
        type: 'error',
        message: t('common:errors.data.duplicate_link_name'),
      });
    }

    return json(
      { success: 'false', errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
