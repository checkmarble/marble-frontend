import {
  type AnalyticsFiltersQuery,
  type AnalyticsQuery,
  DecisionOutcomesPerPeriod,
  DecisionsScoreDistribution,
  RuleVsDecisionOutcome,
  ScreeningHitTableResponse,
} from '@app-builder/models/analytics';
import { RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import {
  getDecisionOutcomesPerDayFn,
  getDecisionsScoreDistributionFn,
  getRuleHitTableFn,
  getRuleVsDecisionOutcomeFn,
  getScreeningHitsTableFn,
} from '@app-builder/server-fns/analytics';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useAnalyticsDataQuery = ({ scenarioId, queryString }: { scenarioId: string; queryString: string }) => {
  const getDecisionOutcomesPerDay = useServerFn(getDecisionOutcomesPerDayFn);
  const getDecisionsScoreDistribution = useServerFn(getDecisionsScoreDistributionFn);
  const getRuleHitTable = useServerFn(getRuleHitTableFn);
  const getRuleVsDecisionOutcome = useServerFn(getRuleVsDecisionOutcomeFn);
  const getScreeningHitsTable = useServerFn(getScreeningHitsTableFn);

  const qs = queryString ? atob(queryString) : null;
  const parsed: AnalyticsFiltersQuery = JSON.parse(qs || '{}');
  const { range, compareRange, scenarioVersion, trigger } = parsed;

  const enabled = Boolean(qs && range);
  const queryData: AnalyticsQuery = { scenarioId, range, compareRange, scenarioVersion, trigger };

  const decisionsOutcomesPerDayQuery = useQuery({
    queryKey: ['analytics', 'query', scenarioId, 'decision-outcomes-per-day', queryString],
    enabled,
    queryFn: async () => getDecisionOutcomesPerDay({ data: queryData }) as Promise<DecisionOutcomesPerPeriod>,
    placeholderData: keepPreviousData,
  });

  const decisionsScoreDistributionQuery = useQuery({
    queryKey: ['analytics', 'query', scenarioId, 'decisions-score-distribution', queryString],
    enabled,
    queryFn: async () => getDecisionsScoreDistribution({ data: queryData }) as Promise<DecisionsScoreDistribution>,
    placeholderData: keepPreviousData,
  });

  const ruleHitTableQuery = useQuery({
    queryKey: ['analytics', 'query', scenarioId, 'rule-hit-table', queryString],
    enabled,
    queryFn: async () => getRuleHitTable({ data: queryData }) as Promise<RuleHitTableResponse[]>,
    placeholderData: keepPreviousData,
  });

  const ruleVsDecisionOutcomeQuery = useQuery({
    queryKey: ['analytics', 'query', scenarioId, 'rule-vs-decision-outcome', queryString],
    enabled,
    queryFn: async () => getRuleVsDecisionOutcome({ data: queryData }) as Promise<RuleVsDecisionOutcome[]>,
    placeholderData: keepPreviousData,
  });

  const screeningHitsTableQuery = useQuery({
    queryKey: ['analytics', 'query', scenarioId, 'screening-hits-table', queryString],
    enabled,
    queryFn: async () => getScreeningHitsTable({ data: queryData }) as Promise<ScreeningHitTableResponse[]>,
    placeholderData: keepPreviousData,
  });

  return {
    decisionsOutcomesPerDayQuery,
    decisionsScoreDistributionQuery,
    ruleHitTableQuery,
    ruleVsDecisionOutcomeQuery,
    screeningHitsTableQuery,
  };
};
