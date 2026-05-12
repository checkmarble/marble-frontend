import { listSuspicionActivityReportsFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useSarReportsQuery(caseId: string) {
  const listSuspicionActivityReports = useServerFn(listSuspicionActivityReportsFn);

  return useQuery({
    queryKey: ['sar-reports', caseId],
    queryFn: () => {
      return listSuspicionActivityReports({ data: { caseId } });
    },
  });
}
