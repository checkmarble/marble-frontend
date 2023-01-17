import type { ScenariosLoaderData } from '@marble-front/builder/routes/__builder/scenarios';
import type { RequiredKeys } from '@marble-front/builder/utils/utility-types';

function getLast<T extends { creationDate: string }>(elements: T[]) {
  return elements.reduce(
    (lastDeployment: T | undefined, deployment) =>
      lastDeployment && lastDeployment?.creationDate > deployment.creationDate
        ? lastDeployment
        : deployment,
    undefined
  );
}

export function createScenario(scenarioData: ScenariosLoaderData[number]) {
  return {
    id: scenarioData.id,
    creationDate: scenarioData.creationDate,
    authorId: scenarioData.authorId,
    name: scenarioData.name,
    description: scenarioData.description,
    mainTable: scenarioData.mainTable,
    deployments: scenarioData.deployments,
    versions: scenarioData.versions,

    get lastDeployment() {
      return getLast(this.deployments);
    },

    get lastVersion() {
      return getLast(this.versions);
    },

    get versionIdToOpen() {
      return this.lastDeployment?.scenarioVersionId ?? this.lastVersion?.id;
    },
  };
}
type Scenario = ReturnType<typeof createScenario>;

export const ScenarioPredicates = {
  isLive(
    scenario: Scenario
  ): scenario is RequiredKeys<Scenario, 'lastDeployment'> {
    return scenario.lastDeployment?.scenarioVersionId !== undefined;
  },
  hasVersionToOpen(
    scenario: Scenario
  ): scenario is RequiredKeys<Scenario, 'versionIdToOpen'> {
    return scenario?.versionIdToOpen !== undefined;
  },
};
