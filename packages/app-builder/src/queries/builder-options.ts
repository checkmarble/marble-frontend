import { type BuilderOptionsResource, getBuilderOptionsFn } from '@app-builder/server-fns/scenarios';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export type { BuilderOptionsResource };

type UseBuilderOptionsQueryParams = {
  scenarioId: string;
  initialData?: BuilderOptionsResource;
};
export function useBuilderOptionsQuery(params: UseBuilderOptionsQueryParams) {
  const getBuilderOptions = useServerFn(getBuilderOptionsFn);
  const queryKey = ['resources', 'builder-options', fromUUIDtoSUUID(params.scenarioId)] as const;

  return useQuery({
    queryKey,
    queryFn: async () =>
      getBuilderOptions({ data: { scenarioId: params.scenarioId } }) as Promise<BuilderOptionsResource>,
    initialData: params.initialData,
  });
}
