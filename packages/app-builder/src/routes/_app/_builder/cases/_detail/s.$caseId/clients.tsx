import { PivotTabs } from '@app-builder/components/CaseManager/PivotTabs';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/clients')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pivotObjects } = Route.useRouteContext();

  return (
    <>
      <PivotTabs pivots={pivotObjects} to="./clients/$pivotValue" />
      <Outlet />
    </>
  );
}
