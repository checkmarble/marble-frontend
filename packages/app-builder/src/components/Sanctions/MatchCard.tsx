import {
  type FamilyPersonEntity,
  type SanctionCheckMatch,
} from '@app-builder/models/sanction-check';
import { useLayoutLoaderData } from '@app-builder/routes/_builder+/decisions+/$decisionId';
import { SanctionCheckReviewModal } from '@app-builder/routes/ressources+/cases+/review-sanction-match';
import { EnrichMatchButton } from '@app-builder/routes/ressources+/sanction-check+/enrich-match.$matchId';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, CollapsibleV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchDetails } from './MatchDetails';
import { StatusTag } from './StatusTag';
import { sanctionsI18n } from './sanctions-i18n';
import { TopicTag } from './TopicTag';

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

  const { datasets } = useLayoutLoaderData();

  const datasetNames = match.payload.datasets
    ?.map((code) =>
      [...(datasets as Map<string, Map<string, string>>).values()]
        .find((innerMap) => innerMap.has(code))
        ?.get(code),
    )
    .filter(Boolean);

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
              <div className="text-s flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold">{entity.caption}</span>

                <span>
                  {t(`sanctions:entity.schema.${entitySchema}`, { defaultValue: entitySchema })}
                </span>
                <Tag color="grey">
                  {t('sanctions:match.similarity', {
                    percent: Math.round(entity.score * 100),
                  })}
                </Tag>
                <span className="col-span-full flex w-full flex-wrap gap-1">
                  {entity.properties['topics']?.map((topic) => (
                    <TopicTag key={`${match.id}-${topic}`} topic={topic} />
                  ))}
                </span>
              </div>
            </CollapsibleV2.Title>
            {!match.enriched ? (
              <div>
                <EnrichMatchButton matchId={match.id} />
              </div>
            ) : null}
            <div className="inline-flex h-8 text-nowrap">
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
              {entitySchema === 'person' ? (
                <div className="flex flex-col gap-2">
                  <div className="font-semibold">Appears on</div>
                  <div>
                    {datasetNames?.map((name, index) => (
                      <ul key={`dataset-${index}`} className="flex flex-wrap gap-1">
                        <li>{name}</li>
                      </ul>
                    ))}
                  </div>
                </div>
              ) : null}
              {entitySchema === 'person' && entity.properties['familyPerson']?.length ? (
                <FamilyDetail familyMembers={entity.properties['familyPerson']} />
              ) : null}
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
            {formatDateTimeWithoutPresets(comment.createdAt, {
              language,
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </time>
        </span>
      </div>
      <p>{comment.comment}</p>
    </div>
  );
}

function FamilyDetail({ familyMembers }: { familyMembers: FamilyPersonEntity[] }) {
  const { t } = useTranslation(sanctionsI18n);
  return (
    <div className="flex flex-col items-start gap-1">
      {/* <Icon icon="person" className="text-grey-90 size-5" /> */}
      <div className="text-grey-00">{t('sanctions:match.family.label')}</div>

      <div className="grid w-full grid-cols-[max-content_1fr] gap-x-2 gap-y-1">
        {familyMembers.map(({ properties: { relationship, relative } }) =>
          relative?.map(({ id, properties }, idx) => {
            if (!properties.name?.[0]) return null;
            const rel = relationship?.[0] || t('sanctions:match.family.unknown_relationship');
            return (
              <div key={`person-${id}-${idx}`} className="contents">
                <div className="font-semibold">{rel}:</div>
                <div className="flex items-center gap-1">
                  <span>
                    {properties.firstName} {properties.lastName}
                  </span>
                  {properties['topics']?.map((topic) => (
                    <TopicTag key={`${id}-${topic}`} topic={topic} />
                  ))}
                </div>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
