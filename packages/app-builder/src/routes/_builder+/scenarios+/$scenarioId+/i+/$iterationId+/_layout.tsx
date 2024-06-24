import {
  type EditorMode,
  EditorModeContextProvider,
} from '@app-builder/services/editor';
import { CurrentScenarioIterationContextProvider } from '@app-builder/services/editor/current-scenario-iteration';
import { serverServices } from '@app-builder/services/init.server';
import { CurrentScenarioValidationContextProvider } from '@app-builder/services/validation/current-scenario-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as R from 'remeda';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { user, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const iterationId = fromParams(params, 'iterationId');

  const [isEditScenarioAvailable, scenarioIteration, scenarioValidation] =
    await Promise.all([
      featureAccessService.isEditScenarioAvailable({
        userPermissions: user.permissions,
      }),
      scenario.getScenarioIteration({
        iterationId,
      }),
      scenario.validate({
        iterationId,
      }),
    ]);

  const editorMode: EditorMode =
    isEditScenarioAvailable && R.isNullish(scenarioIteration.version)
      ? 'edit'
      : 'view';

  return json({
    editorMode,
    scenarioIteration,
    scenarioValidation,
  });
}

export default function CurrentScenarioIterationProvider() {
  const { editorMode, scenarioIteration, scenarioValidation } =
    useLoaderData<typeof loader>();

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
