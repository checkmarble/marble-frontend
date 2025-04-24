import { type OpenSanctionDatasetFreshnessInfoResource } from '@app-builder/routes/ressources+/opensanctions+/dataset-freshness';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = () => getRoute('/ressources/opensanctions/dataset-freshness');

export function useOpenSanctionsDatasetFreshnessInfo() {
  const queryKey = ['opensanctions-dataset-freshness-info'] as const;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(endpoint(), { method: 'GET' });
      return response.json() as Promise<OpenSanctionDatasetFreshnessInfoResource | null>;
    },
  });
}
