import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { activateIterationPayloadSchema } from '@app-builder/queries/scenarios/activate-iteration';
import {
  IsDraftError,
  PreparationIsRequiredError,
  PreparationServiceOccupied,
  ValidationError,
} from '@app-builder/repositories/ScenarioRepository';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
    i18nextService: { getFixedT },
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

  const { error, success } = activateIterationPayloadSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await scenario.createScenarioPublication({
      publicationAction: 'publish',
      scenarioIterationId: iterationId,
    });

    return Response.json({
      redirectTo: getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
        iterationId: fromUUIDtoSUUID(iterationId),
      }),
    });
  } catch (error) {
    let formError: string;
    if (error instanceof ValidationError) {
      formError = t('scenarios:deployment_modal.activate.validation_error');
    } else if (error instanceof PreparationIsRequiredError) {
      formError = t('scenarios:deployment_modal.activate.preparation_is_required_error');
    } else if (error instanceof PreparationServiceOccupied) {
      formError = t('scenarios:deployment_modal.activate.preparation_service_occupied_error');
    } else if (error instanceof IsDraftError) {
      formError = t('scenarios:deployment_modal.activate.is_draft_error');
    } else {
      formError = t('common:errors.unknown');
    }

    setToastMessage(session, {
      type: 'error',
      message: formError,
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}
