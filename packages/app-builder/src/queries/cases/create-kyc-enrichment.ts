import { enrichKycFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCreateKycEnrichmentQuery = (caseId: string) => {
  const enrichKyc = useServerFn(enrichKycFn);

  return useQuery({
    queryKey: ['cases', 'create-kyc-enrichment', caseId],
    queryFn: async () => enrichKyc({ data: { caseId } }),
    enabled: false,
    staleTime: Infinity,
  });
};
