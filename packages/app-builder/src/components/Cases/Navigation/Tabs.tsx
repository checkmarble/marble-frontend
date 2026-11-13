import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { isAccessible } from '@app-builder/services/feature-access';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link, useLoaderData } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Tabs, Typo } from 'ui-design-system';

export function CasesNavigationTabs({
  actions,
  showAdminSections = true,
  inboxId,
}: {
  actions?: React.ReactNode;
  showAdminSections?: boolean;
  inboxId?: string;
}) {
  const { t } = useTranslation(['navigation', 'cases']);
  const { featuresAccess } = useLoaderData({ from: '/_app/_builder' });

  return (
    <div className="flex flex-col gap-sm">
      <Typo variant="title1">{t('navigation:case_manager')}</Typo>
      <div className="flex items-center justify-between">
        <Tabs.Nav>
          {showAdminSections ? (
            <>
              <Tabs.Link asChild>
                <Link to="/cases/overview">{t('cases:overview.navigation.overview')}</Link>
              </Tabs.Link>
              <Tabs.Link asChild>
                <Link to="/cases/analytics">{t('cases:overview.navigation.analytics')}</Link>
              </Tabs.Link>
            </>
          ) : null}
          <Tabs.Link asChild>
            {inboxId ? (
              <Link
                to="/cases/inboxes/$inboxId"
                params={{ inboxId: inboxId === MY_INBOX_ID ? inboxId : fromUUIDtoSUUID(inboxId) }}
              >
                {t('cases:overview.navigation.cases')}
              </Link>
            ) : (
              <Link to="/cases/inboxes">{t('cases:overview.navigation.cases')}</Link>
            )}
          </Tabs.Link>
          {isAccessible(featuresAccess.continuousScreening) ? (
            <Tabs.Link asChild>
              <Link
                to="/cases/screening-review"
                search={{ inboxId, filter: 'to_review', limit: 50, cursors: [] }}
                activeOptions={{ includeSearch: false }}
              >
                {t('cases:screening_review.title')}
              </Link>
            </Tabs.Link>
          ) : null}
        </Tabs.Nav>
        {actions}
      </div>
    </div>
  );
}
