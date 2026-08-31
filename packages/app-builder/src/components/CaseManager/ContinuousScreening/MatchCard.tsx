import { CommentLine } from '@app-builder/components/Screenings/MatchCard/CommentLine';
import { MatchDetails } from '@app-builder/components/Screenings/MatchDetails';
import { TopicTag } from '@app-builder/components/Screenings/TopicTag';
import { Case } from '@app-builder/models/cases';
import {
  ContinuousScreening,
  ContinuousScreeningMatch,
  getMatchEntityType,
  isDirectContinuousScreening,
  isDirectContinuousScreeningMatch,
  isIndirectContinuousScreeningMatch,
} from '@app-builder/models/continuous-screening';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Card, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ObjectDetails } from './ObjectDetails';
import { ReviewScreeningMatch } from './ReviewScreeningMatch';

type MatchCardProps = {
  caseDetail: Case;
  screening: ContinuousScreening;
  screeningMatch: ContinuousScreeningMatch;
};

export function MatchCard({ caseDetail, screening, screeningMatch }: MatchCardProps) {
  const { t } = useTranslation(['screenings']);
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <Card>
      <Collapsible.Root defaultOpen={screening.matches.length === 1} className="overflow-hidden group/collapsible">
        <div className="flex justify-between">
          <Collapsible.Trigger asChild>
            <div className="flex gap-sm items-center">
              <Icon
                icon="caret-down"
                className="self-start mt-xs size-4 group-radix-state-open/collapsible:rotate-180 transition-transform duration-200"
              />
              <div className="flex flex-col gap-xs">
                <div className="flex flex-row gap-sm items-center">
                  <span className="font-medium">{screeningMatch.payload.caption}</span>
                  <span className="text-tiny p-xs border border-grey-border rounded-sm">
                    {getMatchEntityType(screeningMatch)}
                  </span>
                  <div className="bg-grey-border rounded-full size-1.5" />
                  <Tag color="grey" className="shrink-0">
                    {t('screenings:match.score', { score: Math.round(screeningMatch.payload.score * 100) })}
                  </Tag>
                </div>
                <div className="flex flex-row flex-wrap gap-xs">
                  {screeningMatch.payload.properties['topics']?.map((topic) => {
                    return <TopicTag key={topic} topic={topic} className="text-small" />;
                  })}
                </div>
                {screeningMatch.comments.map((comment) => {
                  return <CommentLine key={comment.id} comment={comment} />;
                })}
              </div>
            </div>
          </Collapsible.Trigger>
          <div>
            {match(screeningMatch.status)
              .with('confirmed_hit', () => <Tag color="red">{t('screenings:match.status.confirmed_hit')}</Tag>)
              .with('no_hit', () => <Tag color="green">{t('screenings:match.status.no_hit')}</Tag>)
              .with('pending', () => (
                <ReviewScreeningMatch
                  screeningMatch={screeningMatch}
                  automaticallyConfirmScreening={isDirectContinuousScreening(screening)}
                  open={popoverOpen}
                  onOpenChange={setPopoverOpen}
                />
              ))
              .with('skipped', () => <Tag color="grey">{t('screenings:match.status.skipped')}</Tag>)
              .exhaustive()}
          </div>
        </div>
        <Collapsible.Content className="mt-md radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
          {match(screeningMatch)
            .when(isDirectContinuousScreeningMatch, (directMatch) => {
              return (
                <MatchDetails
                  entity={directMatch.payload}
                  before={
                    <>
                      <span className="font-bold capitalize">
                        {t('screenings:dataset', { count: directMatch.payload.datasets.length })}
                      </span>
                      <div className="flex flex-row flex-wrap">
                        {directMatch.payload.datasets.map((dataset, index) => {
                          return (
                            <Fragment key={dataset}>
                              <span>{dataset}</span>
                              {index < directMatch.payload.datasets.length - 1 ? (
                                <span className="mx-xs">·</span>
                              ) : null}
                            </Fragment>
                          );
                        })}
                      </div>
                    </>
                  }
                />
              );
            })
            .when(isIndirectContinuousScreeningMatch, (indirectMatch) => (
              <div className="flex flex-col gap-md">
                <ObjectDetails
                  objectType={indirectMatch.objectType}
                  objectId={indirectMatch.objectId}
                  currentCase={caseDetail}
                />
              </div>
            ))
            .exhaustive()}
        </Collapsible.Content>
      </Collapsible.Root>
    </Card>
  );
}
