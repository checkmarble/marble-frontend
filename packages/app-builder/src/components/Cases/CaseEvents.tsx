import { type CaseEvent } from '@app-builder/models/cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { formatDateRelative } from '@app-builder/utils/format';
import { cx } from 'class-variance-authority';
import { type TFunction } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';
import { Accordion, Avatar, Collapsible } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { casesI18n } from './cases-i18n';
import { caseStatusMapping, caseStatusVariants } from './CaseStatus';
import { CaseTags } from './CaseTags';

export function CaseEvents({ events }: { events: CaseEvent[] }) {
  const {
    t,
    i18n: { language },
  } = useTranslation(casesI18n);

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>
        <span className="text-grey-100 text-m font-bold capitalize">
          {t('cases:case_detail.history')}
        </span>
      </Collapsible.Title>
      <Collapsible.Content>
        <Accordion.Container className="relative z-0">
          <div className="border-r-grey-10 absolute inset-y-0 left-0 -z-10 w-3 border-r border-dashed" />
          {events.filter(displayedEventTypes).map((event) => {
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
                    {formatDateRelative(event.created_at, {
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
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

function displayedEventTypes(event: CaseEvent) {
  return [
    'case_created',
    'comment_added',
    'decision_added',
    'name_updated',
    'status_updated',
    'tags_updated',
    'file_added',
    'inbox_changed',
  ].includes(event.event_type);
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
  const { event_type } = event;
  switch (event_type) {
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
      const newStatus = event.new_value;
      return (
        <EventIcon
          className={caseStatusVariants({
            color: caseStatusMapping[newStatus].color,
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
  const { event_type } = event;
  switch (event_type) {
    case 'case_created': {
      return (
        <span className="text-s text-grey-100 font-semibold">
          {t('cases:case_detail.history.event_title.case_created')}
        </span>
      );
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
              name: event.new_value,
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
      const newStatus = event.new_value;
      return (
        <span className="text-s text-grey-100 font-semibold first-letter:capitalize">
          <Trans
            t={t}
            i18nKey="cases:case_detail.history.event_title.status_updated"
            components={{
              Status: (
                <span
                  className={caseStatusVariants({
                    color: caseStatusMapping[newStatus].color,
                    variant: 'text',
                    className: 'capitalize',
                  })}
                />
              ),
            }}
            values={{
              status: t(caseStatusMapping[newStatus].tKey),
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
              name: event.additional_note || 'default file name',
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

export function getEventDetail(event: CaseEvent) {
  const { event_type } = event;
  switch (event_type) {
    case 'case_created': {
      return <Author userId={event.user_id} type="added_by" />;
    }
    case 'comment_added': {
      return (
        <div className="flex flex-col gap-2">
          <Author userId={event.user_id} type="added_by" />
          {event.additional_note ? (
            <div className="text-s text-grey-100 whitespace-break-spaces font-normal">
              {event.additional_note}
            </div>
          ) : null}
        </div>
      );
    }
    case 'tags_updated': {
      return (
        <div className="flex flex-col gap-2">
          <Author userId={event.user_id} type="added_by" />
          <CaseTags caseTagIds={event.tagIds} />
        </div>
      );
    }
    case 'decision_added':
    case 'file_added': {
      return <Author userId={event.user_id} type="added_by" />;
    }
    case 'name_updated':
    case 'status_updated':
    case 'inbox_changed': {
      return <Author userId={event.user_id} type="edited_by" />;
    }
  }
}
