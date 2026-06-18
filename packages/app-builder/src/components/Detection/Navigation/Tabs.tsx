import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Tabs, Typo, tabClassName } from 'ui-design-system';

export function DetectionNavigationTabs({ actions }: { actions?: React.ReactNode }) {
  const { t } = useTranslation(['navigation']);

  return (
    <div className="flex flex-col gap-sm">
      <Typo variant="title1">{t('navigation:detection')}</Typo>
      <div className="flex items-center justify-between">
        <Tabs>
          <Link to="/detection/scenarios" className={tabClassName}>
            {t('navigation:scenarios')}
          </Link>
          <Link to="/detection/lists" className={tabClassName}>
            {t('navigation:lists')}
          </Link>
          <Link to="/detection/analytics" className={tabClassName}>
            {t('navigation:analytics')}
          </Link>
          <Link to="/detection/decisions" className={tabClassName}>
            {t('navigation:decisions')}
          </Link>
        </Tabs>
        {actions}
      </div>
    </div>
  );
}
