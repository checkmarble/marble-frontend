import { PromiseMutationResponse } from '@app-builder/utils/http/mutation';
import { getRoute } from '@app-builder/utils/routes';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { uniqueBy } from '@app-builder/utils/schema/helpers/unique-array';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';

export const cidrSchema = z.union([z.cidrv4(), z.cidrv6(), z.ipv4(), z.ipv6()]);

export const updateAllowedNetworksPayloadSchema = z.object({
  allowedNetworks: protectArray(
    uniqueBy(z.array(cidrSchema), (s) => s),
    { maxLength: 100 },
  ),
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

      return response.json() as PromiseMutationResponse<{ subnets: string[] }>;
    },
  });
};
