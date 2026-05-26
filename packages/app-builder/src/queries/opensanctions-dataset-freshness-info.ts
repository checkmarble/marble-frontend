import { getDatasetFreshnessFn } from '@app-builder/server-fns/opensanctions';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useOpenSanctionsDatasetFreshnessInfo() {
  const getDatasetFreshness = useServerFn(getDatasetFreshnessFn);

  return useQuery({
    queryKey: ['opensanctions-dataset-freshness-info'],
    queryFn: async () => getDatasetFreshness(),
  });
}
