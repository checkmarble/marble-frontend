import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';

export const loader = createServerFn([handleRedirectMiddleware, authMiddleware], async ({ context, params }) => {
  const stableId = params['stableId'];
  invariant(stableId, 'Stable ID is required');

  const config = await context.authInfo.continuousScreening.getConfiguration(stableId);

  return data({ config });
});
