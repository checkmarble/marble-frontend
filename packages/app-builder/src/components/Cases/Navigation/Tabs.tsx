import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Tabs, Typo, tabClassName } from 'ui-design-system';

export function CasesNavigationTabs({ actions }: { actions?: React.ReactNode }) {
  const { t } = useTranslation(['navigation', 'cases']);

  return (
    <div className="flex flex-col gap-sm">
      <Typo variant="title1">{t('navigation:case_manager')}</Typo>
      <div className="flex items-center justify-between">
        <Tabs>
          <Link to="/cases/overview" className={tabClassName}>
            {t('cases:overview.navigation.overview')}
          </Link>
          <Link to="/cases/analytics" className={tabClassName}>
            {t('cases:overview.navigation.analytics')}
          </Link>
          <Link to="/cases/inboxes" className={tabClassName}>
            {t('cases:overview.navigation.cases')}
          </Link>
        </Tabs>
        {actions}
      </div>
    </div>
  );
}
