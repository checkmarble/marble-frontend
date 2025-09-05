import { getRoute } from '@app-builder/utils/routes';
import { uniqueBy } from '@app-builder/utils/schema/helpers/unique-array';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';

export const cidrSchema = z.union([z.cidrv4(), z.cidrv6()]);

export const updateAllowedNetworksPayloadSchema = z.object({
  allowedNetworks: uniqueBy(z.array(cidrSchema), (s) => s),
});

export type UpdateAllowedNetworksPayload = z.infer<typeof updateAllowedNetworksPayloadSchema>;

const endpoint = (organizationId: string) =>
  getRoute('/ressources/settings/organization/:organizationId/update-allowed-networks', {
    organizationId: fromUUIDtoSUUID(organizationId),
  });

export const useUpdateAllowedNetworks = (organizationId: string) => {
  return useMutation({
    mutationKey: ['settings', 'organization', 'update-allowed-networks', organizationId],
    mutationFn: async (payload: UpdateAllowedNetworksPayload) => {
      const response = await fetch(endpoint(organizationId), {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
