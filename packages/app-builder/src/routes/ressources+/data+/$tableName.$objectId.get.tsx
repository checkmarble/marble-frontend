import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { HttpError } from '@oazapfts/runtime';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function dataTableNameObjectIdGetLoader({ context, params }) {
    const { dataModelRepository } = context.authInfo;
    const tableName = params['tableName'] ?? '';
    const objectId = params['objectId'] ?? '';

    try {
      const object = await dataModelRepository.getIngestedObject(tableName, objectId);

      return { tableName, objectId, object };
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        return { tableName, objectId, object: null };
      }
      throw err;
    }
  },
);
