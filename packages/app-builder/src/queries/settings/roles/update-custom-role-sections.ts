import { type UpdateCustomRoleSectionsPayload } from '@app-builder/schemas/custom-roles';
import { updateCustomRoleSectionsFn } from '@app-builder/server-fns/custom-roles';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useUpdateCustomRoleSectionsMutation = () => {
  const updateCustomRoleSections = useServerFn(updateCustomRoleSectionsFn);

  return useMutation({
    mutationFn: async (payload: UpdateCustomRoleSectionsPayload) => updateCustomRoleSections({ data: payload }),
  });
};
