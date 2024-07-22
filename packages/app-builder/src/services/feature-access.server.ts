import { type UserPermissions } from '@app-builder/models';
import { type LicenseEntitlements } from '@app-builder/models/license';

export function makeFeatureAccessService({
  getLicenseEntitlements,
}: {
  getLicenseEntitlements: () => Promise<LicenseEntitlements>;
}) {
  return {
    isSSOAvailable: async () => {
      const licenseEntitlements = await getLicenseEntitlements();
      return licenseEntitlements.sso;
    },
    isAnalyticsAvailable: async ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      const licenseEntitlements = await getLicenseEntitlements();
      return licenseEntitlements.analytics && userPermissions.canReadAnalytics;
    },
    isIngestDataAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canIngestData;
    },
    isWorkflowsAvailable: async () => {
      const licenseEntitlements = await getLicenseEntitlements();
      return licenseEntitlements.workflows;
    },
    isDeploymentActionsAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canPublishScenario;
    },
    isCreateDraftAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageScenario;
    },
    isEditScenarioAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageScenario;
    },
    isManualTriggerScenarioAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageDecision;
    },
    isCreateListValueAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageListItem;
    },
    isDeleteListValueAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageListItem;
    },
    isCreateListAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageList;
    },
    isEditListAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageList;
    },
    isDeleteListAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageList;
    },
    isCreateDataModelTableAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canEditDataModel;
    },
    isEditDataModelInfoAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canEditDataModel;
    },
    isCreateDataModelFieldAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canEditDataModel;
    },
    isEditDataModelFieldAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canEditDataModel;
    },
    isCreateDataModelLinkAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canEditDataModel;
    },
    isCreateDataModelPivotAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canEditDataModel;
    },
    isCreateInboxAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canEditInboxes;
    },
    getUserRoles: async () => {
      const licenseEntitlements = await getLicenseEntitlements();
      if (licenseEntitlements.userRoles) {
        return ['VIEWER', 'BUILDER', 'PUBLISHER', 'ADMIN'] as const;
      }
      return ['ADMIN'] as const;
    },
    getInboxUserRoles: async () => {
      const licenseEntitlements = await getLicenseEntitlements();
      if (licenseEntitlements.userRoles) {
        return ['admin', 'member'] as const;
      }
      return ['admin'] as const;
    },
    isReadWebhookAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageWebhooks;
    },
    isCreateWebhookAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageWebhooks;
    },
    isEditWebhookAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageWebhooks;
    },
    isDeleteWebhookAvailable: ({
      userPermissions,
    }: {
      userPermissions: UserPermissions;
    }) => {
      return userPermissions.canManageWebhooks;
    },
  };
}
