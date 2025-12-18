import { ErrorComponent } from '@bo/components/ErrorComponent';
import { OrganizationUsersPage } from '@bo/components/pages/organization.users';
import { listOrganizationUsersQueryOptions } from '@bo/data/organization';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/organizations/$orgId/users')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    context.queryClient.ensureQueryData(listOrganizationUsersQueryOptions(params.orgId));
  },
  errorComponent: ({ error }) => {
    return <ErrorComponent message="Something went wrong while fetching the organization users" />;
  },
});

function RouteComponent() {
  const { orgId } = Route.useParams();

  return <OrganizationUsersPage orgId={orgId} />;
}
