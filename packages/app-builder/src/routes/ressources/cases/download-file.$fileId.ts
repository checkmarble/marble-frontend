import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { createFileRoute } from '@tanstack/react-router';
import invariant from 'tiny-invariant';

export const Route = createFileRoute('/ressources/cases/download-file/$fileId')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ context, params }) => {
        const fileId = params['fileId'];
        invariant(fileId, 'fileId is required');

        return Response.json(await context.api.downloadCaseFile(fileId));
      },
    },
  },
});
