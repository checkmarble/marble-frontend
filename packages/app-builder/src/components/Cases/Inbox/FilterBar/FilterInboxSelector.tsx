import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PartialInbox } from './types';

type FilterInboxSelectorProps = {
  inboxes: PartialInbox[];
  selectedInbox: PartialInbox;
  onSelectInbox: (inbox: PartialInbox) => void;
};

export const FilterInboxSelector = ({
  inboxes,
  selectedInbox,
  onSelectInbox,
}: FilterInboxSelectorProps) => {
  const { t } = useTranslation(['cases']);
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <ButtonV2 variant="primary" size="default">
          <span>
            {t('cases:case.inbox')}: {selectedInbox.name}
          </span>
          {selectedInbox.casesCount !== undefined ? (
            <div className="px-v2-xs py-v2-xxs rounded-full bg-white border border-grey-border text-purple-65 text-small">
              {selectedInbox.casesCount} cases
            </div>
          ) : null}
          <Icon icon="caret-down" className="size-4" />
        </ButtonV2>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" sideOffset={4} sameWidth>
        <MenuCommand.List>
          {inboxes.map((inbox) => (
            <MenuCommand.Item
              key={inbox.id}
              value={`${inbox.id} ${inbox.name}`}
              onSelect={() => onSelectInbox(inbox)}
            >
              <div className="grid grid-cols-[20px_1fr] items-center gap-v2-xs">
                {inbox.id === selectedInbox.id ? (
                  <Icon icon="tick" className="size-4 text-purple-65" />
                ) : null}
                <span className="col-start-2">{inbox.name}</span>
              </div>
              {inbox.casesCount !== undefined ? (
                <span className="text-small text-grey-50">
                  {t('cases:inbox.cases_count', { count: inbox.casesCount })}
                </span>
              ) : null}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};
