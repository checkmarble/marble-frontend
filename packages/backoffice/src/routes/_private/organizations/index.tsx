import { ErrorComponent } from '@bo/components/ErrorComponent';
import { OrganizationsPage } from '@bo/components/pages/organizations';
import { listOrganizationsQueryOptions } from '@bo/data/organization';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/organizations/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(listOrganizationsQueryOptions());
  },
  errorComponent: ({ error }) => {
    return <ErrorComponent message="Something went wrong while fetching the organizations" />;
  },
});

function RouteComponent() {
  return <OrganizationsPage />;
}
