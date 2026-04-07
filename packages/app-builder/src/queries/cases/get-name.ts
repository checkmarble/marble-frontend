import { getCaseNameFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetCaseNameQuery = (caseId: string) => {
  const getCaseName = useServerFn(getCaseNameFn);

  return useQuery({
    queryKey: ['cases', caseId, 'get-name'],
    queryFn: async () => {
      const result = await getCaseName({ data: { caseId } });
      return result as { name: string };
    },
  });
};
