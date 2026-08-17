import { testRunStatuses as statuses } from '@app-builder/models/testrun';
import { matchSorter } from '@app-builder/utils/search';
import { toggle } from 'radash';
import { useDeferredValue, useMemo, useState } from 'react';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { TestRunStatus } from '../../TestRunStatus';
import { useStatusesFilter } from '../TestRunsFiltersContext';

export function StatusesFilter() {
  const [value, setSearchValue] = useState('');
  const { selectedStatuses, setSelectedStatuses } = useStatusesFilter();
  const deferredValue = useDeferredValue(value);
  const selected = selectedStatuses ?? [];

  const matches = useMemo(() => matchSorter(toggle(statuses, 'unknown'), deferredValue), [deferredValue]);

  return (
    <div className="flex flex-col gap-sm p-sm">
      <MenuCommand.Inline>
        <MenuCommand.Combobox className="m-0" onValueChange={setSearchValue} />
        <MenuCommand.List className="max-h-40">
          {matches.map((status) => {
            const isSelected = selected.includes(status);
            return (
              <MenuCommand.Item
                key={status}
                value={status}
                onSelect={() => setSelectedStatuses(toggle(selected, status))}
              >
                <TestRunStatus status={status} />
                {isSelected ? <Icon icon="tick" className="text-purple-primary size-6 shrink-0" /> : null}
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Inline>
    </div>
  );
}
