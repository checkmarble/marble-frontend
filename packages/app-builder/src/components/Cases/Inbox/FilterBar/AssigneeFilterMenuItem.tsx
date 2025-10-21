import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import * as R from 'remeda';
import { Avatar, MenuCommand } from 'ui-design-system';

type AssigneeFilterMenuItemProps = {
  onSelect: (userId: string) => void;
};

export const AssigneeFilterMenuItem = ({ onSelect }: AssigneeFilterMenuItemProps) => {
  const { orgUsers } = useOrganizationUsers();

  return (
    <>
      <MenuCommand.Combobox />
      <MenuCommand.List>
        {orgUsers.map((user) => (
          <MenuCommand.Item
            key={user.userId}
            value={`${user.userId} ${user.firstName} ${user.lastName}`}
            onSelect={() => onSelect(user.userId)}
          >
            <div className="flex items-center gap-v2-xs">
              <Avatar size="xs" firstName={user.firstName} lastName={user.lastName} />
              <span>{`${R.capitalize(user.firstName)} ${R.capitalize(user.lastName)}`}</span>
            </div>
          </MenuCommand.Item>
        ))}
      </MenuCommand.List>
    </>
  );
};
