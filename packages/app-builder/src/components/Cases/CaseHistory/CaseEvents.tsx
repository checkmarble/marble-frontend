import { CopyToClipboardButton } from '@app-builder/components/CopyToClipboardButton';
import { ReviewStatusTag } from '@app-builder/components/Decisions/ReviewStatusTag';
import { Spinner } from '@app-builder/components/Spinner';
import {
  type CaseEvent,
  type CaseEventType,
  type CaseSnoozedEvent,
  type CaseTagsUpdatedEvent,
  type CommentAddedEvent,
  type DecisionReviewedEvent,
  type RuleSnoozeCreatedEvent,
} from '@app-builder/models/cases';
import { useGetRuleSnoozeFetcher } from '@app-builder/routes/ressources+/rule-snoozes+/read.$ruleSnoozeId';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { formatDateRelative, formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import * as Ariakit from '@ariakit/react';
import { Link } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { type TFunction } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';
import { assertNever } from 'typescript-utils';
import { Avatar } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { casesI18n } from '../cases-i18n';
import { CaseStatusPreview } from '../CaseStatus';
import { CaseTags } from '../CaseTags';

export function CaseEvents({ events }: { events: CaseEvent[] }) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();

  return (
    <div className="relative z-0 flex flex-col gap-4 lg:gap-6">
      <div className="absolute left-0 top-0 flex h-full w-6 flex-col items-center">
        <div className="-z-10 h-full w-px bg-[#D9D9D9]" />
      </div>
      {events.map((event) => {
        const EventIcon = getEventIcon(event.eventType);
        const Title = getEventTitle(event, t);
        const Detail = getEventDetail(event);
        return (
          <div key={event.id} className="grid w-full grid-cols-[max-content,_1fr] gap-x-2 gap-y-1">
            {EventIcon}
            <span className="flex w-full flex-row items-baseline gap-2">
              <span className="flex-1 text-start">{Title}</span>
              <span className="text-s text-grey-80 font-normal">
                {formatDateRelative(event.createdAt, {
                  language,
                })}
              </span>
            </span>
            <div className="col-start-2">{Detail}</div>
          </div>
        );
      })}
    </div>
  );
}

function EventIcon({ className, icon }: { icon: IconName; className?: string }) {
  return (
    <div className={cx('flex size-6 items-center justify-center rounded-full', className)}>
      <Icon icon={icon} className="size-4" />
    </div>
  );
}

export function getEventIcon(eventType: CaseEventType) {
  switch (eventType) {
    case 'status_updated': {
      return <EventIcon className="bg-blue-96 text-blue-58" icon="manage-search" />;
    }
    case 'case_created':
      return <EventIcon className="bg-blue-96 text-blue-58" icon="case-manager" />;
    case 'decision_added':
      return <EventIcon className="bg-blue-96 text-blue-58" icon="decision" />;
    case 'tags_updated':
    case 'name_updated':
    case 'inbox_changed':
    case 'outcome_updated':
    case 'comment_added':
      return <EventIcon className="bg-grey-90 text-grey-50" icon="edit" />;
    case 'file_added':
      return <EventIcon className="bg-grey-90 text-grey-50" icon="attachment" />;
    case 'rule_snooze_created':
      return <EventIcon className="bg-purple-96 text-purple-65" icon="snooze" />;
    case 'decision_reviewed':
      return <EventIcon className="bg-purple-96 text-purple-65" icon="case-manager" />;
    case 'case_snoozed':
      return <EventIcon className="bg-purple-96 text-purple-65" icon="snooze" />;
    case 'case_unsnoozed':
      return <EventIcon className="bg-purple-96 text-purple-65" icon="snooze" />;
    default:
      assertNever('[CaseEvent] unknown event:', eventType);
  }
}

export function getEventTitle(event: CaseEvent, t: TFunction<typeof casesI18n>) {
  const { eventType } = event;
  switch (eventType) {
    case 'case_created': {
      if (event.userId) {
        return (
          <span className="text-s text-grey-00 font-semibold">
            {t('cases:case_detail.history.event_title.case_created')}
          </span>
        );
      } else {
        return (
          <span className="text-s text-grey-00 font-semibold">
            {t('cases:case_detail.history.event_title.case_created_automatically')}
          </span>
        );
      }
    }
    case 'comment_added': {
      return (
        <span className="text-s text-grey-00 font-semibold">
          {t('cases:case_detail.history.event_title.comment_added')}
        </span>
      );
    }
    case 'decision_added': {
      //TODO(events): aggregate decision_added events to show the count
      const decisionCount = 1;
      return (
        <span className="text-s text-grey-00 font-semibold">
          {t('cases:case_detail.history.event_title.decision_added', {
            count: decisionCount,
          })}
        </span>
      );
    }
    case 'name_updated': {
      return (
        <span className="text-s text-grey-00 font-semibold">
          <Trans
            t={t}
            i18nKey="cases:case_detail.history.event_title.name_updated"
            components={{
              Name: <span className="text-s text-grey-00 font-normal" />,
            }}
            values={{
              name: event.newName,
            }}
          />
        </span>
      );
    }
    case 'outcome_updated': {
      return (
        <span className="text-s text-grey-00 font-semibold">
          {t('cases:case_detail.history.event_title.outcome_updated')}
        </span>
      );
    }
    case 'tags_updated': {
      return (
        <span className="text-s text-grey-00 font-semibold">
          {t('cases:case_detail.history.event_title.tags_updated')}
        </span>
      );
    }
    case 'inbox_changed': {
      return (
        <span className="text-s text-grey-00 font-semibold">
          {t('cases:case_detail.history.event_title.inbox_changed')}
        </span>
      );
    }
    case 'status_updated': {
      return (
        <span className="text-s text-grey-00 font-semibold">
          <Trans
            t={t}
            i18nKey="cases:case_detail.history.event_title.status_updated"
            components={{
              Status: <CaseStatusPreview status={event.newStatus} size="small" type="full" />,
            }}
          />
        </span>
      );
    }
    case 'file_added': {
      return (
        <span className="text-s text-grey-00 font-semibold">
          <Trans
            t={t}
            i18nKey="cases:case_detail.history.event_title.file_added"
            components={{
              Name: <span className="text-s text-grey-00 font-normal" />,
            }}
            values={{
              name: event.fileName || 'default file name',
            }}
          />
        </span>
      );
    }
    case 'rule_snooze_created':
      return (
        <span className="text-s text-grey-00 font-semibold">
          {t('cases:case_detail.history.event_title.rule_snooze_created')}
        </span>
      );
    case 'decision_reviewed':
      return (
        <span className="text-s text-grey-00 font-semibold">
          <Trans
            t={t}
            i18nKey="cases:case_detail.history.event_title.decision_reviewed"
            components={{
              ReviewStatus: (
                <ReviewStatusTag
                  border="square"
                  size="small"
                  reviewStatus={event.finalStatus}
                  className="w-fit"
                />
              ),
            }}
          />
        </span>
      );
    case 'case_snoozed':
      return (
        <span className="text-s text-grey-00 font-semibold">
          {t('cases:case_detail.history.event_detail.case_snoozed.title')}
        </span>
      );
    case 'case_unsnoozed':
      return (
        <span className="text-s text-grey-00 font-semibold">
          {t('cases:case_detail.history.event_detail.case_unsnoozed.title')}
        </span>
      );
    default:
      assertNever('[CaseEvent] unknown event:', eventType);
  }
}

function Author({
  userId,
  type,
}: {
  userId: string;
  type: 'added_by' | 'edited_by' | 'reviewed_by';
}) {
  const { t } = useTranslation(casesI18n);
  const { getOrgUserById } = useOrganizationUsers();
  const user = getOrgUserById(userId);

  return (
    <div className="text-grey-00 text-s flex items-center gap-1 whitespace-pre font-medium">
      <Trans
        t={t}
        i18nKey={`cases:case_detail.history.event_detail.${type}`}
        components={{
          Avatar: <Avatar size="xs" firstName={user?.firstName} lastName={user?.lastName} />,
          User: <span className="text-s text-grey-00 font-normal capitalize" />,
        }}
        values={{
          user: getFullName(user) || t('cases:case_detail.unknown_user'),
        }}
      />
    </div>
  );
}

function ByWorkflow({ type }: { type: 'added_by_workflow' | 'edited_by_workflow' }) {
  const { t } = useTranslation(casesI18n);
  return (
    <div className="text-grey-00 text-s font-medium">
      <Trans t={t} i18nKey={`cases:case_detail.history.event_detail.${type}`} />
    </div>
  );
}

export function getEventDetail(event: CaseEvent) {
  const { eventType } = event;
  switch (eventType) {
    case 'case_created': {
      if (!event.userId) {
        return <ByWorkflow type="added_by_workflow" />;
      }
      return <Author userId={event.userId} type="added_by" />;
    }
    case 'comment_added': {
      return <CommentAddedEventDetail event={event} />;
    }
    case 'tags_updated': {
      return <TagsUpdatedEventDetail event={event} />;
    }
    case 'rule_snooze_created': {
      return <RuleSnoozeCreatedDetail event={event} />;
    }
    case 'decision_reviewed': {
      return <DecisionReviewedEventDetail event={event} />;
    }
    case 'decision_added': {
      if (!event.userId) {
        return <ByWorkflow type="added_by_workflow" />;
      }
      return <Author userId={event.userId} type="added_by" />;
    }
    case 'file_added': {
      return <Author userId={event.userId} type="added_by" />;
    }
    case 'case_snoozed': {
      return <CaseSnoozedDetail event={event} />;
    }
    case 'outcome_updated':
    case 'case_unsnoozed':
    case 'name_updated':
    case 'status_updated':
    case 'inbox_changed': {
      return <Author userId={event.userId} type="edited_by" />;
    }
    default:
      assertNever('[CaseEvent] unknown event:', eventType);
  }
}

function CommentAddedEventDetail({ event }: { event: CommentAddedEvent }) {
  return (
    <div className="flex flex-col gap-2">
      <Author userId={event.userId} type="added_by" />
      {event.comment ? (
        <div className="text-s text-grey-00 whitespace-break-spaces font-normal">
          {event.comment}
        </div>
      ) : null}
    </div>
  );
}

function DecisionReviewedEventDetail({ event }: { event: DecisionReviewedEvent }) {
  const { t } = useTranslation(casesI18n);

  return (
    <div className="flex flex-col gap-2">
      <Author userId={event.userId} type="reviewed_by" />
      <div className="text-s text-grey-00 whitespace-break-spaces font-normal">
        {event.reviewComment}
      </div>
      <Link
        className="text-s hover:text-purple-60 focus:text-purple-60 text-purple-65 relative font-normal hover:underline focus:underline"
        to={getRoute('/decisions/:decisionId', {
          decisionId: fromUUID(event.decisionId),
        })}
      >
        {t('cases:case_detail.history.event_detail.rule_snooze_created.decision_detail')}
      </Link>
    </div>
  );
}

function CaseSnoozedDetail({ event }: { event: CaseSnoozedEvent }) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  return (
    <div className="flex flex-col gap-2">
      <Author userId={event.userId} type="added_by" />
      <div className="text-s text-grey-00 whitespace-break-spaces font-normal">
        {t('cases:case_detail.history.event_detail.case_snoozed.snooze_until', {
          date: formatDateTime(event.snoozeUntil, { language }),
        })}
      </div>
    </div>
  );
}

function TagsUpdatedEventDetail({ event }: { event: CaseTagsUpdatedEvent }) {
  const { t } = useTranslation(casesI18n);
  const { orgTags } = useOrganizationTags();
  return (
    <div className="flex flex-col gap-2">
      <Author userId={event.userId} type="edited_by" />
      {event.tagIds.length === 0 ? (
        <p className="text-grey-00 text-s font-normal first-letter:capitalize">
          {t('cases:case_detail.history.event_detail.case_tags.none')}
        </p>
      ) : (
        <div className="text-grey-00 text-s inline-flex flex-wrap whitespace-pre font-medium">
          <Trans
            t={t}
            i18nKey="cases:case_detail.history.event_detail.case_tags.new"
            components={{
              CaseTags: <CaseTags caseTagIds={event.tagIds} orgTags={orgTags} />,
            }}
          />
        </div>
      )}
    </div>
  );
}

function RuleSnoozeCreatedDetail({ event }: { event: RuleSnoozeCreatedEvent }) {
  const { t } = useTranslation(casesI18n);
  return (
    <div className="flex flex-col gap-2">
      <Author userId={event.userId} type="added_by" />
      {event.comment ? (
        <div className="text-s text-grey-00 whitespace-break-spaces font-normal">
          {event.comment}
        </div>
      ) : null}
      <Ariakit.HovercardProvider placement="bottom-start" showTimeout={0}>
        <Ariakit.HovercardAnchor
          tabIndex={-1}
          className="text-s text-purple-65 inline-flex w-fit cursor-pointer items-center gap-1 font-normal"
        >
          {t('cases:case_detail.history.event_detail.rule_snooze_created.load_details')}
        </Ariakit.HovercardAnchor>
        <Ariakit.Hovercard
          unmountOnHide
          portal
          className="bg-grey-100 border-grey-90 flex w-96 rounded border p-2 shadow-md"
        >
          <RuleSnoozeDetail ruleSnoozeId={event.ruleSnoozeId} />
        </Ariakit.Hovercard>
      </Ariakit.HovercardProvider>
    </div>
  );
}

function RuleSnoozeDetail({ ruleSnoozeId }: { ruleSnoozeId: string }) {
  const { state, data } = useGetRuleSnoozeFetcher({
    ruleSnoozeId,
  });
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();

  const isError = data?.success === false;
  const isLoading = state === 'loading' || !data;

  if (isError) {
    return <div className="text-s text-red-47">{t('common:errors.unknown')}</div>;
  }

  return (
    <div className="grid w-full auto-rows-max grid-cols-[max-content_1fr] items-baseline gap-2">
      <span className="text-grey-00 text-s font-medium first-letter:capitalize">
        {t('cases:case_detail.history.event_detail.rule_snooze_created.pivot_value')}
      </span>
      <span className="text-grey-00 text-s">
        {isLoading ? (
          <Spinner className="size-4" />
        ) : (
          <CopyToClipboardButton toCopy={data.ruleSnoozeDetail.pivotValue}>
            <span className="line-clamp-1 max-w-40 text-xs font-normal">
              {data.ruleSnoozeDetail.pivotValue}
            </span>
          </CopyToClipboardButton>
        )}
      </span>
      <span className="text-grey-00 text-s font-medium first-letter:capitalize">
        {t('cases:case_detail.history.event_detail.rule_snooze_created.created_from_decision')}
      </span>
      <span className="text-grey-00 text-s">
        {isLoading ? (
          <Spinner className="size-4" />
        ) : data.ruleSnoozeDetail.createdFromDecisionId ? (
          <Link
            className="hover:text-purple-60 focus:text-purple-60 text-purple-65 relative font-normal hover:underline focus:underline"
            to={getRoute('/decisions/:decisionId', {
              decisionId: fromUUID(data.ruleSnoozeDetail.createdFromDecisionId),
            })}
          >
            {t('cases:case_detail.history.event_detail.rule_snooze_created.decision_detail')}
          </Link>
        ) : (
          '-'
        )}
      </span>
      <span className="text-grey-00 text-s font-medium first-letter:capitalize">
        {t('cases:case_detail.history.event_detail.rule_snooze_created.created_from_rule')}
      </span>
      <span className="text-grey-00 text-s">
        {isLoading ? (
          <Spinner className="size-4" />
        ) : (
          <Link
            className="hover:text-purple-60 focus:text-purple-60 text-purple-65 relative font-normal hover:underline focus:underline"
            to={getRoute('/scenarios/:scenarioId/i/:iterationId/rules/:ruleId', {
              scenarioId: fromUUID(data.ruleSnoozeDetail.createdFromRule.scenarioId),
              iterationId: fromUUID(data.ruleSnoozeDetail.createdFromRule.scenarioIterationId),
              ruleId: fromUUID(data.ruleSnoozeDetail.createdFromRule.ruleId),
            })}
          >
            {data.ruleSnoozeDetail.createdFromRule.ruleName ??
              t('cases:case_detail.history.event_detail.rule_snooze_created.rule_detail')}
          </Link>
        )}
      </span>
      <span className="text-grey-00 text-s font-medium first-letter:capitalize">
        {t('cases:case_detail.history.event_detail.rule_snooze_created.validity')}
      </span>
      <span className="text-grey-00 text-s">
        {t('cases:case_detail.pivot_values.snooze_from_to', {
          from: isLoading
            ? '--/--/----'
            : formatDateTime(data.ruleSnoozeDetail.startsAt, { language }),
          to: isLoading ? '--/--/----' : formatDateTime(data.ruleSnoozeDetail.endsAt, { language }),
        })}
      </span>
    </div>
  );
}
