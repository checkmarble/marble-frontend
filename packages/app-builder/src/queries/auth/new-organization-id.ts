import { changeOrganizationId } from '@app-builder/server-fns/auth';
import { useMutation } from '@tanstack/react-query';

export const useChangeOrganizationIdMutation = () => {
  return useMutation({
    mutationKey: ['auth', 'refresh-token'],
    mutationFn: async ({
      idToken,
      csrf,
      newOrganizationId,
    }: {
      idToken: string;
      csrf: string;
      newOrganizationId: string;
    }) => {
      return changeOrganizationId({ data: { idToken, csrf, newOrganizationId } });
    },
  });
};
