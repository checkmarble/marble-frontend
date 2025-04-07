import { initServerServices } from '@app-builder/services/init.server';
import { parseIdParamSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);

  const parsedParams = await parseIdParamSafe(params, 'caseId');

  if (!parsedParams.success) {
    return { redirect: getRoute('/cases/inboxes') };
  }

  await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
    successRedirect: getRoute('/cases/:caseId/decisions', {
      caseId: fromUUIDtoSUUID(parsedParams.data.caseId),
    }),
  });
}
