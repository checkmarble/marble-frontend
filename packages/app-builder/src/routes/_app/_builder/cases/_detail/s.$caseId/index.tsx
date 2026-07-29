import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/')({
  beforeLoad: () => {
    throw redirect({ from: '/cases/s/$caseId', to: './principal' });
  },
});
