import { type CurrentUser } from '@app-builder/models';
import { type FeatureAccesses } from '@app-builder/models/feature-access';
import { type Inbox } from '@app-builder/models/inbox';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';

export const isAccessible = (featureAccess: FeatureAccessLevelDto): boolean =>
  featureAccess !== 'restricted' && featureAccess !== 'missing_configuration';

export const isRestricted = (featureAccess: FeatureAccessLevelDto): boolean => featureAccess === 'restricted';

export const isAnalyticsAvailable = ({ permissions }: CurrentUser, entitlements: FeatureAccesses) =>
  isAccessible(entitlements.analytics) && permissions.canReadAnalytics;

// ---- Section access capabilities ----
// These replace the former `isAnalyst`/`isAdmin` role gates. They encode which permission
// grants access to a given builder/config area. If a mapping is wrong, fix it here only.

export const canAccessScenarios = ({ permissions }: CurrentUser) => permissions.canReadScenarios;

export const canAccessDecisions = ({ permissions }: CurrentUser) => permissions.canReadDecisions;

export const canAccessDataModel = ({ permissions }: CurrentUser) => permissions.canReadDataModel;

export const canAccessUserScoring = ({ permissions }: CurrentUser) => permissions.canManageScoring;

export const canAccessContinuousScreeningSection = ({ permissions }: CurrentUser) =>
  permissions.canReadContinuousScreening;

export const isReadUserAvailable = ({ permissions }: CurrentUser) => permissions.canReadUser;

export const isReadAllInboxesAvailable = ({ permissions }: CurrentUser) => permissions.canEditInboxes;

export const isInboxAdmin = ({ actorIdentity: { userId } }: CurrentUser, inbox: Inbox) =>
  inbox.users.some((inboxUser) => inboxUser.userId === userId && inboxUser.role === 'admin');

export const canAccessInboxesSettings = (user: CurrentUser, inboxes: Inbox[]) =>
  user.permissions.canEditInboxes || inboxes.some((inbox) => isInboxAdmin(user, inbox));

export const isReadTagAvailable = ({ permissions }: CurrentUser) => permissions.canReadTags;

export const isReadApiKeyAvailable = ({ permissions }: CurrentUser) => permissions.canReadApiKey;

export const isReadWebhookAvailable = ({ permissions }: CurrentUser) => permissions.canManageWebhooks;

export const isCreateInboxAvailable = ({ permissions }: CurrentUser) => permissions.canEditInboxes;

export const isReadSnoozeAvailable = ({ permissions }: CurrentUser, entitlements: FeatureAccesses) =>
  isAccessible(entitlements.ruleSnoozes) && permissions.canReadSnoozes;

export const isCreateSnoozeAvailable = ({ permissions }: CurrentUser, entitlements: FeatureAccesses) =>
  isAccessible(entitlements.ruleSnoozes) && permissions.canCreateSnoozes;

export const isCreateDataModelTableAvailable = ({ permissions }: CurrentUser) => permissions.canEditDataModel;

export const isEditDataModelInfoAvailable = ({ permissions }: CurrentUser) => permissions.canEditDataModel;

export const isCreateDataModelFieldAvailable = ({ permissions }: CurrentUser) => permissions.canEditDataModel;

export const isEditDataModelFieldAvailable = ({ permissions }: CurrentUser) => permissions.canEditDataModel;

export const isCreateDataModelLinkAvailable = ({ permissions }: CurrentUser) => permissions.canEditDataModel;

export const isCreateDataModelPivotAvailable = ({ permissions }: CurrentUser) => permissions.canEditDataModel;

export const isIngestDataAvailable = ({ permissions }: CurrentUser) => permissions.canIngestData;

export const isDeleteDataModelTableAvailable = ({ permissions }: CurrentUser) => permissions.canEditDataModel;

export const isDeleteDataModelFieldAvailable = ({ permissions }: CurrentUser) => permissions.canEditDataModel;

export const isDeleteDataModelLinkAvailable = ({ permissions }: CurrentUser) => permissions.canEditDataModel;

export const isDeleteDataModelPivotAvailable = ({ permissions }: CurrentUser) => permissions.canEditDataModel;

export const isCreateListAvailable = ({ permissions }: CurrentUser) => permissions.canManageList;

export const isCreateListValueAvailable = ({ permissions }: CurrentUser) => permissions.canManageListItem;

export const isDeleteListValueAvailable = ({ permissions }: CurrentUser) => permissions.canManageListItem;

export const isEditListAvailable = ({ permissions }: CurrentUser) => permissions.canManageList;

export const isDeleteListAvailable = ({ permissions }: CurrentUser) => permissions.canManageList;

export const isEditScenarioAvailable = ({ permissions }: CurrentUser) => permissions.canManageScenario;

export const isManualTriggerScenarioAvailable = ({ permissions }: CurrentUser) => permissions.canManageDecision;

export const isWorkflowsAvailable = (entitlements: FeatureAccesses) => isAccessible(entitlements.workflows);

export const isTestRunAvailable = (entitlements: FeatureAccesses) => isAccessible(entitlements.testRun);

export const isDeploymentActionsAvailable = ({ permissions }: CurrentUser) => permissions.canPublishScenario;

export const isCreateDraftAvailable = ({ permissions }: CurrentUser) => permissions.canManageScenario;

export const isCreateApiKeyAvailable = ({ permissions }: CurrentUser) => permissions.canCreateApiKey;

export const isDeleteApiKeyAvailable = ({ permissions }: CurrentUser) => permissions.canCreateApiKey;

export const getInboxUserRoles = (entitlements: FeatureAccesses) =>
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

export const isCreateUserAvailable = ({ permissions }: CurrentUser) => permissions.canCreateUser;

export const isEditUserAvailable = ({ permissions }: CurrentUser) => permissions.canCreateUser;

export const isDeleteUserAvailable = ({ permissions }: CurrentUser) => permissions.canDeleteUser;

export const isCreateWebhookAvailable = ({ permissions }: CurrentUser) => permissions.canManageWebhooks;

export const isEditWebhookAvailable = ({ permissions }: CurrentUser) => permissions.canManageWebhooks;

export const isDeleteWebhookAvailable = ({ permissions }: CurrentUser) => permissions.canManageWebhooks;

export const isAutoAssignmentAvailable = (entitlements: FeatureAccesses): boolean =>
  isAccessible(entitlements.autoAssignment);

export const hasAnyEntitlement = (entitlements: FeatureAccesses): boolean =>
  Object.values(entitlements).some(isAccessible);

export const isContinuousScreeningAvailable = (entitlements: FeatureAccesses) =>
  isAccessible(entitlements.continuousScreening);

export const isScreeningSearchAvailable = (entitlements: FeatureAccesses) =>
  isAccessible(entitlements.sanctions) || isContinuousScreeningAvailable(entitlements);

export const isLexisNexisAvailable = (entitlements: FeatureAccesses) => isAccessible(entitlements.lexisnexis);

export const isAiRuleBuildingAvailable = (entitlements: FeatureAccesses) => isAccessible(entitlements.aiRuleBuilding);

export const isUserScoringAvailable = (entitlements: FeatureAccesses) => isAccessible(entitlements.userScoring);
