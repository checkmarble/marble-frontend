import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/user-scoring/')({
  beforeLoad: () => {
    throw redirect({ to: '/user-scoring/overview' });
  },
});
