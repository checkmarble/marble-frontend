import { getDataModelFn, getObjectDetailsFn } from '@app-builder/server-fns/data';
import { useQueries } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useContinuousScreeningObjectDetailsQuery = (objectType: string, objectId: string) => {
  const getDataModel = useServerFn(getDataModelFn);
  const getObjectDetails = useServerFn(getObjectDetailsFn);

  return useQueries({
    queries: [
      {
        queryKey: ['data-model'],
        queryFn: async () => getDataModel({}),
      },
      {
        queryKey: ['object-details', objectType, objectId],
        queryFn: async () => {
          return getObjectDetails({ data: { objectType, objectId } });
        },
      },
    ],
  });
};
