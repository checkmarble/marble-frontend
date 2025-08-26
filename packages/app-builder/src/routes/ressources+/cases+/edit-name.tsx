import { editNamePayloadSchema } from '@app-builder/queries/cases/edit-name';
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

  const { success, data, error } = editNamePayloadSchema.safeParse(raw);

  if (!success) return { success: false, errors: z.treeifyError(error) };

  await cases.updateCase({
    caseId: data.caseId,
    body: { name: data.name },
  });

  return { success: true, errors: [] };
}
