import { MembershipMemberEntity } from '@app-builder/models/sanction-check';
import { useTranslation } from 'react-i18next';

export const MemberShip = ({
  membershipMember,
}: {
  membershipMember: MembershipMemberEntity[];
}) => {
  const { t } = useTranslation(['sanctions']);

  return (
    <>
      <div className="grid grid-cols-[168px,_1fr] gap-2">
        <div className="font-bold col-span-2">{t('sanctions:match.membership.title')}</div>

        {membershipMember?.map((membership, idx) => {
          return (
            <div key={`membership-${membership.id}-${idx}`} className="contents">
              <div className="font-semibold"></div>
              <div className="flex flex-row items-start gap-2 rounded p-2 bg-grey-100">
                <div className="flex flex-col gap-2">
                  <div className="col-span-full flex w-full flex-wrap gap-1">
                    <span className="font-semibold">
                      {membership.caption || t('sanctions:match.membership.no-caption')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
