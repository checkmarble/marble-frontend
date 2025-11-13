import { initServerServices } from '@app-builder/services/init.server';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { z } from 'zod/v4';

const paginationSchema = z.object({
  limit: z.coerce.number().optional(),
  cursorId: z.string().optional(),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { cases: caseRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const caseId = fromParams(params, 'caseId');
  const parsedPaginationQuery = await parseQuerySafe(request, paginationSchema);
  if (!parsedPaginationQuery.success) {
    return Response.json({ error: parsedPaginationQuery.error }, { status: 400 });
  }

  const paginatedDecisions = await caseRepository.listCaseDecisions(
    { caseId },
    { ...parsedPaginationQuery.data, limit: 200 },
  );

  return Response.json(paginatedDecisions);
}
