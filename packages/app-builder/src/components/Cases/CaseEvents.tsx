import { CaseEventDetail } from '@app-builder/components/Cases/Events/CaseEventDetail';
import { CaseEventFilters, type CaseEventFiltersForm } from '@app-builder/components/Cases/Events/Filters';
import {
  CASE_EVENT_CATEGORY_TO_EVENTS_MAPPING,
  DEFAULT_CASE_EVENT_CATEGORIES_FILTER,
} from '@app-builder/constants/cases';
import { type CaseEvent, CaseEventType } from '@app-builder/models/cases';
import { debounce } from 'radash';
import { Fragment, type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { allPass, filter } from 'remeda';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

const MAX_EVENTS_BEFORE_DEBOUNCE = 60;
const EVENT_DELAY = 100;

export function CaseEvents({ events, root }: { events: CaseEvent[]; root: RefObject<HTMLDivElement | null> }) {
  const { t } = useTranslation(['common', 'cases']);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const [olderEvents, setOlderEventsCount] = useState(0);
  const [newerEvents, setNewerEventsCount] = useState(0);
  const [filters, setFilters] = useState<CaseEventFiltersForm>({
    types: DEFAULT_CASE_EVENT_CATEGORIES_FILTER,
  });

  const orderedEvents = useMemo(
    () => events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [events],
  );

  const filteredEvents = useMemo(() => {
    if (!filters) return orderedEvents;

    const { types: type, startDate, endDate } = filters;

    return filter(orderedEvents, (event) =>
      allPass(event, [
        (e) => {
          if (type.length === 0) return true;
          const typesAllowed: CaseEventType[] = type.flatMap((t) => CASE_EVENT_CATEGORY_TO_EVENTS_MAPPING[t]);
          return typesAllowed.includes(e.eventType);
        },
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
  }, [filteredEvents]);

  return (
    <div className="relative z-0 flex w-full flex-col gap-md">
      {filteredEvents.length > 0 ? (
        <div className="absolute left-0 top-0 flex h-full w-6 flex-col items-center">
          <div className="bg-grey-border -z-10 h-full w-px" />
        </div>
      ) : null}
      <div className="bg-surface-card sticky left-0 top-0 z-[-15] flex w-full items-center justify-between ps-lg">
        <span className={cn('text-grey-secondary text-small')}>
          {t('cases:investigation.more_recent', { number: newerEvents })}
        </span>
        <div className="flex items-center gap-xs">
          <CaseEventFilters filters={filters} setFilters={setFilters} />
          <Button variant="secondary" appearance="link" onClick={() => setShowAll(!showAll)}>
            <Icon icon={showAll ? 'eye-slash' : 'eye'} className="size-3.5" />
            {showAll ? t('cases:investigation.collapse') : t('cases:investigation.expand')}
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={cn('flex flex-col gap-md overflow-x-hidden', {
          'max-h-[400px] overflow-y-scroll': !showAll,
        })}
      >
        {filteredEvents.map((event) => (
          <Fragment key={event.id}>
            <CaseEventDetail event={event} />
          </Fragment>
        ))}
      </div>
      {showAll ? null : (
        <span
          className={cn('bg-surface-card text-grey-secondary sticky left-0 top-0 z-[-15] ps-lg text-xs', {
            'text-grey-white': showAll,
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
