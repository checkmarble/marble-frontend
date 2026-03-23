import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { ScoringRuleset } from '@app-builder/models/scoring';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/scoring/list-rulesets');

export const useListScoringRulesetsQuery = () => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['scoring', 'rulesets'],
    queryFn: async () => {
      const response = await fetch(endpoint);
      const result = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return;
      }

      return result as { rulesets: ScoringRuleset[] };
    },
  });
};
