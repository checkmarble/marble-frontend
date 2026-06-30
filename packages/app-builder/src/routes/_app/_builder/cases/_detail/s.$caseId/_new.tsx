import { CommentContext } from '@app-builder/components/CaseManagerV2/hooks/comment-context';
import { CaseManagerPageLayout } from '@app-builder/components/CaseManagerV2/PageLayout';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
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
      await context.authInfo.cases.getCase({ caseId: data.caseId }),
      await context.authInfo.dataModelRepository.getDataModel(),
      await context.authInfo.cases.listPivotObjects({ caseId: data.caseId }),
      await context.authInfo.client360.getClient360Tables(),
    ]);

    const dataModelFeatureAccess = dataModelFeatureAccessLoader(context.authInfo.user, context.authInfo.entitlements);
    const userScoringAccess = isAnalyst(context.authInfo.user)
      ? ('restricted' as const)
      : context.authInfo.entitlements.userScoring;

    return {
      caseDetail,
      dataModel,
      dataModelFeatureAccess,
      pivotObjects: pivotObjects ?? [],
      client360Tables,
      userScoringAccess,
      entitlements: context.authInfo.entitlements,
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/_new')({
  beforeLoad: async ({ params }) => {
    return beforeLoadFn({ data: { caseId: params.caseId } });
  },
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
