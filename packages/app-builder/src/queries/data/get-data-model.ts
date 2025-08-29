import { DataModel } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/data/data-model');

export const useDataModelQuery = () => {
  return useQuery({
    queryKey: ['data-model'],
    queryFn: async () => {
      const response = await fetch(endpoint);

      return response.json() as Promise<{ dataModel: DataModel }>;
    },
  });
};
