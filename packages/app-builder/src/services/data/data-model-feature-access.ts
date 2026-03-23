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
  isIngestDataAvailable,
} from '@app-builder/services/feature-access';

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
  };
}
