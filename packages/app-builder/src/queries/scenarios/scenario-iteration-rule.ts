import { getIterationRuleFn } from '@app-builder/server-fns/scenarios';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useScenarioIterationRule(ruleId: string) {
  const getIterationRule = useServerFn(getIterationRuleFn);

  return useQuery({
    queryKey: ['scenario-iteration-rule', ruleId],
    queryFn: async () => getIterationRule({ data: { ruleId } }),
  });
}
