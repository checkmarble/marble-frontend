import { type PersonalSettings } from '@app-builder/models/personal-settings';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQuery } from '@tanstack/react-query';

const endpoint = () => getRoute('/ressources/settings/personal/unavailability');

export function useGetUnavailabilityQuery() {
  return useQuery({
    queryKey: ['personal-settings', 'unavailability'],
    queryFn: async () => (await fetch(endpoint())).json() as Promise<PersonalSettings>,
  });
}

export function useDeleteUnavailabilityMutation() {
  return useMutation({
    mutationFn: async () => (await fetch(endpoint(), { method: 'DELETE' })).json(),
  });
}
