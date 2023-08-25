import {
  Callout,
  navigationI18n,
  ScenarioPage,
  Scenarios,
  type ScenariosLinkProps,
} from '@app-builder/components';
import { VersionSelect } from '@app-builder/components/Scenario/Iteration/VersionSelect';
import { sortScenarioIterations } from '@app-builder/models/scenario-iteration';
import { useCurrentScenario } from '@app-builder/routes/__builder/scenarios/$scenarioId';
import { DeploymentModal } from '@app-builder/routes/ressources/scenarios/deployment';
import {
  EditorIdentifiersProvider,
  EditorOperatorsProvider,
} from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs, redirect } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { Tag } from '@ui-design-system';
import { Decision, Rules, Trigger } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';

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

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { editor, scenario, user } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: '/login',
    }
  );

  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const operatorsPromise = editor.listOperators({
    scenarioId,
  });

  const identifiersPromise = editor.listIdentifiers({
    scenarioId,
  });

  const scenarioValidationPromise = scenario.validate({
    iterationId: iterationId,
  });

  if (!user.permissions.canManageScenario) {
    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/view', {
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(iterationId),
      })
    );
  }

  const scenarioIterations = await scenario.listScenarioIterations({
    scenarioId,
  });

  let currentIteration = scenarioIterations.find(
    ({ id }) => id === iterationId
  );

  if (currentIteration && currentIteration.version !== null) {
    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/view', {
        scenarioId: fromUUID(currentIteration.scenarioId),
        iterationId: fromUUID(currentIteration.id),
      })
    );
  } else {
    currentIteration = R.sortBy(scenarioIterations, [
      ({ createdAt }) => createdAt,
      'desc',
    ])[0];
  }

  return json({
    scenarioIterations: scenarioIterations,
    currentIteration: currentIteration,
    identifiers: await identifiersPromise,
    operators: await operatorsPromise,
    scenarioValidation: await scenarioValidationPromise,
  });
}

export default function ScenarioEditLayout() {
  const currentScenario = useCurrentScenario();
  const {
    scenarioIterations,
    currentIteration,
    identifiers,
    operators,
    scenarioValidation,
  } = useLoaderData<typeof loader>();

  const sortedScenarioIterations = sortScenarioIterations(
    scenarioIterations,
    currentScenario.liveVersionId
  );

  const iterationId = useParam('iterationId');

  const currentIterationSorted = sortedScenarioIterations.find(
    ({ id }) => id === iterationId
  ) ?? {
    ...currentIteration,
    type:
      currentIteration.version !== null
        ? ('live version' as const)
        : ('draft' as const),
  };

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
              <VersionSelect
                scenarioIterations={sortedScenarioIterations}
                currentIteration={currentIterationSorted}
              />
              <Tag size="big" border="square">
                Edit
              </Tag>
            </div>
            <div className="flex-column flex gap-4">
              <DeploymentModal
                scenarioId={currentScenario.id}
                liveVersionId={currentScenario.liveVersionId}
                currentIteration={{ ...currentIteration, type: 'draft' }}
              />
            </div>
          </ScenarioPage.Header>
          <ScenarioPage.Content>
            <SanityErrors errors={scenarioValidation?.errors ?? []} />
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

function SanityErrors({ errors }: { errors: string[] }) {
  const { t } = useTranslation(handle.i18n);

  if (errors.length === 0) return null;

  return (
    <Callout variant="error">
      <div className="flex flex-col">
        <p>
          {t('common:error', {
            count: errors.length,
          })}
        </p>
        <ul className="list-inside list-disc">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    </Callout>
  );
}
