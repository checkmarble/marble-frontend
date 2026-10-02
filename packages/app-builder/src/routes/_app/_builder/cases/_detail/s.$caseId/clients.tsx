import { PivotTabs } from '@app-builder/components/CaseManager/PivotTabs';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/clients')({
  component: RouteComponent,
});

function RouteComponent() {
  const { caseClients, caseDetail, userScoringAccess } = Route.useRouteContext();

  return (
    <>
      <PivotTabs
        clients={caseClients}
        to="./clients/$pivotValue"
        caseStatus={caseDetail?.status}
        userScoringAccess={userScoringAccess}
      />
      <Outlet />
    </>
  );
}
