import { NavLink } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Tabs, tabClassName } from 'ui-design-system';

export function CasesNavigationTabs({ actions }: { actions?: React.ReactNode }) {
  const { t } = useTranslation(['navigation', 'cases']);

  return (
    <div className="flex flex-col gap-v2-sm">
      <h1 className="text-xl font-bold">{t('navigation:case_manager')}</h1>
      <div className="flex items-center justify-between">
        <Tabs>
          <NavLink to="/cases/overview" className={tabClassName}>
            {t('cases:overview.navigation.overview')}
          </NavLink>
          {/* TODO: Add analytics tab */}
          {/* <NavLink to="/cases/analytics" className={tabClassName}>
            {t('cases:overview.navigation.analytics')}
          </NavLink> */}
          <NavLink to="/cases/inboxes" className={tabClassName}>
            {t('cases:overview.navigation.cases')}
          </NavLink>
        </Tabs>
        {actions}
      </div>
    </div>
  );
}
