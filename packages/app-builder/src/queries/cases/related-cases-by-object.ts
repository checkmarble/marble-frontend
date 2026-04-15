import { type Case } from '@app-builder/models/cases';
import { getRelatedCasesByObjectFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useRelatedCasesByObjectQuery = (objectType: string, objectId: string) => {
  const getRelatedCasesByObject = useServerFn(getRelatedCasesByObjectFn);

  return useQuery({
    queryKey: ['cases', 'related', objectType, objectId],
    queryFn: async () => {
      return getRelatedCasesByObject({ data: { objectType, objectId } }) as Promise<{ cases: Case[] }>;
    },
  });
};
