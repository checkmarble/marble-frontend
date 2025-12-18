import { Tabs, tabClassName } from '@bo/components/common/Tabs';
import { getOrganizationQueryOptions } from '@bo/data/organization';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

const tabs = ['users' /* , 'settings' */, 'features'] as const;

export const Route = createFileRoute('/_private/organizations/$orgId')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    context.queryClient.ensureQueryData(getOrganizationQueryOptions(params.orgId));
  },
});

function RouteComponent() {
  const { orgId } = Route.useParams();
  const { data: organization } = useSuspenseQuery(getOrganizationQueryOptions(orgId));

  return (
    <div className="flex flex-col gap-v2-md">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">{organization.name}</h1>
        <Tabs>
          {tabs.map((tab) => (
            <Link
              key={tab}
              to={`/organizations/$orgId/${tab}`}
              params={{ orgId: organization.id }}
              className={tabClassName}
            >
              {tab}
            </Link>
          ))}
        </Tabs>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
