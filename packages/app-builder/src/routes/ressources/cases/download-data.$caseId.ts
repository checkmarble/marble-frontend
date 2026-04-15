import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCaseInvestigationDataDownloadEndpoint } from '@app-builder/utils/files';
import { createFileRoute } from '@tanstack/react-router';
import invariant from 'tiny-invariant';

export const Route = createFileRoute('/ressources/cases/download-data/$caseId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { tokenService } = await authService.isAuthenticated(request, {
          failureRedirect: '/sign-in',
        });

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
