import { type DataModel } from '@app-builder/models/data-model';
import { getDataModelFn } from '@app-builder/server-fns/data';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const DATA_MODEL_QUERY_KEY = ['data-model'] as const;

export const useDataModelQuery = () => {
  const getDataModel = useServerFn(getDataModelFn);

  return useQuery({
    queryKey: DATA_MODEL_QUERY_KEY,
    queryFn: async () => getDataModel({}) as Promise<{ dataModel: DataModel }>,
  });
};
