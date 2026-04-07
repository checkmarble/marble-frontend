import { type InboxMetadata } from '@app-builder/models/inbox';
import { listWorkflowInboxesFn } from '@app-builder/server-fns/workflows';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useListInboxesQuery(): UseQueryResult<InboxMetadata[], Error> {
  const listWorkflowInboxes = useServerFn(listWorkflowInboxesFn);

  return useQuery({
    queryKey: ['inboxes'],
    queryFn: async (): Promise<InboxMetadata[]> => {
      const data = await listWorkflowInboxes();
      return data as InboxMetadata[];
    },
  });
}
