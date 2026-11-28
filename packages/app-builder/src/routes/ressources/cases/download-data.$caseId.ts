import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCaseInvestigationDataDownloadEndpoint } from '@app-builder/utils/files';
import { createFileRoute } from '@tanstack/react-router';
import invariant from 'tiny-invariant';

export const Route = createFileRoute('/ressources/cases/download-data/$caseId')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ context: { tokenService }, params }) => {
        const caseId = params['caseId'];
        invariant(caseId, 'caseId is required');

        // This download doesn't use the marble API because the oazapfts library configured in optimistic is stripping the response
        // so due to the download being a binary file, it's not possible to stream the response
        return fetch(`${getServerEnv('MARBLE_API_URL')}${getCaseInvestigationDataDownloadEndpoint(caseId)}`, {
          headers: {
            Authorization: `Bearer ${await tokenService.getToken()}`,
          },
        });
      },
    },
  },
});
