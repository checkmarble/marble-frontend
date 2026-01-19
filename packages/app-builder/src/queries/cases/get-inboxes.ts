import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { InboxWithCasesCount } from '@app-builder/models/inbox';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/cases/get-inboxes');

export const useGetInboxesQuery = () => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['cases', 'inboxes'],
    queryFn: async () => {
      const response = await fetch(endpoint);
      const result = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return;
      }

      return result.inboxes as { inboxes: InboxWithCasesCount[] };
    },
  });
};
