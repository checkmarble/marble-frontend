import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useTranslation } from 'react-i18next';
import { Avatar, Tooltip } from 'ui-design-system';

import { casesI18n } from '.';

export function CaseAssignedTo({ userId }: { userId: string }) {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);

  const user = getOrgUserById(userId);

  return (
    <Tooltip.Default
      content={
        <div key={user?.userId ?? 0} className="flex flex-row items-center gap-1">
          <Avatar key={user?.userId} size="xs" firstName={user?.firstName} lastName={user?.lastName} />
          <div className="text-grey-00 text-xs font-normal capitalize">
            {getFullName(user) || t('cases:case_detail.unknown_user')}
          </div>
        </div>
      }
    >
      <div className="flex w-fit flex-row items-center gap-1">
        <Avatar
          key={user?.userId ?? 0}
          className="border-grey-100 border-2"
          size="s"
          firstName={user?.firstName}
          lastName={user?.lastName}
        />
      </div>
    </Tooltip.Default>
  );
}
