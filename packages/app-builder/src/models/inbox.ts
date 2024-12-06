import { type ParseKeys } from 'i18next';
import {
  type AddInboxUserBodyDto,
  type InboxDto,
  type InboxUserDto,
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

export interface InboxCreateBody {
  name: string;
}

export interface InboxUpdateBody {
  name: string;
}

export type InboxUser = {
  id: string;
  inboxId: string;
  userId: string;
  role: string;
};

export function adaptInboxUser(inboxUser: InboxUserDto): InboxUser {
  return {
    id: inboxUser.id,
    inboxId: inboxUser.inbox_id,
    userId: inboxUser.user_id,
    role: inboxUser.role,
  };
}

export interface InboxUserCreateBody {
  userId: string;
  role: string;
}

export function adaptInboxUserCreateBody({
  userId,
  role,
}: InboxUserCreateBody): AddInboxUserBodyDto {
  return {
    user_id: userId,
    role,
  };
}

export interface InboxUserUpdateBody {
  role: string;
}

export function tKeyForInboxUserRole(role: string): ParseKeys<['settings']> {
  switch (role) {
    case 'admin':
      return 'settings:inboxes.user_role.admin';
    case 'member':
      return 'settings:inboxes.user_role.member';
    default:
      return 'settings:inboxes.user_role.unknown';
  }
}
