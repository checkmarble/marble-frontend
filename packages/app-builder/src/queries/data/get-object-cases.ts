import { type Case } from '@app-builder/models/cases';
import { getObjectCasesFn } from '@app-builder/server-fns/data';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetObjectCasesQuery = (objectType: string, objectId: string) => {
  const getObjectCases = useServerFn(getObjectCasesFn);

  return useQuery({
    queryKey: ['data', objectType, objectId, 'cases'],
    queryFn: async () => {
      return getObjectCases({ data: { objectType, objectId } }) as Promise<{ cases: Case[] }>;
    },
  });
};
