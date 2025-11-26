import { InboxWithCasesCount } from '@app-builder/models/inbox';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/cases/get-inboxes');

export const useGetInboxesQuery = () => {
  return useQuery({
    queryKey: ['cases', 'inboxes'],
    queryFn: async () => {
      const response = await fetch(endpoint);
      return response.json() as Promise<{ inboxes: InboxWithCasesCount[] }>;
    },
  });
};
