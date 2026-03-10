import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import invariant from 'tiny-invariant';

export const loader = createServerFn([authMiddleware], async function sarDownloadLoader({ params, context }) {
  const { apiClient } = context.authInfo;

  const caseId = params['caseId'];
  invariant(caseId, 'caseId is required');
  const reportId = params['reportId'];
  invariant(reportId, 'reportId is required');

  return Response.json(await apiClient.sarDownload(caseId, reportId));
});
