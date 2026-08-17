import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from '@app-builder/utils/search';
import { toggle } from 'radash';
import { useDeferredValue, useMemo, useState } from 'react';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useCaseInboxFilter } from '../DecisionFiltersContext';

export function CaseInboxFilter() {
  const [value, setSearchValue] = useState('');
  const { inboxes, selectedCaseInboxIds, setSelectedCaseInboxIds } = useCaseInboxFilter();
  const searchValue = useDeferredValue(value);

  const matches = useMemo(() => matchSorter(inboxes, searchValue, { keys: ['name'] }), [searchValue, inboxes]);

  return (
    <div className="flex flex-col gap-sm p-sm">
      <MenuCommand.Inline>
        <MenuCommand.Combobox className="m-0" onValueChange={setSearchValue} />
        <MenuCommand.List className="max-h-40">
          {matches.map((inbox) => {
            const isSelected = selectedCaseInboxIds.includes(inbox.id);
            return (
              <MenuCommand.Item
                key={inbox.id}
                value={`${inbox.name} ${inbox.id}`}
                onSelect={() => setSelectedCaseInboxIds(toggle(selectedCaseInboxIds, inbox.id))}
              >
                <Highlight text={inbox.name} query={searchValue} />
                {isSelected ? <Icon icon="tick" className="text-purple-primary size-6 shrink-0" /> : null}
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Inline>
    </div>
  );
}
