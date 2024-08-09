import {
  type CaseEvent,
  type CaseTagsUpdatedEvent,
  type CommentAddedEvent,
  type RuleSnoozeCreated,
} from '@app-builder/models/cases';
import { useGetRuleSnoozeFetcher } from '@app-builder/routes/ressources+/rule-snoozes+/read.$ruleSnoozeId';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import {
  formatDateRelative,
  formatDateTime,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { Link } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { type TFunction } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';
import { assertNever } from 'typescript-utils';
import { Avatar, CollapsibleV2 } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { Spinner } from '../Spinner';
import { casesI18n } from './cases-i18n';
import { caseStatusMapping, caseStatusVariants } from './CaseStatus';
import { CaseTags } from './CaseTags';
import { CopyPivotValue } from './PivotValue';

export function CaseEvents({ events }: { events: CaseEvent[] }) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();

  return (
    <div className="relative z-0 flex flex-col gap-4 lg:gap-6">
      <div className="border-r-grey-10 absolute inset-y-0 left-0 -z-10 w-3 border-r border-dashed" />
      {events.map((event) => {
        const EventIcon = getEventIcon(event);
        const Title = getEventTitle(event, t);
        const Detail = getEventDetail(event);
        const defaultOpen = getDefaultOpen(event);
        return (
          <div key={event.id}>
            <CollapsibleV2.Provider defaultOpen={defaultOpen}>
              <CollapsibleV2.Title className="group flex w-full flex-row items-center">
                <span className="mr-2">{EventIcon}</span>
                <span className="line-clamp-1 flex-1 text-start">{Title}</span>
                <span className="text-s text-grey-25 mx-4 font-normal">
                  {formatDateRelative(event.createdAt, {
                    language,
                  })}
                </span>
                <Icon
                  icon="arrow-2-down"
                  aria-hidden
                  className="size-6 rounded transition-transform group-aria-expanded:rotate-180"
                />
              </CollapsibleV2.Title>
              <CollapsibleV2.Content className="ml-8 mt-2">
                {Detail}
              </CollapsibleV2.Content>
            </CollapsibleV2.Provider>
          </div>
        );
      })}
    </div>
  );
}

function EventIcon({
  className,
  icon,
}: {
  icon: IconName;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'flex size-6 items-center justify-center rounded-full',
        className,
      )}
    >
      <Icon icon={icon} className="size-4" />
    </div>
  );
}

export function getEventIcon(event: CaseEvent) {
  const { eventType } = event;
  switch (eventType) {
    case 'case_created':
      return (
        <EventIcon
          className="border-grey-10 bg-grey-00 text-grey-100 border"
          icon="case-manager"
        />
      );
    case 'comment_added':
      return (
        <EventIcon
          className="border-grey-10 bg-grey-00 text-grey-100 border"
          icon="create-new-folder"
        />
      );
    case 'decision_added':
      return (
        <EventIcon
          className="border-grey-10 bg-grey-00 text-grey-100 border"
          icon="decision"
        />
      );
    case 'tags_updated':
    case 'name_updated':
    case 'inbox_changed':
      return (
        <EventIcon
          className="border-grey-10 bg-grey-00 text-grey-100 border"
          icon="edit"
        />
      );
    case 'status_updated': {
      return (
        <EventIcon
          className={caseStatusVariants({
            color: caseStatusMapping[event.newStatus].color,
            variant: 'contained',
          })}
          icon="manage-search"
        />
      );
    }
    case 'file_added':
      return (
        <EventIcon
          className="border-grey-10 bg-grey-00 text-grey-100 border"
          icon="attachment"
        />
      );
    case 'rule_snooze_created':
      return (
        <EventIcon
          className="border-grey-10 bg-grey-00 text-grey-100 border"
          icon="snooze"
        />
      );
    default:
      assertNever('[CaseEvent] unknown event:', eventType);
  }
}

export function getDefaultOpen(event: CaseEvent) {
  const { eventType } = event;
  switch (eventType) {
    case 'comment_added':
    case 'rule_snooze_created':
      return true;
    default:
      return false;
  }
}

export function getEventTitle(
  event: CaseEvent,
  t: TFunction<typeof casesI18n>,
) {
  const { eventType } = event;
  switch (eventType) {
    case 'case_created': {
      if (event.userId) {
        return (
          <span className="text-s text-grey-100 font-semibold">
            {t('cases:case_detail.history.event_title.case_created')}
          </span>
        );
      } else {
        return (
          <span className="text-s text-grey-100 font-semibold">
            {t(
              'cases:case_detail.history.event_title.case_created_automatically',
            )}
          </span>
        );
      }
    }
    case 'comment_added': {
      return (
        <span className="text-s text-grey-100 font-semibold">
          {t('cases:case_detail.history.event_title.comment_added')}
        </span>
      );
    }
    case 'decision_added': {
      //TODO(events): aggregate decision_added events to show the count
      const decisionCount = 1;
      return (
        <span className="text-s text-grey-100 font-semibold">
          {t('cases:case_detail.history.event_title.decision_added', {
            count: decisionCount,
          })}
        </span>
      );
    }
    case 'name_updated': {
      return (
        <span className="text-s text-grey-100 font-semibold first-letter:capitalize">
          <Trans
            t={t}
            i18nKey="cases:case_detail.history.event_title.name_updated"
            components={{
              Name: <span className="text-s text-grey-100 font-normal" />,
            }}
            values={{
              name: event.newName,
            }}
          />
        </span>
      );
    }
    case 'tags_updated': {
      return (
        <span className="text-s text-grey-100 font-semibold first-letter:capitalize">
          {t('cases:case_detail.history.event_title.tags_updated')}
        </span>
      );
    }
    case 'inbox_changed': {
      return (
        <span className="text-s text-grey-100 font-semibold first-letter:capitalize">
          {t('cases:case_detail.history.event_title.inbox_changed')}
        </span>
      );
    }
    case 'status_updated': {
      return (
        <span className="text-s text-grey-100 font-semibold first-letter:capitalize">
          <Trans
            t={t}
            i18nKey="cases:case_detail.history.event_title.status_updated"
            components={{
              Status: (
                <span
                  className={caseStatusVariants({
                    color: caseStatusMapping[event.newStatus].color,
                    variant: 'text',
                    className: 'capitalize',
                  })}
                />
              ),
            }}
            values={{
              status: t(caseStatusMapping[event.newStatus].tKey),
            }}
          />
        </span>
      );
    }
    case 'file_added': {
      return (
        <span className="text-s text-grey-100 font-semibold">
          <Trans
            t={t}
            i18nKey="cases:case_detail.history.event_title.file_added"
            components={{
              Name: <span className="text-s text-grey-100 font-normal" />,
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
        <span className="text-s text-grey-100 font-semibold first-letter:capitalize">
          {t('cases:case_detail.history.event_title.rule_snooze_created')}
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
  type: 'added_by' | 'edited_by';
}) {
  const { t } = useTranslation(casesI18n);
  const { getOrgUserById } = useOrganizationUsers();
  const user = getOrgUserById(userId);

  return (
    <div className="text-grey-100 text-s flex items-center gap-1 whitespace-pre font-semibold">
      <Trans
        t={t}
        i18nKey={`cases:case_detail.history.event_detail.${type}`}
        components={{
          Avatar: (
            <Avatar
              size="xs"
              firstName={user?.firstName}
              lastName={user?.lastName}
            />
          ),
          User: (
            <span className="text-s text-grey-100 font-normal capitalize" />
          ),
        }}
        values={{
          user: getFullName(user) || t('cases:case_detail.unknown_user'),
        }}
      />
    </div>
  );
}

function ByWorkflow({
  type,
}: {
  type: 'added_by_workflow' | 'edited_by_workflow';
}) {
  const { t } = useTranslation(casesI18n);
  return (
    <div className="text-grey-100 text-s font-semibold">
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
    case 'decision_added': {
      if (!event.userId) {
        return <ByWorkflow type="added_by_workflow" />;
      }
      return <Author userId={event.userId} type="added_by" />;
    }
    case 'file_added': {
      return <Author userId={event.userId} type="added_by" />;
    }
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
        <div className="text-s text-grey-100 whitespace-break-spaces font-normal">
          {event.comment}
        </div>
      ) : null}
    </div>
  );
}

function TagsUpdatedEventDetail({ event }: { event: CaseTagsUpdatedEvent }) {
  const { t } = useTranslation(casesI18n);
  return (
    <div className="flex flex-col gap-2">
      <Author userId={event.userId} type="edited_by" />
      {event.tagIds.length === 0 ? (
        <p className="text-grey-100 text-s font-normal first-letter:capitalize">
          {t('cases:case_detail.history.event_detail.case_tags.none')}
        </p>
      ) : (
        <div className="text-grey-100 text-s inline-flex flex-wrap whitespace-pre font-semibold">
          <Trans
            t={t}
            i18nKey="cases:case_detail.history.event_detail.case_tags.new"
            components={{
              CaseTags: <CaseTags caseTagIds={event.tagIds} />,
            }}
          />
        </div>
      )}
    </div>
  );
}

function RuleSnoozeCreatedDetail({ event }: { event: RuleSnoozeCreated }) {
  return (
    <div className="flex flex-col gap-2">
      <Author userId={event.userId} type="added_by" />
      {event.comment ? (
        <div className="text-s text-grey-100 border-grey-10 whitespace-break-spaces rounded border p-2 font-normal">
          {event.comment}
        </div>
      ) : null}
      <RuleSnoozeDetail ruleSnoozeId={event.ruleSnoozeId} />
    </div>
  );
}

function RuleSnoozeDetail({ ruleSnoozeId }: { ruleSnoozeId: string }) {
  const { state, data } = useGetRuleSnoozeFetcher({
    ruleSnoozeId,
  });
  const { t } = useTranslation(casesI18n);
  const getCopyToClipboardProps = useGetCopyToClipboard();
  const language = useFormatLanguage();

  const isError = data?.success === false;
  const isLoading = state === 'loading' || !data;

  if (isError) {
    return (
      <div className="text-s text-red-100">{t('common:errors.unknown')}</div>
    );
  }

  return (
    <div className="grid w-full grid-cols-[max-content_1fr] gap-2">
      <span className="text-grey-100 text-s font-semibold first-letter:capitalize">
        {t(
          'cases:case_detail.history.event_detail.rule_snooze_created.pivot_value',
        )}
      </span>
      <span
        className="text-grey-100 text-s"
        {...(isLoading
          ? {}
          : getCopyToClipboardProps(data.ruleSnoozeDetail.pivotValue))}
      >
        {isLoading ? (
          <Spinner className="size-4" />
        ) : (
          <CopyPivotValue>{data.ruleSnoozeDetail.pivotValue}</CopyPivotValue>
        )}
      </span>
      <span className="text-grey-100 text-s font-semibold first-letter:capitalize">
        {t(
          'cases:case_detail.history.event_detail.rule_snooze_created.created_from_decision',
        )}
      </span>
      <span className="text-grey-100 text-s">
        {isLoading ? (
          <Spinner className="size-4" />
        ) : data.ruleSnoozeDetail.createdFrom ? (
          <Link
            className="hover:text-purple-120 focus:text-purple-120 relative font-semibold text-purple-100 hover:underline focus:underline"
            to={getRoute('/decisions/:decisionId', {
              decisionId: fromUUID(
                data.ruleSnoozeDetail.createdFrom.decisionId,
              ),
            })}
          >
            {t(
              'cases:case_detail.history.event_detail.rule_snooze_created.decision_detail',
            )}
          </Link>
        ) : (
          '-'
        )}
      </span>
      <span className="text-grey-100 text-s font-semibold first-letter:capitalize">
        {t(
          'cases:case_detail.history.event_detail.rule_snooze_created.created_from_rule',
        )}
      </span>
      <span className="text-grey-100 text-s">
        {isLoading ? (
          <Spinner className="size-4" />
        ) : data.ruleSnoozeDetail.createdFrom ? (
          <Link
            className="hover:text-purple-120 focus:text-purple-120 relative font-semibold text-purple-100 hover:underline focus:underline"
            to={getRoute(
              '/scenarios/:scenarioId/i/:iterationId/rules/:ruleId',
              {
                scenarioId: fromUUID(
                  data.ruleSnoozeDetail.createdFrom.scenarioId,
                ),
                iterationId: fromUUID(
                  data.ruleSnoozeDetail.createdFrom.scenarioIterationId,
                ),
                ruleId: fromUUID(data.ruleSnoozeDetail.createdFrom.ruleId),
              },
            )}
          >
            {data.ruleSnoozeDetail.createdFrom.ruleName ??
              t(
                'cases:case_detail.history.event_detail.rule_snooze_created.rule_detail',
              )}
          </Link>
        ) : (
          '-'
        )}
      </span>
      <span className="text-grey-100 text-s font-semibold first-letter:capitalize">
        {t(
          'cases:case_detail.history.event_detail.rule_snooze_created.valid_from',
        )}
      </span>
      <span className="text-grey-100 text-s">
        <div className="grid w-fit grid-cols-[1fr_max-content_1fr] gap-1">
          <span className="text-grey-100 text-s text-right">
            {isLoading
              ? '--/--/----'
              : formatDateTime(data.ruleSnoozeDetail.startsAt, { language })}
          </span>
          <span className="text-s self-center">→</span>
          <span className="text-grey-100 text-s">
            {isLoading
              ? '--/--/----'
              : formatDateTime(data.ruleSnoozeDetail.endsAt, { language })}
          </span>
        </div>
      </span>
    </div>
  );
}
