import {
  type InboxDto,
  type InboxUserDto,
  type InboxUserRole,
} from 'marble-api';
import invariant from 'tiny-invariant';

export interface Inbox {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
  users: InboxUser[];
}

export function adaptInbox(inbox: InboxDto): Inbox {
  return {
    id: inbox.id,
    name: inbox.name,
    createdAt: inbox.created_at,
    updatedAt: inbox.updated_at,
    status: inbox.status,
    users: (inbox.users ?? []).map(adaptInboxUser),
  };
}

export interface InboxWithCasesCount extends Inbox {
  casesCount: number;
}

export function adaptInboxWithCasesCount(inbox: InboxDto): InboxWithCasesCount {
  invariant(inbox.cases_count !== undefined, 'cases_count is required');
  return {
    ...adaptInbox(inbox),
    casesCount: inbox.cases_count,
  };
}

export interface InboxUser {
  id: string;
  inboxId: string;
  userId: string;
  role: InboxUserRole;
}

export function adaptInboxUser(inboxUser: InboxUserDto): InboxUser {
  return {
    id: inboxUser.id,
    inboxId: inboxUser.inbox_id,
    userId: inboxUser.user_id,
    role: inboxUser.role,
  };
}
