import { CaseManagerClientsPage } from '@app-builder/components/CaseManager/ClientsPage';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/clients/$pivotValue')({
  beforeLoad: ({ context, params }) => {
    // The `$pivotValue` route param carries the case client key (see `CaseClient`), so
    // pivot objects and manually added entities resolve to distinct clients.
    const client = context.caseClients.find((c) => c.key === params.pivotValue);
    if (!client) {
      throw redirect({ from: '/cases/s/$caseId/', to: './principal' });
    }

    return { client };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { caseDetail, dataModel, client, client360Tables, userScoringAccess } = Route.useRouteContext();

  return (
    <CaseManagerClientsPage
      caseDetail={caseDetail}
      dataModel={dataModel}
      client={client}
      client360Tables={client360Tables}
      userScoringAccess={userScoringAccess}
    />
  );
}
