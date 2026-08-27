import { type CreateInitialOrgPayload } from '@app-builder/schemas/onboarding';
import { createInitialOrgFn } from '@app-builder/server-fns/onboarding';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCreateInitialOrgMutation = () => {
  const createInitialOrg = useServerFn(createInitialOrgFn);

  return useMutation({
    mutationKey: ['onboarding', 'create-initial-org'],
    mutationFn: async (data: CreateInitialOrgPayload) => createInitialOrg({ data }),
  });
};
