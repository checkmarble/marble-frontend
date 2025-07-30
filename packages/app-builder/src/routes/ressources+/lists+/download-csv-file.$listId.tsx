import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { authService } = initServerServices(request);
  const { customListsRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const listId = fromParams(params, 'listId');
  const fileContents = await customListsRepository.downloadValues(listId);

  return new Response(fileContents, {
    headers: {
      'Content-Disposition': `attachment; filename="list-${listId}.csv"`,
      'Content-Type': 'text/csv',
    },
  });
};
