import type { InboxUser } from '@app-builder/models/inbox';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useTranslation } from 'react-i18next';
import { cn, Switch, Tag } from 'ui-design-system';

import { INBOX_USER_ROW_VARIANTS, type InboxUserRowVariant } from './constants';

interface InboxUserRowProps {
  user: InboxUser;
  checked?: boolean;
  onToggle?: (userId: string, checked: boolean) => void;
  variant?: InboxUserRowVariant;
}

export const InboxUserRow = ({
  user,
  checked,
  onToggle,
  variant = INBOX_USER_ROW_VARIANTS.default,
}: InboxUserRowProps) => {
  const { t } = useTranslation(['cases']);
  const { getOrgUserById } = useOrganizationUsers();
  const orgUser = getOrgUserById(user.userId);
  const userName = getFullName(orgUser) ?? t('cases:overview.inbox.unknown_user');
  const roleLabel =
    user.role === 'admin'
      ? t('cases:overview.inbox.role.admin')
      : user.role === 'member'
        ? t('cases:overview.inbox.role.member')
        : user.role;
  const isChecked = checked ?? user.autoAssignable;

  return (
    <div className={cn('flex items-center gap-v2-sm', { 'pl-12': variant === INBOX_USER_ROW_VARIANTS.default })}>
      <div className="flex-1 flex items-center gap-v2-xs">
        <span className="text-xs">{userName}</span>
        <Tag color="purple" size="small" border="rounded-sm">
          {roleLabel}
        </Tag>
      </div>
      {variant === INBOX_USER_ROW_VARIANTS.default && (
        <Tag color={isChecked ? 'green' : 'grey'} size="small" border="rounded-sm">
          {isChecked ? t('cases:overview.config.active') : t('cases:overview.config.inactive')}
        </Tag>
      )}
      {variant === INBOX_USER_ROW_VARIANTS.panel && (
        <Switch
          checked={isChecked}
          disabled={!onToggle}
          onCheckedChange={(newChecked) => onToggle?.(user.id, newChecked)}
        />
      )}
    </div>
  );
};
