import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { matchSorter } from '@app-builder/utils/search';
import { toggle } from 'radash';
import { useDeferredValue, useMemo, useState } from 'react';
import { Avatar, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useCreatorFilter } from '../TestRunsFiltersContext';

export function CreatorsFilter() {
  const [value, setSearchValue] = useState('');
  const { creator, setCreator } = useCreatorFilter();
  const deferredValue = useDeferredValue(value);
  const { orgUsers } = useOrganizationUsers();
  const selected = creator ?? [];

  const matches = useMemo(
    () => matchSorter(orgUsers, deferredValue, { keys: ['firstName', 'lastName'] }),
    [deferredValue, orgUsers],
  );

  return (
    <div className="flex flex-col gap-sm p-sm">
      <MenuCommand.Inline>
        <MenuCommand.Combobox className="m-0" onValueChange={setSearchValue} />
        <MenuCommand.List className="max-h-40">
          {matches.map((user) => {
            const isSelected = selected.includes(user.userId);
            return (
              <MenuCommand.Item
                key={user.userId}
                value={`${user.firstName} ${user.lastName} ${user.userId}`}
                onSelect={() => setCreator(toggle(selected, user.userId))}
              >
                <div className="flex flex-row items-center gap-md">
                  <Avatar firstName={user.firstName} lastName={user.lastName} size="m" />
                  <span className="text-grey-primary text-s">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                {isSelected ? <Icon icon="tick" className="text-purple-primary size-6 shrink-0" /> : null}
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Inline>
    </div>
  );
}
