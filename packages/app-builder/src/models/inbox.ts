import { type InboxUserDto, type InboxUserRole } from 'marble-api';

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
