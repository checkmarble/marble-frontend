import { B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
const isAccessible = (featureAccess) => featureAccess !== "restricted" && featureAccess !== "missing_configuration";
const isRestricted = (featureAccess) => featureAccess === "restricted";
const isAnalyticsAvailable = ({ permissions }, entitlements) => isAccessible(entitlements.analytics) && permissions.canReadAnalytics;
const isReadUserAvailable = ({ role }) => role === "ADMIN" || role === "MARBLE_ADMIN";
const isInboxAdmin = ({ actorIdentity: { userId } }, inbox) => inbox.users.some((inboxUser) => inboxUser.userId === userId && inboxUser.role === "admin");
const canAccessInboxesSettings = (user, inboxes) => isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox));
const isReadTagAvailable = ({ role }) => role === "ADMIN" || role === "MARBLE_ADMIN";
const isReadApiKeyAvailable = ({ permissions }) => permissions.canReadApiKey;
const isReadWebhookAvailable = ({ permissions }) => permissions.canManageWebhooks;
const isCreateInboxAvailable = ({ permissions }) => permissions.canEditInboxes;
const isCreateDataModelTableAvailable = ({ permissions }) => permissions.canEditDataModel;
const isEditDataModelInfoAvailable = ({ permissions }) => permissions.canEditDataModel;
const isCreateDataModelFieldAvailable = ({ permissions }) => permissions.canEditDataModel;
const isEditDataModelFieldAvailable = ({ permissions }) => permissions.canEditDataModel;
const isCreateDataModelLinkAvailable = ({ permissions }) => permissions.canEditDataModel;
const isCreateDataModelPivotAvailable = ({ permissions }) => permissions.canEditDataModel;
const isIngestDataAvailable = ({ permissions }) => permissions.canIngestData;
const isDeleteDataModelTableAvailable = ({ permissions }) => permissions.canEditDataModel;
const isDeleteDataModelFieldAvailable = ({ permissions }) => permissions.canEditDataModel;
const isDeleteDataModelLinkAvailable = ({ permissions }) => permissions.canEditDataModel;
const isDeleteDataModelPivotAvailable = ({ permissions }) => permissions.canEditDataModel;
const isCreateListAvailable = ({ permissions }) => permissions.canManageList;
const isCreateListValueAvailable = ({ permissions }) => permissions.canManageListItem;
const isDeleteListValueAvailable = ({ permissions }) => permissions.canManageListItem;
const isEditListAvailable = ({ permissions }) => permissions.canManageList;
const isDeleteListAvailable = ({ permissions }) => permissions.canManageList;
const isEditScenarioAvailable = ({ permissions }) => permissions.canManageScenario;
const isManualTriggerScenarioAvailable = ({ permissions }) => permissions.canManageDecision;
const isWorkflowsAvailable = (entitlements) => isAccessible(entitlements.workflows);
const isDeploymentActionsAvailable = ({ permissions }) => permissions.canPublishScenario;
const isCreateDraftAvailable = ({ permissions }) => permissions.canManageScenario;
const isCreateApiKeyAvailable = ({ permissions }) => permissions.canCreateApiKey;
const isDeleteApiKeyAvailable = ({ permissions }) => permissions.canCreateApiKey;
const getInboxUserRoles = (entitlements) => isAccessible(entitlements.userRoles) ? ["admin", "member"] : ["admin"];
const isEditInboxAvailable = (user, inbox) => user.permissions.canEditInboxes || isInboxAdmin(user, inbox);
const isDeleteInboxAvailable = ({ permissions }) => permissions.canEditInboxes;
const isCreateInboxUserAvailable = (user, inbox) => user.permissions.canEditInboxes || isInboxAdmin(user, inbox);
const isEditInboxUserAvailable = (user, inbox) => user.permissions.canEditInboxes || isInboxAdmin(user, inbox);
const isDeleteInboxUserAvailable = (user, inbox) => user.permissions.canEditInboxes || isInboxAdmin(user, inbox);
const isCreateTagAvailable = ({ permissions }) => permissions.canEditInboxes;
const isEditTagAvailable = ({ permissions }) => permissions.canEditInboxes;
const isDeleteTagAvailable = ({ permissions }) => permissions.canEditInboxes;
const getUserRoles = (entitlements) => isAccessible(entitlements.userRoles) ? ["VIEWER", "BUILDER", "PUBLISHER", "ADMIN", "ANALYST"] : ["ADMIN"];
const isCreateUserAvailable = ({ permissions }) => permissions.canCreateUser;
const isEditUserAvailable = ({ permissions }) => permissions.canCreateUser;
const isDeleteUserAvailable = ({ permissions }) => permissions.canDeleteUser;
const isCreateWebhookAvailable = ({ permissions }) => permissions.canManageWebhooks;
const isEditWebhookAvailable = ({ permissions }) => permissions.canManageWebhooks;
const isDeleteWebhookAvailable = ({ permissions }) => permissions.canManageWebhooks;
const isAutoAssignmentAvailable = (entitlements) => isAccessible(entitlements.autoAssignment);
const hasAnyEntitlement = (entitlements) => Object.values(entitlements).some(isAccessible);
const isContinuousScreeningAvailable = (entitlements) => isAccessible(entitlements.continuousScreening);
const isScreeningSearchAvailable = (entitlements) => isAccessible(entitlements.sanctions) || isContinuousScreeningAvailable(entitlements);
const isLexisNexisAvailable = (entitlements) => isAccessible(entitlements.lexisnexis);
const isAiRuleBuildingAvailable = (entitlements) => isAccessible(entitlements.aiRuleBuilding);
const isUserScoringAvailable = (entitlements) => isAccessible(entitlements.userScoring);
export {
  isCreateDraftAvailable as $,
  isAccessible as A,
  isDeleteUserAvailable as B,
  isEditUserAvailable as C,
  isCreateUserAvailable as D,
  getUserRoles as E,
  isDeleteListAvailable as F,
  isEditListAvailable as G,
  isDeleteListValueAvailable as H,
  isCreateListValueAvailable as I,
  isReadWebhookAvailable as J,
  isDeleteWebhookAvailable as K,
  isEditWebhookAvailable as L,
  isUserScoringAvailable as M,
  isManualTriggerScenarioAvailable as N,
  isLexisNexisAvailable as O,
  isAiRuleBuildingAvailable as P,
  isDeleteInboxUserAvailable as Q,
  isEditInboxUserAvailable as R,
  isCreateInboxUserAvailable as S,
  isDeleteInboxAvailable as T,
  isEditInboxAvailable as U,
  getInboxUserRoles as V,
  isCreateWebhookAvailable as W,
  isDeleteApiKeyAvailable as X,
  isCreateApiKeyAvailable as Y,
  isWorkflowsAvailable as Z,
  isDeploymentActionsAvailable as _,
  isContinuousScreeningAvailable as a,
  isCreateListAvailable as a0,
  isRestricted as a1,
  isEditScenarioAvailable as b,
  isInboxAdmin as c,
  isReadTagAvailable as d,
  isDeleteTagAvailable as e,
  isEditTagAvailable as f,
  isCreateTagAvailable as g,
  hasAnyEntitlement as h,
  isAnalyticsAvailable as i,
  isCreateInboxAvailable as j,
  isAutoAssignmentAvailable as k,
  isScreeningSearchAvailable as l,
  canAccessInboxesSettings as m,
  isReadUserAvailable as n,
  isReadApiKeyAvailable as o,
  isDeleteDataModelPivotAvailable as p,
  isDeleteDataModelLinkAvailable as q,
  isDeleteDataModelFieldAvailable as r,
  isDeleteDataModelTableAvailable as s,
  isIngestDataAvailable as t,
  isCreateDataModelPivotAvailable as u,
  isCreateDataModelLinkAvailable as v,
  isEditDataModelFieldAvailable as w,
  isCreateDataModelFieldAvailable as x,
  isEditDataModelInfoAvailable as y,
  isCreateDataModelTableAvailable as z
};
