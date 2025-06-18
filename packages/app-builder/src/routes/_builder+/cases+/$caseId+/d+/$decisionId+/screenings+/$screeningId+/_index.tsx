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

  const decisionId = fromParams(params, 'decisionId');
  const screeningId = fromParams(params, 'screeningId');
  if (!decisionId || !screeningId) {
    return {
      redirect: getRoute('/cases/:caseId', {
        caseId: fromUUIDtoSUUID(caseId),
      }),
    };
  }

  await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
    successRedirect: getRoute('/cases/:caseId/d/:decisionId/screenings/:screeningId/hits', {
      caseId: fromUUIDtoSUUID(caseId),
      decisionId: fromUUIDtoSUUID(decisionId),
      screeningId: fromUUIDtoSUUID(screeningId),
    }),
  });
}
