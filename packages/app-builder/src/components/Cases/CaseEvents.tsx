import {
  type CaseEvent,
  type CaseTagsUpdatedEvent,
  type CommentAddedEvent,
} from '@app-builder/models/cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import {
  formatDateRelative,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { cx } from 'class-variance-authority';
import { type TFunction } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';
import { Accordion, Avatar, Collapsible } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { casesI18n } from './cases-i18n';
import { caseStatusMapping, caseStatusVariants } from './CaseStatus';
import { CaseTags } from './CaseTags';

export function CaseEvents({ events }: { events: CaseEvent[] }) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>
        <div className="flex flex-1 items-center justify-between">
          <span className="text-grey-100 text-m font-bold capitalize">
            {t('cases:case_detail.history')}
          </span>
          <span className="text-grey-25 text-xs font-normal capitalize">
            {t('cases:case_detail.events_count', {
              count: events.length,
            })}
          </span>
        </div>
      </Collapsible.Title>
      <Collapsible.ScrollableContent className="max-h-[70dvh]">
        <Accordion.Container className="relative z-0">
          <div className="border-r-grey-10 absolute inset-y-0 left-0 -z-10 w-3 border-r border-dashed" />
          {events.map((event) => {
            const Icon = getEventIcon(event);
            const Title = getEventTitle(event, t);
            const Detail = getEventDetail(event);
            return (
              <Accordion.Item key={event.id} value={event.id}>
                <Accordion.Title className="flex w-full flex-row items-center">
                  <span className="mr-2">{Icon}</span>
                  <span className="line-clamp-1 flex-1 text-start">
                    {Title}
                  </span>
                  <span className="text-s text-grey-25 mx-4 font-normal">
                    {formatDateRelative(event.createdAt, {
                      language,
                    })}
                  </span>
                  <Accordion.Arrow />
                </Accordion.Title>
                <Accordion.Content className="ml-8 mt-2">
                  {Detail}
                </Accordion.Content>
              </Accordion.Item>
            );
          })}
        </Accordion.Container>
      </Collapsible.ScrollableContent>
    </Collapsible.Container>
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
    <div className="text-grey-100 text-s font-semibold">
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
