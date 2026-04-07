import { ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { Inbox } from '@app-builder/models/inbox';
import { listContinuousScreeningConfigurationsFn } from '@app-builder/server-fns/continuous-screening';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type ContinuousScreeningConfiguration = ContinuousScreeningConfig & {
  inbox: Inbox | undefined;
};

export const useContinuousScreeningConfigurationsQuery = () => {
  const listContinuousScreeningConfigurations = useServerFn(listContinuousScreeningConfigurationsFn);

  return useQuery({
    queryKey: ['continuous-screening', 'configurations'],
    queryFn: async () => {
      const result = await listContinuousScreeningConfigurations();
      return result.configurations as ContinuousScreeningConfiguration[];
    },
  });
};
