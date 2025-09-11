import { useQuery } from '@tanstack/react-query';

export const useCreateKycEnrichmentQuery = (caseId: string) =>
  useQuery({
    queryKey: ['case', 'create-kyc-enrichment', caseId],
    queryFn: async () =>
      fetch(`/ressources/cases/${caseId}/enrich-kyc`, {
        method: 'POST',
      }).then((response) => response.json()),

    enabled: false,
    staleTime: Infinity,
  });
