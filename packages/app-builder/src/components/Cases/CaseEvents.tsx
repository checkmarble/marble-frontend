import { CaseCreatedDetail } from '@app-builder/components/Cases/Events/CaseCreated';
import { CaseSnoozedDetail } from '@app-builder/components/Cases/Events/CaseSnoozed';
import { CaseUnsnoozedDetail } from '@app-builder/components/Cases/Events/CaseUnsnoozed';
import { CommentAddedDetail } from '@app-builder/components/Cases/Events/CommentAdded';
import { DecisionAddedDetail } from '@app-builder/components/Cases/Events/DecisionAdded';
import { DecisionReviewedDetail } from '@app-builder/components/Cases/Events/DecisionReviewed';
import { FileAddedDetail } from '@app-builder/components/Cases/Events/FileAdded';
import {
  CaseEventFilters,
  type CaseEventFiltersForm,
} from '@app-builder/components/Cases/Events/Filters';
import { InboxChangedDetail } from '@app-builder/components/Cases/Events/InboxChanged';
import { NameUpdatedDetail } from '@app-builder/components/Cases/Events/NameUpdated';
import { OutcomeUpdatedDetail } from '@app-builder/components/Cases/Events/OutcomeUpdated';
import { RuleSnoozeCreatedDetail } from '@app-builder/components/Cases/Events/RuleSnoozed';
import { StatusUpdatedDetail } from '@app-builder/components/Cases/Events/StatusUpdated';
import { TagsUpdatedDetail } from '@app-builder/components/Cases/Events/TagsUpdated';
import { type CaseEvent } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { useEffect, useMemo, useRef, useState } from 'react';
import { allPass, filter } from 'remeda';
import { match } from 'ts-pattern';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CaseEvents({
  events,
  showLogs = false,
  inboxes,
}: {
  events: CaseEvent[];
  showLogs?: boolean;
  inboxes: Inbox[];
}) {
  const [showAll, setShowAll] = useState(false);
  const [olderEvents, setOlderEventsCount] = useState(0);
  const [newerEvents, setNewerEventsCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<CaseEventFiltersForm>({
    type: showLogs ? [] : ['comment_added'],
  });
  const orderedEvents = useMemo(
    () => events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [events],
  );

  useEffect(() => {
    setFilters((prev) => ({ ...prev, type: showLogs ? [] : ['comment_added'] }));
  }, [showLogs]);

  const filteredEvents = useMemo(() => {
    if (!filters) return orderedEvents;

    console.log(filters);

    const { type, startDate, endDate } = filters;

    return filter(orderedEvents, (event) =>
      allPass(event, [
        (e) => !type.length || type.includes(e.eventType),
        (e) => !startDate || new Date(e.createdAt).getTime() >= new Date(startDate).getTime(),
        (e) => !endDate || new Date(e.createdAt).getTime() <= new Date(endDate).getTime(),
      ]),
    );
  }, [orderedEvents, filters]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const items = Array.from(container.children);

    const callback = () => {
      // Reset counts
      let itemsBeforeVisible = 0;
      let itemsAfterVisible = 0;

      // Check each item's position relative to container
      for (const item of items) {
        const itemRect = item.getBoundingClientRect();
        if (itemRect.bottom < containerRect.top) {
          itemsBeforeVisible++;
        } else if (itemRect.top > containerRect.bottom) {
          itemsAfterVisible++;
        }
      }

      setNewerEventsCount(itemsBeforeVisible);
      setOlderEventsCount(itemsAfterVisible);
    };

    callback();

    container.addEventListener('scroll', callback);

    return () => container.removeEventListener('scroll', callback);
  }, [filteredEvents]);

  return (
    <div className="relative z-0 flex w-full flex-col gap-3">
      <div className="absolute left-0 top-0 flex h-full w-6 flex-col items-center">
        <div className="bg-grey-90 -z-10 h-full w-px" />
      </div>
      <div className="bg-grey-100 sticky left-0 top-0 z-[-15] flex w-full items-center justify-between pl-6">
        <span
          className={cn('text-grey-50 text-xs', {
            'text-grey-100': showAll || newerEvents === 0,
          })}
        >
          {newerEvents} newer
        </span>
        <div className="flex items-center gap-2">
          <CaseEventFilters filters={filters} setFilters={setFilters} />
          <Button variant="secondary" onClick={() => setShowAll(!showAll)} size="small">
            <Icon icon={showAll ? 'eye-slash' : 'eye'} className="size-3.5" />
            <span className="text-xs">{showAll ? 'View less' : 'View all'}</span>
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={cn('flex flex-col gap-3 overflow-x-hidden', {
          'max-h-[400px] overflow-y-scroll': !showAll,
        })}
      >
        {filteredEvents.map((event) =>
          match(event)
            .with({ eventType: 'case_created' }, (e) => <CaseCreatedDetail event={e} />)
            .with({ eventType: 'status_updated' }, (e) => <StatusUpdatedDetail event={e} />)
            .with({ eventType: 'outcome_updated' }, (e) => <OutcomeUpdatedDetail event={e} />)
            .with({ eventType: 'decision_added' }, (e) => <DecisionAddedDetail event={e} />)
            .with({ eventType: 'comment_added' }, (e) => <CommentAddedDetail event={e} />)
            .with({ eventType: 'name_updated' }, (e) => <NameUpdatedDetail event={e} />)
            .with({ eventType: 'tags_updated' }, (e) => <TagsUpdatedDetail event={e} />)
            .with({ eventType: 'file_added' }, (e) => <FileAddedDetail event={e} />)
            .with({ eventType: 'inbox_changed' }, (e) => (
              <InboxChangedDetail event={e} inboxes={inboxes} />
            ))
            .with({ eventType: 'rule_snooze_created' }, (e) => (
              <RuleSnoozeCreatedDetail event={e} />
            ))
            .with({ eventType: 'decision_reviewed' }, (e) => <DecisionReviewedDetail event={e} />)
            .with({ eventType: 'case_snoozed' }, (e) => <CaseSnoozedDetail event={e} />)
            .with({ eventType: 'case_unsnoozed' }, (e) => <CaseUnsnoozedDetail event={e} />)
            .exhaustive(),
        )}
      </div>
      {showAll ? null : (
        <span
          className={cn('bg-grey-100 text-grey-50 sticky left-0 top-0 z-[-15] pl-6 text-xs', {
            'text-grey-100': showAll,
          })}
        >
          {olderEvents === 0 ? `No older events` : `${olderEvents} older`}
        </span>
      )}
    </div>
  );
}
