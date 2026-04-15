import { type CaseDetail } from '@app-builder/models/cases';
import { getCaseDetailFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetCaseDetailQuery = (caseId: string) => {
  const getCaseDetail = useServerFn(getCaseDetailFn);

  return useQuery({
    queryKey: ['cases', caseId, 'get-details'],
    queryFn: async () => {
      const result = await getCaseDetail({ data: { caseId } });
      return result as { caseDetail: CaseDetail };
    },
  });
};
