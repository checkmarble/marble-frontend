import { Highlight } from '@app-builder/components/Highlight';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { matchSorter } from '@app-builder/utils/search';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';

type UserFilterMenuProps = {
  onSelect: (userId: string) => void;
};

export const UserFilterMenu = ({ onSelect }: UserFilterMenuProps) => {
  const { t } = useTranslation(['common']);
  const [searchValue, setSearchValue] = useState('');
  const deferredValue = useDeferredValue(searchValue);
  const { orgUsers } = useOrganizationUsers();

  const matches = useMemo(
    () => matchSorter(orgUsers, deferredValue, { keys: ['email', 'firstName', 'lastName'] }),
    [deferredValue, orgUsers],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <MenuCommand.Combobox placeholder={t('common:search')} onValueChange={setSearchValue} />
      <MenuCommand.List className="max-h-40">
        {matches.map((user) => (
          <MenuCommand.Item
            key={user.userId}
            value={`${user.firstName ?? ''} ${user.lastName ?? ''} ${user.email}`.trim()}
            onSelect={() => onSelect(user.userId)}
          >
            <div className="flex flex-col">
              <span className="text-grey-00 text-s">
                {user.firstName} {user.lastName}
              </span>
              <Highlight text={user.email} query={deferredValue} className="text-grey-50 text-xs" />
            </div>
          </MenuCommand.Item>
        ))}
      </MenuCommand.List>
    </div>
  );
};
