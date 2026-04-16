import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/continuous-screening/')({
  beforeLoad: () => {
    throw redirect({ to: '/continuous-screening/configurations' });
  },
});
