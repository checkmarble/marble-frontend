import { type UpdateAllowedNetworksPayload, updateAllowedNetworksPayloadSchema } from '@app-builder/schemas/settings';
import { updateAllowedNetworksFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { updateAllowedNetworksPayloadSchema, type UpdateAllowedNetworksPayload };

export const useUpdateAllowedNetworks = (organizationId: string) => {
  const updateAllowedNetworks = useServerFn(updateAllowedNetworksFn);

  return useMutation({
    mutationKey: ['settings', 'organization', 'update-allowed-networks', organizationId],
    mutationFn: async (payload: UpdateAllowedNetworksPayload) =>
      updateAllowedNetworks({ data: { ...payload, organizationId } }),
  });
};
