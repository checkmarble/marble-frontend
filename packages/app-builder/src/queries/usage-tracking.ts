import { getUsageTrackingFn, updateUsageTrackingFn } from '@app-builder/server-fns/usage-tracking';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const queryKey = ['settings', 'usage-tracking'] as const;

export function useUsageTrackingQuery() {
  const getUsageTracking = useServerFn(getUsageTrackingFn);
  return useQuery({ queryKey, queryFn: () => getUsageTracking() });
}

export function useUpdateUsageTrackingMutation() {
  const queryClient = useQueryClient();
  const updateUsageTracking = useServerFn(updateUsageTrackingFn);
  const { t } = useTranslation(['common']);

  return useMutation({
    mutationFn: (enabled: boolean) => updateUsageTracking({ data: { enabled } }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      toast.success(t('common:success.save'));
    },
    onError: () => toast.error(t('common:errors.unknown')),
  });
}
