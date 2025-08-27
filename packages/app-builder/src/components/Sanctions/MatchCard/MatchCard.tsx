import { EnrichMatchButton } from '@app-builder/components/Sanctions/EnrichMatchButton';
import { type SanctionCheckMatch } from '@app-builder/models/sanction-check';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsibleV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { MatchDetails } from '../MatchDetails';
import { ReviewScreeningMatch } from '../ReviewScreeningMatch';
import { StatusTag } from '../StatusTag';
import { sanctionsI18n } from '../sanctions-i18n';
import { TopicTag } from '../TopicTag';
import { CommentLine } from './CommentLine';

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
            <CollapsibleV2.Title className="focus-visible:text-purple-65 group flex grow items-center gap-2 rounded-sm outline-hidden transition-colors">
              <Icon
                icon="smallarrow-up"
                aria-hidden
                className="size-5 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-initial:rotate-180 rtl:-rotate-90 group-aria-expanded:rtl:-rotate-180 group-data-initial:rtl:-rotate-180"
              />
              <div className="text-s flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold">{entity.caption}</span>

                <span>
                  {t(`sanctions:entity.schema.${entitySchema}`, {
                    defaultValue: entitySchema,
                  })}
                </span>
                <Tag color="grey">
                  {t('sanctions:match.similarity', {
                    percent: Math.round(entity.score * 100),
                  })}
                </Tag>
                <div className="col-span-full flex w-full flex-wrap gap-1">
                  {entity.properties['topics']?.map((topic) => (
                    <TopicTag key={`${match.id}-${topic}`} topic={topic} />
                  ))}
                </div>
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
              {entitySchema === 'person' && entity.datasets?.length ? (
                <div className="grid grid-cols-[168px_1fr] gap-2">
                  <div className="font-bold">{t('sanctions:match.datasets.title')}</div>
                  <div>
                    <ul>
                      {entity?.datasets?.map((name, index) => (
                        <li className="break-all" key={`dataset-${index}`}>
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {match.comments.map((comment) => {
                return <CommentLine key={comment.id} comment={comment} />;
              })}
              <MatchDetails entity={entity} />
            </div>
          </CollapsibleV2.Content>
        </div>
      </CollapsibleV2.Provider>
      <ReviewScreeningMatch
        open={isInReview}
        onClose={() => setIsInReview(false)}
        sanctionMatch={match}
      />
    </div>
  );
};
