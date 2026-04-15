import { initServerServices } from '@app-builder/services/init.server';
import { createFileRoute } from '@tanstack/react-router';
import invariant from 'tiny-invariant';

export const Route = createFileRoute('/ressources/annotations/download-file/$annotationId/$fileId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { apiClient } = await authService.isAuthenticated(request, {
          failureRedirect: '/sign-in',
        });

        const annotationId = params['annotationId'];
        invariant(annotationId, 'annotationId is required');
        const fileId = params['fileId'];
        invariant(fileId, 'fileId is required');

        return Response.json(await apiClient.downloadAnnotationFile(annotationId, fileId));
      },
    },
  },
});
