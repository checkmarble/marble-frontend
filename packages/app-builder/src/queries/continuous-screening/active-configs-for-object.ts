import { listActiveConfigsForObjectFn } from '@app-builder/server-fns/continuous-screening';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useActiveConfigsForObjectQuery = (objectType: string, objectId: string) => {
  const listActiveConfigsForObject = useServerFn(listActiveConfigsForObjectFn);

  return useQuery({
    queryKey: ['continuous-screening', 'active-configs', objectType, objectId],
    queryFn: async () => {
      const result = await listActiveConfigsForObject({ data: { objectType, objectId } });
      return result.configurations;
    },
  });
};
