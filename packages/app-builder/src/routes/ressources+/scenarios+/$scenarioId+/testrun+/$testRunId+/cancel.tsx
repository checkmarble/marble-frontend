import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const scenarioId = fromParams(params, 'scenarioId');
  const testRunId = fromParams(params, 'testRunId');
  const { testRun } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  try {
    await testRun.cancelTestRun({ testRunId });
    return Response.json({
      redirectTo: getRoute('/scenarios/:scenarioId/test-run', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
      }),
    });
  } catch (_error) {
    const { getSession, commitSession } = initServerServices(request).toastSessionService;

    const session = await getSession(request);

    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return Response.json(
      { success: false },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}
