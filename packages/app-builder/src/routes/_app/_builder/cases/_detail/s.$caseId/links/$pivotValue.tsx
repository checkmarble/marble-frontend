import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { isGraphEligiblePivot } from '@app-builder/components/CaseManager/graph-pivots';
import { CaseManagerLinksPage } from '@app-builder/components/CaseManager/LinksPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getPivotObjectKey } from '@app-builder/models/cases';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { fromSUUIDtoUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import { z } from 'zod/v4';

const linksPivotLoader = createServerFn()
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string(), pivotValue: z.string() }))
  .handler(async function linksPivotLoader({ context, data }) {
    const caseId = fromSUUIDtoUUID(data.caseId);
    const dataModelFeatureAccess = dataModelFeatureAccessLoader(context.authInfo.user, context.authInfo.entitlements);

    if (!dataModelFeatureAccess.isGraphExplorationEnabled) {
      throw redirect({ to: '/cases/s/$caseId/principal', params: { caseId: data.caseId } });
    }

    const [pivotObjects, dataModel] = await Promise.all([
      context.authInfo.cases.listPivotObjects({ caseId }),
      context.authInfo.dataModelRepository.getDataModel(),
    ]);

    const pivotObject = (pivotObjects ?? []).find((p) => getPivotObjectKey(p) === data.pivotValue);
    if (!pivotObject) {
      throw redirect({ to: '/cases/s/$caseId/principal', params: { caseId: data.caseId } });
    }

    if (!isGraphEligiblePivot(pivotObject, dataModel)) {
      throw redirect({
        to: '/cases/s/$caseId/clients/$pivotValue',
        params: { caseId: data.caseId, pivotValue: data.pivotValue },
      });
    }

    return { objectId: pivotObject.pivotObjectId, objectType: pivotObject.pivotObjectName };
  });

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/links/$pivotValue')({
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['cases']);
        const { caseId, pivotValue } = Route.useParams();

        return (
          <BreadCrumbLink to="/cases/s/$caseId/links/$pivotValue" params={{ caseId, pivotValue }} isLast={isLast}>
            {t('cases:manager.tab.links_to_other')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  loader: ({ params }) => linksPivotLoader({ data: { caseId: params.caseId, pivotValue: params.pivotValue } }),
  component: RouteComponent,
});

function RouteComponent() {
  const { objectId, objectType } = Route.useLoaderData();

  return <CaseManagerLinksPage objectType={objectType} objectId={objectId} />;
}
