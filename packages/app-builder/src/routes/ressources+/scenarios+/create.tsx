import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createScenarioPayloadSchema } from '@app-builder/queries/scenarios/create-scenario';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, rawData, { scenario }] = await Promise.all([
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = createScenarioPayloadSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    const createdScenario = await scenario.createScenario(data);
    const scenarioIteration = await scenario.createScenarioIteration({
      scenarioId: createdScenario.id,
    });

    return {
      redirectTo: getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUIDtoSUUID(createdScenario.id),
        iterationId: fromUUIDtoSUUID(scenarioIteration.id),
      }),
    };
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}
