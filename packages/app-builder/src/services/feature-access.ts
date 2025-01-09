import { type CurrentUser } from '@app-builder/models';
import { type LicenseEntitlements } from '@app-builder/models/license';

export const isAnalyticsAvailable = (
  { permissions }: CurrentUser,
  entitlements: LicenseEntitlements,
) => entitlements.analytics !== 'restricted' && permissions.canReadAnalytics;

export const isReadUserAvailable = ({ role }: CurrentUser) =>
  role === 'ADMIN' || role === 'MARBLE_ADMIN';

export const isReadAllInboxesAvailable = ({ role }: CurrentUser) =>
  role === 'ADMIN' || role === 'MARBLE_ADMIN';

export const isReadTagAvailable = ({ role }: CurrentUser) =>
  role === 'ADMIN' || role === 'MARBLE_ADMIN';

export const isReadApiKeyAvailable = ({ permissions }: CurrentUser) =>
  permissions.canReadApiKey;

export const isReadWebhookAvailable = (
  { permissions }: CurrentUser,
  entitlements: LicenseEntitlements,
) => entitlements.webhooks !== 'restricted' && permissions.canManageWebhooks;

export const isCreateInboxAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditInboxes;

export const isReadSnoozeAvailable = (
  { permissions }: CurrentUser,
  entitlements: LicenseEntitlements,
) => entitlements.ruleSnoozes !== 'restricted' && permissions.canReadSnoozes;

export const isCreateSnoozeAvailable = (
  { permissions }: CurrentUser,
  entitlements: LicenseEntitlements,
) => entitlements.ruleSnoozes !== 'restricted' && permissions.canCreateSnoozes;

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

export const isIngestDataAvailable = ({ permissions }: CurrentUser) =>
  permissions.canIngestData;

export const isCreateListAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageList;

export const isCreateListValueAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageListItem;

export const isDeleteListValueAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageListItem;

export const isEditListAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageList;

export const isDeleteListAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageList;

export const isEditScenarioAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageScenario;

export const isManualTriggerScenarioAvailable = ({
  permissions,
}: CurrentUser) => permissions.canManageDecision;

export const isWorkflowsAvailable = (entitlements: LicenseEntitlements) =>
  entitlements.workflows !== 'restricted';

export const isTestRunAvailable = (entitlements: LicenseEntitlements) =>
  entitlements.testRun !== 'restricted';

export const isDeploymentActionsAvailable = ({ permissions }: CurrentUser) =>
  permissions.canPublishScenario;

export const isCreateDraftAvailable = ({ permissions }: CurrentUser) =>
  permissions.canManageScenario;

export const isCreateApiKeyAvailable = ({ permissions }: CurrentUser) =>
  permissions.canCreateApiKey;

export const isDeleteApiKeyAvailable = ({ permissions }: CurrentUser) =>
  permissions.canCreateApiKey;

export const getInboxUserRoles = (entitlements: LicenseEntitlements) =>
  entitlements.userRoles !== 'restricted'
    ? (['admin', 'member'] as const)
    : (['admin'] as const);

export const isEditInboxAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditInboxes;

export const isDeleteInboxAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditInboxes;

export const isCreateInboxUserAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditInboxes;

export const isEditInboxUserAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditInboxes;

export const isDeleteInboxUserAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditInboxes;

export const isCreateTagAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditInboxes;

export const isEditTagAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditInboxes;

export const isDeleteTagAvailable = ({ permissions }: CurrentUser) =>
  permissions.canEditInboxes;

export const getUserRoles = (entitlements: LicenseEntitlements) =>
  entitlements.userRoles !== 'restricted'
    ? (['VIEWER', 'BUILDER', 'PUBLISHER', 'ADMIN'] as const)
    : (['ADMIN'] as const);

export const isCreateUserAvailable = ({ permissions }: CurrentUser) =>
  permissions.canCreateUser;

export const isEditUserAvailable = ({ permissions }: CurrentUser) =>
  permissions.canCreateUser;

export const isDeleteUserAvailable = ({ permissions }: CurrentUser) =>
  permissions.canDeleteUser;

export const isCreateWebhookAvailable = (
  { permissions }: CurrentUser,
  entitlements: LicenseEntitlements,
) => entitlements.webhooks !== 'restricted' && permissions.canManageWebhooks;

export const isEditWebhookAvailable = (
  { permissions }: CurrentUser,
  entitlements: LicenseEntitlements,
) => entitlements.webhooks !== 'restricted' && permissions.canManageWebhooks;

export const isDeleteWebhookAvailable = (
  { permissions }: CurrentUser,
  entitlements: LicenseEntitlements,
) => entitlements.webhooks !== 'restricted' && permissions.canManageWebhooks;
