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
  users: Section;
  scenarios: Section;
  case_manager: Section;
  ai_assist?: Section;
  api: Section;
  ip_whitelisting: Section;
};

export function getSettingsAccess(
  user: CurrentUser,
  appConfig: AppConfig,
  inboxes: Inbox[],
): Sections {
  // Define all sections with their icon and settings, Order of the sections and settings is important
  const sections: Sections = {
    users: {
      icon: 'users',
      settings: [
        ...(isReadUserAvailable(user) ? [{ title: 'users', to: getRoute('/settings/users') }] : []),
      ],
    },
    scenarios: {
      icon: 'world',
      settings: [
        ...(isAdmin(user) ? [{ title: 'scenarios', to: getRoute('/settings/scenarios') }] : []),
      ],
    },
    case_manager: {
      icon: 'case-manager',
      settings: [
        ...(canAccessInboxesSettings(user, inboxes)
          ? [{ title: 'inboxes', to: getRoute('/settings/inboxes') }]
          : []),
        ...(isReadTagAvailable(user) ? [{ title: 'tags', to: getRoute('/settings/tags') }] : []),
        ...(isAdmin(user) && appConfig.isManagedMarble
          ? [{ title: 'data_display', to: getRoute('/settings/data-display') }]
          : []),
      ],
    },
    ...(isAdmin(user) &&
      appConfig.isManagedMarble && {
        ai_assist: {
          icon: 'ai-review',
          settings: [{ title: 'ai_case_manager', to: getRoute('/settings/ai-case-review') }],
        },
      }),
    api: {
      icon: 'world',
      settings: [
        ...(isReadApiKeyAvailable(user)
          ? [{ title: 'api', to: getRoute('/settings/api-keys') }]
          : []),
        ...(user.permissions.canManageWebhooks
          ? [{ title: 'webhooks', to: getRoute('/settings/webhooks') }]
          : []),
      ],
    },
    ip_whitelisting: {
      icon: 'world',
      settings: [
        ...(isAdmin(user)
          ? [{ title: 'ip_whitelisting', to: getRoute('/settings/ip-whitelisting') }]
          : []),
      ],
    },
  };

  return sections;
}
