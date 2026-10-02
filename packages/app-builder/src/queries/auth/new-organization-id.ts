import { changeOrganizationId } from '@app-builder/server-fns/auth';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useChangeOrganizationIdMutation = () => {
  const changeOrganization = useServerFn(changeOrganizationId);

  return useMutation({
    mutationKey: ['auth', 'change-organization'],
    mutationFn: async ({
      idToken,
      csrf,
      newOrganizationId,
    }: {
      idToken: string;
      csrf: string;
      newOrganizationId: string;
    }) => {
      return changeOrganization({ data: { idToken, csrf, newOrganizationId } });
    },
  });
};
