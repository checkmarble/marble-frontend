import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function downloadAnnotationFileLoader({ params, context }) {
    const { apiClient } = context.authInfo;

    const annotationId = params['annotationId'];
    invariant(annotationId, 'annotationId is required');
    const fileId = params['fileId'];
    invariant(fileId, 'fileId is required');

    return Response.json(await apiClient.downloadAnnotationFile(annotationId, fileId));
  },
);
