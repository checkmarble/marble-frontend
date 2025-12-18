import { g as getUnavailabilityFn, s as setUnavailabilityFn, c as cancelUnavailabilityFn } from "./settings-CPv2zx4k.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
const queryKey = ["personal-settings", "unavailability"];
function useUnavailabilityQuery() {
  const getUnavailability = useServerFn(getUnavailabilityFn);
  return useQuery({
    queryKey,
    queryFn: () => getUnavailability({})
  });
}
function useSetUnavailabilityMutation() {
  const queryClient = useQueryClient();
  const setUnavailability = useServerFn(setUnavailabilityFn);
  return useMutation({
    mutationFn: async (unavailability) => setUnavailability({ data: { until: unavailability.until?.toISOString() ?? null } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });
}
function useDeleteUnavailabilityMutation() {
  const queryClient = useQueryClient();
  const cancelUnavailability = useServerFn(cancelUnavailabilityFn);
  return useMutation({
    mutationFn: async () => cancelUnavailability({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });
}
function useUnavailabilitySettings() {
  const query = useUnavailabilityQuery();
  const setUnavailabilityMutation = useSetUnavailabilityMutation();
  const deleteUnavailabilityMutation = useDeleteUnavailabilityMutation();
  return {
    query,
    setUnavailability: setUnavailabilityMutation,
    deleteUnavailability: deleteUnavailabilityMutation
  };
}
export {
  useUnavailabilitySettings as u
};
