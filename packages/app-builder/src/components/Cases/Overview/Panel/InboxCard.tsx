import type { InboxWithCasesCount } from '@app-builder/models/inbox';
import { useTranslation } from 'react-i18next';
import { Switch, Tag } from 'ui-design-system';

import { INBOX_USER_ROW_VARIANTS } from '../constants';
import { InboxUserRow } from '../InboxUserRow';

interface InboxCardProps {
  inbox: InboxWithCasesCount;
  inboxChecked?: boolean;
  userCheckedMap?: Record<string, boolean>;
  onToggleInbox?: (inboxId: string, checked: boolean) => void;
  onToggleUser?: (userId: string, checked: boolean) => void;
  disabled?: boolean;
}

export const InboxCard = ({
  inbox,
  inboxChecked,
  userCheckedMap,
  onToggleInbox,
  onToggleUser,
  disabled,
}: InboxCardProps) => {
  const { t } = useTranslation(['cases']);
  const hasUsers = inbox.users?.length > 0;
  const isInboxChecked = inboxChecked ?? inbox.autoAssignEnabled;

  return (
    <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center gap-v2-sm">
          <span className="text-s font-medium">{inbox.name}</span>
          <Tag color="purple" size="small" border="rounded-sm">
            {t('cases:overview.inbox.cases_count', { count: inbox.casesCount })}
          </Tag>
        </div>
        <Switch
          checked={isInboxChecked}
          disabled={disabled}
          onCheckedChange={(checked) => onToggleInbox?.(inbox.id, checked)}
        />
      </div>
      {hasUsers && (
        <div className="flex flex-col gap-v2-sm">
          {inbox.users.map((user) => (
            <InboxUserRow
              key={user.id}
              user={user}
              checked={userCheckedMap?.[user.id]}
              onToggle={disabled ? undefined : onToggleUser}
              variant={INBOX_USER_ROW_VARIANTS.panel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
