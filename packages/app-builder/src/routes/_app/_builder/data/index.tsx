import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/data/')({
  beforeLoad: () => {
    throw redirect({ to: '/data/list' });
  },
});
