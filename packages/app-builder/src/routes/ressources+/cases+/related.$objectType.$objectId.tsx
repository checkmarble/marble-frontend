import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function relatedCasesByObjectLoader({ context, params }) {
    const objectType = params['objectType'];
    const objectId = params['objectId'];
    invariant(objectType, 'Object type is required');
    invariant(objectId, 'Object ID is required');

    const cases = await context.authInfo.cases.getObjectRelatedCases({ objectType, objectId });

    return data({ cases });
  },
);
