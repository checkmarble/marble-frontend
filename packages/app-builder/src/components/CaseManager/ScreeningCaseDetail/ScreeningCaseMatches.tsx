import { MatchDetails } from '@app-builder/components/Screenings/MatchDetails';
import { TopicTag } from '@app-builder/components/Screenings/TopicTag';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  ContinuousScreening,
  ContinuousScreeningMatch,
  isDirectContinuousScreeningMatch,
  isIndirectContinuousScreeningMatch,
} from '@app-builder/models/continuous-screening';
import { useDismissContinuousScreeningMutation } from '@app-builder/queries/continuous-screening/dismiss';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, Modal, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ReviewScreeningMatch } from './ReviewScreeningMatch';
import { ScreeningObjectDetails } from './ScreeningObjectDetails';

export const ScreeningCaseMatches = ({
  screening,
  isUserAdmin,
}: {
  screening: ContinuousScreening;
  isUserAdmin: boolean;
}) => {
  const { t } = useTranslation(['continuousScreening', 'screenings']);

  return (
    <div className="flex flex-col gap-v2-sm">
      <div className="flex items-center justify-between gap-v2-sm">
        <div className="text-h2 font-semibold">Matches found</div>
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
                  <div className="flex items-center gap-v2-sm">
                    <Collapsible.Trigger asChild>
                      <Icon
                        icon="caret-down"
                        className="size-4 group-radix-state-open/collapsible:rotate-180 transition-transform duration-200"
                      />
                    </Collapsible.Trigger>
                    <span className="font-medium">{screeningMatch.payload.caption}</span>
                    <span className="text-small text-grey-secondary">{getMatchEntityType(screeningMatch)}</span>
                    <Tag color="grey" className="shrink-0">
                      Correspondance {screeningMatch.payload.score * 100}%
                    </Tag>
                    {screeningMatch.payload.properties['topics']?.map((topic) => {
                      return <TopicTag key={topic} topic={topic} className="text-small" />;
                    })}
                  </div>
                  <Collapsible.Content className="radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
                    {match(screeningMatch)
                      .when(isDirectContinuousScreeningMatch, (directMatch) => (
                        <div className="p-v2-sm bg-grey-background-light rounded-v2-md">
                          <MatchDetails entity={directMatch.payload} />
                        </div>
                      ))
                      .when(isIndirectContinuousScreeningMatch, (indirectMatch) => (
                        <ScreeningObjectDetails
                          objectType={indirectMatch.objectType}
                          objectId={indirectMatch.objectId}
                          className="bg-grey-background-light rounded-v2-md"
                        />
                      ))
                      .exhaustive()}
                  </Collapsible.Content>
                </Collapsible.Root>
                <div className="p-v2-sm">
                  {match(screeningMatch.status)
                    .with('confirmed_hit', () => <Tag color="red">{t('screenings:match.status.confirmed_hit')}</Tag>)
                    .with('no_hit', () => <Tag color="green">{t('screenings:match.status.no_hit')}</Tag>)
                    .with('pending', () => (
                      <ReviewScreeningMatch screeningMatch={screeningMatch}>
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
  const { t } = useTranslation(['continuousScreening']);
  const dismissMutation = useDismissContinuousScreeningMutation();
  const revalidate = useLoaderRevalidator();
  const [open, setOpen] = useState(false);

  const handleDismissClick = () => {
    if (!screening.partial) {
      dismissAlert();
    }
  };

  const dismissAlert = () => {
    dismissMutation.mutateAsync(screening.id).then(() => {
      revalidate();
      if (screening.partial) {
        setOpen(false);
      }
    });
  };

  const button = (
    <ButtonV2 variant="secondary" size="small" onClick={handleDismissClick}>
      <Icon icon="snooze-stroke" className="size-4" />
      {t('continuousScreening:review.dismiss_alert')}
    </ButtonV2>
  );

  return screening.partial ? (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{button}</Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('continuousScreening:review.dismiss_alert')}</Modal.Title>
        <div className="flex flex-col gap-v2-lg p-v2-lg">
          <div>{t('continuousScreening:review.dismiss_alert_modal.warning_text')}</div>
          <div>{t('continuousScreening:review.dismiss_alert_modal.confirmation_text')}</div>
        </div>
        <Modal.Footer>
          <div className="flex flex-row gap-v2-sm p-v2-md justify-end">
            <Modal.Close asChild>
              <ButtonV2 variant="secondary">Cancel</ButtonV2>
            </Modal.Close>
            <ButtonV2 variant="primary" onClick={dismissAlert}>
              {t('continuousScreening:review.dismiss_alert_modal.confirm_button')}
            </ButtonV2>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  ) : (
    button
  );
};
