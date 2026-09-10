import { CurrentUser } from '@app-builder/models';
import { FeatureAccesses } from '@app-builder/models/feature-access';
import {
  hasAnyEntitlement,
  isCreateDataModelFieldAvailable,
  isCreateDataModelLinkAvailable,
  isCreateDataModelPivotAvailable,
  isCreateDataModelTableAvailable,
  isDeleteDataModelFieldAvailable,
  isDeleteDataModelLinkAvailable,
  isDeleteDataModelPivotAvailable,
  isDeleteDataModelTableAvailable,
  isEditDataModelFieldAvailable,
  isEditDataModelInfoAvailable,
  isGraphExplorationAvailable,
  isIngestDataAvailable,
} from '@app-builder/services/feature-access';
import { getServerEnv, isFlagActive } from '@app-builder/utils/environment';

export function dataModelFeatureAccessLoader(user: CurrentUser, entitlements: FeatureAccesses) {
  return {
    isCreateDataModelTableAvailable: isCreateDataModelTableAvailable(user),
    isEditDataModelInfoAvailable: isEditDataModelInfoAvailable(user),
    isCreateDataModelFieldAvailable: isCreateDataModelFieldAvailable(user),
    isEditDataModelFieldAvailable: isEditDataModelFieldAvailable(user),
    isCreateDataModelLinkAvailable: isCreateDataModelLinkAvailable(user),
    isCreateDataModelPivotAvailable: isCreateDataModelPivotAvailable(user),
    isIngestDataAvailable: isIngestDataAvailable(user),
    isDeleteDataModelTableAvailable: isDeleteDataModelTableAvailable(user),
    isDeleteDataModelFieldAvailable: isDeleteDataModelFieldAvailable(user),
    isDeleteDataModelLinkAvailable: isDeleteDataModelLinkAvailable(user),
    isDeleteDataModelPivotAvailable: isDeleteDataModelPivotAvailable(user),
    isIpGpsAvailable: hasAnyEntitlement(entitlements),
    isGraphExplorationEnabled: isFlagActive(getServerEnv('ENABLE_GRAPH_EXPLORATION'), user.organizationId),
    isGraphExplorationAvailable: isGraphExplorationAvailable(entitlements),
  };
}
