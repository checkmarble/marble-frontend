import { DashboardPage } from '@bo/components/pages/dashboard';
import { listOrganizationsQueryOptions } from '@bo/data/organization';
import { noop } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_private/dashboard')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.query(listOrganizationsQueryOptions()).catch(noop);
  },
});

function RouteComponent() {
  return <DashboardPage />;
}
