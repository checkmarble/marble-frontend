import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function downloadCaseFileLoader({ params, context }) {
    const { cases: caseRepository } = context.authInfo;

    const fileId = params['fileId'];
    invariant(fileId, 'fileId is required');

    return Response.json(await caseRepository.getCaseFileDownloadLink(fileId));
  },
);
