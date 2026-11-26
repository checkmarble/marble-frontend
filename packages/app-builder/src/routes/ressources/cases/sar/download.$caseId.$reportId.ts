import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { createFileRoute } from '@tanstack/react-router';
import invariant from 'tiny-invariant';

export const Route = createFileRoute('/ressources/cases/sar/download/$caseId/$reportId')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ context: { api }, params }) => {
        const caseId = params['caseId'];
        invariant(caseId, 'caseId is required');
        const reportId = params['reportId'];
        invariant(reportId, 'reportId is required');

        return Response.json(await api.sarDownload(caseId, reportId));
      },
    },
  },
});
