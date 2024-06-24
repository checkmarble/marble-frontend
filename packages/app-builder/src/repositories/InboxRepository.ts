import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptInbox,
  adaptInboxUser,
  adaptInboxWithCasesCount,
  type Inbox,
  type InboxUser,
  type InboxWithCasesCount,
} from '@app-builder/models/inbox';
import * as R from 'remeda';

export interface InboxRepository {
  listInboxes(): Promise<Inbox[]>;
  listInboxesWithCaseCount(): Promise<InboxWithCasesCount[]>;
  listAllInboxUsers(): Promise<InboxUser[]>;
}

export function makeGetInboxRepository() {
  return (marbleApiClient: MarbleApi): InboxRepository => ({
    listInboxes: async () => {
      const { inboxes } = await marbleApiClient.listInboxes({
        withCaseCount: false,
      });

      return R.pipe(inboxes, R.map(adaptInbox), R.sortBy(R.prop('name')));
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
