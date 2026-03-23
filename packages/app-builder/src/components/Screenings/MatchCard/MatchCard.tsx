import { EnrichMatchButton } from '@app-builder/components/Screenings/EnrichMatchButton';
import { type ScreeningMatch } from '@app-builder/models/screening';
import { type ScreeningAiSuggestion } from '@app-builder/models/screening-ai-suggestion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsibleV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { MatchDetails } from '../MatchDetails';
import { ReviewMatchPopover } from '../ReviewMatchPopover';
import { StatusTag } from '../StatusTag';
import { screeningsI18n } from '../screenings-i18n';
import { TopicTag } from '../TopicTag';
import { CommentLine } from './CommentLine';

type MatchCardProps = {
  match: ScreeningMatch;
  readonly?: boolean;
  unreviewable?: boolean;
  defaultOpen?: boolean;
  hideEnrich?: boolean;
  hideReview?: boolean;
  aiSuggestion?: ScreeningAiSuggestion;
};

export const MatchCard = ({
  match,
  readonly,
  unreviewable,
  defaultOpen,
  hideEnrich,
  hideReview,
  aiSuggestion,
}: MatchCardProps) => {
  const { t } = useTranslation(screeningsI18n);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const entity = match.payload;
  const entitySchema = entity.schema.toLowerCase() as Lowercase<typeof entity.schema>;
  const canReview = match.status === 'pending' && !readonly && !unreviewable;

  return (
    <div className="grid grid-cols-[max-content_1fr_max-content] gap-x-6 gap-y-2">
      <CollapsibleV2.Provider defaultOpen={defaultOpen}>
        <div className="border-grey-border col-span-full grid grid-cols-subgrid rounded-lg border">
          <div className="col-span-full flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <CollapsibleV2.Title className="focus-visible:text-purple-primary group flex grow items-center gap-2 rounded-sm outline-hidden transition-colors">
                <Icon
                  icon="smallarrow-up"
                  aria-hidden
                  className="size-4 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-initial:rotate-180 rtl:-rotate-90 group-aria-expanded:rtl:-rotate-180 group-data-initial:rtl:-rotate-180"
                />
                <span className="text-s font-medium">{entity.caption}</span>
                {aiSuggestion && match.status === 'pending' ? (
                  <Tag color="grey">
                    {t(`screenings:match.ai_suggestion.${aiSuggestion.confidence}`)}
                    <Icon icon="wand" className="size-4" />
                  </Tag>
                ) : null}
                <Tag color="grey">
                  {t('screenings:match.similarity', {
                    percent: Math.round(entity.score * 100),
                  })}
                </Tag>
              </CollapsibleV2.Title>
              {!hideEnrich && !match.enriched ? <EnrichMatchButton matchId={match.id} /> : null}
              {!hideReview ? (
                <div className="inline-flex h-8 shrink-0 text-nowrap">
                  {unreviewable ? (
                    <Tag color="grey">{t('screenings:match.not_reviewable')}</Tag>
                  ) : canReview ? (
                    <ReviewMatchPopover screeningMatch={match} open={isPopoverOpen} onOpenChange={setIsPopoverOpen} />
                  ) : (
                    <StatusTag status={match.status} disabled />
                  )}
                </div>
              ) : null}
            </div>
            {entity.properties['topics']?.length ? (
              <div className="flex flex-wrap gap-1 ps-6">
                {entity.properties['topics'].map((topic) => (
                  <TopicTag key={`${match.id}-${topic}`} topic={topic} />
                ))}
              </div>
            ) : null}
          </div>

          <CollapsibleV2.Content className="col-span-full">
            <div className="mx-4 mb-4">
              <div className="bg-grey-background-light border-grey-border text-s flex flex-col gap-2 rounded-lg border p-2">
                {entitySchema === 'person' && entity.datasets?.length ? (
                  <div className="grid grid-cols-[146px_1fr] gap-3">
                    <div className="text-xs opacity-50">{t('screenings:match.datasets.title')}</div>
                    <div>
                      <ul className="list-disc ps-4">
                        {entity?.datasets?.map((name, index) => (
                          <li className="break-all text-xs" key={`dataset-${index}`}>
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
            </div>
          </CollapsibleV2.Content>
        </div>
      </CollapsibleV2.Provider>
    </div>
  );
};
