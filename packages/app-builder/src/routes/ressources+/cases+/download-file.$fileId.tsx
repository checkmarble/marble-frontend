import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { authService } = initServerServices(request);
  const { cases: caseRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const fileId = params['fileId'];
  invariant(fileId, 'fileId is required');

  return Response.json(await caseRepository.getCaseFileDownloadLink(fileId));
};
