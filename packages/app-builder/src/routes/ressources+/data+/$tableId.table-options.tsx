import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';

export const loader = createServerFn([handleRedirectMiddleware, authMiddleware], async ({ context, params }) => {
  const tableId = params['tableId'];
  invariant(tableId, 'tableId is required');

  const tableOptions = await context.authInfo.dataModelRepository.getDataModelTableOptions(tableId);

  return data({ tableOptions });
});
