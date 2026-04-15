import { type DataModelWithTableOptions } from '@app-builder/models/data-model';
import { getDataModelWithOptionsFn } from '@app-builder/server-fns/data';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useDataModelWithOptionsQuery = () => {
  const getDataModelWithOptions = useServerFn(getDataModelWithOptionsFn);

  return useQuery({
    queryKey: ['data-model', 'with-options'],
    queryFn: async () => getDataModelWithOptions({}) as Promise<{ dataModel: DataModelWithTableOptions }>,
  });
};
