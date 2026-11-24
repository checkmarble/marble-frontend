import { type CreateSsoRecoveryKeyPayload, createSsoRecoveryKeyPayloadSchema } from '@app-builder/schemas/settings';
import { createSsoRecoveryKeyFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type CreateSsoRecoveryKeyPayload, createSsoRecoveryKeyPayloadSchema };

export const useCreateSsoRecoveryKeyMutation = () => {
  const createSsoRecoveryKey = useServerFn(createSsoRecoveryKeyFn);

  return useMutation({
    mutationKey: ['settings', 'sso', 'create-recovery-key'],
    mutationFn: async (payload: CreateSsoRecoveryKeyPayload) => createSsoRecoveryKey({ data: payload }),
  });
};
