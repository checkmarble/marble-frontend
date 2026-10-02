import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Tabs, Typo } from 'ui-design-system';

export function CasesNavigationTabs({ actions }: { actions?: React.ReactNode }) {
  const { t } = useTranslation(['navigation', 'cases']);

  return (
    <div className="flex flex-col gap-sm">
      <Typo variant="title1">{t('navigation:case_manager')}</Typo>
      <div className="flex items-center justify-between">
        <Tabs.Nav>
          <Tabs.Link asChild>
            <Link to="/cases/overview">{t('cases:overview.navigation.overview')}</Link>
          </Tabs.Link>
          <Tabs.Link asChild>
            <Link to="/cases/analytics">{t('cases:overview.navigation.analytics')}</Link>
          </Tabs.Link>
          <Tabs.Link asChild>
            <Link to="/cases/inboxes">{t('cases:overview.navigation.cases')}</Link>
          </Tabs.Link>
        </Tabs.Nav>
        {actions}
      </div>
    </div>
  );
}
