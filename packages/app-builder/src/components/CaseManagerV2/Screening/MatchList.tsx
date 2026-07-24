import { ObjectRelatedCases } from '@app-builder/components/CaseManager/ScreeningCaseDetail/ObjectRelatedCases';
import { ReviewScreeningMatch } from '@app-builder/components/CaseManager/ScreeningCaseDetail/ReviewScreeningMatch';
import { ScreeningObjectDetails } from '@app-builder/components/CaseManager/ScreeningCaseDetail/ScreeningObjectDetails';
import { MatchDetails } from '@app-builder/components/Screenings/MatchDetails';
import { sortScreeningMatchesByTopics } from '@app-builder/components/Screenings/match-sorting';
import { TopicTag } from '@app-builder/components/Screenings/TopicTag';
import { Case } from '@app-builder/models/cases';
import {
  ContinuousScreening,
  getMatchEntityType,
  isDirectContinuousScreening,
  isDirectContinuousScreeningMatch,
  isIndirectContinuousScreeningMatch,
} from '@app-builder/models/continuous-screening';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Card, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DismissAlertButton } from './DismissAlertButton';

type ScreeningMatchListProps = {
  screening: ContinuousScreening;
  caseDetail: Case;
  isUserAdmin: boolean;
};

export function ScreeningMatchList({ screening, caseDetail, isUserAdmin }: ScreeningMatchListProps) {
  const { t } = useTranslation(['continuousScreening']);

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center justify-between gap-sm">
        <div className="text-default font-medium">{t('continuousScreening:review.matches.title')}</div>
        {isUserAdmin ? <DismissAlertButton screening={screening} /> : null}
      </div>
      <div className="flex flex-col gap-sm">
        {[...screening.matches].sort(sortScreeningMatchesByTopics).map((screeningMatch) => {
          return (
            <Card key={screeningMatch.id}>
              <Collapsible.Root
                defaultOpen={screening.matches.length === 1}
                className="overflow-hidden group/collapsible"
              >
                <div className="flex justify-between">
                  <Collapsible.Trigger asChild>
                    <div className="flex gap-sm items-center">
                      <Icon
                        icon="caret-down"
                        className="size-4 group-radix-state-open/collapsible:rotate-180 transition-transform duration-200"
                      />
                      <span className="font-medium">{screeningMatch.payload.caption}</span>
                      <span className="text-tiny p-xs border border-grey-border rounded-sm">
                        {getMatchEntityType(screeningMatch)}
                      </span>
                      <div className="bg-grey-border rounded-full size-1.5" />
                      <Tag color="grey" className="shrink-0">
                        {t('screenings:match.score', { score: screeningMatch.payload.score * 100 })}
                      </Tag>
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
                        >
                          <Button variant="primary" size="small">
                            <span>{t('screenings:match.status.pending')}</span>
                            <Icon icon="caret-down" className="size-4" />
                          </Button>
                        </ReviewScreeningMatch>
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
                              <span>Screening tags</span>
                              <div className="flex flex-row flex-wrap gap-xs">
                                {screeningMatch.payload.properties['topics']?.map((topic) => {
                                  return <TopicTag key={topic} topic={topic} className="text-small" />;
                                })}
                              </div>
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
                        <ScreeningObjectDetails
                          objectType={indirectMatch.objectType}
                          objectId={indirectMatch.objectId}
                          className="bg-grey-background-light rounded-md"
                        />
                        <ObjectRelatedCases
                          objectType={indirectMatch.objectType}
                          objectId={indirectMatch.objectId}
                          currentCase={caseDetail}
                          className="bg-grey-background-light"
                        />
                      </div>
                    ))
                    .exhaustive()}
                </Collapsible.Content>
              </Collapsible.Root>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
