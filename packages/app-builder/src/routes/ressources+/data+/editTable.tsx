import { editTablePayloadSchema } from '@app-builder/queries/data/edit-table';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [raw, { apiClient }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = editTablePayloadSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: z.treeifyError(error) });

  try {
    await apiClient.patchDataModelTable(data.tableId, {
      description: data.description,
    });

    return json({ success: 'true', errors: [] });
  } catch (_error) {
    return json({ success: 'false', errors: [] });
  }
}
