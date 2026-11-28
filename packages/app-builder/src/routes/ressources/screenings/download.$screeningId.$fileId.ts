import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { createFileRoute } from '@tanstack/react-router';
import invariant from 'tiny-invariant';

export const Route = createFileRoute('/ressources/screenings/download/$screeningId/$fileId')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ context: { api }, params }) => {
        const screeningId = params['screeningId'];
        invariant(screeningId, 'screeningId is required');
        const fileId = params['fileId'];
        invariant(fileId, 'fileId is required');

        return Response.json(await api.downloadScreeningFile(screeningId, fileId));
      },
    },
  },
});
