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
  data_display: Section;
  audit: Section;
  ip_whitelisting: Section;
};

export function getSettingsAccess(user: CurrentUser, appConfig: AppConfig, inboxes: Inbox[]): Sections {
  // Define all sections with their icon and settings, Order of the sections and settings is important
  const sections: Sections = {
    api: {
      icon: 'world',
      settings: [
        ...(isReadApiKeyAvailable(user) ? [{ title: 'api', to: '/settings/api-keys' }] : []),
        ...(user.permissions.canManageWebhooks ? [{ title: 'webhooks', to: '/settings/webhooks' }] : []),
      ],
    },
    users: {
      icon: 'users',
      settings: [...(isReadUserAvailable(user) ? [{ title: 'users', to: '/settings/users' }] : [])],
    },
    scenarios: {
      icon: 'world',
      settings: [
        ...(isAdmin(user) ? [{ title: 'scenarios', to: '/settings/scenarios' }] : []),
        ...(isAdmin(user) ? [{ title: 'filters-settings', to: '/settings/analytics/filters' }] : []),
      ],
    },
    case_manager: {
      icon: 'case-manager',
      settings: [
        ...(canAccessInboxesSettings(user, inboxes) || isReadTagAvailable(user) || isAdmin(user)
          ? [{ title: 'case_manager', to: '/settings/inboxes' }]
          : []),
      ],
    },
    data_display: {
      icon: 'world',
      settings: [...(isAdmin(user) ? [{ title: 'data_display', to: '/settings/data-display' }] : [])],
    },
    audit: {
      icon: 'history',
      settings: [...(isAdmin(user) ? [{ title: 'audit.audit_logs_section', to: '/settings/audit-logs' }] : [])],
    },
    ip_whitelisting: {
      icon: 'world',
      settings: [
        ...(isAdmin(user) && appConfig.isManagedMarble
          ? [{ title: 'ip_whitelisting', to: '/settings/ip-whitelisting' }]
          : []),
      ],
    },
  };

  return sections;
}
