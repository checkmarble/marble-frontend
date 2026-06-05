import { CaseManagerClientsPage } from '@app-builder/components/CaseManagerV2/ClientsPage';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/_new/clients/$pivotValue')({
  beforeLoad: ({ context, params }) => {
    const { pivotObjects } = context;

    const pivotObject = (pivotObjects ?? []).find((p) => p.pivotValue === params.pivotValue);
    if (!pivotObject) {
      throw redirect({ from: '/cases/s/$caseId/', to: './principal' });
    }

    return { pivotObject };
  },
  loader: ({ context: { pivotObject } }) => {
    return { objectId: pivotObject.pivotObjectId!, objectType: pivotObject.pivotObjectName };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { caseDetail, dataModel, pivotObject, client360Tables, userScoringAccess } = Route.useRouteContext();
  const { objectId, objectType } = Route.useLoaderData();

  return (
    <CaseManagerClientsPage
      ingestedInfo={pivotObject.isIngested ? { objectId, objectType } : null}
      caseDetail={caseDetail}
      dataModel={dataModel}
      pivotObject={pivotObject}
      client360Tables={client360Tables}
      userScoringAccess={userScoringAccess}
    />
  );
}
