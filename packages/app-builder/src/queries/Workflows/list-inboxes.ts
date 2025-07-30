import { type InboxMetadata } from '@app-builder/models/inbox';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export function useListInboxesQuery(): UseQueryResult<InboxMetadata[], Error> {
  return useQuery({
    queryKey: ['inboxes'],
    queryFn: async (): Promise<InboxMetadata[]> => {
      const response = await fetch('/ressources/workflows/inboxes');
      if (!response.ok) {
        throw new Error('Failed to fetch inboxes');
      }
      const data = await response.json();
      return data;
    },
  });
}
