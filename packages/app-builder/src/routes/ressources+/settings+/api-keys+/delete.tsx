import { deleteApiKeyPayloadSchema } from '@app-builder/queries/settings/api-keys/delete-api-key';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { apiKey } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const raw = await request.json();
  const payload = deleteApiKeyPayloadSchema.safeParse(raw);

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    await apiKey.deleteApiKey(payload.data);
    return Response.json({ redirectTo: getRoute('/settings/api-keys') });
  } catch {
    return Response.json({ success: false, errors: [] });
  }
}
