import { type InboxMetadata } from '@app-builder/models/inbox';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export interface EscalationCondition {
  sourceInboxId: string;
  targetInboxId: string | null;
}

interface EscalationConditionRowProps {
  condition: EscalationCondition;
  allInboxesMetadata: InboxMetadata[];
  usedSourceIds: string[];
  onUpdate: (field: 'sourceInboxId' | 'targetInboxId', value: string | null) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const EscalationConditionRow = ({
  condition,
  allInboxesMetadata,
  usedSourceIds,
  onUpdate,
  onRemove,
  disabled,
}: EscalationConditionRowProps) => {
  const { t } = useTranslation(['cases']);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);

  const sourceInbox = allInboxesMetadata.find((i) => i.id === condition.sourceInboxId);
  const targetInbox = allInboxesMetadata.find((i) => i.id === condition.targetInboxId);

  // Filter out already used source inboxes and the target inbox
  const availableSourceInboxes = allInboxesMetadata.filter(
    (i) => !usedSourceIds.includes(i.id) && i.id !== condition.targetInboxId,
  );

  // Filter out the source inbox from target options
  const availableTargetInboxes = allInboxesMetadata.filter((i) => i.id !== condition.sourceInboxId);

  return (
    <div className="flex items-center gap-v2-sm">
      <span className="text-s text-grey-secondary px-2">{t('cases:overview.panel.escalation.from')}</span>

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

      <span className="text-s text-grey-secondary px-2">{t('cases:overview.panel.escalation.escalate_to')}</span>

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
        <Button mode="icon" variant="secondary" onClick={onRemove}>
          <Icon icon="delete" className="size-4 text-purple-primary" />
        </Button>
      )}
    </div>
  );
};
