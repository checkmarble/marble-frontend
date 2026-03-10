import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import invariant from 'tiny-invariant';

export const loader = createServerFn([authMiddleware], async function downloadScreeningFileLoader({ params, context }) {
  const { apiClient } = context.authInfo;

  const screeningId = params['screeningId'];
  invariant(screeningId, 'screeningId is required');
  const fileId = params['fileId'];
  invariant(fileId, 'fileId is required');

  return Response.json(await apiClient.downloadScreeningFile(screeningId, fileId));
});
