import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isAdmin } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { badRequest, forbidden } from '@app-builder/utils/http/http-responses';
import { getRoute } from '@app-builder/utils/routes';

import { ActionFunctionArgs } from '@remix-run/node';
import * as Sentry from '@sentry/remix';

export async function action({ request }: ActionFunctionArgs) {
  const { authService, toastSessionService } = initServerServices(request);
  const { aiAssistSettings, user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  if (!isAdmin(user)) {
    return forbidden('Only admins can update AI settings');
  }

  const [rawData, toastSession] = await Promise.all([
    request.json(),
    toastSessionService.getSession(request),
  ]);

  try {
    await aiAssistSettings.updateAiAssistSettings(rawData);
    setToastMessage(toastSession, {
      type: 'success',
      messageKey: 'common:success.save',
    });
  } catch (error) {
    setToastMessage(toastSession, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });
    Sentry.captureException(error);
    return badRequest(error);
  }

  return Response.json({ success: true });
}
