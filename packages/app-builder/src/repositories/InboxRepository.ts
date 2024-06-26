import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
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
  return (marbleCoreApiClient: MarbleCoreApi): InboxRepository => ({
    listInboxes: async () => {
      const { inboxes } = await marbleCoreApiClient.listInboxes({
        withCaseCount: false,
      });

      return R.pipe(inboxes, R.map(adaptInbox), R.sortBy(R.prop('name')));
    },
    listInboxesWithCaseCount: async () => {
      const { inboxes } = await marbleCoreApiClient.listInboxes({
        withCaseCount: true,
      });

      return inboxes.map(adaptInboxWithCasesCount);
    },
    listAllInboxUsers: async () => {
      const { inbox_users } = await marbleCoreApiClient.listAllInboxUsers();

      return inbox_users.map(adaptInboxUser);
    },
  });
}
