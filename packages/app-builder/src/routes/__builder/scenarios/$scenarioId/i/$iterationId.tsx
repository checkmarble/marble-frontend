import { usePermissionsContext } from '@app-builder/components';
import { EditorModeContextProvider } from '@app-builder/services/editor';
import { CurrentScenarioIterationContextProvider } from '@app-builder/services/editor/current-scenario-iteration';
import { serverServices } from '@app-builder/services/init.server';
import { CurrentScenarioValidationContextProvider } from '@app-builder/services/validation/current-scenario-validation';
import { fromParams } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { isDefined } from 'remeda';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const iterationId = fromParams(params, 'iterationId');

  const scenarioIterationPromise = scenario.getScenarioIteration({
    iterationId,
  });

  const scenarioValidationPromise = scenario.validate({
    iterationId,
  });

  return json({
    scenarioIteration: await scenarioIterationPromise,
    scenarioValidation: await scenarioValidationPromise,
  });
}

export default function CurrentScenarioIterationProvider() {
  const { canManageScenario } = usePermissionsContext();
  const { scenarioIteration, scenarioValidation } =
    useLoaderData<typeof loader>();

  //TODO(merge view/edit): move this logic in an adapter from DTO
  const editorMode =
    canManageScenario && !isDefined(scenarioIteration.version)
      ? 'edit'
      : 'view';

  return (
    <CurrentScenarioIterationContextProvider value={scenarioIteration}>
      <CurrentScenarioValidationContextProvider value={scenarioValidation}>
        <EditorModeContextProvider value={editorMode}>
          <Outlet key={scenarioIteration.id} />
        </EditorModeContextProvider>
      </CurrentScenarioValidationContextProvider>
    </CurrentScenarioIterationContextProvider>
  );
}
