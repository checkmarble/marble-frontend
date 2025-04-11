import {
  type CaseCreatedEvent,
  type CaseEvent,
  type CaseOutcomeUpdatedEvent,
  type CaseSnoozedEvent,
  type CaseStatusUpdatedEvent,
  type CaseTagsUpdatedEvent,
  type CaseUnsnoozedEvent,
  type CommentAddedEvent,
  type DecisionAddedEvent,
  type DecisionReviewedEvent,
  type FileAddedEvent,
  type InboxChangedEvent,
  type NameUpdatedEvent,
  type RuleSnoozeCreatedEvent,
} from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { formatDateRelative, formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { differenceInDays } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Avatar, Button, cn, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { casesI18n } from './cases-i18n';
import { CaseTags } from './CaseTags';

const EventTime = ({ time }: { time: string }) => {
  const date = new Date(time);
  const language = useFormatLanguage();
  const is6daysOld = Math.abs(differenceInDays(new Date(), date)) > 6;

  return (
    <Tooltip.Default
      arrow={false}
      className="border-grey-90 flex items-center border px-1.5 py-1"
      content={
        <span className="text-2xs font-normal">
          {formatDateTime(date, {
            language,
            timeStyle: is6daysOld ? 'short' : undefined,
            dateStyle: is6daysOld ? undefined : 'short',
          })}
        </span>
      }
    >
      <span className="text-grey-50 shrink-0 grow-0 text-xs font-normal">
        {formatDateRelative(date, { language })}
      </span>
    </Tooltip.Default>
  );
};

const CaseCreatedDetail = ({ event }: { event: CaseCreatedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="case-manager" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.created_by"
          components={{ Actor: <span className="font-bold capitalize" /> }}
          values={{ actor: user ? getFullName(user) : 'Workflow' }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};

const StatusUpdatedDetail = ({ event }: { event: CaseStatusUpdatedEvent }) => {
  const { t } = useTranslation(casesI18n);

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="manage-search" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.status_updated"
          components={{ Style: <span className="font-bold capitalize" /> }}
          values={{ status: t(`cases:case.status.${event.newStatus}`) }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};

const OutcomeUpdatedDetail = ({ event }: { event: CaseOutcomeUpdatedEvent }) => {
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

const DecisionAddedDetail = ({ event }: { event: DecisionAddedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="decision" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.decision_added"
          components={{ Actor: <span className="font-bold capitalize" /> }}
          values={{ actor: user ? getFullName(user) : 'Workflow' }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};

const CommentAddedDetail = ({ event }: { event: CommentAddedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex items-start gap-2">
      <Avatar firstName={user?.firstName} lastName={user?.lastName} size="xxs" color="grey" />
      <span className="text-grey-00 whitespace-pre text-wrap text-xs">{event.comment}</span>
      <EventTime time={event.createdAt} />
    </div>
  );
};

const NameUpdatedDetail = ({ event }: { event: NameUpdatedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="edit" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.name_updated"
          components={{ Style: <span className="font-bold capitalize" /> }}
          values={{ actor: user ? getFullName(user) : 'Workflow', name: event.newName }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};

const TagsUpdatedDetail = ({ event }: { event: CaseTagsUpdatedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const { orgTags } = useOrganizationTags();

  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  //TODO: Remove when proper event is implemented
  const finalTags = useMemo(() => event.tagIds.filter((id) => id !== ''), [event.tagIds]);

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="decision" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey={
            finalTags.length === 0
              ? 'cases:case_detail.history.event_detail.tags_removed'
              : 'cases:case_detail.history.event_detail.tags_updated'
          }
          components={{
            Actor: <span className="font-bold capitalize" />,
            Tags: <CaseTags caseTagIds={finalTags} orgTags={orgTags} />,
          }}
          values={{
            actor: user ? getFullName(user) : 'Workflow',
          }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};

const FileAddedDetail = ({ event }: { event: FileAddedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="decision" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.file_added"
          components={{
            Actor: <span className="font-bold capitalize" />,
            File: (
              <span className="border-grey-90 flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium" />
            ),
          }}
          values={{
            actor: user ? getFullName(user) : 'Marble',
            file: event.fileName,
          }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};

const InboxChangedDetail = ({ event, inboxes }: { event: InboxChangedEvent; inboxes: Inbox[] }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );
  const inboxName = useMemo(
    () => inboxes.find((i) => i.id === event.newInboxId)?.name ?? 'Unknown',
    [event.newInboxId, inboxes],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="decision" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.inbox_changed"
          components={{
            Style: <span className="font-bold capitalize" />,
          }}
          values={{
            actor: user ? getFullName(user) : 'Marble',
            inbox: inboxName,
          }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};

const DecisionReviewedDetail = (_: { event: DecisionReviewedEvent }) => {
  return <span>Decision reviewed</span>;
};

const CaseSnoozedDetail = ({ event }: { event: CaseSnoozedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="snooze" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.case_snoozed"
          components={{ Style: <span className="font-bold capitalize" /> }}
          values={{
            actor: user ? getFullName(user) : 'Marble',
            date: formatDateTime(event.snoozeUntil, { language }),
          }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};

const CaseUnsnoozedDetail = ({ event }: { event: CaseUnsnoozedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="snooze-on" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.case_unsnoozed"
          components={{ Style: <span className="font-bold capitalize" /> }}
          values={{ actor: user ? getFullName(user) : 'Marble' }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
};

const RuleSnoozeCreatedDetail = (_: { event: RuleSnoozeCreatedEvent }) => {
  return <span>Rule snooze created</span>;
};

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
  const [hiddenItemsCountAfter, setHiddenItemsCountAfter] = useState(0);
  const [hiddenItemsCountBefore, setHiddenItemsCountBefore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const filteredEvents = useMemo(
    () =>
      (showLogs ? events : events.filter((e) => e.eventType === 'comment_added')).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [events, showLogs],
  );

  console.log('Filtered Events', filteredEvents);

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
      // TODO: Add margin in order to count all items
      for (const item of items) {
        const itemRect = item.getBoundingClientRect();
        if (itemRect.bottom < containerRect.top) {
          itemsBeforeVisible++;
        } else if (itemRect.top > containerRect.bottom) {
          itemsAfterVisible++;
        }
      }

      setHiddenItemsCountBefore(itemsBeforeVisible);
      setHiddenItemsCountAfter(itemsAfterVisible);
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
            'text-grey-100': showAll || hiddenItemsCountBefore === 0,
          })}
        >
          {hiddenItemsCountBefore} newer
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="small">
            <Icon icon="filters" className="size-3.5" />
            <span className="text-xs">Filters</span>
          </Button>
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
          {hiddenItemsCountAfter === 0 ? `No older events` : `${hiddenItemsCountAfter} older`}
        </span>
      )}
    </div>
  );
}
