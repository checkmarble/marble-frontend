import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createTestRunPayloadSchema } from '@app-builder/queries/scenarios/create-testrun';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);
  const scenarioId = fromParams(params, 'scenarioId');

  const [t, session, rawData, { testRun }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = createTestRunPayloadSchema.safeParse(rawData);

  if (!success) {
    return Response.json(
      { success: false, errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await testRun.launchTestRun({ ...data, scenarioId });

    return Response.json({
      redirectTo: getRoute('/scenarios/:scenarioId/test-run', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
      }),
    });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: isStatusConflictHttpError(error)
        ? t('common:errors.data.duplicate_test_run')
        : t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}
