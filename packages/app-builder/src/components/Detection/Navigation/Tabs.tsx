import { getRoute } from '@app-builder/utils/routes';
import { NavLink } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';

const tabClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center h-8 px-v2-sm text-s font-medium rounded-v2-md',
    isActive
      ? 'bg-purple-primary text-white dark:bg-purple-primary dark:text-grey-white'
      : 'bg-purple-background text-purple-primary dark:bg-transparent dark:text-grey-secondary',
  );

export function DetectionNavigationTabs() {
  const { t } = useTranslation(['navigation']);

  return (
    <div className="flex p-v2-xs gap-v2-xs rounded-v2-lg bg-purple-background self-start justify-self-start dark:bg-grey-background">
      <NavLink to={getRoute('/detection/scenarios')} className={tabClassName}>
        <span>{t('navigation:scenarios')}</span>
      </NavLink>
      <NavLink to={getRoute('/detection/lists')} className={tabClassName}>
        <span>{t('navigation:lists')}</span>
      </NavLink>
      <NavLink to={getRoute('/detection/analytics')} className={tabClassName}>
        <span>{t('navigation:analytics')}</span>
      </NavLink>
      <NavLink to={getRoute('/detection/decisions')} className={tabClassName}>
        <span>{t('navigation:decisions')}</span>
      </NavLink>
    </div>
  );
}
