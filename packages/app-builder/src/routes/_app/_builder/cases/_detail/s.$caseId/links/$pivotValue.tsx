import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { isGraphEligibleClient } from '@app-builder/components/CaseManager/graph-pivots';
import { CaseManagerLinksPage } from '@app-builder/components/CaseManager/LinksPage';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

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
  beforeLoad: ({ context, params }) => {
    // Graph exploration access is checked by the parent `links` route.
    const client = context.caseClients.find((c) => c.key === params.pivotValue);
    if (!client) {
      throw redirect({ from: '/cases/s/$caseId/', to: './principal' });
    }

    if (!isGraphEligibleClient(client, context.dataModel)) {
      throw redirect({
        from: '/cases/s/$caseId/',
        to: './clients/$pivotValue',
        params: { pivotValue: params.pivotValue },
      });
    }

    return { objectId: client.objectId, objectType: client.tableName };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { objectId, objectType } = Route.useRouteContext();

  return <CaseManagerLinksPage objectType={objectType} objectId={objectId} />;
}
