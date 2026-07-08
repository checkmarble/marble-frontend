import { getOrganizationUsersWithTfaFn } from '@app-builder/server-fns/settings';
import * as Sentry from '@sentry/tanstackstart-react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useState } from 'react';

export const useOrganizationUsersTfaQuery = () => {
  const getOrganizationUsersWithTfa = useServerFn(getOrganizationUsersWithTfaFn);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  return useQuery({
    queryKey: ['organization', 'users', 'tfa'],
    queryFn: async () => {
      try {
        const { users } = await getOrganizationUsersWithTfa({});
        return users;
      } catch (e) {
        Sentry.captureException(e);
        throw e;
      }
    },
    enabled: isClient,
  });
};
