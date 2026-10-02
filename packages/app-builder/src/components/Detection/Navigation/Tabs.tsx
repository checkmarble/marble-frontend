import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Tabs, Typo } from 'ui-design-system';

export function DetectionNavigationTabs({ actions }: { actions?: React.ReactNode }) {
  const { t } = useTranslation(['navigation']);

  return (
    <div className="flex flex-col gap-sm">
      <Typo variant="title1">{t('navigation:detection')}</Typo>
      <div className="flex items-center justify-between">
        <Tabs>
          <Tabs.Link asChild>
            <Link to="/detection/scenarios">{t('navigation:scenarios')}</Link>
          </Tabs.Link>
          <Tabs.Link asChild>
            <Link to="/detection/lists">{t('navigation:lists')}</Link>
          </Tabs.Link>
          <Tabs.Link asChild>
            <Link to="/detection/analytics">{t('navigation:analytics')}</Link>
          </Tabs.Link>
          <Tabs.Link asChild>
            <Link to="/detection/decisions">{t('navigation:decisions')}</Link>
          </Tabs.Link>
        </Tabs>
        {actions}
      </div>
    </div>
  );
}
