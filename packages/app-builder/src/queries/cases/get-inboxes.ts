import { getInboxesFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetInboxesQuery = () => {
  const getInboxes = useServerFn(getInboxesFn);

  return useQuery({
    queryKey: ['cases', 'inboxes'],
    queryFn: async () => {
      return getInboxes();
    },
  });
};
