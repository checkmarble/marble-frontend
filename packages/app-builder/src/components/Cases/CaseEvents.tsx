import { CaseAssignedDetail } from '@app-builder/components/Cases/Events/CaseAssignedDetail';
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
import { SarDeletedDetail } from '@app-builder/components/Cases/Events/SarDeleted';
import { SarFileUploadedDetail } from '@app-builder/components/Cases/Events/SarFileUploaded';
import { SarStatusChangedDetail } from '@app-builder/components/Cases/Events/SarStatusChanged';
import { StatusUpdatedDetail } from '@app-builder/components/Cases/Events/StatusUpdated';
import { TagsUpdatedDetail } from '@app-builder/components/Cases/Events/TagsUpdated';
import type { CaseEvent } from '@app-builder/models/cases';
import type { Inbox } from '@app-builder/models/inbox';
import { debounce, unique } from 'radash';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { allPass, filter } from 'remeda';
import { match } from 'ts-pattern';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { casesI18n } from './cases-i18n';
import { SarCreatedDetail } from './Events/SarCreated';

const MAX_EVENTS_BEFORE_DEBOUNCE = 60;
const EVENT_DELAY = 100;

export function CaseEvents({
  events,
  inboxes,
  root,
}: {
  events: CaseEvent[];
  inboxes: Inbox[];
  root: RefObject<HTMLDivElement>;
}) {
  const { t } = useTranslation(casesI18n);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const [olderEvents, setOlderEventsCount] = useState(0);
  const [newerEvents, setNewerEventsCount] = useState(0);
  const [filters, setFilters] = useState<CaseEventFiltersForm>({
    types: ['comment_added', 'file_added'],
  });

  const orderedEvents = useMemo(
    () => events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [events],
  );

  const allowedEventTypes = useMemo(
    () => unique(orderedEvents.map((e) => e.eventType)),
    [orderedEvents],
  );

  const filteredEvents = useMemo(() => {
    if (!filters) return orderedEvents;

    const { types: type, startDate, endDate } = filters;

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

    let callback = () => {
      // Reset counts
      let itemsBeforeVisible = 0;
      let itemsAfterVisible = 0;

      // Check each item's position relative to container
      for (const item of items) {
        const itemRect = item.getBoundingClientRect();
        if (itemRect.bottom + (root.current?.scrollTop ?? 0) < containerRect.top) {
          itemsBeforeVisible++;
        } else if (itemRect.top + (root.current?.scrollTop ?? 0) > containerRect.bottom) {
          itemsAfterVisible++;
        }
      }

      setNewerEventsCount(itemsBeforeVisible);
      setOlderEventsCount(itemsAfterVisible);
    };

    if (filteredEvents.length > MAX_EVENTS_BEFORE_DEBOUNCE) {
      callback = debounce({ delay: EVENT_DELAY }, callback);
    }

    callback();

    container.addEventListener('scroll', callback);

    return () => container.removeEventListener('scroll', callback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEvents]);

  return (
    <div className="relative z-0 flex w-full flex-col gap-3">
      {filteredEvents.length > 0 ? (
        <div className="absolute left-0 top-0 flex h-full w-6 flex-col items-center">
          <div className="bg-grey-90 -z-10 h-full w-px" />
        </div>
      ) : null}
      <div className="bg-grey-100 sticky left-0 top-0 z-[-15] flex w-full items-center justify-between pl-6">
        <span
          className={cn('text-grey-50 text-xs', {
            'text-grey-100': showAll || newerEvents === 0,
          })}
        >
          {t('cases:investigation.more_recent', { number: newerEvents })}
        </span>
        <div className="flex items-center gap-2">
          <CaseEventFilters
            filters={filters}
            allowedEventTypes={allowedEventTypes}
            setFilters={setFilters}
          />
          <Button variant="secondary" onClick={() => setShowAll(!showAll)} size="xs">
            <Icon icon={showAll ? 'eye-slash' : 'eye'} className="size-3.5" />
            <span className="text-xs">
              {showAll ? t('cases:investigation.collapse') : t('cases:investigation.expand')}
            </span>
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
            .with({ eventType: 'case_assigned' }, (e) => <CaseAssignedDetail event={e} />)
            .with({ eventType: 'sar_created' }, (e) => <SarCreatedDetail event={e} />)
            .with({ eventType: 'sar_deleted' }, (e) => <SarDeletedDetail event={e} />)
            .with({ eventType: 'sar_status_changed' }, (e) => <SarStatusChangedDetail event={e} />)
            .with({ eventType: 'sar_file_uploaded' }, (e) => <SarFileUploadedDetail event={e} />)
            .exhaustive(),
        )}
      </div>
      {showAll ? null : (
        <span
          className={cn('bg-grey-100 text-grey-50 sticky left-0 top-0 z-[-15] pl-6 text-xs', {
            'text-grey-100': showAll,
          })}
        >
          {filteredEvents.length === 0 || olderEvents === 0
            ? t('cases:investigation.no_older')
            : t('cases:investigation.older', { number: olderEvents })}
        </span>
      )}
    </div>
  );
}
