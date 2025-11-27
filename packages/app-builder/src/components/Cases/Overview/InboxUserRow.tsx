import type { InboxUser } from '@app-builder/models/inbox';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { cn, Switch, Tag } from 'ui-design-system';

import { type InboxUserRole, inboxUserRoleLabels } from './constants';

interface InboxUserRowProps {
  user: InboxUser;
  checked?: boolean;
  onToggle?: (userId: string, checked: boolean) => void;
  variant?: 'default' | 'panel';
}

export const InboxUserRow = ({ user, checked, onToggle, variant = 'default' }: InboxUserRowProps) => {
  const { getOrgUserById } = useOrganizationUsers();
  const orgUser = getOrgUserById(user.userId);
  const userName = getFullName(orgUser) ?? 'Unknown';
  const roleLabel = inboxUserRoleLabels[user.role as InboxUserRole] ?? user.role;
  const isEditable = !!onToggle;
  const isChecked = checked ?? user.autoAssignable;

  return (
    <div className={cn('flex items-center gap-2', { 'pl-12': variant === 'default' })}>
      <div className="flex-1 flex items-center gap-v2-xs">
        <span className="text-xs">{userName}</span>
        <Tag color="purple" size="small" border="rounded-sm">
          {roleLabel}
        </Tag>
      </div>
      <div>
        {variant === 'default' && (
          <Tag color={isChecked ? 'green' : 'grey'} size="small" border="rounded-sm">
            {isChecked ? 'Active' : 'Disabled'}
          </Tag>
        )}
        {variant === 'panel' && (
          <Switch
            checked={isChecked}
            disabled={!isEditable}
            onCheckedChange={(newChecked) => onToggle?.(user.id, newChecked)}
          />
        )}
      </div>
    </div>
  );
};
