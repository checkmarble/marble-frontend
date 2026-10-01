import { OrganizationScreeningsPage } from '@bo/components/pages/organization.screenings';
import { getOrganizationDataModelQueryOptions } from '@bo/data/organization';
import { organizationScreeningsSearchSchema } from '@bo/schemas/screenings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_private/organizations/$orgId/screenings')({
  validateSearch: organizationScreeningsSearchSchema,
  loader: ({ params, context }) => {
    context.queryClient.prefetchQuery(getOrganizationDataModelQueryOptions(params.orgId));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { orgId } = Route.useParams();
  const search = Route.useSearch();

  return <OrganizationScreeningsPage orgId={orgId} search={search} />;
}
