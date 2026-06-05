import { type ScoringSettings } from '@app-builder/models/scoring';
import { getScoringSettingsFn } from '@app-builder/server-fns/scoring';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useScoringSettingsQuery = () => {
  const getScoringSettings = useServerFn(getScoringSettingsFn);

  return useQuery({
    queryKey: ['scoring', 'settings'],
    queryFn: () => getScoringSettings() as Promise<{ settings: ScoringSettings | null }>,
    staleTime: 5 * 60 * 1000,
  });
};
