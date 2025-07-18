import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
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

  return fetch(
    `${getServerEnv('MARBLE_API_URL_SERVER')}/cases/${encodeURIComponent(caseId)}/data_for_investigation`,
    {
      headers: {
        Authorization: `Bearer ${await tokenService.getToken()}`,
      },
    },
  );
};
