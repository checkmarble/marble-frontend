import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptInbox,
  adaptInboxMetadata,
  adaptInboxUser,
  adaptInboxUserUpdateBody,
  adaptInboxWithCasesCount,
  adaptUpdateInboxDto,
  type Inbox,
  type InboxCreateBody,
  type InboxMetadata,
  type InboxUpdateBody,
  type InboxUser,
  type InboxUserUpdateBody,
  type InboxWithCasesCount,
} from '@app-builder/models/inbox';
import * as R from 'remeda';

export async function listInboxes(api: MarbleCoreApi): Promise<Inbox[]> {
  const { inboxes } = await api.listInboxes({
    withCaseCount: false,
  });

  return R.pipe(inboxes, R.map(adaptInbox), R.sortBy(R.prop('name')));
}

export async function listInboxesWithCaseCount(api: MarbleCoreApi): Promise<InboxWithCasesCount[]> {
  const { inboxes } = await api.listInboxes({
    withCaseCount: true,
  });

  return inboxes.map(adaptInboxWithCasesCount);
}

export async function listInboxesMetadata(api: MarbleCoreApi): Promise<InboxMetadata[]> {
  const inboxes = await api.listInboxesMetadata();

  return R.pipe(inboxes, R.map(adaptInboxMetadata), R.sortBy(R.prop('name')));
}

export async function createInbox(api: MarbleCoreApi, data: InboxCreateBody): Promise<Inbox> {
  const { inbox } = await api.createInbox(data);

  return adaptInbox(inbox);
}

export async function getInbox(api: MarbleCoreApi, inboxId: string): Promise<Inbox> {
  const { inbox } = await api.getInbox(inboxId);

  return adaptInbox(inbox);
}

export async function updateInbox(api: MarbleCoreApi, inboxId: string, data: InboxUpdateBody): Promise<Inbox> {
  const { inbox } = await api.updateInbox(inboxId, adaptUpdateInboxDto(data));

  return adaptInbox(inbox);
}

export async function deleteInbox(api: MarbleCoreApi, inboxId: string): Promise<void> {
  await api.deleteInbox(inboxId);
}

export async function updateInboxUser(
  api: MarbleCoreApi,
  inboxUserId: string,
  data: InboxUserUpdateBody,
): Promise<InboxUser> {
  const { inbox_user } = await api.updateInboxUser(inboxUserId, adaptInboxUserUpdateBody(data));
  return adaptInboxUser(inbox_user);
}
