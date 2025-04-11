import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);

  const caseId = fromParams(params, 'caseId');
  const decisionId = fromParams(params, 'decisionId');
  if (!caseId) {
    return {
      redirect: getRoute('/cases/inboxes'),
    };
  }

  if (!decisionId) {
    return {
      redirect: getRoute('/cases/:caseId', {
        caseId: fromUUIDtoSUUID(caseId),
      }),
    };
  }

  await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
    successRedirect: getRoute('/cases/:caseId/sanctions/:decisionId/hits', {
      caseId: fromUUIDtoSUUID(caseId),
      decisionId: fromUUIDtoSUUID(decisionId),
    }),
  });
}
