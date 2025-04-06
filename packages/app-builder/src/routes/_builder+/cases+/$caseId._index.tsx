import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);

  const caseId = fromParams(params, 'caseId');
  if (!caseId) {
    return {
      redirect: getRoute('/cases/inboxes'),
    };
  }

  await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
    successRedirect: getRoute('/cases/:caseId/decisions', {
      caseId: fromUUIDtoSUUID(caseId),
    }),
  });
}
