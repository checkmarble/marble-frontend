import { getObjectDetailsFn } from '@app-builder/server-fns/data';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useObjectDetailsQuery = (
  objectType: string | undefined,
  objectId: string | undefined,
  enabled: boolean = true,
) => {
  const getObjectDetails = useServerFn(getObjectDetailsFn);

  return useQuery({
    queryKey: ['object-details', objectType ?? '', objectId ?? ''] as const,
    queryFn: async ({ queryKey: [_, objectType, objectId] }) => {
      return getObjectDetails({ data: { objectType, objectId } });
    },
    enabled: enabled && !!objectType && !!objectId,
  });
};
