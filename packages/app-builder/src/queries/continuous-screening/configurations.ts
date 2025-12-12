import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { Inbox } from '@app-builder/models/inbox';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

type ContinuousScreeningConfiguration = ContinuousScreeningConfig & {
  inbox: Inbox | undefined;
};

const endpoint = getRoute('/ressources/continuous-screening/configurations');

export const useContinuousScreeningConfigurationsQuery = () => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['continuous-screening', 'configurations'],
    queryFn: async () => {
      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result.configurations as ContinuousScreeningConfiguration[];
    },
  });
};
