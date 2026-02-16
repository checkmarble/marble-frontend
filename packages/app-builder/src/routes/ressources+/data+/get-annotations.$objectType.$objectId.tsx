import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';
import z from 'zod';

const queryParams = z.object({
  load_thumbnails: z.stringbool().optional(),
});

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async ({ request, context, params }) => {
    const { objectType, objectId } = params;
    const { dataModelRepository } = context.authInfo;

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const parsedSearchParams = queryParams.parse(Object.fromEntries(searchParams));

    invariant(objectType, 'Object type is required');
    invariant(objectId, 'Object ID is required');

    const annotations = await dataModelRepository.getAnnotationsByTableNameAndObjectId(
      objectType,
      objectId,
      parsedSearchParams.load_thumbnails ?? false,
    );

    return data({ annotations });
  },
);
