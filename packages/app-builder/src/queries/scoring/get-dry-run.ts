import { type ScoringDryRun } from '@app-builder/models/scoring';
import { getScoringDryRunFn } from '@app-builder/server-fns/scoring';
import { type Query, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const SCORING_DRY_RUN_POLL_INTERVAL_MS = 1000;

type ScoringDryRunQueryData = { dryRun: ScoringDryRun | null };

type ScoringDryRunQuery = Query<ScoringDryRunQueryData, Error, ScoringDryRunQueryData, string[]>;

type UseGetScoringDryRunQueryOptions = {
  enabled?: boolean;
  refetchInterval?: number | false | ((query: ScoringDryRunQuery) => number | false | undefined);
};

export const useGetScoringDryRunQuery = (recordType: string, options?: UseGetScoringDryRunQueryOptions) => {
  const getScoringDryRun = useServerFn(getScoringDryRunFn);

  return useQuery({
    queryKey: ['scoring', 'dry-run', recordType],
    queryFn: () => getScoringDryRun({ data: { recordType } }) as Promise<ScoringDryRunQueryData>,
    enabled: !!recordType && (options?.enabled ?? true),
    // forced refesh or depending of the status
    refetchInterval:
      options?.refetchInterval ??
      ((query) => {
        const status = query.state.data?.dryRun?.status;
        return status === 'running' || status === 'pending' ? SCORING_DRY_RUN_POLL_INTERVAL_MS : false;
      }),
  });
};
