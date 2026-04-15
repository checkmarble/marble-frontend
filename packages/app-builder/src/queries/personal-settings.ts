import { type PersonalSettings } from '@app-builder/models/personal-settings';
import { cancelUnavailabilityFn, getUnavailabilityFn, setUnavailabilityFn } from '@app-builder/server-fns/settings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

const queryKey = ['personal-settings', 'unavailability'] as const;

function useUnavailabilityQuery() {
  const getUnavailability = useServerFn(getUnavailabilityFn);

  return useQuery({
    queryKey,
    queryFn: () => getUnavailability({}),
  });
}

function useSetUnavailabilityMutation() {
  const queryClient = useQueryClient();
  const setUnavailability = useServerFn(setUnavailabilityFn);

  return useMutation({
    mutationFn: async (unavailability: PersonalSettings) =>
      setUnavailability({ data: { until: unavailability.until?.toISOString() ?? null } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

function useDeleteUnavailabilityMutation() {
  const queryClient = useQueryClient();
  const cancelUnavailability = useServerFn(cancelUnavailabilityFn);

  return useMutation({
    mutationFn: async () => cancelUnavailability({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUnavailabilitySettings() {
  const query = useUnavailabilityQuery();
  const setUnavailabilityMutation = useSetUnavailabilityMutation();
  const deleteUnavailabilityMutation = useDeleteUnavailabilityMutation();

  return {
    query,
    setUnavailability: setUnavailabilityMutation,
    deleteUnavailability: deleteUnavailabilityMutation,
  };
}
