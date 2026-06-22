import { MembershipMemberEntity } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';

export const MemberShip = ({ membershipMember }: { membershipMember: MembershipMemberEntity[] }) => {
  const { t } = useTranslation(['screenings']);

  return (
    <>
      <div className="grid grid-cols-[146px_1fr] gap-sm">
        {membershipMember?.map((membership, idx) => {
          return (
            <div key={`membership-${membership.id}-${idx}`} className="contents">
              {idx === 0 ? (
                <div className="font-bold">{t('screenings:match.membership.title')}</div>
              ) : (
                <div className="font-semibold"></div>
              )}
              <div className="flex flex-row items-start gap-sm rounded-sm p-sm bg-surface-card">
                <div className="flex flex-col gap-sm">
                  <div className="col-span-full flex w-full flex-wrap gap-xs">
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
