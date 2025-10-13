import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { AnalyticsQuery, DecisionOutcomesPerPeriod } from '@app-builder/models/analytics';
import { RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useGetAnalytics = ({
  scenarioId,
  scenarioVersion,
  dateRange,
  compareDateRange = undefined,
  trigger = [],
}: AnalyticsQuery) => {
  const navigate = useAgnosticNavigation();
  const endpoint = getRoute('/ressources/analytics/:scenarioId/query', {
    scenarioId,
  });
  return useQuery({
    queryKey: [
      'analytics',
      'query',
      scenarioId,
      scenarioVersion,
      dateRange,
      compareDateRange,
      trigger,
    ],
    queryFn: async () => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId,
          scenarioVersion,
          dateRange: {
            start: dateRange.start,
            end: dateRange.end,
          },
          compareDateRange: compareDateRange
            ? {
                start: compareDateRange.start,
                end: compareDateRange.end,
              }
            : undefined,
          trigger,
        }),
      });

      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result as {
        decisionOutcomesPerDay: DecisionOutcomesPerPeriod | null;
        ruleHitTable: RuleHitTableResponse[] | null;
      };
    },
    placeholderData: keepPreviousData,
  });
};
