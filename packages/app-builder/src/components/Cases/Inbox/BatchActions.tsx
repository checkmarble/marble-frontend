import { User } from '@app-builder/models';
import { Case } from '@app-builder/models/cases';
import { Inbox } from '@app-builder/models/inbox';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Avatar, Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type MassUpdateCasesFn = (
  params:
    | { action: 'reopen' | 'close' }
    | { action: 'assign'; assigneeId: string }
    | { action: 'move_to_inbox'; inboxId: string },
) => void;

export type BatchActionsProps = {
  onMassUpdateCases: MassUpdateCasesFn;
  assignableUsers: User[];
  inboxes: Inbox[];
  selectedCases: Case[];
};

export const BatchActions = ({
  onMassUpdateCases,
  assignableUsers,
  inboxes,
  selectedCases,
}: BatchActionsProps) => {
  const { t } = useTranslation(['common', 'cases']);
  const canReopen = selectedCases.some(({ status }) => status === 'closed');
  const canClose = selectedCases.some(({ status }) => status !== 'closed');

  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <Button variant="secondary">
          <Icon icon="checked" className="size-4" />
          {t('common:actions')}
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="end" sideOffset={4}>
        <MenuCommand.List>
          {canReopen ? (
            <MenuCommand.Item onSelect={() => onMassUpdateCases({ action: 'reopen' })}>
              {t('cases:case.batch_actions.reopen')}
            </MenuCommand.Item>
          ) : null}
          {canClose ? (
            <MenuCommand.Item onSelect={() => onMassUpdateCases({ action: 'close' })}>
              {t('cases:case.batch_actions.lose')}
            </MenuCommand.Item>
          ) : null}
          {assignableUsers.length > 0 ? (
            <MenuCommand.SubMenu trigger={<span>{t('cases:case.batch_actions.assign')}</span>}>
              <MenuCommand.List>
                {assignableUsers.map(({ userId, firstName, lastName }) => (
                  <MenuCommand.Item
                    key={userId}
                    onSelect={() => onMassUpdateCases({ action: 'assign', assigneeId: userId })}
                  >
                    <span className="flex items-center gap-v2-sm">
                      <Avatar size="xs" firstName={firstName} lastName={lastName} />
                      <span>{`${R.capitalize(firstName)} ${R.capitalize(lastName)}`}</span>
                    </span>
                  </MenuCommand.Item>
                ))}
              </MenuCommand.List>
            </MenuCommand.SubMenu>
          ) : null}
          {inboxes.length > 0 ? (
            <MenuCommand.SubMenu
              trigger={<span>{t('cases:case.batch_actions.move_to_inbox')}</span>}
            >
              <MenuCommand.List>
                {inboxes.map(({ id, name }) => (
                  <MenuCommand.Item
                    key={id}
                    onSelect={() => onMassUpdateCases({ action: 'move_to_inbox', inboxId: id })}
                  >
                    {name}
                  </MenuCommand.Item>
                ))}
              </MenuCommand.List>
            </MenuCommand.SubMenu>
          ) : null}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};
