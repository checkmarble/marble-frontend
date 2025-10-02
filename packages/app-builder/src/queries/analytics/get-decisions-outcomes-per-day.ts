import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import {
  DecisionOutcomesPerDayQuery,
  DecisionOutcomesPerPeriod,
} from '@app-builder/models/analytics';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useGetDecisionsOutcomesPerDay = ({
  scenarioId,
  scenarioVersion,
  dateRange,
  compareDateRange,
  trigger = [],
}: DecisionOutcomesPerDayQuery) => {
  const navigate = useAgnosticNavigation();
  const endpoint = getRoute('/ressources/analytics/decisions_outcomes_per_day/:scenarioId', {
    scenarioId,
  });
  return useQuery({
    queryKey: [
      'analytics',
      'decisions',
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

      return result as Promise<DecisionOutcomesPerPeriod>;
    },
    placeholderData: keepPreviousData,
  });
};
