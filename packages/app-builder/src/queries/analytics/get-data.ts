import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import {
  type AnalyticsFiltersQuery,
  DecisionOutcomesPerPeriod,
  DecisionsScoreDistribution,
  RuleVsDecisionOutcome,
  ScreeningHitTableResponse,
} from '@app-builder/models/analytics';

import { RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

function createAnalyticsQuery<TData>(queryName: string) {
  return ({ scenarioId, queryString }: { scenarioId: string; queryString: string }) => {
    const navigate = useAgnosticNavigation();
    const endpoint = getRoute('/ressources/analytics/:scenarioId/query/:queryName', {
      scenarioId,
      queryName,
    });
    const qs = queryString ? atob(queryString) : null;
    const parsed: AnalyticsFiltersQuery = JSON.parse(qs || '{}');

    const { range, compareRange, scenarioVersion, trigger } = parsed;

    return useQuery({
      queryKey: ['analytics', 'query', scenarioId, queryName, queryString],
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

        const responseData = (await response.json()) as { redirectTo: string } | { data: TData };

        if ('redirectTo' in responseData) {
          navigate(responseData.redirectTo);
          return;
        }

        return responseData.data;
      },
      placeholderData: keepPreviousData,
    });
  };
}

export const useGetDecisionsOutcomesPerDay =
  createAnalyticsQuery<DecisionOutcomesPerPeriod>('decision-outcomes-per-day');
export const useGetDecisionsScoreDistribution =
  createAnalyticsQuery<DecisionsScoreDistribution>('decisions-score-distribution');

export const useGetRuleHitTable = createAnalyticsQuery<RuleHitTableResponse[]>('rule-hit-table');

export const useGetRuleVsDecisionOutcome = createAnalyticsQuery<RuleVsDecisionOutcome[]>('rule-vs-decision-outcome');

export const useGetScreeningHitsTable = createAnalyticsQuery<ScreeningHitTableResponse[]>('screening-hits-table');
