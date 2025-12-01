import { type InboxWithCasesCount } from '@app-builder/models/inbox';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export interface EscalationCondition {
  sourceInboxId: string;
  targetInboxId: string | null;
}

interface EscalationConditionRowProps {
  condition: EscalationCondition;
  inboxes: InboxWithCasesCount[];
  usedSourceIds: string[];
  onUpdate: (field: 'sourceInboxId' | 'targetInboxId', value: string | null) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const EscalationConditionRow = ({
  condition,
  inboxes,
  usedSourceIds,
  onUpdate,
  onRemove,
  disabled,
}: EscalationConditionRowProps) => {
  const { t } = useTranslation(['cases']);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);

  const sourceInbox = inboxes.find((i) => i.id === condition.sourceInboxId);
  const targetInbox = inboxes.find((i) => i.id === condition.targetInboxId);

  // Filter out already used source inboxes and the target inbox
  const availableSourceInboxes = inboxes.filter(
    (i) => !usedSourceIds.includes(i.id) && i.id !== condition.targetInboxId,
  );

  // Filter out the source inbox from target options
  const availableTargetInboxes = inboxes.filter((i) => i.id !== condition.sourceInboxId);

  return (
    <div className="flex items-center gap-v2-sm">
      <span className="text-s text-grey-50 px-2">{t('cases:overview.panel.escalation.if')}</span>

      <div className="flex-1">
        <MenuCommand.Menu open={disabled ? false : sourceOpen} onOpenChange={disabled ? undefined : setSourceOpen}>
          <MenuCommand.Trigger>
            <MenuCommand.SelectButton className="w-full" disabled={disabled}>
              {sourceInbox?.name ?? t('cases:overview.panel.escalation.select_inbox')}
            </MenuCommand.SelectButton>
          </MenuCommand.Trigger>
          <MenuCommand.Content align="start" sameWidth sideOffset={4}>
            <MenuCommand.List>
              {availableSourceInboxes.map((inbox) => (
                <MenuCommand.Item
                  key={inbox.id}
                  value={inbox.id}
                  onSelect={() => {
                    onUpdate('sourceInboxId', inbox.id);
                    setSourceOpen(false);
                  }}
                >
                  {inbox.name}
                </MenuCommand.Item>
              ))}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>

      <span className="text-s text-grey-50 px-2">{t('cases:overview.panel.escalation.escalate_to')}</span>

      <div className="flex-1">
        <MenuCommand.Menu open={disabled ? false : targetOpen} onOpenChange={disabled ? undefined : setTargetOpen}>
          <MenuCommand.Trigger>
            <MenuCommand.SelectButton className="w-full" disabled={disabled}>
              {targetInbox?.name ?? t('cases:overview.panel.escalation.select_inbox')}
            </MenuCommand.SelectButton>
          </MenuCommand.Trigger>
          <MenuCommand.Content align="start" sameWidth sideOffset={4}>
            <MenuCommand.List>
              {availableTargetInboxes.map((inbox) => (
                <MenuCommand.Item
                  key={inbox.id}
                  value={inbox.id}
                  onSelect={() => {
                    onUpdate('targetInboxId', inbox.id);
                    setTargetOpen(false);
                  }}
                >
                  {inbox.name}
                </MenuCommand.Item>
              ))}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>

      {!disabled && (
        <ButtonV2 mode="icon" variant="secondary" onClick={onRemove}>
          <Icon icon="delete" className="size-4 text-purple-65" />
        </ButtonV2>
      )}
    </div>
  );
};
