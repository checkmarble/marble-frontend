import { getScoreLatestFn } from '@app-builder/server-fns/scoring';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { type ScoringScore } from 'marble-api';

export const useScoreLatestQuery = (objectType: string, objectId: string) => {
  const getScoreLatest = useServerFn(getScoreLatestFn);

  return useQuery({
    queryKey: ['scoring', 'score-latest', objectType, objectId],
    queryFn: () => getScoreLatest({ data: { objectType, objectId } }) as Promise<{ score: ScoringScore | null }>,
    enabled: !!objectType && !!objectId,
  });
};
