import { getRiskLevelLatestFn } from '@app-builder/server-fns/scoring';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useRiskLevelLatestQuery = (objectType: string, objectId: string, enabled: boolean = true) => {
  const getRiskLevelLatest = useServerFn(getRiskLevelLatestFn);

  return useQuery({
    queryKey: ['scoring', 'risk-level-latest', objectType, objectId],
    queryFn: () => getRiskLevelLatest({ data: { objectType, objectId } }),
    enabled: enabled && !!objectType && !!objectId,
    staleTime: 5 * 60 * 1000,
  });
};
