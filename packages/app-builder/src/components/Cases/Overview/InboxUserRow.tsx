import type { InboxUser } from '@app-builder/models/inbox';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { Switch, Tag } from 'ui-design-system';
import { type InboxUserRole, inboxUserRoleLabels } from './constants';

interface InboxUserRowProps {
  user: InboxUser;
}

export const InboxUserRow = ({ user }: InboxUserRowProps) => {
  const { getOrgUserById } = useOrganizationUsers();
  const orgUser = getOrgUserById(user.userId);
  const userName = getFullName(orgUser) ?? 'Unknown';
  const roleLabel = inboxUserRoleLabels[user.role as InboxUserRole] ?? user.role;

  return (
    <div className="flex items-center gap-2 pl-12">
      <div className="flex-1 flex items-center gap-v2-xs">
        <span className="text-xs">{userName}</span>
        <Tag color="purple" size="small" border="rounded-sm">
          {roleLabel}
        </Tag>
      </div>
      <div className="opacity-50">
        <Switch checked={user.autoAssignable} disabled />
      </div>
    </div>
  );
};
