import { initServerServices } from '@app-builder/services/init.server';
import { createFileRoute } from '@tanstack/react-router';
import invariant from 'tiny-invariant';

export const Route = createFileRoute('/ressources/cases/download-file/$fileId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { cases: caseRepository } = await authService.isAuthenticated(request, {
          failureRedirect: '/sign-in',
        });

        const fileId = params['fileId'];
        invariant(fileId, 'fileId is required');

        return Response.json(await caseRepository.getCaseFileDownloadLink(fileId));
      },
    },
  },
});
