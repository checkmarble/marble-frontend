import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { fromParams } from '@app-builder/utils/short-uuid';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ressources/lists/download-csv-file/$listId')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ context: { api }, params }) => {
        const listId = fromParams(params, 'listId');
        const fileContents = await api.downloadListValuesAsCsvFile(listId);

        return new Response(fileContents, {
          headers: {
            'Content-Disposition': `attachment; filename="list-${listId}.csv"`,
            'Content-Type': 'text/csv',
          },
        });
      },
    },
  },
});
