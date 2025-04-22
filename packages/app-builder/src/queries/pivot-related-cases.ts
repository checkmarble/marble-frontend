import { type PivotRelatedCasesResource } from '@app-builder/routes/ressources+/cases+/pivot+/related+/$pivotValue._index';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (pivotValue: string) =>
  getRoute('/ressources/cases/pivot/related/:pivotValue', {
    pivotValue,
  });

export function usePivotRelatedCasesQuery(pivotValue: string) {
  return useQuery({
    queryKey: ['pivot', 'relatedCases', pivotValue],
    queryFn: async () => {
      return (await fetch(endpoint(pivotValue))).json() as Promise<PivotRelatedCasesResource>;
    },
  });
}
