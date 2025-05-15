import { type CurrentUser, isAdmin } from '@app-builder/models';
import type { Inbox } from '@app-builder/models/inbox';
import type { LicenseEntitlements } from '@app-builder/models/license';
import type { FeatureAccessDto } from 'marble-api/generated/license-api';

export const isAccessible = (featureAccess: FeatureAccessDto) =>
  featureAccess !== 'restricted' && featureAccess !== 'missing_configuration';

export const isAnalyticsAvailable = (
  { permissions }: CurrentUser,
  entitlements: LicenseEntitlements,
) => isAccessible(entitlements.analytics) && permissions.canReadAnalytics;

export const isReadUserAvailable = ({ role }: CurrentUser) =>
  role === 'ADMIN' || role === 'MARBLE_ADMIN';

export const isReadAllInboxesAvailable = ({ role }: CurrentUser) =>
  role === 'ADMIN' || role === 'MARBLE_ADMIN';

export const isInboxAdmin = ({ actorIdentity: { userId } }: CurrentUser, inbox: Inbox) =>
  inbox.users.some((inboxUser) => inboxUser.userId === userId && inboxUser.role === 'admin');

export const canAccessInboxesSettings = (user: CurrentUser, inboxes: Inbox[]) =>
  isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox));

export const isReadTagAvailable = ({ role }: CurrentUser) =>
  role === 'ADMIN' || role === 'MARBLE_ADMIN';

export const isReadApiKeyAvailable = ({ permissions }: CurrentUser) => permissions.canReadApiKey;

export const isReadWebhookAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageWebhooks;

export const isCreateInboxAvailable = ({ permissions }: CurrentUser) => permissions.canEditInboxes;

export const isReadSnoozeAvailable = (
  { permissions }: CurrentUser,
  entitlements: LicenseEntitlements,
) => isAccessible(entitlements.ruleSnoozes) && permissions.canReadSnoozes;

export const isCreateSnoozeAvailable = (
  { permissions }: CurrentUser,
  entitlements: LicenseEntitlements,
) => isAccessible(entitlements.ruleSnoozes) && permissions.canCreateSnoozes;

export const isCreateDataModelTableAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditDataModel;

export const isEditDataModelInfoAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditDataModel;

export const isCreateDataModelFieldAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditDataModel;

export const isEditDataModelFieldAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditDataModel;

export const isCreateDataModelLinkAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditDataModel;

export const isCreateDataModelPivotAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditDataModel;

export const isIngestDataAvailable = ({ permissions }: CurrentUser) => permissions.canIngestData;

export const isCreateListAvailable = ({ permissions }: CurrentUser) => permissions.canManageList;

export const isCreateListValueAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageListItem;

export const isDeleteListValueAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageListItem;

export const isEditListAvailable = ({ permissions }: CurrentUser) => permissions.canManageList;

export const isDeleteListAvailable = ({ permissions }: CurrentUser) => permissions.canManageList;

export const isEditScenarioAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageScenario;

export const isManualTriggerScenarioAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageDecision;

export const isWorkflowsAvailable = (entitlements: LicenseEntitlements) =>
  isAccessible(entitlements.workflows);

export const isTestRunAvailable = (entitlements: LicenseEntitlements) =>
  isAccessible(entitlements.testRun);

export const isDeploymentActionsAvailable = ({ permissions }: CurrentUser) =>
  permissions.canPublishScenario;

export const isCreateDraftAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageScenario;

export const isCreateApiKeyAvailable = ({ permissions }: CurrentUser) =>
  permissions.canCreateApiKey;

export const isDeleteApiKeyAvailable = ({ permissions }: CurrentUser) =>
  permissions.canCreateApiKey;

export const getInboxUserRoles = (entitlements: LicenseEntitlements) =>
  isAccessible(entitlements.userRoles) ? (['admin', 'member'] as const) : (['admin'] as const);

export const isEditInboxAvailable = (user: CurrentUser, inbox: Inbox) =>
  user.permissions.canEditInboxes || isInboxAdmin(user, inbox);

export const isDeleteInboxAvailable = ({ permissions }: CurrentUser) => permissions.canEditInboxes;

export const isCreateInboxUserAvailable = (user: CurrentUser, inbox: Inbox) =>
  user.permissions.canEditInboxes || isInboxAdmin(user, inbox);

export const isEditInboxUserAvailable = (user: CurrentUser, inbox: Inbox) =>
  user.permissions.canEditInboxes || isInboxAdmin(user, inbox);

export const isDeleteInboxUserAvailable = (user: CurrentUser, inbox: Inbox) =>
  user.permissions.canEditInboxes || isInboxAdmin(user, inbox);

export const isCreateTagAvailable = ({ permissions }: CurrentUser) => permissions.canEditInboxes;

export const isEditTagAvailable = ({ permissions }: CurrentUser) => permissions.canEditInboxes;

export const isDeleteTagAvailable = ({ permissions }: CurrentUser) => permissions.canEditInboxes;

export const getUserRoles = (entitlements: LicenseEntitlements) =>
  isAccessible(entitlements.userRoles)
    ? (['VIEWER', 'BUILDER', 'PUBLISHER', 'ADMIN'] as const)
    : (['ADMIN'] as const);

export const isCreateUserAvailable = ({ permissions }: CurrentUser) => permissions.canCreateUser;

export const isEditUserAvailable = ({ permissions }: CurrentUser) => permissions.canCreateUser;

export const isDeleteUserAvailable = ({ permissions }: CurrentUser) => permissions.canDeleteUser;

export const isCreateWebhookAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageWebhooks;

export const isEditWebhookAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageWebhooks;

export const isDeleteWebhookAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageWebhooks;
