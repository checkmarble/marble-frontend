import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { authService } = initServerServices(request);
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const caseId = params['caseId'];
  invariant(caseId, 'caseId is required');
  const reportId = params['reportId'];
  invariant(reportId, 'reportId is required');

  return Response.json(await apiClient.sarDownload(caseId, reportId));
};
