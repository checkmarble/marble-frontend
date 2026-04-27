import { EnrichMatchButton } from '@app-builder/components/Screenings/EnrichMatchButton';
import { type ScreeningMatch } from '@app-builder/models/screening';
import { type ScreeningAiSuggestion } from '@app-builder/models/screening-ai-suggestion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsible, Tag } from 'ui-design-system';
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
    <Collapsible.Container defaultOpen={defaultOpen}>
      <Collapsible.Title size="small">
        <div className="flex grow items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
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
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
        </div>
      </Collapsible.Title>
      {entity.properties['topics']?.length ? (
        <div className="flex flex-wrap gap-1 px-4 pb-3">
          {entity.properties['topics'].map((topic) => (
            <TopicTag key={`${match.id}-${topic}`} topic={topic} />
          ))}
        </div>
      ) : null}
      <Collapsible.Content>
        <div className="bg-grey-background-light border-grey-border flex flex-col gap-2 rounded-lg border p-2">
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
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
