import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import {
  type AnalyticsFiltersQuery,
  type DecisionOutcomesPerPeriod,
  type RuleVsDecisionOutcome,
} from '@app-builder/models/analytics';
import { RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import { ScreeningHitTableResponse } from '@app-builder/models/analytics/screening-hit';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useGetAnalytics = ({
  scenarioId,
  queryString,
}: {
  scenarioId: string;
  queryString: string;
}) => {
  const navigate = useAgnosticNavigation();
  const endpoint = getRoute('/ressources/analytics/:scenarioId/query', {
    scenarioId,
  });
  const qs = queryString ? atob(queryString) : null;
  const parsed: AnalyticsFiltersQuery = JSON.parse(qs || '{}');

  const { range, compareRange, scenarioVersion, trigger } = parsed;

  return useQuery({
    queryKey: ['analytics', 'query', scenarioId, queryString],
    enabled: Boolean(qs && range),
    queryFn: async () => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          scenarioVersion,
          range,
          compareRange,
          trigger,
        }),
      });

      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      if (!result.success) {
        throw new Error(result.errors?.join(', ') ?? 'Failed to fetch analytics');
      }

      return result.data as {
        decisionOutcomesPerDay: DecisionOutcomesPerPeriod | null;
        ruleHitTable: RuleHitTableResponse[] | null;
        screeningHitsTable: ScreeningHitTableResponse[] | null;
        // decisionsScoreDistribution: DecisionsScoreDistribution | null;
        ruleVsDecisionOutcome: RuleVsDecisionOutcome[] | null;
      };
    },
    placeholderData: keepPreviousData,
  });
};
