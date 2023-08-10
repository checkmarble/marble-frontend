import {
  navigationI18n,
  ScenarioPage,
  Scenarios,
  type ScenariosLinkProps,
  usePermissionsContext,
} from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type AstOperator } from '@app-builder/models/ast-operators';
import { type EditorIdentifiersByType } from '@app-builder/models/identifier';
import { type ScenarioIteration } from '@app-builder/models/scenario';
import { useCurrentScenario } from '@app-builder/routes/__builder/scenarios/$scenarioId';
import { DeploymentModal } from '@app-builder/routes/ressources/scenarios/deployment';
import {
  EditorIdentifiersProvider,
  EditorOperatorsProvider,
} from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { Tag } from '@ui-design-system';
import { Decision, Rules, Trigger } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useEffect } from 'react';
import { redirectBack } from 'remix-utils';

export const handle = {
  i18n: [...navigationI18n, 'scenarios', 'common'] satisfies Namespace,
};

const LINKS: ScenariosLinkProps[] = [
  { labelTKey: 'navigation:scenario.trigger', to: './trigger', Icon: Trigger },
  { labelTKey: 'navigation:scenario.rules', to: './rules', Icon: Rules },
  {
    labelTKey: 'navigation:scenario.decision',
    to: './decision',
    Icon: Decision,
  },
];

interface LoaderResponse {
  scenarioIteration: ScenarioIteration;
  identifiers: EditorIdentifiersByType;
  operators: AstOperator[];
}

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { scenario, editor } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const iterationId = fromParams(params, 'iterationId');

  const scenarioIteration = await scenario.getScenarioIteration({
    iterationId,
  });

  if (scenarioIteration.version !== null) {
    const { getSession, commitSession } = serverServices.sessionService;
    const session = await getSession(request);

    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.edit.forbidden_not_draft',
    });
    return redirectBack(request, {
      fallback: getRoute('/scenarios/:scenarioId/i/:iterationId/view', {
        scenarioId: fromUUID(scenarioIteration.scenarioId),
        iterationId: fromUUID(scenarioIteration.id),
      }),
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
  const scenarioId = fromParams(params, 'scenarioId');
  const operators = await editor.listOperators({
    scenarioId,
  });

  const identifiers = await editor.listIdentifiers({
    scenarioId,
  });

  return json({
    scenarioIteration: scenarioIteration,
    identifiers: identifiers,
    operators: operators,
  });
}

export default function ScenarioEditLayout() {
  const currentScenario = useCurrentScenario();
  const { scenarioIteration, identifiers, operators } = useLoaderData<
    typeof loader
  >() as LoaderResponse;

  const { userPermissions } = usePermissionsContext();

  useEffect(() => {
    if (!userPermissions.canManageScenario) {
      const redirectUrl = getRoute(
        '/scenarios/:scenarioId/i/:iterationId/view',
        {
          scenarioId: fromUUID(scenarioIteration.scenarioId),
          iterationId: fromUUID(scenarioIteration.id),
        }
      );
      window.location.replace(redirectUrl);
    }
  }, [
    scenarioIteration.id,
    scenarioIteration.scenarioId,
    userPermissions.canManageScenario,
  ]);

  return (
    <ScenarioPage.Container>

        <EditorIdentifiersProvider identifiers={identifiers}>
          <EditorOperatorsProvider operators={operators}>
              <ScenarioPage.Header className="justify-between">
                <div className="flex flex-row items-center gap-4">
                  <Link to={getRoute('/scenarios')}>
                    <ScenarioPage.BackButton />
                  </Link>
                  {currentScenario.name}
                  <Tag size="big" border="square">
                    Edit
                  </Tag>
                </div>
                <DeploymentModal
                  scenarioId={currentScenario.id}
                  liveVersionId={currentScenario.liveVersionId}
                  currentIteration={{...scenarioIteration, type: 'draft'}}
                />
              </ScenarioPage.Header>
              <ScenarioPage.Content className="max-w-3xl overflow-scroll">
                <Scenarios.Nav>
                  {LINKS.map((linkProps) => (
                    <li key={linkProps.labelTKey}>
                      <Scenarios.Link {...linkProps} />
                    </li>
                  ))}
                </Scenarios.Nav>
                <Outlet />
              </ScenarioPage.Content>
          </EditorOperatorsProvider>
        </EditorIdentifiersProvider>
    </ScenarioPage.Container>
  );
}
