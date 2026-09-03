import { isGraphEligiblePivot } from '@app-builder/components/CaseManager/graph-pivots';
import { CaseManagerLinksPage } from '@app-builder/components/CaseManager/LinksPage';
import { getPivotObjectKey } from '@app-builder/models/cases';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/links/$pivotValue')({
  beforeLoad: ({ context, params }) => {
    const { pivotObjects, dataModel, dataModelFeatureAccess } = context;

    if (!dataModelFeatureAccess.isGraphExplorationEnabled) {
      throw redirect({ from: '/cases/s/$caseId/', to: './principal' });
    }

    const pivotObject = (pivotObjects ?? []).find((p) => getPivotObjectKey(p) === params.pivotValue);
    if (!pivotObject) {
      throw redirect({ from: '/cases/s/$caseId/', to: './principal' });
    }

    if (!isGraphEligiblePivot(pivotObject, dataModel)) {
      throw redirect({
        from: '/cases/s/$caseId/',
        to: './clients/$pivotValue',
        params: { pivotValue: params.pivotValue },
      });
    }

    return { pivotObject };
  },
  loader: ({ context: { pivotObject } }) => {
    return { objectId: pivotObject.pivotObjectId, objectType: pivotObject.pivotObjectName };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { objectId, objectType } = Route.useLoaderData();

  return <CaseManagerLinksPage objectType={objectType} objectId={objectId} />;
}
