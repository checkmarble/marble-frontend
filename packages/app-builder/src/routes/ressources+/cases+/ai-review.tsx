import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';

import { ActionFunctionArgs } from '@remix-run/node';
import * as Sentry from '@sentry/remix';

export async function action({ request }: ActionFunctionArgs) {
  const { authService, toastSessionService } = initServerServices(request);
  const { aiAssistSettings } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const [rawData, toastSession] = await Promise.all([request.json(), toastSessionService.getSession(request)]);

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
    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await toastSessionService.commitSession(toastSession) } },
    );
  }

  return Response.json(
    { success: true },
    { headers: { 'Set-Cookie': await toastSessionService.commitSession(toastSession) } },
  );
}
