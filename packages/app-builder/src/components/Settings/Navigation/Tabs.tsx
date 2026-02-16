import { type Sections } from '@app-builder/services/settings-access';
import { NavLink } from '@remix-run/react';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Tabs, tabClassName } from 'ui-design-system';

const sectionTKeys: Record<keyof Sections, ParseKeys<['settings']>> = {
  api: 'settings:api',
  users: 'settings:users',
  scenarios: 'settings:scenarios',
  case_manager: 'settings:case_manager',
  data_display: 'settings:data_display',
  audit: 'settings:audit',
  ip_whitelisting: 'settings:ip_whitelisting',
};

export function SettingsNavigationTabs({ sections }: { sections: Sections }) {
  const { t } = useTranslation(['navigation', 'settings']);

  return (
    <div className="flex flex-col gap-v2-sm">
      <h1 className="text-xl font-bold">{t('navigation:settings')}</h1>
      <Tabs>
        {(Object.keys(sections) as Array<keyof Sections>).map((sectionKey) => {
          const { settings } = sections[sectionKey];
          if (settings.length === 0) return null;

          const firstSetting = settings[0]!;

          return (
            <NavLink key={sectionKey} to={firstSetting.to} className={tabClassName}>
              {t(sectionTKeys[sectionKey])}
            </NavLink>
          );
        })}
      </Tabs>
    </div>
  );
}
