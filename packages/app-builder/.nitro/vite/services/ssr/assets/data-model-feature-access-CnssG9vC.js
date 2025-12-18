import { h as hasAnyEntitlement, p as isDeleteDataModelPivotAvailable, q as isDeleteDataModelLinkAvailable, r as isDeleteDataModelFieldAvailable, s as isDeleteDataModelTableAvailable, t as isIngestDataAvailable, u as isCreateDataModelPivotAvailable, v as isCreateDataModelLinkAvailable, w as isEditDataModelFieldAvailable, x as isCreateDataModelFieldAvailable, y as isEditDataModelInfoAvailable, z as isCreateDataModelTableAvailable } from "./feature-access-B8PIS8ad.js";
function dataModelFeatureAccessLoader(user, entitlements) {
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
    isIpGpsAvailable: hasAnyEntitlement(entitlements)
  };
}
export {
  dataModelFeatureAccessLoader as d
};
