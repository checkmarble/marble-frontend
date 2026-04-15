import { initServerServices } from '@app-builder/services/init.server';
import { createFileRoute } from '@tanstack/react-router';
import invariant from 'tiny-invariant';

export const Route = createFileRoute('/ressources/cases/sar/download/$caseId/$reportId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { apiClient } = await authService.isAuthenticated(request, {
          failureRedirect: '/sign-in',
        });

        const caseId = params['caseId'];
        invariant(caseId, 'caseId is required');
        const reportId = params['reportId'];
        invariant(reportId, 'reportId is required');

        return Response.json(await apiClient.sarDownload(caseId, reportId));
      },
    },
  },
});
