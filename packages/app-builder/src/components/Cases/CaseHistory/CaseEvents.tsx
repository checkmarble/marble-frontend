import {
  type CaseCreatedEvent,
  type CaseEvent,
  type CaseEventType,
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
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { formatDateRelative, useFormatLanguage } from '@app-builder/utils/format';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Icon, type IconName } from 'ui-icons';

import { casesI18n } from '../cases-i18n';

const CaseCreatedDetail = ({ event }: { event: CaseCreatedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border border-[#D9D9D9]">
        <Icon icon="case-manager" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full grow items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.added_by"
          components={{ Actor: <span className="font-bold capitalize" /> }}
          values={{ actor: user ? getFullName(user) : 'Workflow' }}
        />
      </span>
      <span className="text-s text-grey-80 shrink-0 grow-0 font-normal">
        {formatDateRelative(event.createdAt, { language })}
      </span>
    </div>
  );
};

const StatusUpdatedDetail = ({ event }: { event: CaseStatusUpdatedEvent }) => {
  const language = useFormatLanguage();

  return (
    <div key={event.id} className="flex w-full items-start gap-2">
      <div className="bg-grey-100 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border border-[#D9D9D9]">
        <Icon icon="manage-search" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full grow items-center gap-1 whitespace-pre text-xs">
        Status updated
      </span>
      <span className="text-s text-grey-80 shrink-0 grow-0 font-normal">
        {formatDateRelative(event.createdAt, {
          language,
        })}
      </span>
    </div>
  );
};

const OutcomeUpdatedDetail = (_: { event: CaseOutcomeUpdatedEvent }) => {
  return <span>Outcome updated</span>;
};

const DecisionAddedDetail = ({ event }: { event: DecisionAddedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border border-[#D9D9D9]">
        <Icon icon="decision" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full grow items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.decision_added"
          components={{ Actor: <span className="font-bold capitalize" /> }}
          values={{ actor: user ? getFullName(user) : 'Workflow' }}
        />
      </span>
      <span className="text-s text-grey-80 shrink-0 grow-0 font-normal">
        {formatDateRelative(event.createdAt, { language })}
      </span>
    </div>
  );
};

const CommentAddedDetail = ({ event }: { event: CommentAddedEvent }) => {
  return <span className="text-grey-00 grow text-xs">{event.comment}</span>;
};

const NameUpdatedDetail = (_: { event: NameUpdatedEvent }) => {
  return <span>Name updated</span>;
};

const TagsUpdatedDetail = ({ event }: { event: CaseTagsUpdatedEvent }) => {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const user = useMemo(
    () => (event.userId ? getOrgUserById(event.userId) : undefined),
    [event.userId, getOrgUserById],
  );

  return (
    <div key={event.id} className="flex w-full items-center gap-2">
      <div className="bg-grey-100 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border border-[#D9D9D9]">
        <Icon icon="decision" className="text-grey-00 size-3" />
      </div>
      <span className="text-grey-00 inline-flex h-full grow items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.tags_updated"
          components={{
            Actor: <span className="font-bold capitalize" />,
            Tags: <span className="font-bold capitalize" />,
          }}
          values={{
            actor: user ? getFullName(user) : 'Workflow',
            tags: event.tagIds.join(', '),
          }}
        />
      </span>
      <span className="text-s text-grey-80 shrink-0 grow-0 font-normal">
        {formatDateRelative(event.createdAt, { language })}
      </span>
    </div>
  );
};

const FileAddedDetail = (_: { event: FileAddedEvent }) => {
  return <span>File added</span>;
};

const InboxChangedDetail = (_: { event: InboxChangedEvent }) => {
  return <span>Inbox changed</span>;
};

const DecisionReviewedDetail = (_: { event: DecisionReviewedEvent }) => {
  return <span>Decision reviewed</span>;
};

function CaseSnoozedDetail(_: { event: CaseSnoozedEvent }) {
  return <span>Case snoozed</span>;
}

function CaseUnsnoozedDetail(_: { event: CaseUnsnoozedEvent }) {
  return <span>Case unsnoozed</span>;
}

const RuleSnoozeCreatedDetail = (_: { event: RuleSnoozeCreatedEvent }) => {
  return <span>Rule snooze created</span>;
};

export const getEventIcon = (eventType: CaseEventType) =>
  match<CaseEventType, IconName>(eventType)
    .with('case_created', () => 'case-manager')
    .with('status_updated', () => 'manage-search')
    .with('outcome_updated', () => 'edit')
    .with('decision_added', () => 'decision')
    .with('comment_added', () => 'edit')
    .with('name_updated', () => 'edit')
    .with('tags_updated', () => 'edit')
    .with('file_added', () => 'edit')
    .with('inbox_changed', () => 'edit')
    .with('rule_snooze_created', () => 'snooze')
    .with('decision_reviewed', () => 'case-manager')
    .with('case_snoozed', () => 'snooze')
    .with('case_unsnoozed', () => 'snooze')
    .exhaustive();

export function CaseEvents({
  events,
  showLogs = false,
}: {
  events: CaseEvent[];
  showLogs?: boolean;
}) {
  const filteredEvents = useMemo(
    () =>
      (showLogs ? events : events.filter((e) => e.eventType === 'comment_added')).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [events, showLogs],
  );

  return (
    <div className="relative z-0 flex flex-col gap-4 lg:gap-6">
      <div className="absolute left-0 top-0 flex h-full w-6 flex-col items-center">
        <div className="-z-10 h-full w-px bg-[#D9D9D9]" />
      </div>
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
          .with({ eventType: 'inbox_changed' }, (e) => <InboxChangedDetail event={e} />)
          .with({ eventType: 'rule_snooze_created' }, (e) => <RuleSnoozeCreatedDetail event={e} />)
          .with({ eventType: 'decision_reviewed' }, (e) => <DecisionReviewedDetail event={e} />)
          .with({ eventType: 'case_snoozed' }, (e) => <CaseSnoozedDetail event={e} />)
          .with({ eventType: 'case_unsnoozed' }, (e) => <CaseUnsnoozedDetail event={e} />)
          .exhaustive(),
      )}
    </div>
  );
}
