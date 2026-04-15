import { initServerServices } from '@app-builder/services/init.server';
import { createFileRoute } from '@tanstack/react-router';
import invariant from 'tiny-invariant';

export const Route = createFileRoute('/ressources/screenings/download/$screeningId/$fileId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { apiClient } = await authService.isAuthenticated(request, {
          failureRedirect: '/sign-in',
        });

        const screeningId = params['screeningId'];
        invariant(screeningId, 'screeningId is required');
        const fileId = params['fileId'];
        invariant(fileId, 'fileId is required');

        return Response.json(await apiClient.downloadScreeningFile(screeningId, fileId));
      },
    },
  },
});
