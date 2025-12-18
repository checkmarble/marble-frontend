import { DashboardPage } from '@bo/components/pages/dashboard';
import { listOrganizationsQueryOptions } from '@bo/data/organization';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_private/dashboard')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(listOrganizationsQueryOptions());
  },
});

function RouteComponent() {
  return <DashboardPage />;
}
