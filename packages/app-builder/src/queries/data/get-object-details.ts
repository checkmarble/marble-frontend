import { DataModelObject } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (objectType: string, objectId: string) =>
  getRoute('/ressources/data/object/:objectType/:objectId', { objectType, objectId });

export const objectDetailsQueryOptions = (objectType: string, objectId: string) => ({
  queryKey: ['object-details', objectType, objectId],
  queryFn: async () => {
    const response = await fetch(endpoint(objectType, objectId));
    const result = await response.json();
    return result.objectDetails as DataModelObject;
  },
});

export const useObjectDetailsQuery = (objectType: string, objectId: string) => {
  return useQuery(objectDetailsQueryOptions(objectType, objectId));
};
