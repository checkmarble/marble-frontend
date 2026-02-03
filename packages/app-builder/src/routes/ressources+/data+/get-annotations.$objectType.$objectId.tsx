import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';

export const loader = createServerFn([handleRedirectMiddleware, authMiddleware], async ({ context, params }) => {
  const { objectType, objectId } = params;
  const { dataModelRepository } = context.authInfo;

  invariant(objectType, 'Object type is required');
  invariant(objectId, 'Object ID is required');

  const annotations = await dataModelRepository.getAnnotationsByTableNameAndObjectId(objectType, objectId);

  console.log('annotations', annotations);

  return data({ annotations });
});
