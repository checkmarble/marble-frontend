import { getOrganizationQueryOptions } from '@bo/data/organization';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

const tabs = ['users', 'settings'] as const;

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
        <div className="inline-flex p-v2-xs gap-v2-xs bg-purple-96 rounded-v2-md">
          {tabs.map((tab) => (
            <Link
              key={tab}
              to={`/organizations/$orgId/${tab}`}
              params={{ orgId: organization.id }}
              className="p-v2-sm text-purple-65 data-[status=active]:text-white data-[status=active]:bg-purple-65 rounded-v2-s"
            >
              {tab}
            </Link>
          ))}
        </div>
      </div>
      <div>
        {/* <Suspense fallback={<div>Loading...</div>}> */}
        <Outlet />
        {/* </Suspense> */}
      </div>
    </div>
  );
}
