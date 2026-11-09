import { getTenantUsersWithoutAccessFn } from '@app-builder/server-fns/settings';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const tenantUsersWithoutAccessQueryKey = ['organization', 'users', 'without-access'] as const;

export const useTenantUsersWithoutAccessQuery = () => {
  const getTenantUsersWithoutAccess = useServerFn(getTenantUsersWithoutAccessFn);

  return useQuery({
    queryKey: tenantUsersWithoutAccessQueryKey,
    queryFn: async () => {
      const { users } = await getTenantUsersWithoutAccess();
      return users;
    },
  });
};
