import { CaseManagerPrincipalPage } from '@app-builder/components/CaseManagerV2/PrincipalPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/_new/principal')({
  component: RouteComponent,
});

function RouteComponent() {
  const { caseDetail, dataModel, pivotObjects, inboxes, client360Tables, userScoringAccess, entitlements } =
    Route.useRouteContext();

  return (
    <CaseManagerPrincipalPage
      caseDetail={caseDetail}
      dataModel={dataModel}
      pivotObjects={pivotObjects}
      inboxes={inboxes}
      client360Tables={client360Tables}
      userScoringAccess={userScoringAccess}
      entitlements={entitlements}
    />
  );
}
