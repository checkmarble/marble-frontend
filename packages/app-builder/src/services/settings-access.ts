import { type AppConfig } from '@app-builder/models/app-config';
import { type Inbox } from '@app-builder/models/inbox';
import { type CurrentUser, isAdmin } from '@app-builder/models/user';
import {
  canAccessInboxesSettings,
  isReadApiKeyAvailable,
  isReadTagAvailable,
  isReadUserAvailable,
} from '@app-builder/services/feature-access';
import { type IconName } from 'ui-icons';
import { getRoute } from '../utils/routes';

export type SettingEntry = {
  title: string;
  to: string;
};

export type Section = {
  icon: IconName;
  settings: SettingEntry[];
};

export type Sections = {
  api: Section;
  users: Section;
  scenarios: Section;
  case_manager: Section;
  audit: Section;
  ip_whitelisting: Section;
};

export function getSettingsAccess(user: CurrentUser, appConfig: AppConfig, inboxes: Inbox[]): Sections {
  // Define all sections with their icon and settings, Order of the sections and settings is important
  const sections: Sections = {
    api: {
      icon: 'world',
      settings: [
        ...(isReadApiKeyAvailable(user) ? [{ title: 'api', to: getRoute('/settings/api-keys') }] : []),
        ...(user.permissions.canManageWebhooks ? [{ title: 'webhooks', to: getRoute('/settings/webhooks') }] : []),
      ],
    },
    users: {
      icon: 'users',
      settings: [...(isReadUserAvailable(user) ? [{ title: 'users', to: getRoute('/settings/users') }] : [])],
    },
    scenarios: {
      icon: 'world',
      settings: [
        ...(isAdmin(user) ? [{ title: 'scenarios', to: getRoute('/settings/scenarios') }] : []),
        ...(isAdmin(user) ? [{ title: 'filters-settings', to: getRoute('/settings/analytics/filters') }] : []),
      ],
    },
    case_manager: {
      icon: 'case-manager',
      settings: [
        ...(canAccessInboxesSettings(user, inboxes) || isReadTagAvailable(user) || isAdmin(user)
          ? [{ title: 'case_manager', to: getRoute('/settings/inboxes') }]
          : []),
      ],
    },
    audit: {
      icon: 'history',
      settings: [
        ...(isAdmin(user) ? [{ title: 'audit.audit_logs_section', to: getRoute('/settings/audit-logs') }] : []),
      ],
    },
    ip_whitelisting: {
      icon: 'world',
      settings: [
        ...(isAdmin(user) && appConfig.isManagedMarble
          ? [{ title: 'ip_whitelisting', to: getRoute('/settings/ip-whitelisting') }]
          : []),
      ],
    },
  };

  return sections;
}
