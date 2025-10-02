import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCaseInvestigationDataDownloadEndpoint } from '@app-builder/utils/files';
import { getRoute } from '@app-builder/utils/routes';
import { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { authService } = initServerServices(request);
  const { tokenService } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const caseId = params['caseId'];
  invariant(caseId, 'caseId is required');

  // This download doesn't use the marble API because the oazapfts library configured in optimistic is stripping the response
  // so due to the download being a binary file, it's not possible to stream the response
  return fetch(
    `${getServerEnv('MARBLE_API_URL')}${getCaseInvestigationDataDownloadEndpoint(caseId)}`,
    {
      headers: {
        Authorization: `Bearer ${await tokenService.getToken()}`,
      },
    },
  );
};
