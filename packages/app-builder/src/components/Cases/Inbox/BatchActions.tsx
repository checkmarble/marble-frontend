import { User } from '@app-builder/models';
import { Case } from '@app-builder/models/cases';
import { Inbox } from '@app-builder/models/inbox';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Avatar, ButtonV2, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type MassUpdateCasesFn = (
  items: Case[],
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

export const BatchActions = ({ onMassUpdateCases, assignableUsers, inboxes, selectedCases }: BatchActionsProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(['common', 'cases']);
  const canReopen = selectedCases.some(({ status }) => status === 'closed');
  const canClose = selectedCases.some(({ status }) => status !== 'closed');

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <ButtonV2 size="default" variant="secondary" appearance="stroked">
          <Icon icon="checked" className="size-4" />
          {t('common:actions')}
          <Icon icon="arrow-right" className="size-4" />
        </ButtonV2>
      </MenuCommand.Trigger>
      <MenuCommand.Content side="right" align="start" sideOffset={4}>
        <MenuCommand.List>
          {canReopen ? (
            <MenuCommand.Item onSelect={() => onMassUpdateCases(selectedCases, { action: 'reopen' })}>
              {t('cases:case.batch_actions.reopen')}
            </MenuCommand.Item>
          ) : null}
          {canClose ? (
            <MenuCommand.Item onSelect={() => onMassUpdateCases(selectedCases, { action: 'close' })}>
              {t('cases:case.batch_actions.lose')}
            </MenuCommand.Item>
          ) : null}
          {assignableUsers.length > 0 ? (
            <MenuCommand.SubMenu trigger={<span>{t('cases:case.batch_actions.assign')}</span>}>
              <MenuCommand.List>
                {assignableUsers.map(({ userId, firstName, lastName }) => (
                  <MenuCommand.Item
                    key={userId}
                    onSelect={() => onMassUpdateCases(selectedCases, { action: 'assign', assigneeId: userId })}
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
            <MenuCommand.SubMenu trigger={<span>{t('cases:case.batch_actions.move_to_inbox')}</span>}>
              <MenuCommand.List>
                {inboxes.map(({ id, name }) => (
                  <MenuCommand.Item
                    key={id}
                    onSelect={() => onMassUpdateCases(selectedCases, { action: 'move_to_inbox', inboxId: id })}
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
