import { Highlight } from '@app-builder/components/Highlight';
import { usePermissionsContext } from '@app-builder/components/PermissionsContext';
import { type Inbox } from '@app-builder/models/inbox';
import { CreateInbox } from '@app-builder/routes/ressources+/settings+/inboxes+/create';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { workflowI18n } from '../workflow-i18n';

export function SelectInbox({
  selectedInboxId,
  onSelectedInboxIdChange,
  inboxes,
}: {
  selectedInboxId?: string;
  onSelectedInboxIdChange: (outcomes: string) => void;
  inboxes: Inbox[];
}) {
  const { t } = useTranslation(workflowI18n);
  const [value, setSearchValue] = React.useState('');
  const searchValue = React.useDeferredValue(value);

  const { canEditInboxes } = usePermissionsContext();

  const selectedInbox = React.useMemo(
    () => inboxes.find((inbox) => inbox.id === selectedInboxId),
    [selectedInboxId, inboxes],
  );

  const matches = React.useMemo(
    () => matchSorter(inboxes, searchValue, { keys: ['name'] }),
    [searchValue, inboxes],
  );

  let footer;
  if (canEditInboxes) {
    footer = <CreateInbox />;
  } else if (inboxes.length === 0) {
    footer = (
      <p>{t('workflows:detail_panel.inbox.need_inbox_contact_admin')}</p>
    );
  } else {
    footer = null;
  }

  return (
    <SelectWithCombobox.Root
      onSearchValueChange={setSearchValue}
      selectedValue={selectedInboxId}
      onSelectedValueChange={onSelectedInboxIdChange}
    >
      <SelectWithCombobox.Label className="text-grey-100 capitalize">
        {t('workflows:detail_panel.inbox.label')}
      </SelectWithCombobox.Label>
      <SelectWithCombobox.Select>
        {selectedInbox ? (
          <span className="text-grey-100">{selectedInbox.name}</span>
        ) : (
          <span className="text-grey-25">
            {t('workflows:detail_panel.inbox.placeholder')}
          </span>
        )}
        <SelectWithCombobox.Arrow />
      </SelectWithCombobox.Select>
      <SelectWithCombobox.Popover
        className="flex flex-col gap-2 p-2"
        fitViewport
      >
        <SelectWithCombobox.Combobox render={<Input />} />
        <SelectWithCombobox.ComboboxList className="max-h-40">
          {matches.map((scenario) => {
            return (
              <SelectWithCombobox.ComboboxItem
                key={scenario.id}
                value={scenario.id}
              >
                <Highlight text={scenario.name} query={searchValue} />
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
        {footer}
      </SelectWithCombobox.Popover>
    </SelectWithCombobox.Root>
  );
}
