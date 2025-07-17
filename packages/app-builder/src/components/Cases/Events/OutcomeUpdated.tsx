import { EventTime } from '@app-builder/components/Cases/Events/Time';
import { type CaseOutcomeUpdatedEvent } from '@app-builder/models/cases';
import { TranslationObject } from '@app-builder/types/i18n';
import { Trans } from 'react-i18next';
import { Icon } from 'ui-icons';

export const OutcomeUpdatedDetail = ({
  event,
  translationObject,
}: {
  event: CaseOutcomeUpdatedEvent;
  translationObject: TranslationObject<['cases']>;
}) => {
  const { tCases } = translationObject;

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="edit" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={tCases}
          i18nKey="case_detail.history.event_detail.outcome_updated"
          components={{ Style: <span className="font-bold capitalize" /> }}
          values={{ outcome: tCases(`case.outcome.${event.newOutcome}`) }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};
