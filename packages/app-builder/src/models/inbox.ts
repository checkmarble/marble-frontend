import { type ParseKeys } from 'i18next';
import {
  type AddInboxUserBodyDto,
  type InboxDto,
  type InboxMetadataDto,
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
  escalationInboxId?: string;
  autoAssignEnabled: boolean;
}

export function adaptInbox(inbox: InboxDto): Inbox {
  return {
    id: inbox.id,
    name: inbox.name,
    createdAt: inbox.created_at,
    updatedAt: inbox.updated_at,
    status: inbox.status,
    users: (inbox.users ?? []).map(adaptInboxUser),
    escalationInboxId: inbox.escalation_inbox_id,
    autoAssignEnabled: inbox.auto_assign_enabled,
  };
}

export interface InboxMetadata {
  id: string;
  name: string;
}

export function adaptInboxMetadata(inbox: InboxMetadataDto): InboxMetadata {
  return {
    id: inbox.id,
    name: inbox.name,
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
  escalationInboxId?: string | null;
  autoAssignEnabled?: boolean;
}

export function adaptUpdateInboxDto(model: InboxUpdateBody): {
  name: string;
  escalation_inbox_id?: string;
  auto_assign_enabled?: boolean;
} {
  return {
    name: model.name,
    escalation_inbox_id: model.escalationInboxId ?? undefined,
    auto_assign_enabled: model.autoAssignEnabled ?? undefined,
  };
}

export type InboxUser = {
  id: string;
  inboxId: string;
  userId: string;
  role: string;
  autoAssignable: boolean;
};

export function adaptInboxUser(inboxUser: InboxUserDto): InboxUser {
  return {
    id: inboxUser.id,
    inboxId: inboxUser.inbox_id,
    userId: inboxUser.user_id,
    role: inboxUser.role,
    autoAssignable: inboxUser.auto_assignable,
  };
}

export interface InboxUserCreateBody {
  userId: string;
  role: string;
  autoAssignable: boolean;
}

export function adaptInboxUserCreateBody({
  userId,
  role,
  autoAssignable,
}: InboxUserCreateBody): AddInboxUserBodyDto {
  return {
    user_id: userId,
    role,
    auto_assignable: autoAssignable,
  };
}

export interface InboxUserUpdateBody {
  role: string;
  autoAssignable: boolean;
}

export function adaptInboxUserUpdateBody(data: InboxUserUpdateBody): {
  role: string;
  auto_assignable: boolean;
} {
  return {
    role: data.role,
    auto_assignable: data.autoAssignable,
  };
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
