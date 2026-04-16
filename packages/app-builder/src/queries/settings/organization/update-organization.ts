import { type UpdateOrganizationPayload, updateOrganizationPayloadSchema } from '@app-builder/schemas/settings';
import { updateOrganizationFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { updateOrganizationPayloadSchema, type UpdateOrganizationPayload };

export const useUpdateOrganizationMutation = () => {
  const updateOrganization = useServerFn(updateOrganizationFn);

  return useMutation({
    mutationFn: async (payload: UpdateOrganizationPayload) => updateOrganization({ data: payload }),
  });
};
