import { type Case } from '@app-builder/models/cases';
import { getPivotRelatedCasesFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function usePivotRelatedCasesQuery(pivotValue: string) {
  const getPivotRelatedCases = useServerFn(getPivotRelatedCasesFn);

  return useQuery({
    queryKey: ['pivot', 'relatedCases', pivotValue],
    queryFn: async () => {
      return getPivotRelatedCases({ data: { pivotValue } }) as Promise<{ cases: Case[] }>;
    },
  });
}
