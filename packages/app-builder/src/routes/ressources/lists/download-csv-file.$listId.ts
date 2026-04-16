import { initServerServices } from '@app-builder/services/init.server';
import { fromParams } from '@app-builder/utils/short-uuid';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ressources/lists/download-csv-file/$listId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { customListsRepository } = await authService.isAuthenticated(request, {
          failureRedirect: '/sign-in',
        });

        const listId = fromParams(params, 'listId');
        const fileContents = await customListsRepository.downloadValues(listId);

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
