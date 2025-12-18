import { OrganizationFeaturesPage } from '@bo/components/pages/organization.features';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/organizations/$orgId/features')({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgId } = Route.useParams();

  return <OrganizationFeaturesPage orgId={orgId} />;
}
