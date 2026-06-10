import { type ScenarioPublicationStatus } from '@app-builder/models/scenario/publication';
import { getPublicationPreparationStatusFn } from '@app-builder/server-fns/scenarios';
import { type Query, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type PublicationPreparationStatusQuery = Query<ScenarioPublicationStatus, Error, ScenarioPublicationStatus, string[]>;

type UsePublicationPreparationStatusQueryOptions = {
  enabled?: boolean;
  refetchInterval?: number | false | ((query: PublicationPreparationStatusQuery) => number | false | undefined);
};

export function usePublicationPreparationStatusQuery(
  scenarioId: string,
  iterationId: string,
  options?: UsePublicationPreparationStatusQueryOptions,
) {
  const getPublicationPreparationStatus = useServerFn(getPublicationPreparationStatusFn);

  return useQuery({
    queryKey: ['scenarios', 'iterations', 'publicationPreparationStatus', scenarioId, iterationId],
    queryFn: async () => getPublicationPreparationStatus({ data: { scenarioId, iterationId } }),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}
