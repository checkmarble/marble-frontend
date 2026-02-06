import { Callout } from '@app-builder/components/Callout';
import { MatchDetails } from '@app-builder/components/Screenings/MatchDetails';
import { TopicTag } from '@app-builder/components/Screenings/TopicTag';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { Case } from '@app-builder/models/cases';
import {
  ContinuousScreening,
  ContinuousScreeningMatch,
  isDirectContinuousScreening,
  isDirectContinuousScreeningMatch,
  isIndirectContinuousScreeningMatch,
} from '@app-builder/models/continuous-screening';
import { useDismissContinuousScreeningMutation } from '@app-builder/queries/continuous-screening/dismiss';
import { useLoadMoreContinuousScreeningMatchesMutation } from '@app-builder/queries/continuous-screening/load-more-matches';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Modal, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ObjectRelatedCases } from './ObjectRelatedCases';
import { ReviewScreeningMatch } from './ReviewScreeningMatch';
import { ScreeningObjectDetails } from './ScreeningObjectDetails';

export const ScreeningCaseMatches = ({
  screening,
  caseDetail,
  isUserAdmin,
}: {
  screening: ContinuousScreening;
  caseDetail: Case;
  isUserAdmin: boolean;
}) => {
  const { t } = useTranslation(['continuousScreening', 'screenings']);
  const loadMoreMatchesMutation = useLoadMoreContinuousScreeningMatchesMutation(screening.id);
  const revalidate = useLoaderRevalidator();

  const handleLoadMore = () => {
    loadMoreMatchesMutation.mutateAsync().then(() => {
      revalidate();
    });
  };

  return (
    <div className="flex flex-col gap-v2-sm">
      <div className="flex items-center justify-between gap-v2-sm">
        <div className="text-h2 font-semibold">{t('continuousScreening:review.matches.title')}</div>
        {isUserAdmin ? <DismissAlertButton screening={screening} /> : null}
      </div>
      <div className="grid grid-cols-[1fr_calc(var(--spacing)_*_52)] border border-grey-border rounded-v2-md bg-surface-card">
        <div className="grid grid-cols-subgrid col-span-full border-b border-grey-border text-tiny text-grey-secondary">
          <div className="p-v2-sm">{t('continuousScreening:review.matches.match_label')}</div>
          <div className="p-v2-sm">{t('continuousScreening:review.matches.status_label')}</div>
        </div>
        {screening.matches.map((screeningMatch) => {
          return (
            <div
              key={screeningMatch.id}
              className="grid grid-cols-subgrid col-span-full not-last:border-b not-last:border-grey-border"
            >
              <div className="grid grid-cols-subgrid col-span-full">
                <Collapsible.Root
                  defaultOpen={screening.matches.length === 1}
                  className="border-r border-grey-border p-v2-md flex flex-col gap-v2-md overflow-hidden group/collapsible"
                >
                  <Collapsible.Trigger asChild>
                    <div className="flex items-center gap-v2-sm">
                      <Icon
                        icon="caret-down"
                        className="size-4 group-radix-state-open/collapsible:rotate-180 transition-transform duration-200"
                      />
                      <span className="font-medium">{screeningMatch.payload.caption}</span>
                      <span className="text-small text-grey-secondary">{getMatchEntityType(screeningMatch)}</span>
                      <Tag color="grey" className="shrink-0">
                        {t('screenings:match.score', { score: screeningMatch.payload.score * 100 })}
                      </Tag>
                      {screeningMatch.payload.properties['topics']?.map((topic) => {
                        return <TopicTag key={topic} topic={topic} className="text-small" />;
                      })}
                    </div>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
                    {match(screeningMatch)
                      .when(isDirectContinuousScreeningMatch, (directMatch) => (
                        <div className="p-v2-sm bg-grey-background-light rounded-v2-md">
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
                                          <span className="mx-1">·</span>
                                        ) : null}
                                      </Fragment>
                                    );
                                  })}
                                </div>
                              </>
                            }
                          />
                        </div>
                      ))
                      .when(isIndirectContinuousScreeningMatch, (indirectMatch) => (
                        <div className="flex flex-col gap-v2-md">
                          <ScreeningObjectDetails
                            objectType={indirectMatch.objectType}
                            objectId={indirectMatch.objectId}
                            className="bg-grey-background-light rounded-v2-md"
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
                <div className="p-v2-sm">
                  {match(screeningMatch.status)
                    .with('confirmed_hit', () => <Tag color="red">{t('screenings:match.status.confirmed_hit')}</Tag>)
                    .with('no_hit', () => <Tag color="green">{t('screenings:match.status.no_hit')}</Tag>)
                    .with('pending', () => (
                      <ReviewScreeningMatch
                        screeningMatch={screeningMatch}
                        automaticallyConfirmScreening={isDirectContinuousScreening(screening)}
                      >
                        <button className="px-v2-sm py-v2-xs cursor-pointer bg-orange-primary text-white dark:bg-transparent dark:border dark:border-orange-primary dark:text-orange-primary rounded-v2-md inline-flex items-center">
                          <span>{t('screenings:match.status.pending')}</span>
                          <Icon icon="caret-down" className="size-4" />
                        </button>
                      </ReviewScreeningMatch>
                    ))
                    .with('skipped', () => <Tag color="grey">{t('screenings:match.status.skipped')}</Tag>)
                    .exhaustive()}
                </div>
              </div>
            </div>
          );
        })}
        {screening.partial ? (
          <div className="grid grid-cols-subgrid col-span-full p-v2-md">
            <Button variant="primary" onClick={() => handleLoadMore()} disabled={loadMoreMatchesMutation.isPending}>
              {loadMoreMatchesMutation.isPending ? <Icon icon="spinner" className="size-4 animate-spin" /> : null}
              {t('continuousScreening:review.matches.partial_search_button')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const getMatchEntityType = (screeningMatch: ContinuousScreeningMatch): string => {
  if (isIndirectContinuousScreeningMatch(screeningMatch)) {
    return screeningMatch.objectType;
  }
  return screeningMatch.payload.schema;
};

const DismissAlertButton = ({ screening }: { screening: ContinuousScreening }) => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const dismissMutation = useDismissContinuousScreeningMutation();
  const revalidate = useLoaderRevalidator();
  const [open, setOpen] = useState(false);

  const dismissAlert = () => {
    dismissMutation.mutateAsync(screening.id).then(() => {
      revalidate();

      setOpen(false);
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        {
          <Button variant="secondary" size="small" disabled={screening.status !== 'in_review'}>
            <Icon icon="snooze-stroke" className="size-4" />
            {t('continuousScreening:review.dismiss_alert')}
          </Button>
        }
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('continuousScreening:review.dismiss_alert')}</Modal.Title>
        <div className="flex flex-col gap-v2-lg p-v2-lg">
          <div>{t('continuousScreening:review.dismiss_alert_modal.warning_text')}</div>
          {screening.partial ? (
            <Callout color="red">{t('continuousScreening:review.dismiss_alert_modal.partial_search_warning')}</Callout>
          ) : null}
          <div>{t('continuousScreening:review.dismiss_alert_modal.confirmation_text')}</div>
        </div>
        <Modal.Footer>
          <div className="flex flex-row gap-v2-sm p-v2-md justify-end">
            <Modal.Close asChild>
              <Button variant="secondary" type="button">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button variant="primary" onClick={dismissAlert}>
              {t('continuousScreening:review.dismiss_alert_modal.confirm_button')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
