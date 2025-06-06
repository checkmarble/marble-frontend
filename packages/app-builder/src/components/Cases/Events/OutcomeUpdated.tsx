import { casesI18n } from '@app-builder/components';
import { EventTime } from '@app-builder/components/Cases/Events/Time';
import { type CaseOutcomeUpdatedEvent } from '@app-builder/models/cases';
import { Trans, useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const OutcomeUpdatedDetail = ({ event }: { event: CaseOutcomeUpdatedEvent }) => {
  const { t } = useTranslation(casesI18n);

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="edit" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.outcome_updated"
          components={{ Style: <span className="font-bold capitalize" /> }}
          values={{ outcome: t(`cases:case.outcome.${event.newOutcome}`) }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};
