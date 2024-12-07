import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { Avatar, Input, SelectWithCombobox } from 'ui-design-system';

import { useCreatorFilter } from '../TestRunsFiltersContext';

export function CreatorsFilter() {
  const [value, setSearchValue] = useState('');
  const { creator, setCreator } = useCreatorFilter();
  const deferredValue = useDeferredValue(value);
  const { orgUsers } = useOrganizationUsers();

  const matches = useMemo(
    () =>
      matchSorter(orgUsers, deferredValue, { keys: ['firstName', 'lastName'] }),
    [deferredValue, orgUsers],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <SelectWithCombobox.Root
        open
        onSearchValueChange={setSearchValue}
        selectedValue={creator}
        onSelectedValueChange={setCreator}
      >
        <SelectWithCombobox.Combobox render={<Input />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList className="max-h-40">
          {matches.map((user) => {
            return (
              <SelectWithCombobox.ComboboxItem
                key={user.userId}
                value={user.userId}
                className="align-baseline"
              >
                <div className="flex flex-row items-center gap-4">
                  <Avatar
                    firstName={user.firstName}
                    lastName={user.lastName}
                    size="m"
                  />
                  <span className="text-grey-100 text-s">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Root>
    </div>
  );
}
