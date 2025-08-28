import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { prepareIterationPayloadSchema } from '@app-builder/queries/scenarios/prepare-iteration';
import { PreparationServiceOccupied } from '@app-builder/repositories/ScenarioRepository';
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

  const [t, session, rawData, { scenario }] = await Promise.all([
    getFixedT(request, ['common', 'scenarios']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const { error, success } = prepareIterationPayloadSchema.safeParse(rawData);

  if (!success) {
    return Response.json(
      { success: false, errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await scenario.startPublicationPreparation({
      iterationId,
    });

    return Response.json({
      redirectTo: getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
      }),
    });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message:
        error instanceof PreparationServiceOccupied
          ? t('scenarios:deployment_modal.prepare.preparation_service_occupied')
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
