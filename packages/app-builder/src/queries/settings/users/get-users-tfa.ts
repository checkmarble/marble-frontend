import { getOrganizationUsersWithTfaFn } from '@app-builder/server-fns/settings';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useState } from 'react';

export const useOrganizationUsersTfaQuery = () => {
  const getOrganizationUsersWithTfa = useServerFn(getOrganizationUsersWithTfaFn);

  // Client-only: the underlying server fn scans every identity-provider user and must
  // not participate in SSR. If it runs during the server render it gets dehydrated in a
  // pending state and never refetches after hydration (stuck `fetching`, handler never
  // hit), so we only enable it once mounted on the client.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  return useQuery({
    queryKey: ['organization', 'users', 'tfa'],
    queryFn: async () => {
      console.log('[tfa-queryFn] calling server fn', { isClient, isServer: typeof window === 'undefined' });
      try {
        const { users } = await getOrganizationUsersWithTfa({});
        console.log('[tfa-queryFn] server fn resolved', users.length);
        return users;
      } catch (e) {
        console.log('[tfa-queryFn] server fn threw', e);
        throw e;
      }
    },
    enabled: isClient,
  });
};
