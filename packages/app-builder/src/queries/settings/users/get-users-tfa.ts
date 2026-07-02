import { getOrganizationUsersWithTfaFn } from '@app-builder/server-fns/settings';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useOrganizationUsersTfaQuery = () => {
  const getOrganizationUsersWithTfa = useServerFn(getOrganizationUsersWithTfaFn);

  return useQuery({
    queryKey: ['organization', 'users', 'tfa'],
    queryFn: async () => {
      const { users } = await getOrganizationUsersWithTfa();
      return users;
    },
  });
};
