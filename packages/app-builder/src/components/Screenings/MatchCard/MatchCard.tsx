import { EnrichMatchButton } from '@app-builder/components/Screenings/EnrichMatchButton';
import { Screening, type ScreeningMatch } from '@app-builder/models/screening';
import { type ScreeningAiSuggestion } from '@app-builder/models/screening-ai-suggestion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsible, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { MatchDetails } from '../MatchDetails';
import { ReviewMatchPopover } from '../ReviewMatchPopover';
import { StatusTag } from '../StatusTag';
import { screeningsI18n } from '../screenings-i18n';
import { TopicsDisplay } from '../TopicsDisplay';
import { CommentLine } from './CommentLine';
import { EntityDatasetsList } from './match-card-entity-components';

type MatchCardProps = {
  screening: Screening;
  match: ScreeningMatch;
  readonly?: boolean;
  unreviewable?: boolean;
  defaultOpen?: boolean;
  hideEnrich?: boolean;
  hideReview?: boolean;
  aiSuggestion?: ScreeningAiSuggestion;
};

export const MatchCard = ({
  screening,
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
    <Collapsible.Container defaultOpen={defaultOpen}>
      <Collapsible.Title size="small">
        <div className="flex grow items-center justify-between gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
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
          </div>
          <div className="flex items-center gap-sm" onClick={(e) => e.stopPropagation()}>
            {!hideEnrich && !match.enriched ? <EnrichMatchButton matchId={match.id} /> : null}
            {!hideReview ? (
              <div className="inline-flex h-8 shrink-0 text-nowrap">
                {unreviewable ? (
                  <Tag color="grey">{t('screenings:match.not_reviewable')}</Tag>
                ) : canReview ? (
                  <ReviewMatchPopover
                    screening={screening}
                    screeningMatch={match}
                    open={isPopoverOpen}
                    onOpenChange={setIsPopoverOpen}
                  />
                ) : (
                  <StatusTag status={match.status} disabled />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </Collapsible.Title>
      {entity.properties['topics']?.length ? (
        <div className="px-sm smd">
          <TopicsDisplay entity={entity} containerClassName="flex flex-wrap gap-xs" />
        </div>
      ) : null}
      <Collapsible.Content>
        {match.comments.map((comment) => {
          return <CommentLine key={comment.id} comment={comment} />;
        })}
        <div className="bg-grey-background-light border-grey-border flex flex-col gap-sm rounded-lg border p-sm">
          {entitySchema === 'person' && entity.datasets?.length ? (
            <div className="grid grid-cols-[146px_1fr] gap-md">
              <div className="text-xs opacity-50">{t('screenings:match.datasets.title')}</div>
              <div>
                <EntityDatasetsList
                  datasets={entity.datasets}
                  useCase="transaction_monitoring"
                  listClassName="list-disc ps-md"
                  itemClassName="break-all text-xs"
                />
              </div>
            </div>
          ) : null}

          <MatchDetails entity={entity} />
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
