import { Highlight } from '@app-builder/components/Highlight';
import { matchSorter } from '@app-builder/utils/search';
import { toggle } from 'radash';
import { useDeferredValue, useMemo, useState } from 'react';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useTriggerObjectFilter } from '../DecisionFiltersContext';

export function TriggerObjectFilter() {
  const [value, setSearchValue] = useState('');
  const { triggerObjects, selectedTriggerObjects, setSelectedTriggerObjects } = useTriggerObjectFilter();
  const searchValue = useDeferredValue(value);

  const matches = useMemo(() => matchSorter(triggerObjects, searchValue), [searchValue, triggerObjects]);

  return (
    <div className="flex flex-col gap-sm p-sm">
      <MenuCommand.Inline>
        <MenuCommand.Combobox className="m-0" onValueChange={setSearchValue} />
        <MenuCommand.List className="max-h-40">
          {matches.map((triggerObject) => {
            const isSelected = selectedTriggerObjects.includes(triggerObject);
            return (
              <MenuCommand.Item
                key={triggerObject}
                value={triggerObject}
                onSelect={() => setSelectedTriggerObjects(toggle(selectedTriggerObjects, triggerObject))}
              >
                <Highlight className="first-letter:capitalize" text={triggerObject} query={searchValue} />
                {isSelected ? <Icon icon="tick" className="text-purple-primary size-6 shrink-0" /> : null}
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Inline>
    </div>
  );
}
