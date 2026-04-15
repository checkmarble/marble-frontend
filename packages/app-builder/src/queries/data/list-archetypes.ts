import { listArchetypesFn } from '@app-builder/server-fns/data';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export interface Archetype {
  name: string;
  label?: string;
  description?: string;
}

export const useListArchetypesQuery = () => {
  const listArchetypes = useServerFn(listArchetypesFn);

  return useQuery({
    queryKey: ['data', 'archetypes'],
    queryFn: () => {
      return listArchetypes({});
    },
  });
};
