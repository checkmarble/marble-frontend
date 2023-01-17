import { useParams, useRouteLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import type { ScenariosLoaderData } from '../routes/__builder/scenarios';

export function useScenarios() {
  const scenarios = useRouteLoaderData('routes/__builder/scenarios') as
    | ScenariosLoaderData
    | undefined;
  invariant(scenarios, 'No scenarios');

  return scenarios;
}

export function useCurrentScenario() {
  const scenarios = useScenarios();

  const { scenarioId } = useParams();
  invariant(scenarioId, 'scenarioId is required');

  const scenario = scenarios?.find(({ id }) => id === scenarioId);
  invariant(scenario, `Unknown scenario`);

  return scenario;
}

export function useCurrentScenarioVersion() {
  const scenario = useCurrentScenario();

  const { versionId } = useParams();
  invariant(versionId, 'versionId is required');

  const scenarioVersion = scenario.versions.find(({ id }) => id === versionId);
  invariant(scenarioVersion, `Unknown scenarioVersion`);

  return scenarioVersion;
}

export function useCurrentRule() {
  const {
    body: { rules },
  } = useCurrentScenarioVersion();

  const { ruleId } = useParams();
  invariant(ruleId, 'ruleId is required');

  const rule = rules.find(({ id }) => id === ruleId);
  invariant(rule, `Unknown rule`);

  return rule;
}
