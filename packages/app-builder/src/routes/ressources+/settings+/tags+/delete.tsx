import { deleteTagPayloadSchema } from '@app-builder/queries/settings/tags/delete-tag';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const rawData = await request.json();
  const payload = deleteTagPayloadSchema.safeParse(rawData);

  if (!payload.success) {
    return Response.json({ success: false, errors: z.treeifyError(payload.error) });
  }

  try {
    await apiClient.deleteTag(payload.data.tagId);
    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, errors: [] });
  }
}
