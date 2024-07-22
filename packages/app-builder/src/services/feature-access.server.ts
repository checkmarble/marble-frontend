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
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      const licenseEntitlements = await getLicenseEntitlements();
      return licenseEntitlements.analytics && permissions.canReadAnalytics;
    },
    isIngestDataAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canIngestData;
    },
    isWorkflowsAvailable: async () => {
      const licenseEntitlements = await getLicenseEntitlements();
      return licenseEntitlements.workflows;
    },
    isDeploymentActionsAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canPublishScenario;
    },
    isCreateDraftAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageScenario;
    },
    isEditScenarioAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageScenario;
    },
    isManualTriggerScenarioAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageDecision;
    },
    isCreateListValueAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageListItem;
    },
    isDeleteListValueAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageListItem;
    },
    isCreateListAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageList;
    },
    isEditListAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageList;
    },
    isDeleteListAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageList;
    },
    isCreateDataModelTableAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canEditDataModel;
    },
    isEditDataModelInfoAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canEditDataModel;
    },
    isCreateDataModelFieldAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canEditDataModel;
    },
    isEditDataModelFieldAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canEditDataModel;
    },
    isCreateDataModelLinkAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canEditDataModel;
    },
    isCreateDataModelPivotAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canEditDataModel;
    },
    isCreateInboxAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canEditInboxes;
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
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageWebhooks;
    },
    isCreateWebhookAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageWebhooks;
    },
    isEditWebhookAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageWebhooks;
    },
    isDeleteWebhookAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canManageWebhooks;
    },
    isReadUserAvailable: ({ role }: { role: string }) => {
      return role === 'ADMIN' || role === 'MARBLE_ADMIN';
    },
    isCreateUserAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canCreateUser;
    },
    isEditUserAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canCreateUser;
    },
    isDeleteUserAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canDeleteUser;
    },
    isReadTagAvailable: ({ role }: { role: string }) => {
      return role === 'ADMIN' || role === 'MARBLE_ADMIN';
    },
    isCreateTagAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canEditInboxes;
    },
    isEditTagAvailable: ({ permissions }: { permissions: UserPermissions }) => {
      return permissions.canEditInboxes;
    },
    isDeleteTagAvailable: ({
      permissions,
    }: {
      permissions: UserPermissions;
    }) => {
      return permissions.canEditInboxes;
    },
  };
}
