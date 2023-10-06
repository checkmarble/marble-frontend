import { usePermissionsContext } from '@app-builder/components';
import { EditorModeContextProvider } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { fromParams } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs, type SerializeFrom } from '@remix-run/node';
import { Outlet, useLoaderData, useRouteLoaderData } from '@remix-run/react';
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

  const scenarioIteration = await scenario.getScenarioIteration({
    iterationId,
  });
  return json(scenarioIteration);
}

export const useCurrentScenarioIteration = () =>
  useRouteLoaderData(
    'routes/__builder/scenarios/$scenarioId/i/$iterationId'
  ) as SerializeFrom<typeof loader>;

export default function CurrentScenarioIterationProvider() {
  const { canManageScenario } = usePermissionsContext();
  const currentIteration = useLoaderData<typeof loader>();

  //TODO(merge view/edit): move this logic in an adapter from DTO
  const editorMode =
    canManageScenario && !isDefined(currentIteration.version) ? 'edit' : 'view';

  return (
    <EditorModeContextProvider value={editorMode}>
      <Outlet />
    </EditorModeContextProvider>
  );
}
