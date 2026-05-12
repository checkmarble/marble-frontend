import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/_new/clients')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pivotObjects } = Route.useRouteContext();

  return (
    <>
      {pivotObjects.length > 1 ? (
        <div className="flex gap-v2-sm mb-v2-lg">
          {pivotObjects.map((p, i) => (
            <Link
              key={p.pivotValue}
              className="px-v2-sm h-8 rounded-md border border-grey-border flex items-center aria-[current=page]:border-purple-primary"
              from="/cases/s/$caseId/"
              to="./clients/$pivotValue"
              params={{ pivotValue: p.pivotValue }}
            >
              Client {i + 1}
            </Link>
          ))}
        </div>
      ) : null}
      <Outlet />
    </>
  );
}
