import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { useFormContext } from 'react-hook-form';
import * as R from 'remeda';
import { Avatar } from 'ui-design-system';
import { CasesFiltersForm, useCasesFiltersContext } from '../CasesFiltersContext';

export function CasesAssigneeFilter({ close }: { close: () => void }) {
  const { submitCasesFilters } = useCasesFiltersContext();
  const { setValue } = useFormContext<CasesFiltersForm>();
  const { orgUsers } = useOrganizationUsers();

  const handleUserSelect = (userId: string) => {
    setValue('assignee', userId);
    submitCasesFilters();
    close();
  };

  return (
    <div className="flex flex-col gap-2 p-v2-sm">
      {orgUsers.map((user) => (
        <div
          key={user.userId}
          className="inline-flex gap-v2-sm w-full p-v2-sm hover:bg-purple-98 cursor-pointer"
          onClick={() => handleUserSelect(user.userId)}
        >
          <Avatar size="xs" firstName={user.firstName} lastName={user.lastName} />
          <span>{`${R.capitalize(user.firstName)} ${R.capitalize(user.lastName)}`}</span>
        </div>
      ))}
    </div>
  );
}
