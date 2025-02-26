import { casesI18n } from '@app-builder/components/Cases/cases-i18n';
import { Highlight } from '@app-builder/components/Highlight';
import { caseEventTypes } from '@app-builder/models/cases';
import { matchSorter } from '@app-builder/utils/search';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { getEventIcon } from '../../CaseEvents';
import { useCaseEventTypesFilter } from '../CaseHistoryFiltersContext';

export function EventTypeFilter() {
  const { t } = useTranslation(casesI18n);
  const [value, setSearchValue] = React.useState('');
  const { selectedCaseEventTypes, setSelectedCaseEventTypes } = useCaseEventTypesFilter();
  const deferredValue = React.useDeferredValue(value);

  const caseEventTypeOptions = React.useMemo(
    () =>
      caseEventTypes.map((eventType) => {
        const EventIcon = getEventIcon(eventType);
        return {
          EventIcon,
          label: t(`cases:case_detail.history.event_type.${eventType}`),
          value: eventType,
        };
      }),
    [t],
  );
  const matches = React.useMemo(
    () => matchSorter(caseEventTypeOptions, deferredValue, { keys: ['label'] }),
    [caseEventTypeOptions, deferredValue],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <SelectWithCombobox.Root
        open
        onSearchValueChange={setSearchValue}
        selectedValue={selectedCaseEventTypes}
        onSelectedValueChange={setSelectedCaseEventTypes}
      >
        <SelectWithCombobox.Combobox render={<Input />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList className="max-h-40">
          {matches.map((status) => {
            return (
              <SelectWithCombobox.ComboboxItem
                key={status.value}
                value={status.value}
                className="flex items-center gap-2"
              >
                {status.EventIcon}
                <Highlight text={status.label} query={deferredValue} />
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Root>
    </div>
  );
}
