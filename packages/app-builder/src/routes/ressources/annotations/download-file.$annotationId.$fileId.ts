import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { createFileRoute } from '@tanstack/react-router';
import invariant from 'tiny-invariant';

export const Route = createFileRoute('/ressources/annotations/download-file/$annotationId/$fileId')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ context: { api }, params }) => {
        const annotationId = params['annotationId'];
        invariant(annotationId, 'annotationId is required');
        const fileId = params['fileId'];
        invariant(fileId, 'fileId is required');

        return Response.json(await api.downloadAnnotationFile(annotationId, fileId));
      },
    },
  },
});
