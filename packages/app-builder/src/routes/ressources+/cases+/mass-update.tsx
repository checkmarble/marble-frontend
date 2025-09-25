import { massUpdateCasesPayloadSchema } from '@app-builder/queries/cases/mass-update';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { ActionFunctionArgs } from '@remix-run/server-runtime';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [raw, { cases: caseRepository }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const data = massUpdateCasesPayloadSchema.safeParse(raw);

  if (!data.success) {
    return { success: false, errors: z.treeifyError(data.error) };
  }

  try {
    await caseRepository.massUpdateCases({ body: data.data });
  } catch {
    return { success: false, errors: [] };
  }

  return null;
}
