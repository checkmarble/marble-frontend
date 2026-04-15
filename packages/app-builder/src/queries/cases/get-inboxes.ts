import { type InboxWithCasesCount } from '@app-builder/models/inbox';
import { getInboxesFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetInboxesQuery = () => {
  const getInboxes = useServerFn(getInboxesFn);

  return useQuery({
    queryKey: ['cases', 'inboxes'],
    queryFn: async () => {
      const result = await getInboxes();
      return result as { inboxes: InboxWithCasesCount[] };
    },
  });
};
