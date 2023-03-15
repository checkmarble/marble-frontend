import { createSimpleContext } from '@marble-front/builder/utils/create-context';
import { toUUID } from '@marble-front/builder/utils/short-uuid';
import { Outlet, useParams } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as R from 'remeda';
import invariant from 'tiny-invariant';

import { useScenarios } from '../scenarios';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

function useCurrentScenarioValue() {
  const scenarios = useScenarios();

  const { scenarioId } = useParams();
  invariant(scenarioId, 'scenarioId is required');

  const currentScenario = scenarios?.find(
    ({ id }) => id === toUUID(scenarioId)
  );
  invariant(currentScenario, `Unknown current scenario`);

  const publishedVersions = R.pipe(
    currentScenario.deployments,
    R.filter(
      (
        deployments
      ): deployments is Required<
        (typeof currentScenario.deployments)[number]
      > => deployments.scenarioVersionId !== undefined
    ),
    R.map((deployment) => ({
      id: deployment.id,
      type:
        currentScenario.liveVersion?.id === deployment.id
          ? ('live version' as const)
          : ('past version' as const),
      creationDate: deployment.creationDate,
      versionId: deployment.scenarioVersionId,
      label: deployment.frontendSerialName,
    }))
  );

  const publishedVersionIds = new Set(
    publishedVersions.map(({ versionId }) => versionId)
  );

  const drafts = R.pipe(
    currentScenario.versions,
    R.filter(({ id }) => !publishedVersionIds.has(id)),
    R.map((draft) => ({
      id: draft.id,
      type: 'draft' as const,
      creationDate: draft.creationDate,
      versionId: draft.id,
      label: undefined,
    }))
  );

  const scenarioIncrements = R.sortBy(
    [...publishedVersions, ...drafts],
    [({ creationDate }) => creationDate, 'desc']
  );

  const map = new Map(
    scenarioIncrements.map((increment) => [increment.id, increment])
  );
  return {
    ...currentScenario,
    increments: {
      values: scenarioIncrements,
      get(id: string) {
        return map.get(id);
      },
    },
  };
}

type CurrentScenario = ReturnType<typeof useCurrentScenarioValue>;

const { Provider, useValue: useCurrentScenario } =
  createSimpleContext<CurrentScenario>('CurrentScenario');

export default function CurrentScenarioContextProvider() {
  const value = useCurrentScenarioValue();
  return (
    <Provider value={value}>
      <Outlet />
    </Provider>
  );
}

export { useCurrentScenario };
export type Increments = ReturnType<typeof useCurrentScenario>['increments'];
export type Increment = Increments['values'][number];
