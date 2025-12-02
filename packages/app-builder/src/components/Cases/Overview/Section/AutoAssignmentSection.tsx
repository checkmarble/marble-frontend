import { usePanel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { type InboxWithCasesCount } from '@app-builder/models/inbox';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { isAccessible, isRestricted } from '@app-builder/services/feature-access';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, cn, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { InboxUserRow } from '../InboxUserRow';
import { AutoAssignmentPanelContent } from '../Panel/AutoAssignmentPanelContent';
import { UpsaleModal } from '../UpsaleModal';

const MAX_DISPLAYED_INBOXES = 3;

interface AutoAssignmentSectionProps {
  currentUserId?: string;
  isGlobalAdmin: boolean;
  access: FeatureAccessLevelDto;
}

export const AutoAssignmentSection = ({ currentUserId, isGlobalAdmin, access }: AutoAssignmentSectionProps) => {
  const { t } = useTranslation(['cases']);
  const inboxesQuery = useGetInboxesQuery();
  const { openPanel } = usePanel();
  const [expandedInboxIds, setExpandedInboxIds] = useState<string[]>([]);

  const restricted = isRestricted(access);
  const hasAccess = isAccessible(access);
  const canEdit = hasAccess && isGlobalAdmin;

  // Check if user is a member of the inbox (any role)
  const isInboxMember = (inbox: InboxWithCasesCount) => inbox.users.some((u) => u.userId === currentUserId);

  const handleOpenPanel = () => {
    openPanel(
      <AutoAssignmentPanelContent
        currentUserId={currentUserId}
        isGlobalAdmin={isGlobalAdmin}
        hasEntitlement={hasAccess}
      />,
    );
  };

  const toggleInbox = (inboxId: string) => {
    setExpandedInboxIds((prev) => (prev.includes(inboxId) ? prev.filter((id) => id !== inboxId) : [...prev, inboxId]));
  };

  return (
    <div
      className={cn('border rounded-v2-lg p-v2-md flex flex-col gap-v2-md', {
        'border-[#ada7fd] bg-[#f7f6ff]': restricted,
        'border-grey-border bg-grey-background-light': !restricted,
      })}
    >
      <div className="flex items-center gap-v2-md">
        <span className="flex-1 font-medium text-s">{t('cases:overview.panel.auto_assignment.title')}</span>
        {match({ restricted, canEdit })
          .with({ restricted: true }, () => (
            <UpsaleModal
              title={t('cases:overview.upsale.auto_assignment.title')}
              description={t('cases:overview.upsale.auto_assignment.description')}
            />
          ))
          .with({ canEdit: true }, () => (
            <Icon
              icon="edit"
              className="size-5 cursor-pointer text-purple-65 hover:text-purple-50"
              onClick={handleOpenPanel}
            />
          ))
          .otherwise(() => (
            <Icon icon="eye" className="size-5 cursor-pointer text-purple-65" onClick={handleOpenPanel} />
          ))}
      </div>
      <div className="flex flex-col gap-v2-sm">
        {match(inboxesQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center py-4">
              <Spinner className="size-6" />
            </div>
          ))
          .with({ isError: true }, () => (
            <div className="text-s text-grey-50">{t('cases:overview.config.error_loading')}</div>
          ))
          .with({ isSuccess: true }, ({ data }) => {
            const allInboxes = data?.inboxes ?? [];
            // Global admin sees all inboxes, others see only their inboxes (where they are a member)
            const inboxes = isGlobalAdmin ? allInboxes : allInboxes.filter(isInboxMember);
            const displayedInboxes = inboxes.slice(0, MAX_DISPLAYED_INBOXES);
            const hasMore = inboxes.length > MAX_DISPLAYED_INBOXES;

            return (
              <>
                {displayedInboxes.map((inbox) => {
                  const isExpanded = expandedInboxIds.includes(inbox.id);
                  const hasUsers = inbox.users?.length > 0;

                  return (
                    <div key={inbox.id} className="flex flex-col gap-v2-sm">
                      <div className="flex items-center gap-v2-sm h-6">
                        <Icon
                          icon="arrow-down"
                          className={cn('size-5 text-purple-65', {
                            '-rotate-90': !isExpanded,
                            'cursor-pointer': hasUsers,
                            invisible: !hasUsers,
                          })}
                          onClick={hasUsers ? () => toggleInbox(inbox.id) : undefined}
                        />
                        <div className="flex-1 flex items-center gap-v2-xs">
                          <span className="text-s">{inbox.name}</span>
                          <Tag color="purple" size="small" border="rounded-sm">
                            {t('cases:overview.inbox.cases_count', { count: inbox.casesCount })}
                          </Tag>
                        </div>
                        <Tag color={inbox.autoAssignEnabled ? 'green' : 'grey'} size="small" border="rounded-sm">
                          {inbox.autoAssignEnabled
                            ? t('cases:overview.config.active')
                            : t('cases:overview.config.inactive')}
                        </Tag>
                      </div>
                      {isExpanded && hasUsers && (
                        <div className="flex flex-col gap-v2-sm">
                          {inbox.users.map((user) => (
                            <InboxUserRow key={user.id} user={user} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {hasMore && (
                  <ButtonV2 variant="secondary" appearance="link" onClick={handleOpenPanel}>
                    {t('cases:overview.config.view_more')}
                  </ButtonV2>
                )}
              </>
            );
          })
          .exhaustive()}
      </div>
    </div>
  );
};
