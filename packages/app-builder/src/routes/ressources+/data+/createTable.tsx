import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createTableValueSchema } from '@app-builder/queries/data/create-table';
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

  const { success, error, data } = createTableValueSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: z.treeifyError(error) });

  try {
    await apiClient.postDataModelTable(data);

    return json({ success: 'true', errors: [] });
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      setToastMessage(session, {
        type: 'error',
        message: t('common:errors.data.duplicate_table_name'),
      });
    }

    return json(
      { success: 'false', errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
