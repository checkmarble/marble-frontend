import { OrganizationLayout } from '@bo/components/pages/organization._layout';
import { getOrganizationQueryOptions } from '@bo/data/organization';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_private/organizations/$orgId')({
  component: RouteComponent,
  loader: ({ params, context }) => {
    context.queryClient.prefetchQuery(getOrganizationQueryOptions(params.orgId));
  },
});

function RouteComponent() {
  const { orgId } = Route.useParams();
  const { data: organization } = useSuspenseQuery(getOrganizationQueryOptions(orgId));

  return (
    <OrganizationLayout organization={organization}>
      <Outlet />
    </OrganizationLayout>
  );
}
