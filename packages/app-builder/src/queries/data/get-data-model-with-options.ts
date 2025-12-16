import { DataModelWithTableOptions } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/data/data-model-with-options');

export const dataModelWithOptionsQueryOptions = {
  queryKey: ['data-model', 'with-options'],
  queryFn: async () => {
    const response = await fetch(endpoint);

    return response.json() as Promise<{ dataModel: DataModelWithTableOptions }>;
  },
};

export const useDataModelWithOptionsQuery = () => {
  return useQuery(dataModelWithOptionsQueryOptions);
};
