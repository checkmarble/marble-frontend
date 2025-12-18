import { createFileRoute, useLoaderData } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentUser } = useLoaderData({ from: '/_private' });

  return (
    <div className="border border-grey-border">
      <pre>{JSON.stringify(currentUser, null, 2)}</pre>
    </div>
  );
}
