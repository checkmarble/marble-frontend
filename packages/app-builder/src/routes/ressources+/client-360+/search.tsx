import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { client360SearchPayloadSchema } from '@app-builder/queries/client360/search';

export const action = createServerFn([handleRedirectMiddleware, authMiddleware], async ({ request, context }) => {
  const { client360 } = context.authInfo;

  const rawData = await request.json();
  const parsedData = client360SearchPayloadSchema.parse(rawData);

  return client360.searchClient360(parsedData);
});
