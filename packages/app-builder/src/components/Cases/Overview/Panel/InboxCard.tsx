import type { InboxWithCasesCount } from '@app-builder/models/inbox';
import { Switch, Tag } from 'ui-design-system';

import { InboxUserRow } from '../InboxUserRow';

interface InboxCardProps {
  inbox: InboxWithCasesCount;
  inboxChecked?: boolean;
  userCheckedMap?: Map<string, boolean>;
  onToggleInbox?: (inboxId: string, checked: boolean) => void;
  onToggleUser?: (userId: string, checked: boolean) => void;
}

export const InboxCard = ({ inbox, inboxChecked, userCheckedMap, onToggleInbox, onToggleUser }: InboxCardProps) => {
  const hasUsers = inbox.users && inbox.users.length > 0;
  const isInboxChecked = inboxChecked ?? inbox.autoAssignEnabled;

  return (
    <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center gap-v2-sm">
          <span className="text-s font-medium">{inbox.name}</span>
          <Tag color="purple" size="small" border="rounded-sm">
            {inbox.casesCount} cases
          </Tag>
        </div>
        <Switch checked={isInboxChecked} onCheckedChange={(checked) => onToggleInbox?.(inbox.id, checked)} />
      </div>
      {hasUsers && (
        <div className="flex flex-col gap-v2-sm">
          {inbox.users.map((user) => (
            <InboxUserRow
              key={user.id}
              user={user}
              checked={userCheckedMap?.get(user.id)}
              onToggle={onToggleUser}
              variant="panel"
            />
          ))}
        </div>
      )}
    </div>
  );
};
