import { ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { getContinuousScreeningConfigurationFn } from '@app-builder/server-fns/continuous-screening';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useContinuousScreeningConfigurationQuery = (stableId: string) => {
  const getContinuousScreeningConfiguration = useServerFn(getContinuousScreeningConfigurationFn);

  return useQuery({
    queryKey: ['continuous-screening', 'configuration', stableId],
    queryFn: async () => {
      const result = await getContinuousScreeningConfiguration({ data: { stableId } });
      return result.config as ContinuousScreeningConfig;
    },
  });
};
