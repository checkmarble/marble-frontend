import type { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptInbox,
  adaptInboxMetadata,
  adaptInboxUser,
  adaptInboxUserCreateBody,
  adaptInboxWithCasesCount,
  adaptUpdateInboxDto,
  type Inbox,
  type InboxCreateBody,
  type InboxMetadata,
  type InboxUpdateBody,
  type InboxUser,
  type InboxUserCreateBody,
  type InboxUserUpdateBody,
  type InboxWithCasesCount,
} from '@app-builder/models/inbox';
import * as R from 'remeda';

export interface InboxRepository {
  listInboxes(): Promise<Inbox[]>;
  listInboxesMetadata(): Promise<InboxMetadata[]>;
  listInboxesWithCaseCount(): Promise<InboxWithCasesCount[]>;
  createInbox(data: InboxCreateBody): Promise<Inbox>;
  getInbox(inboxId: string): Promise<Inbox>;
  getInboxMetadata(inboxId: string): Promise<InboxMetadata>;
  updateInbox(inboxId: string, data: InboxUpdateBody): Promise<Inbox>;
  deleteInbox(inboxId: string): Promise<void>;
  listAllInboxUsers(): Promise<InboxUser[]>;
  createInboxUser(inboxId: string, data: InboxUserCreateBody): Promise<InboxUser>;
  updateInboxUser(inboxUserId: string, data: InboxUserUpdateBody): Promise<InboxUser>;
  deleteInboxUser(inboxUserId: string): Promise<void>;
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
    listInboxesMetadata: async () => {
      const inboxes = await marbleCoreApiClient.listInboxesMetadata();

      return R.pipe(inboxes, R.map(adaptInboxMetadata), R.sortBy(R.prop('name')));
    },
    createInbox: async (data) => {
      const { inbox } = await marbleCoreApiClient.createInbox(data);

      return adaptInbox(inbox);
    },
    getInbox: async (inboxId) => {
      const { inbox } = await marbleCoreApiClient.getInbox(inboxId);

      return adaptInbox(inbox);
    },
    getInboxMetadata: async (inboxId) => {
      const inbox = await marbleCoreApiClient.getInboxMetadata(inboxId);

      return adaptInboxMetadata(inbox);
    },
    updateInbox: async (inboxId, data) => {
      const { inbox } = await marbleCoreApiClient.updateInbox(inboxId, adaptUpdateInboxDto(data));

      return adaptInbox(inbox);
    },
    deleteInbox: async (inboxId) => {
      await marbleCoreApiClient.deleteInbox(inboxId);
    },
    listAllInboxUsers: async () => {
      const { inbox_users } = await marbleCoreApiClient.listAllInboxUsers();

      return inbox_users.map(adaptInboxUser);
    },
    createInboxUser: async (inboxId, data) => {
      const { inbox_user } = await marbleCoreApiClient.addInboxUser(
        inboxId,
        adaptInboxUserCreateBody(data),
      );
      return adaptInboxUser(inbox_user);
    },
    updateInboxUser: async (inboxUserId, data) => {
      const { inbox_user } = await marbleCoreApiClient.updateInboxUser(inboxUserId, data);
      return adaptInboxUser(inbox_user);
    },
    deleteInboxUser: async (inboxUserId) => {
      await marbleCoreApiClient.deleteInboxUser(inboxUserId);
    },
  });
}
