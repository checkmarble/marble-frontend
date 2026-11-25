import { type AddSsoDomainPayload } from '@app-builder/schemas/settings';
import { addSsoDomainFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useAddSsoDomainMutation = () => {
  const addSsoDomain = useServerFn(addSsoDomainFn);

  return useMutation({
    mutationKey: ['settings', 'sso', 'add-domain'],
    mutationFn: async (payload: AddSsoDomainPayload) => addSsoDomain({ data: payload }),
  });
};
