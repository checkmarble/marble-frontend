import { editTagsPayloadSchema } from '@app-builder/queries/cases/edit-tags';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [raw, { cases }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, data, error } = editTagsPayloadSchema.safeParse(raw);

  if (!success) return { success: false, errors: z.treeifyError(error) };

  await cases.setTags(data);

  return { success: true };
}
