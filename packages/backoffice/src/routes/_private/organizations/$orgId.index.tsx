import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/organizations/$orgId/')({
  beforeLoad: async ({ params }) => {
    throw redirect({ from: '/organizations/$orgId/', to: './users' });
  },
});
