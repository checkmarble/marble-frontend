import type { SanctionCheckMatch } from '@app-builder/models/sanction-check';
import { SanctionCheckReviewModal } from '@app-builder/routes/ressources+/cases+/review-sanction-match';
import { EnrichMatchButton } from '@app-builder/routes/ressources+/sanction-check+/enrich-match.$matchId';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, CollapsibleV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchDetails } from './MatchDetails';
import { StatusTag } from './StatusTag';
import { sanctionsI18n } from './sanctions-i18n';

type MatchCardProps = {
  match: SanctionCheckMatch;
  readonly?: boolean;
  unreviewable?: boolean;
  defaultOpen?: boolean;
};

export const MatchCard = ({ match, readonly, unreviewable, defaultOpen }: MatchCardProps) => {
  const { t } = useTranslation(sanctionsI18n);
  const [isInReview, setIsInReview] = useState(false);

  const entity = match.payload;
  const entitySchema = entity.schema.toLowerCase() as Lowercase<typeof entity.schema>;

  const handleMatchReview = () => {
    setIsInReview(true);
  };

  return (
    <div className="grid grid-cols-[max-content_1fr_max-content] gap-x-6 gap-y-2">
      <CollapsibleV2.Provider defaultOpen={defaultOpen}>
        <div className="bg-grey-98 col-span-full grid grid-cols-subgrid rounded-md">
          <div className="col-span-full flex items-center justify-between gap-2 px-4 py-3">
            <CollapsibleV2.Title className="focus-visible:text-purple-65 group flex grow items-center gap-2 rounded outline-none transition-colors">
              <Icon
                icon="smallarrow-up"
                aria-hidden
                className="size-5 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-[initial]:rotate-180 rtl:-rotate-90 rtl:group-aria-expanded:-rotate-180 rtl:group-data-[initial]:-rotate-180"
              />
              <div className="text-s flex items-center gap-2">
                <span className="font-semibold">{entity.caption}</span>
                <span>{t(`sanctions:entity.schema.${entitySchema}`)}</span>
                <Tag color="grey">
                  {t('sanctions:match.similarity', {
                    percent: Math.round(match.payload.score * 100),
                  })}
                </Tag>
              </div>
            </CollapsibleV2.Title>
            {!match.enriched ? (
              <div>
                <EnrichMatchButton matchId={match.id} />
              </div>
            ) : null}
            <div className="inline-flex h-8">
              {unreviewable ? (
                <Tag border="square" color="grey">
                  {t('sanctions:match.not_reviewable')}
                </Tag>
              ) : (
                <StatusTag
                  status={match.status}
                  disabled={match.status !== 'pending' || readonly}
                  onClick={handleMatchReview}
                />
              )}
            </div>
          </div>

          <CollapsibleV2.Content className="col-span-full">
            <div className="text-s flex flex-col gap-6 p-4">
              {match.comments.map((comment) => {
                return <CommentLine key={comment.id} comment={comment} />;
              })}
              <MatchDetails entity={entity} />
            </div>
          </CollapsibleV2.Content>
        </div>
      </CollapsibleV2.Provider>
      <SanctionCheckReviewModal
        open={isInReview}
        onClose={() => setIsInReview(false)}
        sanctionMatch={match}
      />
    </div>
  );
};

function CommentLine({ comment }: { comment: SanctionCheckMatch['comments'][number] }) {
  const language = useFormatLanguage();
  const { getOrgUserById } = useOrganizationUsers();
  const user = getOrgUserById(comment.authorId);
  const fullName = getFullName(user);

  return (
    <div key={comment.id} className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Avatar size="xs" firstName={user?.firstName} lastName={user?.lastName} />
        <span className="flex items-baseline gap-1">
          {fullName}
          <time className="text-grey-50 text-xs" dateTime={comment.createdAt}>
            {formatDateTime(comment.createdAt, { language })}
          </time>
        </span>
      </div>
      <p>{comment.comment}</p>
    </div>
  );
}
