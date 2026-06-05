import {
  type UpdateScreeningProvidersPayload,
  updateScreeningProvidersPayloadSchema,
} from '@app-builder/schemas/settings';
import { updateScreeningProvidersFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type UpdateScreeningProvidersPayload, updateScreeningProvidersPayloadSchema };

export const useUpdateScreeningProviders = (organizationId: string) => {
  const updateScreeningProviders = useServerFn(updateScreeningProvidersFn);

  return useMutation({
    mutationKey: ['settings', 'organization', 'update-screening-providers', organizationId],
    mutationFn: async (payload: Omit<UpdateScreeningProvidersPayload, 'organizationId'>) =>
      updateScreeningProviders({ data: { ...payload, organizationId } }),
  });
};
