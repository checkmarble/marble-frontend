import { MembershipMemberEntity } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';

export const MemberShip = ({ membershipMember }: { membershipMember: MembershipMemberEntity[] }) => {
  const { t } = useTranslation(['screenings']);

  return (
    <>
      <div className="grid grid-cols-[168px_1fr] gap-2">
        {membershipMember?.map((membership, idx) => {
          return (
            <div key={`membership-${membership.id}-${idx}`} className="contents">
              {idx === 0 ? (
                <div className="font-bold">{t('screenings:match.membership.title')}</div>
              ) : (
                <div className="font-semibold"></div>
              )}
              <div className="flex flex-row items-start gap-2 rounded-sm p-2 bg-grey-100">
                <div className="flex flex-col gap-2">
                  <div className="col-span-full flex w-full flex-wrap gap-1">
                    <span className="font-semibold">
                      {membership.caption || t('screenings:match.membership.no-caption')}
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
