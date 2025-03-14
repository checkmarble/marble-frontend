import { type BuilderOptionsResource } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/builder-options';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { useQuery } from '@tanstack/react-query';

const endpoint = (scenarioId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/builder-options', {
    scenarioId,
  });

type UseBuilderOptionsQueryParams = {
  scenarioId: string;
  initialData?: BuilderOptionsResource;
};
export function useBuilderOptionsQuery(params: UseBuilderOptionsQueryParams) {
  const queryKey = ['resources', 'builder-options', fromUUID(params.scenarioId)] as const;

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [_r, __, scenarioNanoId] }) => {
      const response = await fetch(endpoint(scenarioNanoId), {
        method: 'GET',
      });
      return response.json() as Promise<BuilderOptionsResource>;
    },
    initialData: params.initialData,
  });
}
