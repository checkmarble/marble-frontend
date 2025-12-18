import { OrganizationOverviewPage } from '@bo/components/pages/organization.overview';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_private/organizations/$orgId/overview')({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgId } = Route.useParams();

  return <OrganizationOverviewPage orgId={orgId} />;
}
