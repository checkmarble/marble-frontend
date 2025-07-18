import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { authService } = initServerServices(request);
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const annotationId = params['annotationId'];
  invariant(annotationId, 'annotationId is required');
  const fileId = params['fileId'];
  invariant(fileId, 'fileId is required');

  return Response.json(await apiClient.downloadAnnotationFile(annotationId, fileId));
};
