import { type PersonalSettings } from '@app-builder/models/personal-settings';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const endpoint = () => getRoute('/ressources/settings/personal/unavailability');

const queryKey = ['personal-settings', 'unavailability'] as const;

/**
 * Hook to fetch user's unavailability settings
 * @returns Query result with user's unavailability data
 * @example
 * ```tsx
 * const unavailabilityQuery = useUnavailabilityQuery();
 *
 * if (unavailabilityQuery.data?.until) {
 *   // User is currently unavailable
 * }
 * ```
 */
function useUnavailabilityQuery() {
  return useQuery({
    queryKey,
    queryFn: async () => (await fetch(endpoint())).json() as Promise<PersonalSettings>,
  });
}

/**
 * Hook to set user's unavailability (mark as offline until a specific date)
 * @returns Mutation to set unavailability settings
 * @example
 * ```tsx
 * const setUnavailabilityMutation = useSetUnavailabilityMutation();
 *
 * const handleSetOffline = (until: Date) => {
 *   setUnavailabilityMutation.mutate({ until: until });
 * };
 * ```
 */
function useSetUnavailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unavailability: PersonalSettings) => {
      console.log('====>useSetUnavailabilityMutation', unavailability);
      const response = await fetch(endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unavailability),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Hook to delete user's unavailability settings (mark as available)
 * @returns Mutation to clear unavailability settings
 * @example
 * ```tsx
 * const deleteUnavailabilityMutation = useDeleteUnavailabilityMutation();
 *
 * const handleSetOnline = () => {
 *   deleteUnavailabilityMutation.mutate();
 * };
 * ```
 */
function useDeleteUnavailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => (await fetch(endpoint(), { method: 'DELETE' })).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Comprehensive hook that provides all unavailability-related functionality
 * @returns Object containing query and mutation hooks for managing user availability
 * @example
 * ```tsx
 * const { query, setUnavailability, deleteUnavailability } = useUnavailabilitySettings();
 *
 * // Check current status
 * const isAvailable = query.data?.until === null;
 *
 * // Set offline until specific date
 * const handleSetOffline = (until: Date) => {
 *   setUnavailability.mutate({ until: until });
 * };
 *
 * // Set online (available)
 * const handleSetOnline = () => {
 *   deleteUnavailability.mutate();
 * };
 * ```
 */
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
