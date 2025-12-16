import { useQueries } from '@tanstack/react-query';
import { dataModelQueryOptions } from '../data/get-data-model';
import { objectDetailsQueryOptions } from '../data/get-object-details';

export const useContinuousScreeningObjectDetailsQuery = (objectType: string, objectId: string) => {
  return useQueries({
    queries: [dataModelQueryOptions, objectDetailsQueryOptions(objectType, objectId)],
  });
};
