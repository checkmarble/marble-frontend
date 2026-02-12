import { type Sections } from '@app-builder/services/settings-access';
import { Link, useLocation } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Tabs, tabClassName } from 'ui-design-system';

export function SettingsNavigationTabs({ sections }: { sections: Sections }) {
  const { t } = useTranslation(['navigation', 'settings']);
  const location = useLocation();

  return (
    <div className="flex flex-col gap-v2-sm">
      <h1 className="text-xl font-bold">{t('navigation:settings')}</h1>
      <Tabs>
        {Object.entries(sections).map(([sectionKey, { settings }]) => {
          if (settings.length === 0) return null;

          const firstSetting = settings[0]!;
          const isActive = settings.some((s) => location.pathname.startsWith(s.to));

          return (
            <Link
              key={sectionKey}
              to={firstSetting.to}
              className={tabClassName}
              aria-current={isActive ? 'page' : undefined}
            >
              {t(`settings:${sectionKey}` as any)}
            </Link>
          );
        })}
      </Tabs>
    </div>
  );
}
