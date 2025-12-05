import { NavLink } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';

const tabClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center h-8 px-v2-sm text-s font-medium',
    isActive ? 'bg-purple-65 text-white rounded-v2-md' : 'bg-purple-96 text-purple-65',
  );

export function CasesNavigationTabs() {
  const { t } = useTranslation(['cases']);

  return (
    <div className="flex p-v2-xs gap-v2-xs rounded-v2-md bg-purple-96 self-start justify-self-start">
      <NavLink to="/cases/overview" className={tabClassName}>
        <span>{t('cases:overview.navigation.overview')}</span>
      </NavLink>
      {/* TODO: Add analytics tab */}
      {/* <NavLink to="/cases/analytics" className={tabClassName}>
        <span>{t('cases:overview.navigation.analytics')}</span>
      </NavLink> */}
      <NavLink to="/cases/inboxes" className={tabClassName}>
        <span>{t('cases:overview.navigation.cases')}</span>
      </NavLink>
    </div>
  );
}
