import { getGraphEligibleClients } from '@app-builder/components/CaseManager/graph-pivots';
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
  const { caseClients, dataModel, caseDetail, userScoringAccess } = Route.useRouteContext();
  const { set } = CommentContext.useValue();
  const eligibleClients = getGraphEligibleClients(caseClients, dataModel);
  useEffect(() => {
    set(null);
  }, [set]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PivotTabs
        clients={eligibleClients}
        numberedFrom={caseClients}
        to="./links/$pivotValue"
        caseStatus={caseDetail?.status}
        userScoringAccess={userScoringAccess}
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
