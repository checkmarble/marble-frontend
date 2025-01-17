import { type SanctionCheckMatch } from '@app-builder/models/sanction-check';
import { SanctionCheckReviewModal } from '@app-builder/routes/ressources+/cases+/review-sanction-match';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, CollapsibleV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchDetails } from './MatchDetails';
import { sanctionsI18n } from './sanctions-i18n';
import { StatusTag } from './StatusTag';

type MatchCardProps = {
  match: SanctionCheckMatch;
  readonly: boolean;
};

export const MatchCard = ({ match, readonly }: MatchCardProps) => {
  const { t } = useTranslation(sanctionsI18n);
  const [isInReview, setIsInReview] = useState(false);

  const entity = match.payload;
  const entitySchema = entity.schema.toLowerCase() as Lowercase<
    typeof entity.schema
  >;

  const handleMatchReview = () => {
    setIsInReview(true);
  };

  return (
    <div className="grid grid-cols-[max-content_1fr_max-content] gap-x-6 gap-y-2">
      <CollapsibleV2.Provider>
        <div className="bg-grey-98 col-span-full grid grid-cols-subgrid rounded-md">
          <div className="col-span-full grid grid-cols-subgrid items-center px-4 py-3">
            <CollapsibleV2.Title className="focus-visible:text-purple-65 group rounded outline-none transition-colors">
              <Icon
                icon="smallarrow-up"
                aria-hidden
                className="size-5 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-[initial]:rotate-180 rtl:-rotate-90 rtl:group-aria-expanded:-rotate-180 rtl:group-data-[initial]:-rotate-180"
              />
            </CollapsibleV2.Title>
            <div className="text-s flex items-center gap-2">
              <span className="font-semibold">{entity.caption}</span>
              <span>{t(`sanctions:entity.schema.${entitySchema}`)}</span>
              <Tag color="grey">
                {t('sanctions:match.similarity', {
                  percent: Math.round(match.payload.score * 100),
                })}
              </Tag>
            </div>
            <div className="inline-flex h-8">
              {readonly ? (
                <Tag border="square" color="grey">
                  {t('sanctions:match.not_reviewed')}
                </Tag>
              ) : (
                <StatusTag
                  status={match.status}
                  disabled={match.status !== 'pending'}
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
        sanctionMatchId={match.id}
      />
    </div>
  );
};

function CommentLine({
  comment,
}: {
  comment: SanctionCheckMatch['comments'][number];
}) {
  const language = useFormatLanguage();
  const { getOrgUserById } = useOrganizationUsers();
  const user = getOrgUserById(comment.authorId);

  return (
    <div key={comment.id} className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Avatar
          size="xs"
          firstName={user?.firstName}
          lastName={user?.lastName}
        />
        <span className="flex items-baseline gap-1">
          Roger Grand
          <time className="text-grey-50 text-xs" dateTime={comment.createdAt}>
            {formatDateTime(comment.createdAt, { language })}
          </time>
        </span>
      </div>
      <p>{comment.comment}</p>
    </div>
  );
}
