import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { ScoringRuleset } from '@app-builder/models/scoring';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

export const useListScoringRulesetVersionsQuery = (recordType: string) => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['scoring', 'ruleset-versions', recordType],
    queryFn: async () => {
      const url = new URL(
        getRoute('/ressources/scoring/list-ruleset-versions'),
        window.location.origin,
      );
      url.searchParams.set('recordType', recordType);
      const response = await fetch(url.toString());
      const result = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return;
      }

      return result as { versions: ScoringRuleset[] };
    },
    enabled: !!recordType,
  });
};
