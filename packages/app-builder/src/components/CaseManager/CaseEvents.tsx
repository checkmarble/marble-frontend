import { type CaseEvent, type CaseEventType, type CaseStatus } from '@app-builder/models/cases';
import { type CalendarDayDistance, getCalendarDayDistance, getDueDateUrgency } from '@app-builder/utils/datetime';
import { useFormatTimezone } from '@app-builder/utils/format';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

type CaseEventsProps = {
  events: CaseEvent[];
  /** When set, only these event types are shown. Empty array => no event steps, only due date eventually. */
  includeEventTypes?: CaseEventType[];
  /** Removed after include filtering. Ignored types that were never included. */
  excludeEventTypes?: CaseEventType[];
  dueAt?: string | null;
  status: CaseStatus;
};

type TimelineStep =
  | { kind: 'event'; id: string; at: string; eventType: CaseEventType }
  | { kind: 'due'; id: 'due'; at: string; isLate: boolean };

export function CaseEvents({ events, includeEventTypes, excludeEventTypes, dueAt, status }: CaseEventsProps) {
  const { t } = useTranslation(['cases']);
  const timeZone = useFormatTimezone();

  const steps = useMemo(() => {
    const filtered = events.filter((event) => {
      if (includeEventTypes !== undefined && !includeEventTypes.includes(event.eventType)) {
        return false;
      }
      if (excludeEventTypes?.includes(event.eventType)) {
        return false;
      }
      return true;
    });

    const timelineSteps: TimelineStep[] = filtered.map((event) => ({
      kind: 'event',
      id: event.id,
      at: event.createdAt,
      eventType: event.eventType,
    }));

    if (status !== 'closed') {
      const urgency = getDueDateUrgency(dueAt, { timeZone });
      if (urgency && dueAt) {
        timelineSteps.push({
          kind: 'due',
          id: 'due',
          at: dueAt,
          isLate: urgency.kind === 'late',
        });
      }
    }

    return timelineSteps.sort((a, b) => {
      const byDate = new Date(a.at).getTime() - new Date(b.at).getTime();
      if (byDate !== 0) return byDate;
      return a.id.localeCompare(b.id);
    });
  }, [dueAt, excludeEventTypes, includeEventTypes, events, status, timeZone]);

  if (steps.length === 0) return null;

  return (
    <ol className="max-h-50 overflow-y-auto">
      {steps.map((step, index) => {
        const distance = getCalendarDayDistance(step.at, { timeZone });
        const relativeLabel = formatCalendarDayDistance(distance, t);
        const isLast = index === steps.length - 1;
        const isLateDue = step.kind === 'due' && step.isLate;

        return (
          <li key={step.id} className="flex gap-sm">
            <div className="flex w-2 shrink-0 flex-col items-center" aria-hidden>
              <span
                className={cn('mt-1 size-2 shrink-0 rounded-full', isLateDue ? 'bg-red-primary' : 'bg-grey-border')}
              />
              {!isLast ? <span className="bg-grey-border w-px min-h-sm flex-1" /> : null}
            </div>
            <div
              className={cn(
                'flex min-w-0 items-center gap-2xs pb-sm text-xs text-grey-secondary',
                isLast && 'pb-0',
                isLateDue && 'text-red-primary',
              )}
            >
              {isLateDue ? <Icon icon="error" className="size-3.5 shrink-0" /> : null}
              <span className="truncate">
                {step.kind === 'event'
                  ? t(`cases:case_detail.history.event_type.${step.eventType}`)
                  : t('cases:manager.timeline.due')}{' '}
                {relativeLabel}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function formatCalendarDayDistance(
  distance: CalendarDayDistance | null,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  if (!distance) return '';

  return match(distance)
    .with({ kind: 'today' }, () => t('cases:manager.timeline.today'))
    .with({ kind: 'yesterday' }, () => t('cases:manager.timeline.yesterday'))
    .with({ kind: 'tomorrow' }, () => t('cases:manager.timeline.tomorrow'))
    .with({ kind: 'ago' }, ({ days }) => t('cases:manager.timeline.days_ago', { count: days }))
    .with({ kind: 'in' }, ({ days }) => t('cases:manager.timeline.in_days', { count: days }))
    .exhaustive();
}
