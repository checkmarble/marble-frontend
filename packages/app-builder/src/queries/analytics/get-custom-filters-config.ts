import { type CustomFiltersConfig, getCustomFiltersConfigFn } from '@app-builder/server-fns/analytics';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetCustomFiltersConfigQuery = (triggerObjectTypes: string[]) => {
  const getCustomFiltersConfig = useServerFn(getCustomFiltersConfigFn);

  return useQuery({
    queryKey: ['analytics', 'custom-filters-config', triggerObjectTypes],
    enabled: triggerObjectTypes.length > 0,
    queryFn: async () => getCustomFiltersConfig({ data: { triggerObjectTypes } }) as Promise<CustomFiltersConfig>,
  });
};
