import { type CaseContributor } from '@app-builder/models/cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Avatar, Tooltip } from 'ui-design-system';

import { casesI18n } from '.';

export function CaseContributors({ contributors }: { contributors: CaseContributor[] }) {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);

  return (
    <Tooltip.Default
      content={
        <div className="flex flex-col gap-1">
          {contributors.map((contributor) => {
            const user = getOrgUserById(contributor.userId);
            return (
              <div key={contributor.id} className="flex flex-row items-center gap-1">
                <Avatar key={contributor.id} size="xs" firstName={user?.firstName} lastName={user?.lastName} />
                <div className="text-grey-00 text-xs font-normal capitalize">
                  {getFullName(user) || t('cases:case_detail.unknown_user')}
                </div>
              </div>
            );
          })}
        </div>
      }
    >
      <div className="flex w-fit flex-row items-center gap-1">
        <div className="isolate flex -space-x-4 overflow-hidden">
          {contributors.slice(0, 3).map((contributor, index) => {
            const user = getOrgUserById(contributor.userId);
            return (
              <Avatar
                key={contributor.id}
                className={cx(
                  'border-grey-100 border-2',
                  index === 0 && 'z-30',
                  index === 1 && 'z-20',
                  index === 2 && 'z-10',
                )}
                size="s"
                firstName={user?.firstName}
                lastName={user?.lastName}
              />
            );
          })}
        </div>
        {contributors.length > 3 ? (
          <div className="text-s text-grey-00 font-normal">+{contributors.length - 3}</div>
        ) : null}
      </div>
    </Tooltip.Default>
  );
}
