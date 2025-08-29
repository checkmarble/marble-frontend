import { Highlight } from '@app-builder/components/Highlight';
import { CreateInbox } from '@app-builder/components/Settings/Inboxes/CreateInbox';
import { type InboxMetadata } from '@app-builder/models/inbox';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';

export function InboxSelector({
  selectedInboxId,
  onSelectedInboxIdChange,
  inboxes,
  isCreateInboxAvailable,
  withAnyInboxAvailable,
  isAnyInboxSelected,
}: {
  selectedInboxId?: string;
  onSelectedInboxIdChange: (outcomes: string) => void;
  inboxes: InboxMetadata[];
  isCreateInboxAvailable: boolean;
  withAnyInboxAvailable: boolean;
  isAnyInboxSelected?: boolean;
}) {
  const { t } = useTranslation(['workflows']);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const selectedInbox = useMemo(
    () => inboxes.find((inbox) => inbox.id === selectedInboxId),
    [selectedInboxId, inboxes],
  );

  const matches = useMemo(
    () => matchSorter(inboxes, deferredSearchValue, { keys: ['name'] }),
    [deferredSearchValue, inboxes],
  );

  const getCreateInbox = () => {
    if (isCreateInboxAvailable) {
      return <CreateInbox />;
    }
    if (inboxes.length === 0) {
      return <p className="p-2">{t('workflows:detail_panel.inbox.need_inbox_contact_admin')}</p>;
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-2">
      <MenuCommand.Menu open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton>
            {isAnyInboxSelected ? (
              <span className="text-grey-00">{t('workflows:action.inbox.any_available')}</span>
            ) : selectedInbox ? (
              <span className="text-grey-00">{selectedInbox.name}</span>
            ) : (
              <span className="text-grey-80">{t('workflows:detail_panel.inbox.placeholder')}</span>
            )}
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth sideOffset={4}>
          <MenuCommand.Combobox
            placeholder={t('workflows:detail_panel.inbox.placeholder')}
            onValueChange={setSearchValue}
          />
          <MenuCommand.List className="max-h-40">
            {matches.map((inbox) => {
              return (
                <MenuCommand.Item
                  key={inbox.id}
                  onSelect={() => {
                    onSelectedInboxIdChange(inbox.id);
                    setOpen(false);
                  }}
                >
                  <Highlight text={inbox.name} query={deferredSearchValue} />
                </MenuCommand.Item>
              );
            })}
            {withAnyInboxAvailable && (
              <MenuCommand.Item
                key="any_inbox"
                onSelect={() => {
                  onSelectedInboxIdChange('any_inbox');
                  setOpen(false);
                }}
              >
                <Highlight
                  text={t('workflows:action.inbox.any_available')}
                  query={deferredSearchValue}
                />
              </MenuCommand.Item>
            )}
          </MenuCommand.List>
          <div className="p-2">{getCreateInbox()}</div>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
}
