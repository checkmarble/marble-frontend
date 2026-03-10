import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { fromParams } from '@app-builder/utils/short-uuid';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function downloadCsvFileLoader({ params, context }) {
    const { customListsRepository } = context.authInfo;

    const listId = fromParams(params, 'listId');
    const fileContents = await customListsRepository.downloadValues(listId);

    return new Response(fileContents, {
      headers: {
        'Content-Disposition': `attachment; filename="list-${listId}.csv"`,
        'Content-Type': 'text/csv',
      },
    });
  },
);
