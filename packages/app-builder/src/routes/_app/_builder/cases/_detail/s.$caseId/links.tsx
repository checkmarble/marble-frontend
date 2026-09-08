import { getGraphEligiblePivots } from '@app-builder/components/CaseManager/graph-pivots';
import { CommentContext } from '@app-builder/components/CaseManager/hooks/comment-context';
import { PivotTabs } from '@app-builder/components/CaseManager/PivotTabs';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/links')({
  beforeLoad: ({ context }) => {
    if (!context.dataModelFeatureAccess.isGraphExplorationEnabled) {
      throw redirect({ from: '/cases/s/$caseId/', to: './principal' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { pivotObjects, dataModel } = Route.useRouteContext();
  const { set } = CommentContext.useValue();
  const eligiblePivots = getGraphEligiblePivots(pivotObjects, dataModel);

  useEffect(() => {
    set(null);
  }, [set]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PivotTabs pivots={eligiblePivots} numberedFrom={pivotObjects} to="./links/$pivotValue" />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
