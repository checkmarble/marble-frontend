import { User } from '@app-builder/models';
import { CaseContributor } from '@app-builder/models/cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { useTranslation } from 'react-i18next';
import { Avatar, cn, Tooltip } from 'ui-design-system';

export const AssignedContributors = ({
  assignedTo,
  contributors,
}: {
  assignedTo: string | undefined;
  contributors: CaseContributor[];
}) => {
  const { getOrgUserById } = useOrganizationUsers();
  const assignedUser = assignedTo ? getOrgUserById(assignedTo) : undefined;
  const contributorsUsers = contributors.map((contributor) => getOrgUserById(contributor.userId));

  return (
    <div className="inline-flex items-center gap-v2-sm">
      {assignedTo ? <AvatarWithTooltip user={assignedUser} className="border-purple-65" /> : null}
      <span className="lg:flex items-center gap-v2-xs group/contributors hidden">
        {contributorsUsers.map((user, idx) =>
          user ? (
            <div
              key={user.userId}
              className="w-4 group-hover/contributors:w-9 rotate-0 overflow-visible transition-all"
            >
              <AvatarWithTooltip user={user} />
            </div>
          ) : null,
        )}
      </span>
    </div>
  );
};

type AvatarWithTooltipProps = {
  user: User | undefined;
  className?: string;
};

export const AvatarWithTooltip = ({ user, className }: AvatarWithTooltipProps) => {
  const { t } = useTranslation(['cases']);
  const avatar = <Avatar key={user?.userId} size="s" firstName={user?.firstName} lastName={user?.lastName} />;

  return (
    <Tooltip.Default
      content={
        <div key={user?.userId ?? 0} className="flex flex-row items-center gap-1">
          {avatar}
          <div className="text-grey-00 text-xs font-normal capitalize">
            {getFullName(user) || t('cases:case_detail.unknown_user')}
          </div>
        </div>
      }
    >
      <div className="flex w-fit flex-row items-center gap-1">
        <span className={cn('border-2 border-white rounded-full', className)}>{avatar}</span>
      </div>
    </Tooltip.Default>
  );
};
