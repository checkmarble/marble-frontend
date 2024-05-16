import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptInbox,
  adaptInboxUser,
  adaptInboxWithCasesCount,
  type Inbox,
  type InboxUser,
  type InboxWithCasesCount,
} from '@app-builder/models/inbox';

export interface InboxRepository {
  listInboxes(): Promise<Inbox[]>;
  listInboxesWithCaseCount(): Promise<InboxWithCasesCount[]>;
  listAllInboxUsers(): Promise<InboxUser[]>;
}

export function getInboxRepository() {
  return (marbleApiClient: MarbleApi): InboxRepository => ({
    listInboxes: async () => {
      const { inboxes } = await marbleApiClient.listInboxes({
        withCaseCount: false,
      });

      return inboxes.map(adaptInbox);
    },
    listInboxesWithCaseCount: async () => {
      const { inboxes } = await marbleApiClient.listInboxes({
        withCaseCount: true,
      });

      return inboxes.map(adaptInboxWithCasesCount);
    },
    listAllInboxUsers: async () => {
      const { inbox_users } = await marbleApiClient.listAllInboxUsers();

      return inbox_users.map(adaptInboxUser);
    },
  });
}
