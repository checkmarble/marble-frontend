import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptInboxUser, type InboxUser } from '@app-builder/models/inbox';

export interface InboxRepository {
  listAllInboxUsers(): Promise<InboxUser[]>;
}

export function getInboxRepository() {
  return (marbleApiClient: MarbleApi): InboxRepository => ({
    listAllInboxUsers: async () => {
      const { inbox_users } = await marbleApiClient.listAllInboxUsers();

      return inbox_users.map(adaptInboxUser);
    },
  });
}
