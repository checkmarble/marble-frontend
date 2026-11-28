import {
  caseDetailBreadcrumbData,
  caseDetailBreadcrumbs,
} from '@app-builder/components/CaseManager/case-detail-breadcrumbs';
import { CommentContext } from '@app-builder/components/CaseManager/hooks/comment-context';
import { CaseManagerPageLayout } from '@app-builder/components/CaseManager/PageLayout';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { adaptPivotObject, getCaseClients } from '@app-builder/models/cases';
import { getCase } from '@app-builder/server/cases';
import { getClient360Tables } from '@app-builder/server/client-360';
import { getDataModel } from '@app-builder/server/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { fromSUUIDtoUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { z } from 'zod/v4';

const beforeLoadFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string().transform((shortuuid) => fromSUUIDtoUUID(shortuuid)) }))
  .handler(async ({ context, data }) => {
    const [caseDetail, dataModel, pivotObjects, client360Tables] = await Promise.all([
      getCase(context.api, { caseId: data.caseId }),
      getDataModel(context.api),
      context.api
        .getPivotObjectsForCase(data.caseId)
        .then(({ pivot_objects }) => pivot_objects?.map(adaptPivotObject) ?? null),
      getClient360Tables(context.api),
    ]);

    const dataModelFeatureAccess = dataModelFeatureAccessLoader(context.user, context.entitlements);
    const userScoringAccess = isAnalyst(context.user) ? ('restricted' as const) : context.entitlements.userScoring;

    return {
      caseDetail,
      dataModel,
      dataModelFeatureAccess,
      pivotObjects: pivotObjects ?? [],
      client360Tables,
      userScoringAccess,
      entitlements: context.entitlements,
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId')({
  staticData: {
    BreadCrumbs: caseDetailBreadcrumbs,
  },
  beforeLoad: async ({ params }) => {
    const context = await beforeLoadFn({ data: { caseId: params.caseId } });
    return { ...context, caseClients: getCaseClients(context.pivotObjects, context.caseDetail.entities) };
  },
  loader: ({ context }) => caseDetailBreadcrumbData(context.caseDetail, context.inboxes),
  component: RouteComponent,
});

function RouteComponent() {
  const routeContext = Route.useRouteContext();
  const [currentlyInvestigated, setCurrentlyInvestigated] = useState<{ objectId: string; objectType: string } | null>(
    null,
  );

  return (
    <CommentContext.Provider value={{ info: currentlyInvestigated, set: setCurrentlyInvestigated }}>
      <CaseManagerPageLayout {...routeContext}>
        <Outlet />
      </CaseManagerPageLayout>
    </CommentContext.Provider>
  );
}
