import { type ScenarioIterationRule } from '@app-builder/models/scenario/iteration-rule';
import { getIterationRulesFn } from '@app-builder/server-fns/scenarios';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useScenarioIterationRules(scenarioIterationId: string) {
  const getIterationRules = useServerFn(getIterationRulesFn);

  return useQuery({
    queryKey: ['scenario-iteration-rules', scenarioIterationId],
    queryFn: async () =>
      getIterationRules({ data: { iterationId: scenarioIterationId } }) as Promise<{
        rules: ScenarioIterationRule[];
        archived: boolean;
      }>,
  });
}
