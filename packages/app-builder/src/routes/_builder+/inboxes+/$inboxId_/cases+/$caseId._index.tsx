import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;

  const caseId = fromParams(params, 'caseId');
  const inboxId = fromParams(params, 'inboxId');
  if (!caseId || !inboxId) {
    return {
      redirect: getRoute('/inboxes'),
    };
  }

  await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
    successRedirect: getRoute('/inboxes/:inboxId/cases/:caseId', {
      caseId: fromUUID(caseId),
      inboxId: fromUUID(inboxId),
    }),
  });
}
