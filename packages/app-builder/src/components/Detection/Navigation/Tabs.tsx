import { getRoute } from '@app-builder/utils/routes';
import { NavLink } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Tabs, tabClassName } from 'ui-design-system';

export function DetectionNavigationTabs({ actions }: { actions?: React.ReactNode }) {
  const { t } = useTranslation(['navigation']);

  return (
    <div className="flex flex-col gap-v2-sm">
      <h1 className="text-xl font-bold">{t('navigation:detection')}</h1>
      <div className="flex items-center justify-between">
        <Tabs>
          <NavLink to={getRoute('/detection/scenarios')} className={tabClassName}>
            {t('navigation:scenarios')}
          </NavLink>
          <NavLink to={getRoute('/detection/lists')} className={tabClassName}>
            {t('navigation:lists')}
          </NavLink>
          <NavLink to={getRoute('/detection/analytics')} className={tabClassName}>
            {t('navigation:analytics')}
          </NavLink>
          <NavLink to={getRoute('/detection/decisions')} className={tabClassName}>
            {t('navigation:decisions')}
          </NavLink>
        </Tabs>
        {actions}
      </div>
    </div>
  );
}
