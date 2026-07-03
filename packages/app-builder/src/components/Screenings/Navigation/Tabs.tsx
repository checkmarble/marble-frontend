import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Tabs, Typo, tabClassName } from 'ui-design-system';

export function ScreeningNavigationTabs({ actions }: { actions?: React.ReactNode }) {
  const { t } = useTranslation(['navigation', 'screenings']);

  return (
    <div className="flex flex-col gap-sm">
      <Typo variant="title1">{t('navigation:continuous_screening')}</Typo>
      <div className="flex items-center justify-between">
        <Tabs>
          <Link to="/continuous-screening/configurations" className={tabClassName}>
            {t('screenings:navigation.configurations')}
          </Link>
          <Link to="/continuous-screening/observability" className={tabClassName}>
            {t('screenings:navigation.observability')}
          </Link>
        </Tabs>
        {actions}
      </div>
    </div>
  );
}
