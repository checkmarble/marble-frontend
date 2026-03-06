import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

export interface Archetype {
  name: string;
  label?: string;
  description?: string;
}

const endpoint = getRoute('/ressources/data/list-archetypes');

export const useListArchetypesQuery = () => {
  return useQuery({
    queryKey: ['data', 'archetypes'],
    queryFn: async () => {
      const response = await fetch(endpoint);
      const data = (await response.json()) as { archetypes: Archetype[] };
      return data.archetypes;
    },
  });
};
