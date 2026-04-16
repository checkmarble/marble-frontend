import { type ScoreDistributionItem } from '@app-builder/repositories/UserScoringRepository';
import { getScoreDistributionFn } from '@app-builder/server-fns/scoring';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetScoreDistributionQuery = (recordType: string) => {
  const getScoreDistribution = useServerFn(getScoreDistributionFn);

  return useQuery({
    queryKey: ['scoring', 'distribution', recordType],
    queryFn: () => getScoreDistribution({ data: { recordType } }) as Promise<{ distribution: ScoreDistributionItem[] }>,
    enabled: !!recordType,
  });
};
